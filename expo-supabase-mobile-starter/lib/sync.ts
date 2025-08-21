import NetInfo from '@react-native-community/netinfo'
import { supabase, etoolkit } from './supabase'
import { 
  initDatabase, 
  upsertRecord, 
  getRecords, 
  getRecord, 
  deleteRecord,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncStatus,
  getUnsyncedRecords,
  clearAllData
} from './sqlite'

// Sync configuration
const SYNC_CONFIG = {
  batchSize: 50,
  retryLimit: 3,
  syncInterval: 30000, // 30 seconds
  conflictResolution: 'server-wins' as const
}

// Sync status
let isSyncing = false
let syncInterval: NodeJS.Timeout | null = null

/**
 * Initialize sync service
 */
export const initSync = async (): Promise<void> => {
  // Initialize SQLite database
  await initDatabase()
  
  // Start periodic sync
  startPeriodicSync()
  
  // Initial sync
  await performSync()
}

/**
 * Start periodic sync
 */
export const startPeriodicSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval)
  }
  
  syncInterval = setInterval(async () => {
    if (!isSyncing) {
      await performSync()
    }
  }, SYNC_CONFIG.syncInterval)
}

/**
 * Stop periodic sync
 */
export const stopPeriodicSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

/**
 * Check network connectivity
 */
const isNetworkConnected = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch()
    return netInfo.isConnected || false
  } catch {
    return false
  }
}

/**
 * Perform full sync
 */
export const performSync = async (): Promise<void> => {
  if (isSyncing) return
  
  const isConnected = await isNetworkConnected()
  if (!isConnected) {
    console.log('Sync: No network connection')
    return
  }
  
  isSyncing = true
  
  try {
    // Sync from server to local
    await syncFromServer()
    
    // Sync from local to server
    await syncToServer()
    
    // Process sync queue
    await processSyncQueue()
    
    console.log('Sync: Completed successfully')
  } catch (error) {
    console.error('Sync: Error during sync', error)
  } finally {
    isSyncing = false
  }
}

/**
 * Sync data from server to local
 */
const syncFromServer = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('user_id', user.id)
    .single()
  
  if (!profile?.org_id) return
  
  const orgId = profile.org_id
  
  // Sync organizations
  await syncTable('organizations', { id: orgId })
  
  // Sync profiles
  await syncTable('profiles', { org_id: orgId })
  
  // Sync clients
  await syncTable('clients', { org_id: orgId })
  
  // Sync jobs
  await syncTable('jobs', { org_id: orgId })
  
  // Sync pricebook items
  await syncTable('pricebook_items', { org_id: orgId })
  
  // Sync quotes
  await syncTable('quotes', { org_id: orgId })
  
  // Sync quote items
  await syncTable('quote_items', { org_id: orgId })
  
  // Sync invoices
  await syncTable('invoices', { org_id: orgId })
  
  // Sync invoice items
  await syncTable('invoice_items', { org_id: orgId })
  
  // Sync payments
  await syncTable('payments', { org_id: orgId })
  
  // Sync settings
  await syncTable('settings', { org_id: orgId })
}

/**
 * Sync a specific table from server to local
 */
const syncTable = async (table: string, where: Record<string, any>): Promise<void> => {
  try {
    // Get last sync timestamp
    const lastSync = await getLastSyncTimestamp(table)
    
    // Build query
    let query = supabase.from(table).select('*')
    
    // Add where conditions
    Object.entries(where).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
    
    // Add updated_at filter if we have a last sync
    if (lastSync) {
      query = query.gt('updated_at', lastSync)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error(`Sync: Error fetching ${table}`, error)
      return
    }
    
    // Update local database
    for (const record of data || []) {
      await upsertRecord(table, {
        ...record,
        synced: 1
      })
    }
    
    // Update sync timestamp
    await updateLastSyncTimestamp(table)
    
    console.log(`Sync: Synced ${data?.length || 0} records from ${table}`)
  } catch (error) {
    console.error(`Sync: Error syncing ${table}`, error)
  }
}

/**
 * Sync data from local to server
 */
const syncToServer = async (): Promise<void> => {
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
  
  for (const table of tables) {
    await syncTableToServer(table)
  }
}

/**
 * Sync a specific table from local to server
 */
const syncTableToServer = async (table: string): Promise<void> => {
  try {
    // Get unsynced records
    const unsyncedRecords = await getUnsyncedRecords(table)
    
    if (unsyncedRecords.length === 0) return
    
    console.log(`Sync: Syncing ${unsyncedRecords.length} records to ${table}`)
    
    // Process in batches
    for (let i = 0; i < unsyncedRecords.length; i += SYNC_CONFIG.batchSize) {
      const batch = unsyncedRecords.slice(i, i + SYNC_CONFIG.batchSize)
      
      for (const record of batch) {
        try {
          // Remove synced flag for server operation
          const { synced, ...serverData } = record
          
          let result
          if (record.id) {
            // Update existing record
            const { data, error } = await supabase
              .from(table)
              .update(serverData)
              .eq('id', record.id)
              .select()
              .single()
            
            if (error) throw error
            result = data
          } else {
            // Insert new record
            const { data, error } = await supabase
              .from(table)
              .insert(serverData)
              .select()
              .single()
            
            if (error) throw error
            result = data
          }
          
          // Update local record with server data
          await upsertRecord(table, {
            ...result,
            synced: 1
          })
          
        } catch (error) {
          console.error(`Sync: Error syncing record to ${table}`, error)
          // Add to sync queue for retry
          await addToSyncQueue(table, record.id || 'new', 'UPDATE', record)
        }
      }
    }
  } catch (error) {
    console.error(`Sync: Error syncing ${table} to server`, error)
  }
}

/**
 * Process sync queue
 */
const processSyncQueue = async (): Promise<void> => {
  try {
    const queue = await getSyncQueue()
    
    for (const item of queue) {
      try {
        const { table_name, record_id, operation, data } = item
        
        if (operation === 'DELETE') {
          // Handle delete operation
          const { error } = await supabase
            .from(table_name)
            .delete()
            .eq('id', record_id)
          
          if (error) throw error
        } else {
          // Handle insert/update operations
          const recordData = data ? JSON.parse(data) : {}
          
          if (operation === 'INSERT') {
            const { error } = await supabase
              .from(table_name)
              .insert(recordData)
            
            if (error) throw error
          } else if (operation === 'UPDATE') {
            const { error } = await supabase
              .from(table_name)
              .update(recordData)
              .eq('id', record_id)
            
            if (error) throw error
          }
        }
        
        // Remove from queue on success
        await removeFromSyncQueue(item.id)
        
      } catch (error) {
        console.error('Sync: Error processing queue item', error)
        
        // Increment retry count
        item.retry_count = (item.retry_count || 0) + 1
        
        // Remove from queue if max retries reached
        if (item.retry_count >= SYNC_CONFIG.retryLimit) {
          await removeFromSyncQueue(item.id)
          console.error(`Sync: Max retries reached for queue item ${item.id}`)
        }
      }
    }
  } catch (error) {
    console.error('Sync: Error processing sync queue', error)
  }
}

/**
 * Get last sync timestamp for a table
 */
const getLastSyncTimestamp = async (table: string): Promise<string | null> => {
  try {
    const result = await getRecord('sync_timestamps', { table_name: table })
    return result?.last_sync || null
  } catch {
    return null
  }
}

/**
 * Update last sync timestamp for a table
 */
const updateLastSyncTimestamp = async (table: string): Promise<void> => {
  try {
    const timestamp = new Date().toISOString()
    await upsertRecord('sync_timestamps', {
      table_name: table,
      last_sync: timestamp,
      updated_at: timestamp
    })
  } catch (error) {
    console.error(`Sync: Error updating timestamp for ${table}`, error)
  }
}

/**
 * Force sync specific table
 */
export const forceSyncTable = async (table: string): Promise<void> => {
  if (isSyncing) return
  
  isSyncing = true
  
  try {
    await syncTable(table, {})
    await syncTableToServer(table)
    console.log(`Sync: Force sync completed for ${table}`)
  } catch (error) {
    console.error(`Sync: Error force syncing ${table}`, error)
  } finally {
    isSyncing = false
  }
}

/**
 * Get sync status
 */
export const getSyncStatus = async (): Promise<{
  isSyncing: boolean
  lastSync: string | null
  pendingChanges: number
  queueSize: number
}> => {
  const queue = await getSyncQueue()
  const lastSync = await getLastSyncTimestamp('sync_status')
  
  // Count pending changes
  let pendingChanges = 0
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
  
  for (const table of tables) {
    const unsynced = await getUnsyncedRecords(table)
    pendingChanges += unsynced.length
  }
  
  return {
    isSyncing,
    lastSync,
    pendingChanges,
    queueSize: queue.length
  }
}

/**
 * Clear all local data
 */
export const clearLocalData = async (): Promise<void> => {
  await clearAllData()
  console.log('Sync: Local data cleared')
}

/**
 * Export local data
 */
export const exportLocalData = async (): Promise<string> => {
  const { exportDatabase } = await import('./sqlite')
  return await exportDatabase()
}

/**
 * Import local data
 */
export const importLocalData = async (data: string): Promise<void> => {
  const { importDatabase } = await import('./sqlite')
  await importDatabase(data)
  console.log('Sync: Local data imported')
}

/**
 * Resolve conflicts
 */
export const resolveConflict = async (
  table: string,
  localRecord: any,
  serverRecord: any,
  resolution: 'local' | 'server' | 'merge' = 'server'
): Promise<void> => {
  try {
    let resolvedRecord
    
    switch (resolution) {
      case 'local':
        resolvedRecord = localRecord
        break
      case 'server':
        resolvedRecord = serverRecord
        break
      case 'merge':
        resolvedRecord = {
          ...serverRecord,
          ...localRecord,
          updated_at: new Date().toISOString()
        }
        break
    }
    
    // Update server
    const { error } = await supabase
      .from(table)
      .update(resolvedRecord)
      .eq('id', localRecord.id)
    
    if (error) throw error
    
    // Update local
    await upsertRecord(table, {
      ...resolvedRecord,
      synced: 1
    })
    
    console.log(`Sync: Conflict resolved for ${table}:${localRecord.id}`)
  } catch (error) {
    console.error(`Sync: Error resolving conflict for ${table}:${localRecord.id}`, error)
  }
}

/**
 * Sync utilities
 */
export const syncUtils = {
  initSync,
  startPeriodicSync,
  stopPeriodicSync,
  performSync,
  forceSyncTable,
  getSyncStatus,
  clearLocalData,
  exportLocalData,
  importLocalData,
  resolveConflict
}
