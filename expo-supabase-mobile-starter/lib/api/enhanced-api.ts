// import { supabase } from '../supabase'
import { 
  queryData,
  insertData,
  updateData,
  deleteData,
  executeTransaction
} from '../sqlite'
import { OfflineDataManager } from '../offline-data'
import { performFullSync } from '../offline-sync'
import { clientAPI } from './clients'
import { quoteAPI } from './quotes'
import { invoiceAPI } from './invoices'
import { pricebookAPI } from './pricebook'
import { documentAPI } from './documents'
import { 
  ClientFilters
} from '../database/types'
import type { 
  PricebookItem,
  PricebookFilters
} from './pricebook'
import type { 
  QuoteWithItems as Quote, 
  CreateQuoteData,
  QuoteFilters
} from './quotes'
import type { 
  ClientWithJobs
} from './clients'
import type { ClientFormData } from '../validation'
import type { 
  InvoiceWithItems as Invoice, 
  CreateInvoiceData,
  InvoiceFilters
} from './invoices'

// Enhanced API that provides offline-first functionality
export class EnhancedAPI {
  private static instance: EnhancedAPI

  static getInstance(): EnhancedAPI {
    if (!EnhancedAPI.instance) {
      EnhancedAPI.instance = new EnhancedAPI()
    }
    return EnhancedAPI.instance
  }

  // Client operations
  async getClients(orgId: string, filters?: ClientFilters): Promise<unknown[]> {
    if (OfflineDataManager.isOnline()) {
      try {
        // Try online first
        const onlineData = await clientAPI.list(orgId, filters)
        
        // Cache the data locally
        await this.cacheClients(orgId, onlineData)
        
        return onlineData
      } catch (error) {
        console.warn('Online client fetch failed, falling back to offline:', error)
      }
    }

    // Fallback to offline data
    return this.getClientsOffline(orgId, filters)
  }

  async createClient(orgId: string, data: ClientFormData): Promise<ClientWithJobs | Record<string, unknown>> {
    const clientData = {
      ...data,
      id: `local_${Date.now()}_${Math.random()}`,
      org_id: orgId,
      synced: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save locally first
    await insertData('clients', clientData)

    // Try to sync online if possible
    if (OfflineDataManager.isOnline()) {
      try {
        const onlineClient = await clientAPI.create(orgId, data)
        
        // Update local record with online ID
        await updateData('clients', { 
          id: onlineClient.id, 
          synced: 1 
        }, { id: clientData.id })
        
        return onlineClient
      } catch (error) {
        console.warn('Online client creation failed, keeping offline:', error)
        // Trigger sync when online
        performFullSync()
      }
    }

    return clientData
  }

  async updateClient(clientId: string, data: Partial<ClientFormData>): Promise<ClientWithJobs | Record<string, unknown>> {
    // Update locally first
    const updateDataObj = {
      ...data,
      synced: 0,
      updated_at: new Date().toISOString()
    }

    await updateData('clients', updateDataObj, { id: clientId })

    // Try to sync online if possible
    if (OfflineDataManager.isOnline()) {
      try {
        const onlineClient = await clientAPI.update(clientId, data)
        
        // Mark as synced
        await updateData('clients', { synced: 1 }, { id: clientId })
        
        return onlineClient
      } catch (error) {
        console.warn('Online client update failed, keeping offline:', error)
        // Trigger sync when online
        performFullSync()
      }
    }

    return { id: clientId, ...updateDataObj }
  }

  async deleteClient(clientId: string): Promise<void> {
    // Mark as deleted locally
    await updateData('clients', { 
      _deleted: 1, 
      synced: 0,
      updated_at: new Date().toISOString()
    }, { id: clientId })

    // Try to sync online if possible
    if (OfflineDataManager.isOnline()) {
      try {
        await clientAPI.delete(clientId)
        
        // Actually delete from local
        await deleteData('clients', { id: clientId })
      } catch (error) {
        console.warn('Online client deletion failed, keeping offline:', error)
        // Trigger sync when online
        performFullSync()
      }
    }
  }

  // Quote operations
  async getQuotes(orgId: string, filters?: QuoteFilters): Promise<Quote[] | Record<string, unknown>[]> {
    if (OfflineDataManager.isOnline()) {
      try {
        // Try online first
        const onlineData = await quoteAPI.list(orgId, filters)
        
        // Cache the data locally
        await this.cacheQuotes(orgId, onlineData)
        
        return onlineData
      } catch (error) {
        console.warn('Online quote fetch failed, falling back to offline:', error)
      }
    }

    // Fallback to offline data
    return this.getQuotesOffline(orgId, filters)
  }

  async createQuote(orgId: string, data: CreateQuoteData): Promise<Quote | Record<string, unknown>> {
    const quoteData = {
      ...data,
      id: `local_${Date.now()}_${Math.random()}`,
      org_id: orgId,
      synced: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save locally first
    await insertData('quotes', quoteData)

    // Try to sync online if possible
    if (OfflineDataManager.isOnline()) {
      try {
        const onlineQuote = await quoteAPI.create(orgId, data)
        
        // Update local record with online ID
        await updateData('quotes', { 
          id: onlineQuote.id, 
          synced: 1 
        }, { id: quoteData.id })
        
        return onlineQuote
      } catch (error) {
        console.warn('Online quote creation failed, keeping offline:', error)
        // Trigger sync when online
        performFullSync()
      }
    }

    return quoteData
  }

  // Invoice operations
  async getInvoices(orgId: string, filters?: InvoiceFilters): Promise<Invoice[] | Record<string, unknown>[]> {
    if (OfflineDataManager.isOnline()) {
      try {
        // Try online first
        const onlineData = await invoiceAPI.list(orgId, filters)
        
        // Cache the data locally
        await this.cacheInvoices(orgId, onlineData)
        
        return onlineData
      } catch (error) {
        console.warn('Online invoice fetch failed, falling back to offline:', error)
      }
    }

    // Fallback to offline data
    return this.getInvoicesOffline(orgId, filters)
  }

  async createInvoice(orgId: string, data: CreateInvoiceData): Promise<Invoice | Record<string, unknown>> {
    const invoiceData = {
      ...data,
      id: `local_${Date.now()}_${Math.random()}`,
      org_id: orgId,
      synced: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save locally first
    await insertData('invoices', invoiceData)

    // Try to sync online if possible
    if (OfflineDataManager.isOnline()) {
      try {
        const onlineInvoice = await invoiceAPI.create(orgId, data)
        
        // Update local record with online ID
        await updateData('invoices', { 
          id: onlineInvoice.id, 
          synced: 1 
        }, { id: invoiceData.id })
        
        return onlineInvoice
      } catch (error) {
        console.warn('Online invoice creation failed, keeping offline:', error)
        // Trigger sync when online
        performFullSync()
      }
    }

    return invoiceData
  }

  // Pricebook operations
  async getPricebookItems(orgId: string, filters?: PricebookFilters): Promise<PricebookItem[] | Record<string, unknown>[]> {
    if (OfflineDataManager.isOnline()) {
      try {
        // Try online first
        const onlineData = await pricebookAPI.list(orgId, filters)
        
        // Cache the data locally
        await this.cachePricebookItems(orgId, onlineData)
        
        return onlineData
      } catch (error) {
        console.warn('Online pricebook fetch failed, falling back to offline:', error)
      }
    }

    // Fallback to offline data
    return this.getPricebookItemsOffline(orgId, filters)
  }

  // Document operations
  async uploadDocument(uri: string, orgId: string, clientId: string, jobId?: string): Promise<unknown> {
    if (OfflineDataManager.isOnline()) {
      try {
        // Extract filename from URI for title
        const filename = uri.split('/').pop() || 'Document'
        return await documentAPI.upload(uri, orgId, clientId, { title: filename, jobId })
      } catch (error) {
        console.warn('Online document upload failed:', error)
        throw error
      }
    } else {
      throw new Error('Document upload requires internet connection')
    }
  }

  // Offline data retrieval methods
  private async getClientsOffline(orgId: string, filters?: ClientFilters): Promise<Record<string, unknown>[]> {
    const query: Record<string, unknown> = { org_id: orgId }
    
    if (filters?.status) {
      (query as Record<string, unknown>).status = filters.status
    }

    const clients = await queryData('clients', ['*'], query, 'name ASC')
    
    if (filters?.search) {
      return clients.filter((client: Record<string, unknown>) =>
        (client.name as string)?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        (client.email as string)?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        (client.phone as string)?.includes(filters.search!)
      )
    }

    return clients
  }

  private async getQuotesOffline(orgId: string, filters?: QuoteFilters): Promise<Record<string, unknown>[]> {
    const query: Record<string, unknown> = { org_id: orgId }
    
    if (filters?.status) {
      (query as Record<string, unknown>).status = filters.status
    }

    const quotes = await queryData('quotes', ['*'], query, 'created_at DESC')
    
    // Get related client data
    const quotesWithClients = await Promise.all(
      quotes.map(async (quote: Record<string, unknown>) => {
        const client = await queryData('clients', ['id', 'name', 'email', 'phone'], { id: quote.client_id }, undefined, 1)
        return {
          ...quote,
          client: client[0] || null
        }
      })
    )

    return quotesWithClients
  }

  private async getInvoicesOffline(orgId: string, filters?: InvoiceFilters): Promise<Record<string, unknown>[]> {
    const query: Record<string, unknown> = { org_id: orgId }
    
    if (filters?.status) {
      (query as Record<string, unknown>).status = filters.status
    }

    const invoices = await queryData('invoices', ['*'], query, 'created_at DESC')
    
    // Get related client data
    const invoicesWithClients = await Promise.all(
      invoices.map(async (invoice: Record<string, unknown>) => {
        const client = await queryData('clients', ['id', 'name', 'email', 'phone'], { id: invoice.client_id }, undefined, 1)
        return {
          ...invoice,
          client: client[0] || null
        }
      })
    )

    return invoicesWithClients
  }

  private async getPricebookItemsOffline(orgId: string, filters?: PricebookFilters): Promise<Record<string, unknown>[]> {
    const query: Record<string, unknown> = { org_id: orgId }
    
    if (filters?.active !== undefined) {
      (query as Record<string, unknown>).active = filters.active ? 1 : 0
    }

    if (filters?.isQuickPick !== undefined) {
      (query as Record<string, unknown>).is_quick_pick = filters.isQuickPick ? 1 : 0
    }

    return await queryData('pricebook_items', ['*'], query, 'name ASC')
  }

  // Caching methods
  private async cacheClients(orgId: string, clients: ClientWithJobs[]): Promise<void> {
    await executeTransaction([
      async () => {
        for (const client of clients) {
          await updateData('clients', { 
            ...client, 
            synced: 1,
            updated_at: new Date().toISOString()
          }, { id: client.id })
        }
      }
    ])
  }

  private async cacheQuotes(orgId: string, quotes: Quote[]): Promise<void> {
    await executeTransaction([
      async () => {
        for (const quote of quotes) {
          await updateData('quotes', { 
            ...quote, 
            synced: 1,
            updated_at: new Date().toISOString()
          }, { id: quote.id })
        }
      }
    ])
  }

  private async cacheInvoices(orgId: string, invoices: Invoice[]): Promise<void> {
    await executeTransaction([
      async () => {
        for (const invoice of invoices) {
          await updateData('invoices', { 
            ...invoice, 
            synced: 1,
            updated_at: new Date().toISOString()
          }, { id: invoice.id })
        }
      }
    ])
  }

  private async cachePricebookItems(orgId: string, items: PricebookItem[]): Promise<void> {
    await executeTransaction([
      async () => {
        for (const item of items) {
          await updateData('pricebook_items', { 
            ...item, 
            synced: 1,
            updated_at: new Date().toISOString()
          }, { id: item.id })
        }
      }
    ])
  }

  // Utility methods
  async isOnline(): Promise<boolean> {
    return OfflineDataManager.isOnline()
  }

  async forceSync(): Promise<void> {
    if (OfflineDataManager.isOnline()) {
      await performFullSync()
    }
  }

  async getSyncStatus(): Promise<unknown> {
    const { getSyncStats } = await import('../offline-sync')
    return getSyncStats()
  }
}

// Export singleton instance
export const enhancedAPI = EnhancedAPI.getInstance()
