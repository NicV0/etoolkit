import { supabase } from './supabase'
import { clientAPI } from './api/clients'
import { quoteAPI } from './api/quotes'
import { invoiceAPI } from './api/invoices'
import { pricebookAPI } from './api/pricebook'
import { documentAPI } from './api/documents'
import { logActivity } from './db/mutations'
import { generateQuoteNumber, generateInvoiceNumber } from './numbering'
import { calculateSubtotal, calculateTax, calculateTotal, calculateBalanceDue } from './calculations'
import type { Database } from '../types/database'
import type { 
  ClientFormData, 
  QuoteFormData, 
  InvoiceFormData, 
  PaymentFormData, 
  PricebookItemFormData,
  LineItemFormData 
} from './validation'

// Type definitions for the integration layer
export interface Client {
  id: string
  org_id: string
  name: string
  phone?: string
  email?: string
  address_line1?: string
  city?: string
  state?: string
  postal?: string
  notes?: string
  status: 'active' | 'inactive' | 'prospect'
  created_at: string
  updated_at: string
}

export type CreateClientData = ClientFormData
export type UpdateClientData = Partial<ClientFormData>

export interface Quote {
  id: string
  org_id: string
  number: string
  client_id: string
  job_id?: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  currency: string
  tax_rate_pct: number
  discount_amt: number
  subtotal: number
  tax_total: number
  total: number
  terms?: string
  valid_until?: string
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  items?: Array<{
    id: string
    description: string
    quantity: number
    unit_price: number
    taxable: boolean
    line_total: number
  }>
}

export interface Invoice {
  id: string
  org_id: string
  number: string
  client_id: string
  job_id?: string
  quote_id?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  currency: string
  tax_rate_pct: number
  discount_amt: number
  subtotal: number
  tax_total: number
  total: number
  balance_due: number
  issue_date: string
  due_date: string
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  items?: Array<{
    id: string
    description: string
    quantity: number
    unit_price: number
    taxable: boolean
    line_total: number
  }>
  payments?: Array<{
    id: string
    method: string
    amount: number
    received_at: string
    note?: string
  }>
}

export interface LineItem extends LineItemFormData {
  id: string
  line_total: number
}

export type CreateQuoteData = QuoteFormData
export type CreateInvoiceData = InvoiceFormData
export type PaymentData = PaymentFormData

export interface Organization {
  id: string
  name: string
  trade: string
  size: 'small' | 'medium' | 'large'
  plan: 'free' | 'pro' | 'enterprise'
  created_by: string
  created_at: string
}

export interface CreateOrgData {
  name: string
  trade: string
  size: 'small' | 'medium' | 'large'
  plan: 'free' | 'pro' | 'enterprise'
}

// ServerComm class that provides the integration layer
export class ServerComm {
  private static instance: ServerComm

  static getInstance(): ServerComm {
    if (!ServerComm.instance) {
      ServerComm.instance = new ServerComm()
    }
    return ServerComm.instance
  }

  // Organization management
  async getCurrentOrganization(): Promise<Organization | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id, organizations(*)')
      .eq('user_id', user.id)
      .single()

    return profile?.organizations as Organization || null
  }

  async createOrganization(data: CreateOrgData): Promise<Organization> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        ...data,
        created_by: user.id
      })
      .select()
      .single()

    if (orgError) throw orgError

    // Create profile for user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        org_id: org.id,
        role: 'owner'
      })

    if (profileError) throw profileError

    // Create default settings
    const { error: settingsError } = await supabase
      .from('settings')
      .insert({
        org_id: org.id,
        currency: 'USD',
        default_tax_pct: '0',
        numbering_prefix_quote: 'Q',
        numbering_prefix_invoice: 'INV'
      })

    if (settingsError) throw settingsError

    return org
  }

  // Client management
  async getOrgClients(orgId: string, filters?: {
    status?: 'active' | 'inactive' | 'prospect'
    search?: string
    limit?: number
    offset?: number
  }): Promise<Client[]> {
    return clientAPI.list(orgId, filters)
  }

  async getClient(clientId: string): Promise<Client> {
    return clientAPI.get(clientId)
  }

  async createClient(orgId: string, data: CreateClientData): Promise<Client> {
    return clientAPI.create(orgId, data)
  }

  async updateClient(clientId: string, data: UpdateClientData): Promise<Client> {
    return clientAPI.update(clientId, data)
  }

  async deleteClient(clientId: string): Promise<void> {
    return clientAPI.delete(clientId)
  }

  async searchClients(orgId: string, query: string): Promise<Client[]> {
    const results = await clientAPI.search(orgId, query)
    return results.map(result => ({
      id: result.id,
      org_id: orgId,
      name: result.name,
      phone: result.phone,
      email: result.email,
      status: result.status as 'active' | 'inactive' | 'prospect',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }

  // Quote management
  async getOrgQuotes(orgId: string, filters?: {
    status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
    client_id?: string
    job_id?: string
    limit?: number
    offset?: number
  }): Promise<Quote[]> {
    return quoteAPI.list(orgId, filters)
  }

  async getQuote(quoteId: string): Promise<Quote> {
    return quoteAPI.get(quoteId)
  }

  async createQuote(orgId: string, data: CreateQuoteData): Promise<Quote> {
    return quoteAPI.create(orgId, data)
  }

  async updateQuote(quoteId: string, data: Partial<CreateQuoteData>): Promise<Quote> {
    return quoteAPI.update(quoteId, data)
  }

  async updateQuoteStatus(quoteId: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'): Promise<Quote> {
    return quoteAPI.updateStatus(quoteId, status)
  }

  async sendQuote(quoteId: string): Promise<Quote> {
    return quoteAPI.send(quoteId)
  }

  async acceptQuote(quoteId: string): Promise<Quote> {
    return quoteAPI.accept(quoteId)
  }

  async rejectQuote(quoteId: string): Promise<Quote> {
    return quoteAPI.reject(quoteId)
  }

  async deleteQuote(quoteId: string): Promise<void> {
    return quoteAPI.delete(quoteId)
  }

  async convertQuoteToInvoice(quoteId: string): Promise<{ invoiceId: string }> {
    return quoteAPI.convertToInvoice(quoteId)
  }

  async searchQuotes(orgId: string, query: string): Promise<Quote[]> {
    return quoteAPI.search(orgId, query)
  }

  // Invoice management
  async getOrgInvoices(orgId: string, filters?: {
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    client_id?: string
    job_id?: string
    limit?: number
    offset?: number
  }): Promise<Invoice[]> {
    return invoiceAPI.list(orgId, filters)
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return invoiceAPI.get(invoiceId)
  }

  async createInvoice(orgId: string, data: CreateInvoiceData): Promise<Invoice> {
    return invoiceAPI.create(orgId, data)
  }

  async updateInvoice(invoiceId: string, data: Partial<CreateInvoiceData>): Promise<Invoice> {
    return invoiceAPI.update(invoiceId, data)
  }

  async updateInvoiceStatus(invoiceId: string, status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'): Promise<Invoice> {
    return invoiceAPI.updateStatus(invoiceId, status)
  }

  async sendInvoice(invoiceId: string): Promise<Invoice> {
    return invoiceAPI.send(invoiceId)
  }

  async recordPayment(invoiceId: string, data: PaymentData): Promise<Invoice> {
    return invoiceAPI.recordPayment(invoiceId, data)
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    return invoiceAPI.delete(invoiceId)
  }

  async searchInvoices(orgId: string, query: string): Promise<Invoice[]> {
    return invoiceAPI.search(orgId, query)
  }

  async getOverdueInvoices(orgId: string): Promise<Invoice[]> {
    return invoiceAPI.getOverdue(orgId)
  }

  // Pricebook management
  async getPricebookItems(orgId: string, filters?: {
    category?: string
    active?: boolean
    isQuickPick?: boolean
    limit?: number
    offset?: number
  }): Promise<any[]> {
    return pricebookAPI.list(orgId, filters)
  }

  async getPricebookItem(itemId: string): Promise<any> {
    return pricebookAPI.get(itemId)
  }

  async createPricebookItem(orgId: string, data: any): Promise<any> {
    return pricebookAPI.create(orgId, data)
  }

  async updatePricebookItem(itemId: string, data: any): Promise<any> {
    return pricebookAPI.update(itemId, data)
  }

  async deletePricebookItem(itemId: string): Promise<void> {
    return pricebookAPI.delete(itemId)
  }

  async searchPricebookItems(orgId: string, query: string): Promise<any[]> {
    return pricebookAPI.search(orgId, query)
  }

  async getQuickPicks(orgId: string): Promise<any[]> {
    return pricebookAPI.getQuickPicks(orgId)
  }

  async getCategories(orgId: string): Promise<any[]> {
    return pricebookAPI.getCategories(orgId)
  }

  // Document management
  async uploadDocument(uri: string, orgId: string, clientId: string, jobId?: string, title?: string): Promise<any> {
    return documentAPI.upload(uri, orgId, clientId, {
      title: title || 'Document',
      jobId
    })
  }

  async getDocuments(clientId: string, filters?: {
    job_id?: string
    limit?: number
    offset?: number
  }): Promise<any[]> {
    return documentAPI.list(clientId, filters)
  }

  async getDocument(documentId: string): Promise<any> {
    return documentAPI.get(documentId)
  }

  async updateDocument(documentId: string, data: any): Promise<any> {
    return documentAPI.update(documentId, data)
  }

  async deleteDocument(documentId: string): Promise<void> {
    return documentAPI.delete(documentId)
  }

  async searchDocuments(clientId: string, query: string): Promise<any[]> {
    return documentAPI.search(clientId, query)
  }

  // Statistics and reporting
  async getClientStats(orgId: string): Promise<any> {
    return clientAPI.getStats(orgId)
  }

  async getQuoteStats(orgId: string): Promise<any> {
    return quoteAPI.getStats(orgId)
  }

  async getInvoiceStats(orgId: string): Promise<any> {
    return invoiceAPI.getStats(orgId)
  }

  async getPricebookStats(orgId: string): Promise<any> {
    return pricebookAPI.getStats(orgId)
  }

  async getDocumentStats(clientId: string): Promise<any> {
    return documentAPI.getStats(clientId)
  }

  // Utility functions
  async generateQuoteNumber(orgId: string): Promise<string> {
    return generateQuoteNumber(orgId)
  }

  async generateInvoiceNumber(orgId: string): Promise<string> {
    return generateInvoiceNumber(orgId)
  }

  // Activity logging
  async logActivity(orgId: string, entityType: string, entityId: string, action: string, meta?: any): Promise<void> {
    return logActivity(orgId, entityType, entityId, action, meta)
  }
}

// Export singleton instance
export const serverComm = ServerComm.getInstance()

// Export type definitions for use in state management
export type {
  Client,
  Quote,
  Invoice,
  LineItem,
  Organization,
  CreateOrgData
}

// Re-export validation types for backward compatibility
export type {
  CreateClientData,
  UpdateClientData,
  CreateQuoteData,
  CreateInvoiceData,
  PaymentData
}
