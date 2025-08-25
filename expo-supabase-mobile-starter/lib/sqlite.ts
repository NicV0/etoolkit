import * as SQLite from 'expo-sqlite'
// import { Platform } from 'react-native'

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
  `)

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
  `)

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
  `)

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
      unit_price TEXT NOT NULL,
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
      tax_rate_pct TEXT DEFAULT '0',
      discount_amt TEXT DEFAULT '0',
      subtotal TEXT DEFAULT '0',
      tax_total TEXT DEFAULT '0',
      total TEXT DEFAULT '0',
      terms TEXT,
      valid_until TEXT,
      sent_at TEXT,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
      FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL,
      FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE SET NULL,
      UNIQUE(org_id, number)
    )
  `)

  // Quote items table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS quote_items (
      id TEXT PRIMARY KEY,
      quote_id TEXT NOT NULL,
      item_id TEXT,
      description TEXT NOT NULL,
      quantity TEXT NOT NULL DEFAULT '1',
      unit_price TEXT NOT NULL,
      taxable INTEGER DEFAULT 1,
      line_total TEXT NOT NULL,
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
      tax_rate_pct TEXT DEFAULT '0',
      discount_amt TEXT DEFAULT '0',
      subtotal TEXT DEFAULT '0',
      tax_total TEXT DEFAULT '0',
      total TEXT DEFAULT '0',
      balance_due TEXT DEFAULT '0',
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
      FOREIGN KEY (quote_id) REFERENCES quotes (id) ON DELETE SET NULL,
      UNIQUE(org_id, number)
    )
  `)

  // Invoice items table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      item_id TEXT,
      description TEXT NOT NULL,
      quantity TEXT NOT NULL DEFAULT '1',
      unit_price TEXT NOT NULL,
      taxable INTEGER DEFAULT 1,
      line_total TEXT NOT NULL,
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
      amount TEXT NOT NULL,
      received_at TEXT,
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

  // Create indexes for better performance
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_clients_org_id ON clients(org_id);
    CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
    CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON jobs(org_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_quotes_org_id ON quotes(org_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_pricebook_org_id ON pricebook_items(org_id);
    CREATE INDEX IF NOT EXISTS idx_pricebook_active ON pricebook_items(active);
  `)
}

/**
 * Execute a transaction
 */
export const executeTransaction = async (operations: (() => Promise<void>)[]): Promise<void> => {
  const database = getDatabase()
  await database.execAsync('BEGIN TRANSACTION')
  
  try {
    for (const operation of operations) {
      await operation()
    }
    await database.execAsync('COMMIT')
  } catch (error) {
    await database.execAsync('ROLLBACK')
    throw error
  }
}

/**
 * Insert data into a table
 */
export const insertData = async (table: string, data: Record<string, unknown>): Promise<void> => {
  const database = getDatabase()
  
  const columns = Object.keys(data)
  const values = Object.values(data)
  const placeholders = columns.map(() => '?').join(', ')
  
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
  
  await database.runAsync(sql, values as SQLite.SQLiteBindValue[])
}

/**
 * Update data in a table
 */
export const updateData = async (table: string, data: Record<string, unknown>, where: Record<string, unknown>): Promise<void> => {
  const database = getDatabase()
  
  const setColumns = Object.keys(data)
  const setValues = Object.values(data)
  const whereColumns = Object.keys(where)
  const whereValues = Object.values(where)
  
  const setClause = setColumns.map(col => `${col} = ?`).join(', ')
  const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ')
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`
  const values = [...setValues, ...whereValues] as SQLite.SQLiteBindValue[]
  
  await database.runAsync(sql, values)
}

/**
 * Delete data from a table
 */
export const deleteData = async (table: string, where: Record<string, unknown>): Promise<void> => {
  const database = getDatabase()
  
  const whereColumns = Object.keys(where)
  const whereValues = Object.values(where)
  
  const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ')
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`
  
  await database.runAsync(sql, whereValues as SQLite.SQLiteBindValue[])
}

/**
 * Query data from a table
 */
export const queryData = async <T = Record<string, unknown>>(
  table: string, 
  columns: string[] = ['*'], 
  where?: Record<string, unknown>,
  orderBy?: string,
  limit?: number
): Promise<T[]> => {
  const database = getDatabase()
  
  let sql = `SELECT ${columns.join(', ')} FROM ${table}`
  const values: SQLite.SQLiteBindValue[] = []
  
  if (where) {
    const whereColumns = Object.keys(where)
    const whereValues = Object.values(where)
    const whereClause = whereColumns.map(col => `${col} = ?`).join(' AND ')
    sql += ` WHERE ${whereClause}`
    values.push(...whereValues as SQLite.SQLiteBindValue[])
  }
  
  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`
  }
  
  if (limit) {
    sql += ` LIMIT ${limit}`
  }
  
  const result = await database.getAllAsync(sql, values)
  return result as T[]
}

/**
 * Get a single record
 */
export const getData = async <T = Record<string, unknown>>(
  table: string, 
  columns: string[] = ['*'], 
  where: Record<string, unknown>
): Promise<T | null> => {
  const results = await queryData<T>(table, columns, where, undefined, 1)
  return results.length > 0 ? results[0] : null
}

/**
 * Count records in a table
 */
export const countData = async (table: string, where?: Record<string, unknown>): Promise<number> => {
  const database = getDatabase()
  let sql = `SELECT COUNT(*) as count FROM ${table}`
  const values: SQLite.SQLiteBindValue[] = []

  if (where && Object.keys(where).length > 0) {
    const conditions = Object.keys(where).map(key => `${key} = ?`)
    sql += ` WHERE ${conditions.join(' AND ')}`
    values.push(...Object.values(where) as SQLite.SQLiteBindValue[])
  }

  const result = await database.getFirstAsync(sql, values)
  return (result as Record<string, unknown>)?.count as number || 0
}

/**
 * Check if database is initialized
 */
export const isDatabaseInitialized = (): boolean => {
  return db !== null
}

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync()
    db = null
  }
}

/**
 * Get database size
 */
export const getDatabaseSize = async (): Promise<number> => {
  const database = getDatabase()
  
  const result = await database.getFirstAsync('PRAGMA page_count')
  const pageCount = (result as Record<string, unknown>)?.page_count as number || 0
  
  const result2 = await database.getFirstAsync('PRAGMA page_size')
  const pageSize = (result2 as Record<string, unknown>)?.page_size as number || 0
  
  return pageCount * pageSize
}
