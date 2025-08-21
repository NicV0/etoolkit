import * as SQLite from 'expo-sqlite'
import { Platform } from 'react-native'

// Database name
const DATABASE_NAME = 'etoolkit.db'

// Database instance
let db: SQLite.SQLiteDatabase | null = null

/**
 * Initialize SQLite database
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db

  db = await SQLite.openDatabaseAsync(DATABASE_NAME)
  
  // Create tables
  await createTables()
  
  return db
}

/**
 * Get database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * Create all tables
 */
const createTables = async (): Promise<void> => {
  const database = getDatabase()
  
  // Organizations table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      trade TEXT NOT NULL,
      size TEXT,
      plan TEXT NOT NULL DEFAULT 'free',
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0
    )
  `, false)

  // Profiles table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id TEXT PRIMARY KEY,
      org_id TEXT,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
    )
  `, false)

  // Clients table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address_line1 TEXT,
      address_line2 TEXT,
      city TEXT,
      state TEXT,
      postal TEXT,
      country TEXT DEFAULT 'US',
      notes TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
    )
  `, false)

  // Jobs table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      client_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      location TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL
    )
  `)

  // Pricebook items table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS pricebook_items (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      code TEXT,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT DEFAULT 'each',
      unit_price REAL NOT NULL,
      taxable INTEGER DEFAULT 1,
      active INTEGER DEFAULT 1,
      is_quick_pick INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
    )
  `)

  // Quotes table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      number TEXT NOT NULL,
      client_id TEXT,
      job_id TEXT,
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'USD',
      tax_rate_pct REAL DEFAULT 0,
      discount_amt REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      tax_total REAL DEFAULT 0,
      total REAL DEFAULT 0,
      terms TEXT,
      valid_until TEXT,
      sent_at TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL,
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE SET NULL
    )
  `)

  // Quote items table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      item_id TEXT,
      description TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      taxable INTEGER DEFAULT 1,
      line_total REAL NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (quote_id) REFERENCES quotes (id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES pricebook_items (id) ON DELETE SET NULL
    )
  `)

  // Invoices table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      number TEXT NOT NULL,
      client_id TEXT,
      job_id TEXT,
      quote_id TEXT,
      status TEXT DEFAULT 'draft',
      currency TEXT DEFAULT 'USD',
      tax_rate_pct REAL DEFAULT 0,
      discount_amt REAL DEFAULT 0,
      subtotal REAL DEFAULT 0,
      tax_total REAL DEFAULT 0,
      total REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      issue_date TEXT,
      due_date TEXT,
      sent_at TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL,
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE SET NULL,
      FOREIGN KEY (quote_id) REFERENCES quotes (id) ON DELETE SET NULL
    )
  `)

  // Invoice items table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      item_id TEXT,
      description TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL,
      taxable INTEGER DEFAULT 1,
      line_total REAL NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
      FOREIGN KEY (item_id) REFERENCES pricebook_items (id) ON DELETE SET NULL
    )
  `)

  // Payments table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      received_at TEXT NOT NULL,
      note TEXT,
      external_id TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
    )
  `)

  // Settings table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      org_id TEXT PRIMARY KEY,
      currency TEXT DEFAULT 'USD',
      default_tax_pct TEXT DEFAULT '0',
      numbering_prefix_quote TEXT DEFAULT 'Q',
      numbering_prefix_invoice TEXT DEFAULT 'INV',
      logo_url TEXT,
      legal_name TEXT,
      address_json TEXT,
      terms_default TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE
    )
  `)

  // Sync queue table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT,
      created_at TEXT NOT NULL,
      retry_count INTEGER DEFAULT 0
    )
  `)

  // Sync timestamps table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_timestamps (
      table_name TEXT PRIMARY KEY,
      last_sync TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Create indexes
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients (org_id)`)
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs (org_id)`)
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_quotes_org_id ON quotes (org_id)`)
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices (org_id)`)
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_pricebook_org_id ON pricebook_items (org_id)`)
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue (table_name)`)
}

/**
 * Insert or update record
 */
export const upsertRecord = async (
  table: string,
  data: Record<string, any>
): Promise<void> => {
  const database = getDatabase()
  
  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map(() => '?').join(', ')
  const updateClause = columns.map(col => `${col} = ?`).join(', ')
  
  const sql = `
    INSERT OR REPLACE INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
  `
  
  await database.runAsync(sql, [...values, ...values])
}

/**
 * Get records from table
 */
export const getRecords = async (
  table: string,
  where?: Record<string, any>,
  orderBy?: string
): Promise<any[]> => {
  const database = getDatabase()
  
  let sql = `SELECT * FROM ${table}`
  const params: any[] = []
  
  if (where && Object.keys(where).length > 0) {
    const conditions = Object.keys(where).map(key => `${key} = ?`)
    sql += ` WHERE ${conditions.join(' AND ')}`
    params.push(...Object.values(where))
  }
  
  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`
  }
  
  const result = await database.getAllAsync(sql, params)
  return result
}

/**
 * Get single record
 */
export const getRecord = async (
  table: string,
  where: Record<string, any>
): Promise<any | null> => {
  const database = getDatabase()
  
  const conditions = Object.keys(where).map(key => `${key} = ?`)
  const sql = `SELECT * FROM ${table} WHERE ${conditions.join(' AND ')} LIMIT 1`
  
  const result = await database.getFirstAsync(sql, Object.values(where))
  return result
}

/**
 * Delete record
 */
export const deleteRecord = async (
  table: string,
  where: Record<string, any>
): Promise<void> => {
  const database = getDatabase()
  
  const conditions = Object.keys(where).map(key => `${key} = ?`)
  const sql = `DELETE FROM ${table} WHERE ${conditions.join(' AND ')}`
  
  await database.runAsync(sql, Object.values(where))
}

/**
 * Add to sync queue
 */
export const addToSyncQueue = async (
  tableName: string,
  recordId: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  data?: any
): Promise<void> => {
  const database = getDatabase()
  
  const sql = `
    INSERT INTO sync_queue (id, table_name, record_id, operation, data, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  
  await database.runAsync(sql, [
    `${tableName}_${recordId}_${Date.now()}`,
    tableName,
    recordId,
    operation,
    data ? JSON.stringify(data) : null,
    new Date().toISOString()
  ])
}

/**
 * Get sync queue
 */
export const getSyncQueue = async (): Promise<any[]> => {
  const database = getDatabase()
  
  const sql = `
    SELECT * FROM sync_queue 
    ORDER BY created_at ASC 
    LIMIT 50
  `
  
  return await database.getAllAsync(sql)
}

/**
 * Remove from sync queue
 */
export const removeFromSyncQueue = async (id: string): Promise<void> => {
  const database = getDatabase()
  
  const sql = `DELETE FROM sync_queue WHERE id = ?`
  await database.runAsync(sql, [id])
}

/**
 * Update sync status
 */
export const updateSyncStatus = async (
  table: string,
  recordId: string,
  synced: boolean
): Promise<void> => {
  const database = getDatabase()
  
  const sql = `UPDATE ${table} SET synced = ? WHERE id = ?`
  await database.runAsync(sql, [synced ? 1 : 0, recordId])
}

/**
 * Get unsynced records
 */
export const getUnsyncedRecords = async (table: string): Promise<any[]> => {
  const database = getDatabase()
  
  const sql = `SELECT * FROM ${table} WHERE synced = 0`
  return await database.getAllAsync(sql)
}

/**
 * Clear all data
 */
export const clearAllData = async (): Promise<void> => {
  const database = getDatabase()
  
  const tables = [
    'payments',
    'invoice_items',
    'invoices',
    'quote_items',
    'quotes',
    'pricebook_items',
    'jobs',
    'clients',
    'settings',
    'profiles',
    'organizations',
    'sync_queue'
  ]
  
  for (const table of tables) {
    await database.execAsync(`DELETE FROM ${table}`)
  }
}

/**
 * Get database size
 */
export const getDatabaseSize = async (): Promise<number> => {
  const database = getDatabase()
  
  const result = await database.getFirstAsync(`
    SELECT page_count * page_size as size 
    FROM pragma_page_count(), pragma_page_size()
  `)
  
  return result?.size || 0
}

/**
 * Export database
 */
export const exportDatabase = async (): Promise<string> => {
  const database = getDatabase()
  
  const tables = [
    'organizations',
    'profiles',
    'clients',
    'jobs',
    'pricebook_items',
    'quotes',
    'quote_items',
    'invoices',
    'invoice_items',
    'payments',
    'settings'
  ]
  
  const exportData: Record<string, any[]> = {}
  
  for (const table of tables) {
    const records = await database.getAllAsync(`SELECT * FROM ${table}`)
    exportData[table] = records
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Import database
 */
export const importDatabase = async (data: string): Promise<void> => {
  const database = getDatabase()
  const importData = JSON.parse(data)
  
  await database.transactionAsync(async () => {
    for (const [table, records] of Object.entries(importData)) {
      for (const record of records as any[]) {
        const columns = Object.keys(record)
        const values = Object.values(record)
        const placeholders = columns.map(() => '?').join(', ')
        
        const sql = `
          INSERT OR REPLACE INTO ${table} (${columns.join(', ')})
          VALUES (${placeholders})
        `
        
        await database.runAsync(sql, values)
      }
    }
  })
}

/**
 * Close database
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync()
    db = null
  }
}

/**
 * Database utilities
 */
export const databaseUtils = {
  initDatabase,
  getDatabase,
  upsertRecord,
  getRecords,
  getRecord,
  deleteRecord,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncStatus,
  getUnsyncedRecords,
  clearAllData,
  getDatabaseSize,
  exportDatabase,
  importDatabase,
  closeDatabase
}
