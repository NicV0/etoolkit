import { supabase } from '../supabase'
import { etoolkit } from '../supabase'
import type { 
  ClientInsert,
  // QuoteInsert,
  // InvoiceInsert,
  PricebookItemInsert,
  JobInsert,
  DocumentInsert,
  // PaymentInsert,
  // ActivityInsert,
  ReminderInsert,
  ClientUpdate,
  QuoteUpdate,
  InvoiceUpdate,
  PricebookItemUpdate,
  JobUpdate,
  DocumentUpdate,
  PaymentUpdate,
  ReminderUpdate
} from '../../types/database'

// Add missing type aliases for backward compatibility
type InsertPricebookItem = PricebookItemInsert
type UpdatePricebookItem = PricebookItemUpdate
type InsertJob = JobInsert
type UpdateJob = JobUpdate
type InsertDocument = DocumentInsert
type UpdateDocument = DocumentUpdate
type UpdatePayment = PaymentUpdate
type InsertReminder = ReminderInsert
type UpdateReminder = ReminderUpdate
type UpdateClient = ClientUpdate

// Organization mutations
export const createOrganization = async (data: {
  name: string
  trade: string
  size?: string
  plan?: string
}) => {
  return etoolkit.createOrganization(data)
}

// Client mutations
export const createClient = async (orgId: string, data: Omit<ClientInsert, 'org_id'>) => {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      ...data,
      org_id: orgId,
      name: data.name || 'New Client' // Ensure required field is provided
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(orgId, {
    entity_type: 'client',
    entity_id: client.id,
    action: 'created'
  })

  return client
}

export const updateClient = async (clientId: string, data: ClientUpdate) => {
  const { data: client, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', clientId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(client.org_id, {
    entity_type: 'client',
    entity_id: client.id,
    action: 'updated'
  })

  return client
}

export const deleteClient = async (clientId: string) => {
  // Get client info before deletion for activity logging
  const { data: client } = await supabase
    .from('clients')
    .select('org_id')
    .eq('id', clientId)
    .single()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) throw error

  // Log activity
  if (client) {
    await etoolkit.logActivity(client.org_id, {
      entity_type: 'client',
      entity_id: clientId,
      action: 'deleted'
    })
  }
}

// Quote mutations
export const createQuote = async (orgId: string, data: {
  client_id: string
  job_id?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    taxable?: boolean
  }>
  tax_rate_pct?: number
  discount_amt?: number
  terms?: string
}) => {
  return etoolkit.createQuote(orgId, data)
}

export const updateQuote = async (quoteId: string, data: QuoteUpdate) => {
  const { data: quote, error } = await supabase
    .from('quotes')
    .update(data)
    .eq('id', quoteId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(quote.org_id, {
    entity_type: 'quote',
    entity_id: quote.id,
    action: 'updated'
  })

  return quote
}

export const updateQuoteStatus = async (quoteId: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') => {
  const { data: quote, error } = await supabase
    .from('quotes')
    .update({ 
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : null
    })
    .eq('id', quoteId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(quote.org_id, {
    entity_type: 'quote',
    entity_id: quote.id,
    action: status === 'sent' ? 'sent' : 'updated',
    meta: { status }
  })

  return quote
}

export const deleteQuote = async (quoteId: string) => {
  // Get quote info before deletion for activity logging
  const { data: quote } = await supabase
    .from('quotes')
    .select('org_id')
    .eq('id', quoteId)
    .single()

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId)

  if (error) throw error

  // Log activity
  if (quote) {
    await etoolkit.logActivity(quote.org_id, {
      entity_type: 'quote',
      entity_id: quoteId,
      action: 'deleted'
    })
  }
}

// Invoice mutations
export const createInvoice = async (orgId: string, data: {
  client_id: string
  job_id?: string
  quote_id?: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    taxable?: boolean
  }>
  tax_rate_pct?: number
  discount_amt?: number
  due_date?: string
}) => {
  // Generate invoice number
  const { data: settings } = await supabase
    .from('settings')
    .select('numbering_prefix_invoice')
    .eq('org_id', orgId)
    .single()

  const prefix = settings?.numbering_prefix_invoice || 'INV'
  const number = `${prefix}${Date.now()}`

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      org_id: orgId,
      number,
      client_id: data.client_id,
      job_id: data.job_id,
      quote_id: data.quote_id,
      status: 'draft',
      tax_rate_pct: data.tax_rate_pct || 0,
      discount_amt: data.discount_amt || 0,
      due_date: data.due_date
    })
    .select()
    .single()

  if (invoiceError) throw invoiceError

  // Create invoice items
  const items = data.items.map((item, index) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    taxable: item.taxable ?? true,
    line_total: item.quantity * item.unit_price,
    sort_order: index
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(items)

  if (itemsError) throw itemsError

  // Log activity
  await etoolkit.logActivity(orgId, {
    entity_type: 'invoice',
    entity_id: invoice.id,
    action: 'created'
  })

  return invoice
}

export const updateInvoice = async (invoiceId: string, data: InvoiceUpdate) => {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(invoice.org_id, {
    entity_type: 'invoice',
    entity_id: invoice.id,
    action: 'updated'
  })

  return invoice
}

export const updateInvoiceStatus = async (invoiceId: string, status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') => {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({ 
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : null
    })
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(invoice.org_id, {
    entity_type: 'invoice',
    entity_id: invoice.id,
    action: status === 'sent' ? 'sent' : 'updated',
    meta: { status }
  })

  return invoice
}

export const recordPayment = async (invoiceId: string, data: {
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
  amount: number
  note?: string
}) => {
  return etoolkit.recordPayment(invoiceId, data)
}

export const deleteInvoice = async (invoiceId: string) => {
  // Get invoice info before deletion for activity logging
  const { data: invoice } = await supabase
    .from('invoices')
    .select('org_id')
    .eq('id', invoiceId)
    .single()

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)

  if (error) throw error

  // Log activity
  if (invoice) {
    await etoolkit.logActivity(invoice.org_id, {
      entity_type: 'invoice',
      entity_id: invoiceId,
      action: 'deleted'
    })
  }
}

// Pricebook mutations
export const createPricebookItem = async (orgId: string, data: Omit<InsertPricebookItem, 'org_id'>) => {
  const { data: item, error } = await supabase
    .from('pricebook_items')
    .insert({
      ...data,
      org_id: orgId,
      name: data.name || 'New Item', // Ensure required field is provided
      unit_price: data.unit_price || 0 // Ensure required field is provided
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(orgId, {
    entity_type: 'pricebook_item',
    entity_id: item.id,
    action: 'created'
  })

  return item
}

export const updatePricebookItem = async (itemId: string, data: UpdatePricebookItem) => {
  const { data: item, error } = await supabase
    .from('pricebook_items')
    .update(data)
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(item.org_id, {
    entity_type: 'pricebook_item',
    entity_id: item.id,
    action: 'updated'
  })

  return item
}

export const deletePricebookItem = async (itemId: string) => {
  // Get item info before deletion for activity logging
  const { data: item } = await supabase
    .from('pricebook_items')
    .select('org_id')
    .eq('id', itemId)
    .single()

  const { error } = await supabase
    .from('pricebook_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error

  // Log activity
  if (item) {
    await etoolkit.logActivity(item.org_id, {
      entity_type: 'pricebook_item',
      entity_id: itemId,
      action: 'deleted'
    })
  }
}

// Job mutations
export const createJob = async (orgId: string, data: Omit<InsertJob, 'org_id'>) => {
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      ...data,
      org_id: orgId,
      title: data.title || 'New Job' // Ensure required field is provided
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(orgId, {
    entity_type: 'job',
    entity_id: job.id,
    action: 'created'
  })

  return job
}

export const updateJob = async (jobId: string, data: UpdateJob) => {
  const { data: job, error } = await supabase
    .from('jobs')
    .update(data)
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(job.org_id, {
    entity_type: 'job',
    entity_id: job.id,
    action: 'updated'
  })

  return job
}

export const deleteJob = async (jobId: string) => {
  // Get job info before deletion for activity logging
  const { data: job } = await supabase
    .from('jobs')
    .select('org_id')
    .eq('id', jobId)
    .single()

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) throw error

  // Log activity
  if (job) {
    await etoolkit.logActivity(job.org_id, {
      entity_type: 'job',
      entity_id: jobId,
      action: 'deleted'
    })
  }
}

// Document mutations
export const createDocument = async (orgId: string, data: Omit<InsertDocument, 'org_id'>) => {
  const { data: document, error } = await supabase
    .from('documents')
    .insert({
      ...data,
      org_id: orgId,
      title: data.title || 'New Document', // Ensure required field is provided
      path: data.path || '', // Ensure required field is provided
      mime: data.mime || 'application/octet-stream', // Ensure required field is provided
      size: data.size || 0 // Ensure required field is provided
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(orgId, {
    entity_type: 'document',
    entity_id: document.id,
    action: 'created'
  })

  return document
}

export const updateDocument = async (documentId: string, data: UpdateDocument) => {
  const { data: document, error } = await supabase
    .from('documents')
    .update(data)
    .eq('id', documentId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  await etoolkit.logActivity(document.org_id, {
    entity_type: 'document',
    entity_id: document.id,
    action: 'updated'
  })

  return document
}

export const deleteDocument = async (documentId: string) => {
  // Get document info before deletion for activity logging
  const { data: document } = await supabase
    .from('documents')
    .select('org_id, path')
    .eq('id', documentId)
    .single()

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) throw error

  // Delete from storage
  if (document?.path) {
    await supabase.storage
      .from('documents')
      .remove([document.path])
  }

  // Log activity
  if (document) {
    await etoolkit.logActivity(document.org_id, {
      entity_type: 'document',
      entity_id: documentId,
      action: 'deleted'
    })
  }
}

// Payment mutations
export const updatePayment = async (paymentId: string, data: UpdatePayment) => {
  const { data: payment, error } = await supabase
    .from('payments')
    .update(data)
    .eq('id', paymentId)
    .select()
    .single()

  if (error) throw error

  // Get invoice for activity logging
  const { data: invoice } = await supabase
    .from('invoices')
    .select('org_id')
    .eq('id', payment.invoice_id)
    .single()

  if (invoice) {
    await etoolkit.logActivity(invoice.org_id, {
      entity_type: 'payment',
      entity_id: payment.id,
      action: 'updated'
    })
  }

  return payment
}

export const deletePayment = async (paymentId: string) => {
  // Get payment info before deletion for activity logging
  const { data: payment } = await supabase
    .from('payments')
    .select('invoice_id')
    .eq('id', paymentId)
    .single()

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)

  if (error) throw error

  // Get invoice for activity logging
  if (payment) {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('org_id')
      .eq('id', payment.invoice_id)
      .single()

    if (invoice) {
      await etoolkit.logActivity(invoice.org_id, {
        entity_type: 'payment',
        entity_id: paymentId,
        action: 'deleted'
      })
    }
  }
}

// Reminder mutations
export const createReminder = async (orgId: string, data: Omit<InsertReminder, 'org_id'>) => {
  const { data: reminder, error } = await supabase
    .from('reminders')
    .insert({
      ...data,
      org_id: orgId,
      entity_type: data.entity_type || 'general', // Ensure required field is provided
      entity_id: data.entity_id || '', // Ensure required field is provided
      title: data.title || 'New Reminder', // Ensure required field is provided
      due_at: data.due_at || new Date().toISOString() // Ensure required field is provided
    })
    .select()
    .single()

  if (error) throw error

  return reminder
}

export const updateReminder = async (reminderId: string, data: UpdateReminder) => {
  const { data: reminder, error } = await supabase
    .from('reminders')
    .update(data)
    .eq('id', reminderId)
    .select()
    .single()

  if (error) throw error

  return reminder
}

export const deleteReminder = async (reminderId: string) => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', reminderId)

  if (error) throw error
}

// Bulk operations
export const bulkUpdateClients = async (orgId: string, clientIds: string[], updates: Partial<UpdateClient>) => {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('org_id', orgId)
    .in('id', clientIds)
    .select()

  if (error) throw error

  // Log activities for each updated client
  for (const client of data) {
    await etoolkit.logActivity(orgId, {
      entity_type: 'client',
      entity_id: client.id,
      action: 'updated'
    })
  }

  return data
}

export const bulkDeleteClients = async (orgId: string, clientIds: string[]) => {
  // Log activities before deletion
  for (const clientId of clientIds) {
    await etoolkit.logActivity(orgId, {
      entity_type: 'client',
      entity_id: clientId,
      action: 'deleted'
    })
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('org_id', orgId)
    .in('id', clientIds)

  if (error) throw error
}

// Quote to Invoice conversion
export const convertQuoteToInvoice = async (quoteId: string) => {
  // Get quote with items
  const { data: quote } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items(*)
    `)
    .eq('id', quoteId)
    .single()

  if (!quote) throw new Error('Quote not found')

  // Generate invoice number
  const { data: settings } = await supabase
    .from('settings')
    .select('numbering_prefix_invoice')
    .eq('org_id', quote.org_id)
    .single()

  const prefix = settings?.numbering_prefix_invoice || 'INV'
  const number = `${prefix}${Date.now()}`

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      org_id: quote.org_id,
      number,
      client_id: quote.client_id,
      job_id: quote.job_id,
      quote_id: quote.id,
      status: 'draft',
      currency: quote.currency,
      tax_rate_pct: quote.tax_rate_pct,
      discount_amt: quote.discount_amt,
      subtotal: quote.subtotal,
      tax_total: quote.tax_total,
      total: quote.total,
      balance_due: quote.total,
      issue_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()

  if (invoiceError) throw invoiceError

  // Create invoice items from quote items
  const invoiceItems = quote.quote_items.map((item: any, index: number) => ({
    invoice_id: invoice.id,
    item_id: item.item_id,
    description: item.description as string,
    quantity: item.quantity as number,
    unit_price: item.unit_price as number,
    taxable: item.taxable as boolean,
    line_total: item.line_total as number,
    sort_order: index
  }))

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(invoiceItems)

  if (itemsError) throw itemsError

  // Update quote status
  await updateQuoteStatus(quoteId, 'accepted')

  // Log activity
  await etoolkit.logActivity(quote.org_id, {
    entity_type: 'invoice',
    entity_id: invoice.id,
    action: 'created' as const,
    meta: { converted_from_quote: quoteId }
  })

  return invoice
}

// Export logActivity function for use in API files
export const logActivity = async (
  orgId: string, 
  entityType: string, 
  entityId: string, 
  action: 'created' | 'updated' | 'deleted' | 'sent' | 'viewed' | 'paid' | 'imported' | 'uploaded' | 'status_updated' | 'recorded', 
  meta?: Record<string, unknown>
): Promise<void> => {
  await etoolkit.logActivity(orgId, {
    entity_type: entityType,
    entity_id: entityId,
    action: action as 'created' | 'updated' | 'deleted' | 'sent' | 'viewed' | 'paid',
    meta
  })
}
