import { supabase } from '../supabase'
import { invoiceSchema, InvoiceFormData, paymentSchema, PaymentFormData } from '../validation'
import { logActivity } from '../db/mutations'
import { generateInvoiceNumber } from '../numbering'
import { calculateSubtotal, calculateTax, calculateTotal, calculateBalanceDue } from '../calculations'

export interface InvoiceFilters {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  client_id?: string
  job_id?: string
  date_from?: string
  date_to?: string
  due_date_from?: string
  due_date_to?: string
  limit?: number
  offset?: number
}

export interface InvoiceWithItems {
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
  client: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  job?: {
    id: string
    title: string
    status: string
  }
  quote?: {
    id: string
    number: string
    status: string
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    unit_price: number
    taxable: boolean
    line_total: number
  }>
  payments: Array<{
    id: string
    method: string
    amount: number
    received_at: string
    note?: string
  }>
}

export interface CreateInvoiceData extends InvoiceFormData {
  currency?: string
  issue_date?: string
  due_date?: string
}

export interface UpdateInvoiceData extends Partial<InvoiceFormData> {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  currency?: string
  issue_date?: string
  due_date?: string
}

export const invoiceAPI = {
  // List invoices with optional filtering
  list: async (orgId: string, filters?: InvoiceFilters): Promise<InvoiceWithItems[]> => {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email, phone),
        job:jobs(id, title, status),
        quote:quotes(id, number, status),
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id)
    }

    if (filters?.date_from) {
      query = query.gte('issue_date', filters.date_from)
    }

    if (filters?.date_to) {
      query = query.lte('issue_date', filters.date_to)
    }

    if (filters?.due_date_from) {
      query = query.gte('due_date', filters.due_date_from)
    }

    if (filters?.due_date_to) {
      query = query.lte('due_date', filters.due_date_to)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`)
    }

    return data || []
  },

  // Get single invoice with full details
  get: async (invoiceId: string): Promise<InvoiceWithItems> => {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email, phone, address_line1, city, state, postal),
        job:jobs(id, title, description, status, due_date, location),
        quote:quotes(id, number, status),
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch invoice: ${error.message}`)
    }

    return data
  },

  // Create new invoice
  create: async (orgId: string, data: CreateInvoiceData): Promise<InvoiceWithItems> => {
    // Validate input data
    const validatedData = invoiceSchema.parse(data)

    // Generate invoice number
    const number = await generateInvoiceNumber(orgId)

    // Calculate totals
    const itemsWithTotals = validatedData.items.map((item, index) => ({
      ...item,
      id: `temp_${index}`,
      line_total: item.quantity * item.unit_price
    }))
    const subtotal = calculateSubtotal(itemsWithTotals)
    const taxTotal = calculateTax(subtotal, validatedData.tax_rate_pct, itemsWithTotals)
    const total = calculateTotal(subtotal, taxTotal, validatedData.discount_amt)

    // Set default dates
    const issueDate = data.issue_date || new Date().toISOString().split('T')[0]
    const dueDate = data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        org_id: orgId,
        number,
        client_id: validatedData.client_id,
        job_id: validatedData.job_id,
        quote_id: validatedData.quote_id,
        status: 'draft',
        currency: data.currency || 'USD',
        tax_rate_pct: validatedData.tax_rate_pct,
        discount_amt: validatedData.discount_amt,
        subtotal,
        tax_total: taxTotal,
        total,
        balance_due: total,
        issue_date: issueDate,
        due_date: dueDate
      })
      .select()
      .single()

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    // Create invoice items
    const invoiceItems = validatedData.items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      taxable: item.taxable,
      line_total: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems)

    if (itemsError) {
      // Clean up invoice if items creation fails
      await supabase.from('invoices').delete().eq('id', invoice.id)
      throw new Error(`Failed to create invoice items: ${itemsError.message}`)
    }

    // Log activity
    await logActivity(orgId, 'invoice', invoice.id, 'created', {
      invoice_number: invoice.number,
      client_id: validatedData.client_id,
      total: invoice.total
    })

    // Return the complete invoice
    return invoiceAPI.get(invoice.id)
  },

  // Update existing invoice
  update: async (invoiceId: string, data: UpdateInvoiceData): Promise<InvoiceWithItems> => {
    // Get existing invoice
    const existingInvoice = await invoiceAPI.get(invoiceId)

    // Validate input data
    const validatedData = invoiceSchema.partial().parse(data)

    // Calculate new totals if items changed
    let subtotal = existingInvoice.subtotal
    let taxTotal = existingInvoice.tax_total
    let total = existingInvoice.total

    if (validatedData.items) {
      const itemsWithTotals = validatedData.items.map((item, index) => ({
        ...item,
        id: `temp_${index}`,
        line_total: item.quantity * item.unit_price
      }))
      subtotal = calculateSubtotal(itemsWithTotals)
      taxTotal = calculateTax(subtotal, validatedData.tax_rate_pct || existingInvoice.tax_rate_pct, itemsWithTotals)
      total = calculateTotal(subtotal, taxTotal, validatedData.discount_amt || existingInvoice.discount_amt)
    } else if (validatedData.tax_rate_pct !== undefined || validatedData.discount_amt !== undefined) {
      const taxRate = validatedData.tax_rate_pct ?? existingInvoice.tax_rate_pct
      const discount = validatedData.discount_amt ?? existingInvoice.discount_amt
      taxTotal = calculateTax(subtotal, taxRate, existingInvoice.items)
      total = calculateTotal(subtotal, taxTotal, discount)
    }

    // Calculate new balance due
    const balanceDue = calculateBalanceDue(total, existingInvoice.payments)

    // Update invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        ...validatedData,
        subtotal,
        tax_total: taxTotal,
        total,
        balance_due: balanceDue
      })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update invoice: ${error.message}`)
    }

    // Update items if provided
    if (validatedData.items) {
      // Delete existing items
      await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

      // Create new items
      const invoiceItems = validatedData.items.map(item => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable: item.taxable,
        line_total: item.quantity * item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) {
        throw new Error(`Failed to update invoice items: ${itemsError.message}`)
      }
    }

    // Log activity
    await logActivity(existingInvoice.org_id, 'invoice', invoiceId, 'updated', {
      invoice_number: invoice.number,
      status: invoice.status
    })

    // Return the complete invoice
    return invoiceAPI.get(invoiceId)
  },

  // Update invoice status
  updateStatus: async (invoiceId: string, status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'): Promise<InvoiceWithItems> => {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update invoice status: ${error.message}`)
    }

    // Log activity
    await logActivity(data.org_id, 'invoice', invoiceId, 'status_updated', {
      invoice_number: data.number,
      status
    })

    return invoiceAPI.get(invoiceId)
  },

  // Send invoice (update status to sent)
  send: async (invoiceId: string): Promise<InvoiceWithItems> => {
    return invoiceAPI.updateStatus(invoiceId, 'sent')
  },

  // Record payment
  recordPayment: async (invoiceId: string, paymentData: PaymentFormData): Promise<InvoiceWithItems> => {
    // Validate payment data
    const validatedPayment = paymentSchema.parse(paymentData)

    // Get current invoice
    const invoice = await invoiceAPI.get(invoiceId)

    // Check if payment amount exceeds balance due
    if (validatedPayment.amount > invoice.balance_due) {
      throw new Error('Payment amount cannot exceed balance due')
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        method: validatedPayment.method,
        amount: validatedPayment.amount,
        received_at: new Date().toISOString(),
        note: validatedPayment.note,
        external_id: validatedPayment.external_id
      })
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Failed to record payment: ${paymentError.message}`)
    }

    // Calculate new balance due
    const newBalanceDue = calculateBalanceDue(invoice.total, [...invoice.payments, payment])

    // Update invoice balance and status
    const newStatus = newBalanceDue === 0 ? 'paid' : invoice.status
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        balance_due: newBalanceDue,
        status: newStatus
      })
      .eq('id', invoiceId)

    if (updateError) {
      throw new Error(`Failed to update invoice balance: ${updateError.message}`)
    }

    // Log activity
    await logActivity(invoice.org_id, 'payment', payment.id, 'recorded', {
      invoice_number: invoice.number,
      amount: payment.amount,
      method: payment.method
    })

    return invoiceAPI.get(invoiceId)
  },

  // Delete invoice (soft delete by setting status to cancelled)
  delete: async (invoiceId: string): Promise<void> => {
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('org_id, number')
      .eq('id', invoiceId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch invoice: ${fetchError.message}`)
    }

    const { error } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', invoiceId)

    if (error) {
      throw new Error(`Failed to delete invoice: ${error.message}`)
    }

    // Log activity
    await logActivity(invoice.org_id, 'invoice', invoiceId, 'deleted', {
      invoice_number: invoice.number
    })
  },

  // Search invoices
  search: async (orgId: string, query: string): Promise<InvoiceWithItems[]> => {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email, phone),
        job:jobs(id, title, status),
        quote:quotes(id, number, status),
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('org_id', orgId)
      .or(`number.ilike.%${query}%,client:clients.name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to search invoices: ${error.message}`)
    }

    return data || []
  },

  // Get invoice statistics
  getStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('status, total, balance_due, due_date')
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to fetch invoice stats: ${error.message}`)
    }

    const now = new Date()
    const stats = {
      total: data.length,
      totalValue: data.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
      totalOutstanding: data.reduce((sum, invoice) => sum + (invoice.balance_due || 0), 0),
      byStatus: data.reduce((acc, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byValue: {
        draft: data.filter(i => i.status === 'draft').reduce((sum, i) => sum + (i.total || 0), 0),
        sent: data.filter(i => i.status === 'sent').reduce((sum, i) => sum + (i.total || 0), 0),
        paid: data.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
        overdue: data.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.total || 0), 0)
      },
      overdue: data.filter(invoice => {
        if (invoice.status !== 'sent' && invoice.status !== 'overdue') return false
        const dueDate = new Date(invoice.due_date)
        return dueDate < now
      }).length
    }

    return stats
  },

  // Duplicate invoice
  duplicate: async (invoiceId: string): Promise<InvoiceWithItems> => {
    const originalInvoice = await invoiceAPI.get(invoiceId)

    const duplicateData: CreateInvoiceData = {
      client_id: originalInvoice.client_id,
      job_id: originalInvoice.job_id,
      items: originalInvoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable: item.taxable
      })),
      tax_rate_pct: originalInvoice.tax_rate_pct,
      discount_amt: originalInvoice.discount_amt,
      currency: originalInvoice.currency
    }

    return invoiceAPI.create(originalInvoice.org_id, duplicateData)
  },

  // Get overdue invoices
  getOverdue: async (orgId: string): Promise<InvoiceWithItems[]> => {
    const now = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email, phone),
        job:jobs(id, title, status),
        quote:quotes(id, number, status),
        items:invoice_items(*),
        payments:payments(*)
      `)
      .eq('org_id', orgId)
      .in('status', ['sent', 'overdue'])
      .lt('due_date', now)
      .order('due_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch overdue invoices: ${error.message}`)
    }

    return data || []
  }
}
