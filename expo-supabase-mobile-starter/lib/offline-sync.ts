import { supabase } from './supabase'
import { 
  initDatabase,
  // insertData,
  updateData,
  // deleteData,
  queryData,
  executeTransaction
} from './sqlite'
import { OfflineDataManager } from './offline-data'
// import NetInfo from '@react-native-community/netinfo'

// Sync configuration
const SYNC_CONFIG = {
  batchSize: 50,
  retryAttempts: 3,
  retryDelay: 1000,
  maxConcurrent: 2,
  syncInterval: 5 * 60 * 1000 // 5 minutes
}

// Sync status tracking
interface SyncStatus {
  isRunning: boolean
  lastSync: Date | null
  pendingCount: number
  errorCount: number
  currentTable: string | null
  lastError?: string
}

let syncStatus: SyncStatus = {
  isRunning: false,
  lastSync: null,
  pendingCount: 0,
  errorCount: 0,
  currentTable: null
}

// Sync event listeners
type SyncEventListener = (status: SyncStatus) => void
const syncListeners: SyncEventListener[] = []

/**
 * Add sync status listener
 */
export const onSyncStatusChange = (listener: SyncEventListener) => {
  syncListeners.push(listener)
  return () => {
    const index = syncListeners.indexOf(listener)
    if (index > -1) {
      syncListeners.splice(index, 1)
    }
  }
}

/**
 * Update sync status and notify listeners
 */
const updateSyncStatus = (updates: Partial<SyncStatus>) => {
  syncStatus = { ...syncStatus, ...updates }
  syncListeners.forEach(listener => listener(syncStatus))
}

/**
 * Get current sync status
 */
export const getSyncStatus = (): SyncStatus => ({ ...syncStatus })

/**
 * Check if sync is currently running
 */
export const isSyncRunning = (): boolean => syncStatus.isRunning

/**
 * Get unsynced records count
 */
export const getUnsyncedCount = async (): Promise<number> => {
  if (!OfflineDataManager.isOnline()) return 0

  try {
    const tables = ['clients', 'quotes', 'invoices', 'pricebook_items', 'jobs', 'payments']
    let total = 0

    for (const table of tables) {
      const count = await queryData(table, ['COUNT(*) as count'], { synced: 0 })
      total += Number(count[0]?.count) || 0
    }

    return total
  } catch (error) {
    console.warn('Failed to get unsynced count:', error)
    return 0
  }
}

/**
 * Perform full sync of all tables
 */
export const performFullSync = async (): Promise<void> => {
  if (syncStatus.isRunning) {
    console.log('Sync already running, skipping...')
    return
  }

  if (!OfflineDataManager.isOnline()) {
    console.log('Offline, skipping sync...')
    return
  }

  updateSyncStatus({ isRunning: true, errorCount: 0, lastError: undefined })

  try {
    const tables = ['clients', 'quotes', 'invoices', 'pricebook_items', 'jobs', 'payments']
    
    for (const table of tables) {
      updateSyncStatus({ currentTable: table })
      await syncTable(table)
    }

    updateSyncStatus({ 
      isRunning: false, 
      lastSync: new Date(),
      currentTable: null 
    })
  } catch (error) {
    console.error('Full sync failed:', error)
    updateSyncStatus({ 
      isRunning: false, 
      errorCount: syncStatus.errorCount + 1,
      currentTable: null,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Sync a specific table
 */
const syncTable = async (table: string): Promise<void> => {
  console.log(`Syncing table: ${table}`)
  
  try {
    // Get unsynced records
    const unsyncedRecords = await queryData(table, ['*'], { synced: 0 })
    
    if (unsyncedRecords.length === 0) {
      console.log(`No unsynced records for ${table}`)
      return
    }

    // Process in batches
    const batches = chunk(unsyncedRecords, SYNC_CONFIG.batchSize)
    
    for (const batch of batches) {
      await processBatch(table, batch)
      updateSyncStatus({ pendingCount: unsyncedRecords.length - batch.length })
    }

  } catch (error) {
    console.error(`Failed to sync table ${table}:`, error)
    updateSyncStatus({ 
      errorCount: syncStatus.errorCount + 1,
      lastError: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

/**
 * Process a batch of records for sync
 */
const processBatch = async (table: string, records: Record<string, unknown>[]): Promise<void> => {
  const operations = records.map(record => processRecord(table, record))
  
  // Process with limited concurrency
  const results = await Promise.allSettled(operations)
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  console.log(`Batch processed: ${successful} successful, ${failed} failed`)
}

/**
 * Process a single record for sync
 */
const processRecord = async (table: string, record: Record<string, unknown>): Promise<void> => {
  try {
    // Determine operation type based on record state
    let operation: 'INSERT' | 'UPDATE' | 'DELETE'
    
    if (record._deleted) {
      operation = 'DELETE'
    } else if (record._isNew) {
      operation = 'INSERT'
    } else {
      operation = 'UPDATE'
    }

    // Perform the operation
    switch (operation) {
      case 'INSERT':
        await performInsert(table, record)
        break
      case 'UPDATE':
        await performUpdate(table, record)
        break
      case 'DELETE':
        await performDelete(table, record)
        break
    }

    // Mark as synced
    await updateData(table, { synced: 1 }, { id: record.id })

  } catch (error) {
    console.error(`Failed to sync record ${record.id} in ${table}:`, error)
    throw error
  }
}

/**
 * Perform insert operation
 */
const performInsert = async (table: string, record: Record<string, unknown>): Promise<void> => {
  const { error } = await (supabase as any)
    .from(table)
    .insert(cleanRecordForSync(record))
    .select()
    .single()

  if (error) throw error
}

/**
 * Perform update operation
 */
const performUpdate = async (table: string, record: Record<string, unknown>): Promise<void> => {
  const { error } = await (supabase as any)
    .from(table)
    .update(cleanRecordForSync(record))
    .eq('id', record.id)
    .select()
    .single()

  if (error) throw error
}

/**
 * Perform delete operation
 */
const performDelete = async (table: string, record: Record<string, unknown>): Promise<void> => {
  const { error } = await (supabase as any)
    .from(table)
    .delete()
    .eq('id', record.id)

  if (error) throw error
}

/**
 * Clean record for sync (remove local-only fields)
 */
const cleanRecordForSync = (record: Record<string, unknown>): Record<string, unknown> => {
  const { 
    // synced, 
    // _deleted, 
    // _isNew, 
    // _localId,
    ...cleanRecord 
  } = record
  
  return cleanRecord
}

/**
 * Pull latest data from server
 */
export const pullLatestData = async (): Promise<void> => {
  if (!OfflineDataManager.isOnline()) {
    console.log('Offline, skipping pull...')
    return
  }

  try {
    const tables = ['clients', 'quotes', 'invoices', 'pricebook_items', 'jobs', 'payments']
    
    for (const table of tables) {
      await pullTableData(table)
    }

    console.log('Pull completed successfully')
  } catch (error) {
    console.error('Pull failed:', error)
  }
}

/**
 * Pull data for a specific table
 */
const pullTableData = async (table: string): Promise<void> => {
  try {
    // Get last sync timestamp for this table
    const lastSync = syncStatus.lastSync?.toISOString() || '1970-01-01T00:00:00Z'
    
    // Fetch updated records from server
    const { data: serverRecords, error } = await (supabase as any)
      .from(table)
      .select('*')
      .gte('updated_at', lastSync)
      .order('updated_at', { ascending: true })

    if (error) throw error

    if (serverRecords && serverRecords.length > 0) {
      console.log(`Pulling ${serverRecords.length} records for ${table}`)
      
      // Update local database
      await executeTransaction([
        async () => {
          for (const record of serverRecords) {
            await updateData(table, { ...record, synced: 1 }, { id: (record as any).id })
          }
        }
      ])
    }

  } catch (error) {
    console.error(`Failed to pull data for ${table}:`, error)
  }
}

/**
 * Utility function to chunk array
 */
const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Initialize sync system
 */
export const initializeSync = async (): Promise<void> => {
  // Initialize SQLite database
  await initDatabase()
  
  // Set up network change listener
  OfflineDataManager.onNetworkChange((online) => {
    if (online && !syncStatus.isRunning) {
      console.log('Network restored, triggering sync...')
      performFullSync()
    }
  })

  // Perform initial sync if online
  if (OfflineDataManager.isOnline()) {
    await performFullSync()
  }

  // Set up periodic sync
  setInterval(() => {
    if (OfflineDataManager.isOnline() && !syncStatus.isRunning) {
      performFullSync()
    }
  }, SYNC_CONFIG.syncInterval)
}

/**
 * Force sync of specific table
 */
export const forceSyncTable = async (table: string): Promise<void> => {
  if (!OfflineDataManager.isOnline()) {
    throw new Error('Cannot sync while offline')
  }

  await syncTable(table)
}

/**
 * Reset sync status
 */
export const resetSyncStatus = (): void => {
  updateSyncStatus({
    isRunning: false,
    lastSync: null,
    pendingCount: 0,
    errorCount: 0,
    currentTable: null,
    lastError: undefined
  })
}

/**
 * Get sync statistics
 */
export const getSyncStats = async () => {
  const unsyncedCount = await getUnsyncedCount()
  const isOnline = OfflineDataManager.isOnline()
  
  return {
    isOnline,
    isRunning: syncStatus.isRunning,
    lastSync: syncStatus.lastSync,
    pendingCount: unsyncedCount,
    errorCount: syncStatus.errorCount,
    currentTable: syncStatus.currentTable,
    lastError: syncStatus.lastError
  }
}
