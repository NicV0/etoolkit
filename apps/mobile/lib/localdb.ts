let sqlite: any;
try {
  sqlite = await import('expo-sqlite');
  if (!sqlite || !('openDatabaseSync' in sqlite)) {
    throw new Error('no expo-sqlite');
  }
} catch {
  sqlite = {
    openDatabaseSync() {
      return {
        execSync() {},
        runSync() {},
        getAllSync() { return []; },
        getFirstSync() { return undefined as any; },
      } as any;
    },
  };
}

export const db = sqlite.openDatabaseSync('etoolkit_cache.db');

db.execSync(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS clients_idx (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients_idx(org_id);

CREATE TABLE IF NOT EXISTS quotes_idx (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  client_id TEXT,
  number TEXT,
  status TEXT,
  terms TEXT,
  contract TEXT,
  items TEXT, -- JSON string of {name,qty,rate}
  total_cents INTEGER,
  tax_percent INTEGER,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_quotes_org ON quotes_idx(org_id);

CREATE TABLE IF NOT EXISTS invoices_idx (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  client_id TEXT,
  number TEXT,
  status TEXT,
  total_cents INTEGER,
  due_date INTEGER,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices_idx(org_id);

CREATE TABLE IF NOT EXISTS jobs_idx (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  client_id TEXT,
  title TEXT,
  notes TEXT,
  status TEXT,
  updated_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_jobs_org ON jobs_idx(org_id);
`);

export function putMeta(k: string, v: string) {
  db.runSync('INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v', [k, v]);
}
export function getMeta(k: string) {
  const row = db.getFirstSync('SELECT v FROM meta WHERE k=?', [k]) as { v: string } | undefined;
  return row?.v ?? null;
}
