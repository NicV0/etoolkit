import NetInfo from '@react-native-community/netinfo'
import { 
  initDatabase,
  insertData,
  updateData,
  deleteData,
  queryData,
  // getData,
  countData,
  executeTransaction
} from './sqlite'

// Types for offline data management
interface OfflineRecord {
  id: string
  synced: boolean
  created_at: string
  updated_at: string
}

interface OfflineOptions {
  preferOnline?: boolean
  fallbackToLocal?: boolean
  limit?: number
}

interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Network state management
let isOnline = true
let networkListeners: Array<(online: boolean) => void> = []

const handleNetworkChange = (state: { isConnected: boolean | null; isInternetReachable?: boolean | null }) => {
  const wasOnline = isOnline
  isOnline = (state.isConnected ?? false) && (state.isInternetReachable ?? true)
  
  if (wasOnline !== isOnline) {
    networkListeners.forEach(listener => listener(isOnline))
  }
}

// Initialize network monitoring
NetInfo.addEventListener(handleNetworkChange)

export const OfflineDataManager = {
  /**
   * Check if currently online
   */
  isOnline: () => isOnline,

  /**
   * Add network state listener
   */
  onNetworkChange: (listener: (online: boolean) => void) => {
    networkListeners.push(listener)
    return () => {
      networkListeners = networkListeners.filter(l => l !== listener)
    }
  },

  /**
   * Initialize offline data layer
   */
  initialize: async () => {
    await initDatabase()
  }
}

/**
 * Base class for offline-first data layers
 */
export abstract class OfflineDataLayer<T extends OfflineRecord> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const now = new Date().toISOString()
    const record: T = {
      ...data,
      id: (data as { id?: string }).id || `local_${Date.now()}_${Math.random()}`,
      synced: false,
      created_at: now,
      updated_at: now
    } as T

    await insertData(this.tableName, record as Record<string, unknown>)
    return record
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const now = new Date().toISOString()
    const updates = {
      ...data,
      synced: false,
      updated_at: now
    }

    await updateData(this.tableName, updates, { id })
    
    const updated = await this.get(id)
    if (!updated) {
      throw new Error(`Record ${id} not found`)
    }
    
    return updated
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    await deleteData(this.tableName, { id })
  }

  /**
   * Get a single record
   */
  async get(id: string): Promise<T | null> {
    const results = await queryData<T>(this.tableName, ['*'], { id }, undefined, 1)
    return results.length > 0 ? results[0] : null
  }

  /**
   * List records with filtering and pagination
   */
  async list(
    filters: Record<string, unknown> = {},
    options: OfflineOptions = {}
  ): Promise<PaginatedResult<T>> {
    const { limit = 50 } = options
    
    const results = await queryData<T>(
      this.tableName,
      ['*'],
      filters,
      'created_at DESC',
      limit
    )
    
    const total = await countData(this.tableName, filters)
    
    return {
      data: results,
      total,
      page: 1,
      limit,
      hasMore: total > limit
    }
  }

  /**
   * Search records
   */
  async search(query: string, fields: string[]): Promise<T[]> {
    // Simple search implementation - in production, you'd use full-text search
    const allRecords = await queryData<T>(this.tableName)
    
    const filtered = allRecords.filter(record =>
      fields.some(field => {
        const value = (record as Record<string, unknown>)[field]
        return value && value.toString().toLowerCase().includes(query.toLowerCase())
      })
    )
    
    return filtered
  }

  /**
   * Get unsynced records
   */
  async getUnsynced(): Promise<T[]> {
    return await queryData<T>(this.tableName, ['*'], { synced: false })
  }

  /**
   * Mark record as synced
   */
  async markSynced(id: string): Promise<void> {
    await updateData(this.tableName, { synced: true }, { id })
  }

  /**
   * Bulk operations
   */
  async bulkCreate(records: Partial<T>[]): Promise<T[]> {
    const created: T[] = []
    
    await executeTransaction([
      async () => {
        for (const record of records) {
          const createdRecord = await this.create(record)
          created.push(createdRecord)
        }
      }
    ])
    
    return created
  }

  async bulkUpdate(updates: Array<{ id: string; data: Partial<T> }>): Promise<T[]> {
    const updated: T[] = []
    
    await executeTransaction([
      async () => {
        for (const { id, data } of updates) {
          const updatedRecord = await this.update(id, data)
          updated.push(updatedRecord)
        }
      }
    ])
    
    return updated
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await executeTransaction([
      async () => {
        for (const id of ids) {
          await this.delete(id)
        }
      }
    ])
  }
}

/**
 * Client data layer with jobs relationship
 */
export class ClientDataLayer extends OfflineDataLayer<OfflineRecord & Record<string, unknown>> {
  constructor() {
    super('clients')
  }

  async getWithJobs(clientId: string): Promise<(OfflineRecord & Record<string, unknown>) | null> {
    const client = await this.get(clientId)
    if (!client) return null

    const jobs = await queryData('jobs', ['*'], { client_id: clientId })
    return { ...client, jobs }
  }

  async searchClients(query: string): Promise<(OfflineRecord & Record<string, unknown>)[]> {
    return await this.search(query, ['name', 'email', 'phone'])
  }
}

/**
 * Quote data layer with items relationship
 */
export class QuoteDataLayer extends OfflineDataLayer<OfflineRecord & Record<string, unknown>> {
  constructor() {
    super('quotes')
  }

  async createWithItems(quoteData: Record<string, unknown>, items: Record<string, unknown>[]): Promise<(OfflineRecord & Record<string, unknown>) | null> {
    let quote!: OfflineRecord & Record<string, unknown>

    await executeTransaction([
      async () => {
        quote = await this.create(quoteData)
        
        for (const item of items) {
          await insertData('quote_items', { ...item, quote_id: quote.id })
        }
      }
    ])

    return this.getQuoteWithItems(quote.id)
  }

  async getQuoteWithItems(quoteId: string): Promise<(OfflineRecord & Record<string, unknown>) | null> {
    const quote = await this.get(quoteId)
    if (!quote) return null

    const items = await queryData('quote_items', ['*'], { quote_id: quoteId })
    return { ...quote, quote_items: items }
  }

  async convertToInvoice(quoteId: string): Promise<(OfflineRecord & Record<string, unknown>) | null> {
    const quote = await this.getQuoteWithItems(quoteId)
    if (!quote) throw new Error('Quote not found')

    const invoiceData = {
      org_id: quote.org_id,
      client_id: quote.client_id,
      job_id: quote.job_id,
      quote_id: quote.id,
      number: `INV-${Date.now()}`,
      status: 'draft',
      currency: quote.currency,
      tax_rate_pct: quote.tax_rate_pct,
      discount_amt: quote.discount_amt,
      subtotal: quote.subtotal,
      tax_total: quote.tax_total,
      total: quote.total,
      issue_date: new Date().toISOString()
    }

    await insertData('invoices', invoiceData)
    const invoice = await this.get(`INV-${Date.now()}`)
    
    // Copy quote items to invoice items
    for (const item of (quote.quote_items as Record<string, unknown>[])) {
      await insertData('invoice_items', {
        ...item,
        invoice_id: invoice?.id,
        quote_item_id: item.id
      })
    }

    return invoice
  }
}

/**
 * Invoice data layer with payments relationship
 */
export class InvoiceDataLayer extends OfflineDataLayer<OfflineRecord & Record<string, unknown>> {
  constructor() {
    super('invoices')
  }

  async getWithPayments(invoiceId: string): Promise<(OfflineRecord & Record<string, unknown>) | null> {
    const invoice = await this.get(invoiceId)
    if (!invoice) return null

    const payments = await queryData('payments', ['*'], { invoice_id: invoiceId })
    return { ...invoice, payments }
  }

  async recordPayment(invoiceId: string, paymentData: Record<string, unknown>): Promise<Record<string, unknown>> {
    const invoice = await this.get(invoiceId)
    if (!invoice) throw new Error('Invoice not found')

    await insertData('payments', {
      ...paymentData,
      invoice_id: invoiceId,
      received_at: new Date().toISOString()
    })

    const payment = await queryData('payments', ['*'], { invoice_id: invoiceId }, undefined, 1)
    const paymentRecord = payment[0]

    // Update invoice balance
    const newBalance = parseFloat(invoice.balance_due as string) - parseFloat(paymentRecord.amount as string)
    await this.update(invoiceId, { balance_due: newBalance.toString() })

    return paymentRecord
  }

  async getOverdue(): Promise<(OfflineRecord & Record<string, unknown>)[]> {
    const today = new Date().toISOString().split('T')[0]
    return await queryData(
      'invoices',
      ['*'],
      { due_date: today, status: 'sent' },
      'due_date ASC'
    )
  }
}

/**
 * Pricebook data layer
 */
export class PricebookDataLayer extends OfflineDataLayer<OfflineRecord & Record<string, unknown>> {
  constructor() {
    super('pricebook_items')
  }

  async getActive(orgId: string): Promise<(OfflineRecord & Record<string, unknown>)[]> {
    return await queryData(
      this.tableName,
      ['*'],
      { org_id: orgId, active: 1 },
      'name ASC'
    )
  }

  async getQuickPicks(orgId: string): Promise<(OfflineRecord & Record<string, unknown>)[]> {
    return await queryData(
      this.tableName,
      ['*'],
      { org_id: orgId, active: 1, is_quick_pick: 1 },
      'name ASC'
    )
  }

  async searchItems(query: string): Promise<(OfflineRecord & Record<string, unknown>)[]> {
    return await this.search(query, ['name', 'code', 'category'])
  }
}

// Export instances
export const clientDataLayer = new ClientDataLayer()
export const quoteDataLayer = new QuoteDataLayer()
export const invoiceDataLayer = new InvoiceDataLayer()
export const pricebookDataLayer = new PricebookDataLayer()
