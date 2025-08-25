import { supabase } from '../supabase'
import { createPricebookManager } from '../pricebook/pricebook-manager'
import { logActivity } from '../db/mutations'
import { generateQuoteNumber, generateInvoiceNumber } from '../numbering'
import { PDFGenerator } from '../pdf/generators'
import { Decimal } from 'decimal.js-light'

export interface LineItem {
  id?: string
  description: string
  quantity: number
  unit_price: number
  unit?: string
  taxable: boolean
  line_total: number
  pricebook_item_id?: string
}

export interface QuoteData {
  id?: string
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
  terms: string
  valid_until: string
  issue_date: string
  items: LineItem[]
}

export interface InvoiceData {
  id?: string
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
  items: LineItem[]
}

export interface PaymentData {
  id?: string
  invoice_id: string
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
  amount: number
  received_at: string
  note?: string
  external_id?: string
}

export interface CreateQuoteData {
  client_id: string
  job_id?: string
  currency?: string
  tax_rate_pct?: number
  terms?: string
  valid_until?: string
  items: Omit<LineItem, 'line_total'>[]
}

export interface CreateInvoiceData {
  client_id: string
  job_id?: string
  quote_id?: string
  currency?: string
  tax_rate_pct?: number
  terms?: string
  due_date?: string
  items: Omit<LineItem, 'line_total'>[]
}

export class BillingManager {
  private orgId: string
  private pricebookManager: ReturnType<typeof createPricebookManager>

  constructor(orgId: string, plan: 'free' | 'pro' = 'free') {
    this.orgId = orgId
    this.pricebookManager = createPricebookManager(orgId, plan)
  }

  // Create new quote
  async createQuote(data: CreateQuoteData): Promise<QuoteData> {
    try {
      // Generate quote number
      const number = await generateQuoteNumber(this.orgId)
      
      // Calculate totals
      const calculatedData = this.calculateQuoteTotals(data)
      
      // Create quote in database
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          org_id: this.orgId,
          number,
          client_id: data.client_id,
          job_id: data.job_id,
          status: 'draft',
          currency: data.currency || 'USD',
          tax_rate_pct: data.tax_rate_pct || 0,
          discount_amt: 0,
          subtotal: calculatedData.subtotal,
          tax_total: calculatedData.tax_total,
          total: calculatedData.total,
          terms: data.terms || 'Net 30 days',
          valid_until: data.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          issue_date: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Create quote items
      const quoteItems = await this.createQuoteItems(quote.id, calculatedData.items)

      // Log activity
      await logActivity(this.orgId, 'quote', quote.id, 'created', { number: quote.number, total: quote.total })

      return {
        ...quote,
        issue_date: quote.created_at || new Date().toISOString(),
        items: quoteItems
      }
    } catch (error) {
      throw new Error(`Failed to create quote: ${error}`)
    }
  }

  // Update quote
  async updateQuote(quoteId: string, data: Partial<CreateQuoteData>): Promise<QuoteData> {
    try {
      // Calculate totals if items changed
      let calculatedData = null
      if (data.items) {
        calculatedData = this.calculateQuoteTotals(data as CreateQuoteData)
      }

      // Update quote
      const updateData: Record<string, unknown> = {}
      if (data.client_id) updateData.client_id = data.client_id
      if (data.job_id !== undefined) updateData.job_id = data.job_id
      if (data.currency) updateData.currency = data.currency
      if (data.tax_rate_pct !== undefined) updateData.tax_rate_pct = data.tax_rate_pct
      if (data.terms) updateData.terms = data.terms
      if (data.valid_until) updateData.valid_until = data.valid_until
      if (calculatedData) {
        updateData.subtotal = calculatedData.subtotal
        updateData.tax_total = calculatedData.tax_total
        updateData.total = calculatedData.total
      }

      const { data: quote, error } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', quoteId)
        .select()
        .single()

      if (error) throw error

      // Update items if provided
      let items = []
      if (data.items && calculatedData) {
        // Delete existing items
        await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', quoteId)

        // Create new items
        items = await this.createQuoteItems(quoteId, calculatedData.items)
      } else {
        // Get existing items
        items = await this.getQuoteItems(quoteId)
      }

      // Log activity
      await logActivity(this.orgId, 'quote', quote.id, 'updated', { number: quote.number, total: quote.total })

      return {
        ...quote,
        issue_date: quote.created_at || new Date().toISOString(),
        items
      }
    } catch (error) {
      throw new Error(`Failed to update quote: ${error}`)
    }
  }

  // Create invoice from quote
  async createInvoiceFromQuote(quoteId: string, data?: Partial<CreateInvoiceData>): Promise<InvoiceData> {
    try {
      // Get quote data
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single()

      if (quoteError) throw quoteError

      // Get quote items
      const quoteItems = await this.getQuoteItems(quoteId)

      // Create invoice data
      const invoiceData: CreateInvoiceData = {
        client_id: data?.client_id || quote.client_id,
        job_id: data?.job_id || quote.job_id,
        quote_id: quoteId,
        currency: data?.currency || quote.currency,
        tax_rate_pct: data?.tax_rate_pct || quote.tax_rate_pct,
        terms: data?.terms || quote.terms,
        due_date: data?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: quoteItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit,
          taxable: item.taxable,
          pricebook_item_id: item.pricebook_item_id
        }))
      }

      return await this.createInvoice(invoiceData)
    } catch (error) {
      throw new Error(`Failed to create invoice from quote: ${error}`)
    }
  }

  // Create new invoice
  async createInvoice(data: CreateInvoiceData): Promise<InvoiceData> {
    try {
      // Generate invoice number
      const number = await generateInvoiceNumber(this.orgId)
      
      // Calculate totals
      const calculatedData = this.calculateInvoiceTotals(data)
      
      // Create invoice in database
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          org_id: this.orgId,
          number,
          client_id: data.client_id,
          job_id: data.job_id,
          quote_id: data.quote_id,
          status: 'draft',
          currency: data.currency || 'USD',
          tax_rate_pct: data.tax_rate_pct || 0,
          discount_amt: 0,
          subtotal: calculatedData.subtotal,
          tax_total: calculatedData.tax_total,
          total: calculatedData.total,
          balance_due: calculatedData.total,
          issue_date: new Date().toISOString(),
          due_date: data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Create invoice items
      const invoiceItems = await this.createInvoiceItems(invoice.id, calculatedData.items)

      // Log activity
      await logActivity(this.orgId, 'invoice', invoice.id, 'created', { number: invoice.number, total: invoice.total })

      return {
        ...invoice,
        issue_date: invoice.created_at || new Date().toISOString(),
        due_date: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: invoice.status === 'overdue' ? 'sent' : invoice.status === 'cancelled' ? 'cancelled' : invoice.status,
        items: invoiceItems
      }
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error}`)
    }
  }

  // Record payment
  async recordPayment(data: PaymentData): Promise<void> {
    try {
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: data.invoice_id,
          method: data.method,
          amount: data.amount,
          received_at: data.received_at,
          note: data.note,
          external_id: data.external_id
        })

      if (paymentError) throw paymentError

      // Update invoice balance
      await this.updateInvoiceBalance(data.invoice_id)

      // Log activity
      await logActivity(this.orgId, 'payment', data.invoice_id, 'recorded', { amount: data.amount, method: data.method })
    } catch (error) {
      throw new Error(`Failed to record payment: ${error}`)
    }
  }

  // Generate PDF for quote
  async generateQuotePDF(quoteId: string, template: string = 'clean'): Promise<string> {
    try {
      // Get quote with items and client info
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`
          *,
          clients(name, email, phone, address_line1, city, state, postal),
          quote_items(*)
        `)
        .eq('id', quoteId)
        .single()

      if (quoteError) throw quoteError

      // Get organization info
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', this.orgId)
        .single()

      if (orgError) throw orgError

      // Generate PDF
      const pdfPath = await PDFGenerator.generateQuotePDF({
        org_name: org.name,
        org_address: '',
        org_phone: '',
        org_email: '',
        document_type: 'quote',
        number: quote.number,
        date: quote.created_at || new Date().toISOString(),
        client_name: quote.clients?.name || '',
        client_address: `${quote.clients?.address_line1 || ''} ${quote.clients?.city || ''} ${quote.clients?.state || ''}`.trim(),
        client_phone: quote.clients?.phone || '',
        client_email: quote.clients?.email || '',
        items: quote.quote_items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          taxable: item.taxable || false
        })),
        subtotal: quote.subtotal || 0,
        tax_total: quote.tax_total || 0,
        discount_amt: quote.discount_amt || 0,
        total: quote.total || 0,
        terms: quote.terms || ''
      })

      return pdfPath
    } catch (error) {
      throw new Error(`Failed to generate quote PDF: ${error}`)
    }
  }

  // Generate PDF for invoice
  async generateInvoicePDF(invoiceId: string, template: string = 'clean'): Promise<string> {
    try {
      // Get invoice with items and client info
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(name, email, phone, address_line1, city, state, postal),
          invoice_items(*),
          payments(*)
        `)
        .eq('id', invoiceId)
        .single()

      if (invoiceError) throw invoiceError

      // Get organization info
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', this.orgId)
        .single()

      if (orgError) throw orgError

      // Generate PDF
      const pdfPath = await PDFGenerator.generateInvoicePDF({
        org_name: org.name,
        org_address: '',
        org_phone: '',
        org_email: '',
        document_type: 'invoice',
        number: invoice.number,
        date: invoice.created_at || new Date().toISOString(),
        due_date: invoice.due_date,
        client_name: invoice.clients?.name || '',
        client_address: `${invoice.clients?.address_line1 || ''} ${invoice.clients?.city || ''} ${invoice.clients?.state || ''}`.trim(),
        client_phone: invoice.clients?.phone || '',
        client_email: invoice.clients?.email || '',
        items: invoice.invoice_items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          taxable: item.taxable || false
        })),
        subtotal: invoice.subtotal || 0,
        tax_total: invoice.tax_total || 0,
        discount_amt: invoice.discount_amt || 0,
        total: invoice.total || 0,
        balance_due: invoice.balance_due || 0,
        terms: ''
      })

      return pdfPath
    } catch (error) {
      throw new Error(`Failed to generate invoice PDF: ${error}`)
    }
  }

  // Calculate quote totals
  private calculateQuoteTotals(data: CreateQuoteData): {
    subtotal: number
    tax_total: number
    total: number
    items: LineItem[]
  } {
    const taxRate = data.tax_rate_pct || 0
    let subtotal = new Decimal(0)
    let taxTotal = new Decimal(0)

    const items: LineItem[] = data.items.map(item => {
      const lineTotal = new Decimal(item.quantity).times(item.unit_price)
      const lineTax = item.taxable ? lineTotal.times(taxRate / 100) : new Decimal(0)
      
      subtotal = subtotal.plus(lineTotal)
      taxTotal = taxTotal.plus(lineTax)

      return {
        ...item,
        line_total: lineTotal.toNumber()
      }
    })

    const total = subtotal.plus(taxTotal)

    return {
      subtotal: subtotal.toNumber(),
      tax_total: taxTotal.toNumber(),
      total: total.toNumber(),
      items
    }
  }

  // Calculate invoice totals
  private calculateInvoiceTotals(data: CreateInvoiceData): {
    subtotal: number
    tax_total: number
    total: number
    items: LineItem[]
  } {
    const taxRate = data.tax_rate_pct || 0
    let subtotal = new Decimal(0)
    let taxTotal = new Decimal(0)

    const items: LineItem[] = data.items.map(item => {
      const lineTotal = new Decimal(item.quantity).times(item.unit_price)
      const lineTax = item.taxable ? lineTotal.times(taxRate / 100) : new Decimal(0)
      
      subtotal = subtotal.plus(lineTotal)
      taxTotal = taxTotal.plus(lineTax)

      return {
        ...item,
        line_total: lineTotal.toNumber()
      }
    })

    const total = subtotal.plus(taxTotal)

    return {
      subtotal: subtotal.toNumber(),
      tax_total: taxTotal.toNumber(),
      total: total.toNumber(),
      items
    }
  }

  // Create quote items
  private async createQuoteItems(quoteId: string, items: LineItem[]): Promise<LineItem[]> {
    const quoteItems = items.map(item => ({
      quote_id: quoteId,
      pricebook_item_id: item.pricebook_item_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit: item.unit,
      taxable: item.taxable,
      line_total: item.line_total
    }))

    const { data, error } = await supabase
      .from('quote_items')
      .insert(quoteItems)
      .select()

    if (error) throw error
    return data
  }

  // Create invoice items
  private async createInvoiceItems(invoiceId: string, items: LineItem[]): Promise<LineItem[]> {
    const invoiceItems = items.map(item => ({
      invoice_id: invoiceId,
      pricebook_item_id: item.pricebook_item_id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit: item.unit,
      taxable: item.taxable,
      line_total: item.line_total
    }))

    const { data, error } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)
      .select()

    if (error) throw error
    return data
  }

  // Get quote items
  private async getQuoteItems(quoteId: string): Promise<LineItem[]> {
    const { data, error } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    if (error) throw error
    return data
  }

  // Update invoice balance
  private async updateInvoiceBalance(invoiceId: string): Promise<void> {
    // Get total payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId)

    if (paymentsError) throw paymentsError

    const totalPaid = payments.reduce((sum: number, payment: { amount: number }) => sum + payment.amount, 0)

    // Get invoice total
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('total')
      .eq('id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError

    // Calculate balance due
    const balanceDue = Math.max(0, invoice.total - totalPaid)

    // Update invoice
    const newStatus = balanceDue === 0 ? 'paid' : balanceDue < invoice.total ? 'sent' : 'sent'

    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        balance_due: balanceDue,
        status: newStatus
      })
      .eq('id', invoiceId)

    if (updateError) throw updateError
  }
}

// Export singleton instance
export const createBillingManager = (orgId: string, plan: 'free' | 'pro' = 'free') => {
  return new BillingManager(orgId, plan)
}
