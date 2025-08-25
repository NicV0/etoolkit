import NetInfo from '@react-native-community/netinfo';
import * as SQLite from 'expo-sqlite';
import { AppState } from 'react-native';

type Operation = 'create' | 'update' | 'delete';
type Status = 'pending' | 'processing' | 'completed' | 'failed';

export type QueueItem = {
  id?: number;
  operation: Operation;
  entity_type: string;       // 'clients' | 'invoices' | 'invoice_items' | ...
  entity_id?: number | null; // server/local id
  payload_json: string;      // stringified payload
  dependency_id?: number | null; // another queue id this depends on
  attempts: number;
  status: Status;
  last_error?: string | null;
  created_at?: string;
  updated_at?: string;
};

type SyncAdapter = (item: QueueItem) => Promise<void>;

let adapter: SyncAdapter | null = null;
export function registerSyncAdapter(fn: SyncAdapter) {
  adapter = fn;
}

// ---- DB
let db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');
  }
  return db;
};

const run = async <T = unknown>(sql: string, params: SQLite.SQLiteBindValue[] = []): Promise<T> => {
  const database = await getDb();
  const result = await database.runAsync(sql, ...params);
  return result as unknown as T;
};

const getAll = async <T = unknown>(sql: string, params: SQLite.SQLiteBindValue[] = []): Promise<T[]> => {
  const database = await getDb();
  const result = await database.getAllAsync(sql, ...params);
  return result as T[];
};

export async function initOfflineQueue() {
  await run(`
    CREATE TABLE IF NOT EXISTS sync_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      payload_json TEXT NOT NULL,
      dependency_id INTEGER,
      attempts INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export async function enqueue(item: Omit<QueueItem, 'id' | 'attempts' | 'status' | 'created_at' | 'updated_at'>) {
  const { operation, entity_type, entity_id = null, payload_json, dependency_id = null } = item;
  await run(
    `INSERT INTO sync_outbox (operation, entity_type, entity_id, payload_json, dependency_id, attempts, status)
     VALUES (?, ?, ?, ?, ?, 0, 'pending')`,
    [operation, entity_type, entity_id, payload_json, dependency_id]
  );
}

async function nextBatch(limit = 10) {
  const rows = await getAll<QueueItem>(`SELECT * FROM sync_outbox WHERE status IN ('pending','failed') ORDER BY id ASC LIMIT ?`, [limit]);
  
  // Filter out items whose dependencies aren't completed yet.
  const depsCompleted = async (depId: number) => {
    const dep = await getAll<{status: string}>(`SELECT status FROM sync_outbox WHERE id=?`, [depId]);
    return dep[0]?.status === 'completed';
  };
  
  const out: QueueItem[] = [];
  for (const r of rows) {
    if (!r.dependency_id || (await depsCompleted(r.dependency_id))) out.push(r);
  }
  return out;
}

async function updateStatus(id: number, status: Status, last_error?: string) {
  await run(`UPDATE sync_outbox SET status=?, last_error=?, attempts=attempts+?, updated_at=datetime('now') WHERE id=?`,
    [status, last_error ?? null, status === 'failed' ? 1 : 0, id]);
}

let processing = false;
let unsubscribeNet: (() => void) | null = null;
let appStateSub: (() => void) | null = null;

export function startQueueWorker() {
  if (unsubscribeNet) return;

  unsubscribeNet = NetInfo.addEventListener(async state => {
    if (state.isConnected) processQueue();
  });

  const handler = () => {
    if (AppState.currentState === 'active') processQueue();
  };
  const sub = AppState.addEventListener('change', handler);
  appStateSub = () => sub.remove();

  // Kick once on start
  processQueue();
}

export function stopQueueWorker() {
  unsubscribeNet?.(); unsubscribeNet = null;
  appStateSub?.(); appStateSub = null;
}

export async function processQueue() {
  if (processing) return;
  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  processing = true;
  try {
    let batch = await nextBatch();
    while (batch.length) {
      for (const item of batch) {
        try {
          await updateStatus(item.id!, 'processing');
          if (adapter) {
            await adapter(item);
          } else {
            // Default: mark as completed (no-op). Replace by calling registerSyncAdapter.
            console.warn('[queue] No sync adapter registered; completing item', item.id);
          }
          await updateStatus(item.id!, 'completed');
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          await updateStatus(item.id!, 'failed', errorMessage);
        }
      }
      batch = await nextBatch();
    }
  } finally {
    processing = false;
  }
}