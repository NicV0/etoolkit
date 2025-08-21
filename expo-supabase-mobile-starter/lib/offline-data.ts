import NetInfo from '@react-native-community/netinfo'
import { supabase, etoolkit } from './supabase'
import { 
  upsertRecord, 
  getRecords, 
  getRecord, 
  deleteRecord,
  addToSyncQueue,
  updateSyncStatus
} from './sqlite'
import { performSync } from './sync'

// Network status
let isOnline = true

/**
 * Initialize offline data layer
 */
export const initOfflineData = async (): Promise<void> => {
  // Monitor network status
  NetInfo.addEventListener('connectionChange', handleNetworkChange)
  
  // Initial network check
  const netInfo = await NetInfo.fetch()
  isOnline = netInfo.isConnected || false
}

/**
 * Handle network status changes
 */
const handleNetworkChange = (state: any): void => {
  const wasOnline = isOnline
  isOnline = state.isConnected || false
  
  if (!wasOnline && isOnline) {
    // Came back online, trigger sync
    performSync()
  }
}

/**
 * Check if currently online
 */
export const isNetworkOnline = (): boolean => {
  return isOnline
}

/**
 * Generic data operations with offline support
 */
export class OfflineDataLayer {
  /**
   * Create a record
   */
  static async create<T>(
    table: string,
    data: Partial<T>,
    options: { 
      syncImmediately?: boolean
      validateOnline?: boolean 
    } = {}
  ): Promise<T> {
    const { syncImmediately = true, validateOnline = false } = options
    
    if (validateOnline && !isOnline) {
      throw new Error('Network connection required for this operation')
    }
    
    try {
      if (isOnline) {
        // Try online first
        const { data: result, error } = await supabase
          .from(table)
          .insert(data)
          .select()
          .single()
        
        if (error) throw error
        
        // Store in local database
        await upsertRecord(table, { ...result, synced: 1 })
        
        return result as T
      } else {
        // Offline mode - store locally
        const record = {
          ...data,
          id: data.id || `local_${Date.now()}_${Math.random()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synced: 0
        }
        
        await upsertRecord(table, record)
        
        // Add to sync queue
        await addToSyncQueue(table, record.id, 'INSERT', record)
        
        return record as T
      }
    } catch (error) {
      // Fallback to offline mode
      const record = {
        ...data,
        id: data.id || `local_${Date.now()}_${Math.random()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced: 0
      }
      
      await upsertRecord(table, record)
      await addToSyncQueue(table, record.id, 'INSERT', record)
      
      return record as T
    }
  }
  
  /**
   * Update a record
   */
  static async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    options: { 
      syncImmediately?: boolean
      validateOnline?: boolean 
    } = {}
  ): Promise<T> {
    const { syncImmediately = true, validateOnline = false } = options
    
    if (validateOnline && !isOnline) {
      throw new Error('Network connection required for this operation')
    }
    
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    }
    
    try {
      if (isOnline) {
        // Try online first
        const { data: result, error } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        
        // Update local database
        await upsertRecord(table, { ...result, synced: 1 })
        
        return result as T
      } else {
        // Offline mode - update locally
        const existing = await getRecord(table, { id })
        if (!existing) {
          throw new Error(`Record not found: ${table}:${id}`)
        }
        
        const updatedRecord = {
          ...existing,
          ...updateData,
          synced: 0
        }
        
        await upsertRecord(table, updatedRecord)
        await addToSyncQueue(table, id, 'UPDATE', updatedRecord)
        
        return updatedRecord as T
      }
    } catch (error) {
      // Fallback to offline mode
      const existing = await getRecord(table, { id })
      if (!existing) {
        throw new Error(`Record not found: ${table}:${id}`)
      }
      
      const updatedRecord = {
        ...existing,
        ...updateData,
        synced: 0
      }
      
      await upsertRecord(table, updatedRecord)
      await addToSyncQueue(table, id, 'UPDATE', updatedRecord)
      
      return updatedRecord as T
    }
  }
  
  /**
   * Delete a record
   */
  static async delete(
    table: string,
    id: string,
    options: { 
      syncImmediately?: boolean
      validateOnline?: boolean 
    } = {}
  ): Promise<void> {
    const { syncImmediately = true, validateOnline = false } = options
    
    if (validateOnline && !isOnline) {
      throw new Error('Network connection required for this operation')
    }
    
    try {
      if (isOnline) {
        // Try online first
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        // Remove from local database
        await deleteRecord(table, { id })
      } else {
        // Offline mode - mark for deletion
        await deleteRecord(table, { id })
        await addToSyncQueue(table, id, 'DELETE')
      }
    } catch (error) {
      // Fallback to offline mode
      await deleteRecord(table, { id })
      await addToSyncQueue(table, id, 'DELETE')
    }
  }
  
  /**
   * Get a single record
   */
  static async get<T>(
    table: string,
    id: string,
    options: { 
      preferOnline?: boolean
      fallbackToLocal?: boolean 
    } = {}
  ): Promise<T | null> {
    const { preferOnline = true, fallbackToLocal = true } = options
    
    try {
      if (isOnline && preferOnline) {
        // Try online first
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single()
        
        if (!error && data) {
          // Update local cache
          await upsertRecord(table, { ...data, synced: 1 })
          return data as T
        }
      }
      
      if (fallbackToLocal) {
        // Fallback to local database
        const localRecord = await getRecord(table, { id })
        return localRecord as T
      }
      
      return null
    } catch (error) {
      if (fallbackToLocal) {
        const localRecord = await getRecord(table, { id })
        return localRecord as T
      }
      return null
    }
  }
  
  /**
   * Get multiple records
   */
  static async list<T>(
    table: string,
    where?: Record<string, any>,
    orderBy?: string,
    options: { 
      preferOnline?: boolean
      fallbackToLocal?: boolean
      limit?: number 
    } = {}
  ): Promise<T[]> {
    const { preferOnline = true, fallbackToLocal = true, limit } = options
    
    try {
      if (isOnline && preferOnline) {
        // Try online first
        let query = supabase.from(table).select('*')
        
        if (where) {
          Object.entries(where).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }
        
        if (orderBy) {
          query = query.order(orderBy)
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        
        if (!error && data) {
          // Update local cache
          for (const record of data) {
            await upsertRecord(table, { ...record, synced: 1 })
          }
          return data as T[]
        }
      }
      
      if (fallbackToLocal) {
        // Fallback to local database
        const localRecords = await getRecords(table, where, orderBy)
        return localRecords as T[]
      }
      
      return []
    } catch (error) {
      if (fallbackToLocal) {
        const localRecords = await getRecords(table, where, orderBy)
        return localRecords as T[]
      }
      return []
    }
  }
  
  /**
   * Search records
   */
  static async search<T>(
    table: string,
    searchTerm: string,
    searchFields: string[],
    options: { 
      preferOnline?: boolean
      fallbackToLocal?: boolean
      limit?: number 
    } = {}
  ): Promise<T[]> {
    const { preferOnline = true, fallbackToLocal = true, limit = 50 } = options
    
    try {
      if (isOnline && preferOnline) {
        // Try online search
        let query = supabase.from(table).select('*')
        
        // Build search conditions
        const searchConditions = searchFields.map(field => 
          `${field}.ilike.%${searchTerm}%`
        )
        
        if (searchConditions.length > 0) {
          query = query.or(searchConditions.join(','))
        }
        
        if (limit) {
          query = query.limit(limit)
        }
        
        const { data, error } = await query
        
        if (!error && data) {
          // Update local cache
          for (const record of data) {
            await upsertRecord(table, { ...record, synced: 1 })
          }
          return data as T[]
        }
      }
      
      if (fallbackToLocal) {
        // Fallback to local search (basic implementation)
        const localRecords = await getRecords(table)
        const filtered = localRecords.filter(record => 
          searchFields.some(field => 
            record[field]?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
        return filtered.slice(0, limit) as T[]
      }
      
      return []
    } catch (error) {
      if (fallbackToLocal) {
        const localRecords = await getRecords(table)
        const filtered = localRecords.filter(record => 
          searchFields.some(field => 
            record[field]?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
        return filtered.slice(0, limit) as T[]
      }
      return []
    }
  }
  
  /**
   * Count records
   */
  static async count(
    table: string,
    where?: Record<string, any>,
    options: { 
      preferOnline?: boolean
      fallbackToLocal?: boolean 
    } = {}
  ): Promise<number> {
    const { preferOnline = true, fallbackToLocal = true } = options
    
    try {
      if (isOnline && preferOnline) {
        // Try online count
        let query = supabase.from(table).select('*', { count: 'exact', head: true })
        
        if (where) {
          Object.entries(where).forEach(([key, value]) => {
            query = query.eq(key, value)
          })
        }
        
        const { count, error } = await query
        
        if (!error && count !== null) {
          return count
        }
      }
      
      if (fallbackToLocal) {
        // Fallback to local count
        const records = await getRecords(table, where)
        return records.length
      }
      
      return 0
    } catch (error) {
      if (fallbackToLocal) {
        const records = await getRecords(table, where)
        return records.length
      }
      return 0
    }
  }
  
  /**
   * Bulk operations
   */
  static async bulkCreate<T>(
    table: string,
    records: Partial<T>[],
    options: { 
      syncImmediately?: boolean
      validateOnline?: boolean 
    } = {}
  ): Promise<T[]> {
    const { syncImmediately = true, validateOnline = false } = options
    
    if (validateOnline && !isOnline) {
      throw new Error('Network connection required for this operation')
    }
    
    const results: T[] = []
    
    for (const record of records) {
      const result = await this.create(table, record, { syncImmediately: false })
      results.push(result)
    }
    
    if (syncImmediately && isOnline) {
      await performSync()
    }
    
    return results
  }
  
  static async bulkUpdate<T>(
    table: string,
    updates: { id: string; data: Partial<T> }[],
    options: { 
      syncImmediately?: boolean
      validateOnline?: boolean 
    } = {}
  ): Promise<T[]> {
    const { syncImmediately = true, validateOnline = false } = options
    
    if (validateOnline && !isOnline) {
      throw new Error('Network connection required for this operation')
    }
    
    const results: T[] = []
    
    for (const { id, data } of updates) {
      const result = await this.update(table, id, data, { syncImmediately: false })
      results.push(result)
    }
    
    if (syncImmediately && isOnline) {
      await performSync()
    }
    
    return results
  }
  
  static async bulkDelete(
    table: string,
    ids: string[],
    options: { 
      syncImmediately?: boolean
      validateOnline?: boolean 
    } = {}
  ): Promise<void> {
    const { syncImmediately = true, validateOnline = false } = options
    
    if (validateOnline && !isOnline) {
      throw new Error('Network connection required for this operation')
    }
    
    for (const id of ids) {
      await this.delete(table, id, { syncImmediately: false })
    }
    
    if (syncImmediately && isOnline) {
      await performSync()
    }
  }
}

/**
 * Specialized data layers for specific entities
 */
export class ClientDataLayer extends OfflineDataLayer {
  static async getClients(orgId: string, status?: string): Promise<any[]> {
    const where: Record<string, any> = { org_id: orgId }
    if (status) where.status = status
    
    return this.list('clients', where, 'name ASC')
  }
  
  static async searchClients(orgId: string, searchTerm: string): Promise<any[]> {
    return this.search('clients', searchTerm, ['name', 'email', 'phone'], {
      where: { org_id: orgId }
    })
  }
  
  static async getClientWithJobs(clientId: string): Promise<any> {
    const client = await this.get('clients', clientId)
    if (!client) return null
    
    const jobs = await this.list('jobs', { client_id: clientId }, 'created_at DESC')
    
    return {
      ...client,
      jobs
    }
  }
}

export class QuoteDataLayer extends OfflineDataLayer {
  static async getQuotes(orgId: string, status?: string): Promise<any[]> {
    const where: Record<string, any> = { org_id: orgId }
    if (status) where.status = status
    
    return this.list('quotes', where, 'created_at DESC')
  }
  
  static async getQuoteWithItems(quoteId: string): Promise<any> {
    const quote = await this.get('quotes', quoteId)
    if (!quote) return null
    
    const items = await this.list('quote_items', { quote_id: quoteId }, 'sort_order ASC')
    
    return {
      ...quote,
      items
    }
  }
  
  static async createQuoteWithItems(orgId: string, quoteData: any, items: any[]): Promise<any> {
    const quote = await this.create('quotes', { ...quoteData, org_id: orgId })
    
    for (const item of items) {
      await this.create('quote_items', { ...item, quote_id: quote.id })
    }
    
    return this.getQuoteWithItems(quote.id)
  }
}

export class InvoiceDataLayer extends OfflineDataLayer {
  static async getInvoices(orgId: string, status?: string): Promise<any[]> {
    const where: Record<string, any> = { org_id: orgId }
    if (status) where.status = status
    
    return this.list('invoices', where, 'created_at DESC')
  }
  
  static async getInvoiceWithItems(invoiceId: string): Promise<any> {
    const invoice = await this.get('invoices', invoiceId)
    if (!invoice) return null
    
    const items = await this.list('invoice_items', { invoice_id: invoiceId }, 'sort_order ASC')
    const payments = await this.list('payments', { invoice_id: invoiceId }, 'received_at DESC')
    
    return {
      ...invoice,
      items,
      payments
    }
  }
  
  static async recordPayment(invoiceId: string, paymentData: any): Promise<any> {
    const payment = await this.create('payments', { ...paymentData, invoice_id: invoiceId })
    
    // Update invoice balance
    const invoice = await this.get('invoices', invoiceId)
    if (invoice) {
      const newBalance = parseFloat(invoice.balance_due) - parseFloat(payment.amount)
      await this.update('invoices', invoiceId, { balance_due: newBalance.toString() })
    }
    
    return payment
  }
}

export class PricebookDataLayer extends OfflineDataLayer {
  static async getPricebookItems(orgId: string, category?: string): Promise<any[]> {
    const where: Record<string, any> = { org_id: orgId, active: 1 }
    if (category) where.category = category
    
    return this.list('pricebook_items', where, 'name ASC')
  }
  
  static async getQuickPicks(orgId: string): Promise<any[]> {
    return this.list('pricebook_items', { org_id: orgId, is_quick_pick: 1, active: 1 }, 'name ASC')
  }
  
  static async searchPricebook(orgId: string, searchTerm: string): Promise<any[]> {
    return this.search('pricebook_items', searchTerm, ['name', 'code', 'category'], {
      where: { org_id: orgId, active: 1 }
    })
  }
}

/**
 * Offline data utilities
 */
export const offlineDataUtils = {
  initOfflineData,
  isNetworkOnline,
  OfflineDataLayer,
  ClientDataLayer,
  QuoteDataLayer,
  InvoiceDataLayer,
  PricebookDataLayer
}
