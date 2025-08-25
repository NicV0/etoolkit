import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// If you use expo-sqlite: DB is under FileSystem.documentDirectory + 'SQLite/app.db'
const BACKUP_DIR = FileSystem.documentDirectory + 'backups/';
const KEEP = 7;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(BACKUP_DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
}

export async function listBackups() {
  await ensureDir();
  const entries = await FileSystem.readDirectoryAsync(BACKUP_DIR);
  const files = await Promise.all(entries.map(async (name) => {
    const uri = BACKUP_DIR + name;
    const i = await FileSystem.getInfoAsync(uri);
    return { 
      name, 
      uri, 
      size: i.exists ? (i.size ?? 0) : 0, 
      mtime: i.exists ? ((i.modificationTime ?? 0) * 1000) : 0 
    };
  }));
  return files.sort((a, b) => b.mtime - a.mtime);
}

// —— JSON dump helpers (replace with your real table fetchers)
async function dumpTable() {
  // You likely have a data layer to read from SQLite. Adapt here.
  // For now, return empty to keep compile-safe.
  return [];
}

export async function createJsonBackup() {
  await ensureDir();
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  const path = `${BACKUP_DIR}backup-${stamp}.json`;

  // Pull data
  const payload = {
    version: 1,
    created_at: now.toISOString(),
    data: {
      clients: await dumpTable(),
      invoices: await dumpTable(),
      invoice_items: await dumpTable(),
      templates: await dumpTable(),
      drafts: await dumpTable(),
      audit_logs: await dumpTable(),
      messages: await dumpTable(),
    },
  };

  await FileSystem.writeAsStringAsync(path, JSON.stringify(payload, null, 2), { encoding: 'utf8' });

  // Rotate
  const files = await listBackups();
  const toRemove = files.slice(KEEP);
  await Promise.all(toRemove.map(f => FileSystem.deleteAsync(f.uri, { idempotent: true })));

  return path;
}

export async function shareLatestBackup() {
  const files = await listBackups();
  const latest = files[0];
  if (!latest) {
    Alert.alert('No backups', 'Create a backup first.');
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(latest.uri, { mimeType: 'application/json', dialogTitle: 'Share backup' });
  } else {
    Alert.alert('Shared', latest.uri);
  }
}

export async function restoreFromBackup(uri?: string) {
  try {
    if (!uri) {
      Alert.alert('Restore failed', 'No backup file provided.');
      return;
    }
    
    const json = await FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
    const backup = JSON.parse(json);

    // TODO: validate version and shape. Upsert into SQLite by your data layer.
    // e.g., await upsertAll('clients', backup.data.clients) etc.

    Alert.alert('Restore', 'Restore completed.');
  } catch (e: unknown) {
    Alert.alert('Restore failed', String(e instanceof Error ? e.message : e));
  }
}
