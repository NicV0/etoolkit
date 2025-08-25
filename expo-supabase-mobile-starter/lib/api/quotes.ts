import { supabase } from '../supabase';
import { quoteSchema, QuoteFormData } from '../validation';
import { logActivity } from '../db/mutations';
import { generateQuoteNumber } from '../numbering';
import { calculateSubtotal, calculateTax, calculateTotal } from '../calculations';
import { invoiceAPI, InvoiceWithItems } from './invoices';

export interface QuoteFilters {
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  client_id?: string;
  job_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface QuoteWithItems {
  id: string;
  org_id: string;
  number: string;
  client_id: string;
  job_id?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  currency: string;
  tax_rate_pct: number;
  discount_amt: number;
  subtotal: number;
  tax_total: number;
  total: number;
  terms?: string;
  valid_until?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  job?: {
    id: string;
    title: string;
    status: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    taxable: boolean;
    line_total: number;
  }>;
}

export interface CreateQuoteData extends QuoteFormData {
  currency?: string;
  valid_until?: string;
}

export interface UpdateQuoteData extends Partial<QuoteFormData> {
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  currency?: string;
  valid_until?: string;
}

export const quoteAPI = {
  // List quotes with optional filtering
  list: async (orgId: string, filters?: QuoteFilters): Promise<QuoteWithItems[]> => {
    let query = supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email, phone),
        job:jobs(id, title, status),
        items:quote_items(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id);
    }

    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch quotes: ${error.message}`);
    }

    return data || [];
  },

  // Get single quote with full details
  get: async (quoteId: string): Promise<QuoteWithItems> => {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email, phone, address_line1, city, state, postal),
        job:jobs(id, title, description, status, due_date, location),
        items:quote_items(*)
      `)
      .eq('id', quoteId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch quote: ${error.message}`);
    }

    return data;
  },

  // Create new quote
  create: async (orgId: string, data: CreateQuoteData): Promise<QuoteWithItems> => {
    // Validate input data
    const validatedData = quoteSchema.parse(data);

    // Generate quote number
    const number = await generateQuoteNumber(orgId);

    // Calculate totals
    const subtotal = calculateSubtotal(validatedData.items.map(item => ({
      ...item,
      unit: 'item',
      unitPrice: item.unit_price,
      description: item.description || 'Item', // Ensure description is always provided
      quantity: item.quantity || 1 // Ensure quantity is always provided
    })));
    const taxTotal = calculateTax(subtotal, validatedData.tax_rate_pct);
    const total = calculateTotal(subtotal, taxTotal);

    // Set default valid until date (30 days from now)
    const validUntil = data.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        org_id: orgId,
        number,
        client_id: validatedData.client_id,
        job_id: validatedData.job_id,
        status: 'draft',
        currency: data.currency || 'USD',
        tax_rate_pct: validatedData.tax_rate_pct,
        discount_amt: validatedData.discount_amt,
        subtotal,
        tax_total: taxTotal,
        total,
        terms: validatedData.terms,
        valid_until: validUntil
      })
      .select()
      .single();

    if (quoteError) {
      throw new Error(`Failed to create quote: ${quoteError.message}`);
    }

    // Create quote items
    const quoteItems = validatedData.items.map(item => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      taxable: item.taxable,
      line_total: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(quoteItems);

    if (itemsError) {
      // Clean up quote if items creation fails
      await supabase.from('quotes').delete().eq('id', quote.id);
      throw new Error(`Failed to create quote items: ${itemsError.message}`);
    }

    // Log activity
    await logActivity(orgId, 'quote', quote.id, 'created', {
      quote_number: quote.number,
      client_id: validatedData.client_id,
      total: quote.total
    });

    // Return the complete quote
    return quoteAPI.get(quote.id);
  },

  // Update existing quote
  update: async (quoteId: string, data: UpdateQuoteData): Promise<QuoteWithItems> => {
    // Get existing quote
    const existingQuote = await quoteAPI.get(quoteId);

    // Validate input data
    const validatedData = quoteSchema.partial().parse(data);

    // Calculate new totals if items changed
    let subtotal = existingQuote.subtotal;
    let taxTotal = existingQuote.tax_total;
    let total = existingQuote.total;

    if (validatedData.items) {
      const itemsWithTotals = validatedData.items.map((item, index) => ({
        ...item,
        id: `temp_${index}`,
        line_total: item.quantity * item.unit_price
      }));
      // Recalculate totals
      subtotal = calculateSubtotal(itemsWithTotals.map(item => ({
        ...item,
        unit: 'item',
        unitPrice: item.unit_price,
        description: item.description || 'Item', // Ensure description is always provided
        quantity: item.quantity || 1 // Ensure quantity is always provided
      })));
      taxTotal = calculateTax(subtotal, validatedData.tax_rate_pct || existingQuote.tax_rate_pct);
      total = calculateTotal(subtotal, taxTotal);
    } else if (validatedData.tax_rate_pct !== undefined || validatedData.discount_amt !== undefined) {
      const taxRate = validatedData.tax_rate_pct ?? existingQuote.tax_rate_pct;
      const discount = validatedData.discount_amt ?? existingQuote.discount_amt;
      // Recalculate totals
      taxTotal = calculateTax(subtotal, taxRate);
      total = calculateTotal(subtotal, taxTotal);
    }

    // Update quote
    const { data: quote, error } = await supabase
      .from('quotes')
      .update({
        ...validatedData,
        subtotal,
        tax_total: taxTotal,
        total
      })
      .eq('id', quoteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update quote: ${error.message}`);
    }

    // Update items if provided
    if (validatedData.items) {
      // Delete existing items
      await supabase.from('quote_items').delete().eq('quote_id', quoteId);

      // Create new items
      const quoteItems = validatedData.items.map(item => ({
        quote_id: quoteId,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable: item.taxable,
        line_total: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) {
        throw new Error(`Failed to update quote items: ${itemsError.message}`);
      }
    }

    // Log activity
    await logActivity(existingQuote.org_id, 'quote', quoteId, 'updated', {
      quote_number: quote.number,
      status: quote.status
    });

    // Return the complete quote
    return quoteAPI.get(quoteId);
  },

  // Update quote status
  updateStatus: async (quoteId: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'): Promise<QuoteWithItems> => {
    const { data, error } = await supabase
      .from('quotes')
      .update({ 
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null
      })
      .eq('id', quoteId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update quote status: ${error.message}`);
    }

    // Log activity
    await logActivity(data.org_id, 'quote', quoteId, 'status_updated', {
      quote_number: data.number,
      status
    });

    return quoteAPI.get(quoteId);
  },

  // Send quote (update status to sent)
  send: async (quoteId: string): Promise<QuoteWithItems> => {
    return quoteAPI.updateStatus(quoteId, 'sent');
  },

  // Delete quote (soft delete by setting status to expired)
  delete: async (quoteId: string): Promise<void> => {
    const { data: quote, error: fetchError } = await supabase
      .from('quotes')
      .select('org_id, number')
      .eq('id', quoteId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch quote: ${fetchError.message}`);
    }

    const { error } = await supabase
      .from('quotes')
      .update({ status: 'expired' })
      .eq('id', quoteId);

    if (error) {
      throw new Error(`Failed to delete quote: ${error.message}`);
    }

    // Log activity
    await logActivity(quote.org_id, 'quote', quoteId, 'deleted', {
      quote_number: quote.number
    });
  },

  // Search quotes
  search: async (orgId: string, query: string): Promise<QuoteWithItems[]> => {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        client:clients(id, name, email, phone),
        job:jobs(id, title, status),
        items:quote_items(*)
      `)
      .eq('org_id', orgId)
      .or(`number.ilike.%${query}%,client:clients.name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search quotes: ${error.message}`);
    }

    return data || [];
  },

  // Get quote statistics
  getStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('quotes')
      .select('status, total, created_at')
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to fetch quote stats: ${error.message}`);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total: data.length,
      totalValue: data.reduce((sum, quote) => sum + (quote.total || 0), 0),
      byStatus: data.reduce((acc, quote) => {
        acc[quote.status] = (acc[quote.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byValue: {
        draft: data.filter(q => q.status === 'draft').reduce((sum, q) => sum + (q.total || 0), 0),
        sent: data.filter(q => q.status === 'sent').reduce((sum, q) => sum + (q.total || 0), 0),
        accepted: data.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.total || 0), 0),
        rejected: data.filter(q => q.status === 'rejected').reduce((sum, q) => sum + (q.total || 0), 0)
      },
      recent: data.filter(quote => new Date(quote.created_at) > thirtyDaysAgo).length
    };

    return stats;
  },

  // Duplicate quote
  duplicate: async (quoteId: string): Promise<QuoteWithItems> => {
    const originalQuote = await quoteAPI.get(quoteId);

    const duplicateData: CreateQuoteData = {
      client_id: originalQuote.client_id,
      job_id: originalQuote.job_id,
      items: originalQuote.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable: item.taxable
      })),
      tax_rate_pct: originalQuote.tax_rate_pct,
      discount_amt: originalQuote.discount_amt,
      currency: originalQuote.currency,
      terms: originalQuote.terms
    };

    return quoteAPI.create(originalQuote.org_id, duplicateData);
  },

  // Accept quote
  accept: async (quoteId: string): Promise<QuoteWithItems> => {
    const { data, error } = await supabase
      .from('quotes')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId)
      .select(`
        *,
        client:clients(id, name, email, phone),
        job:jobs(id, title, status),
        items:quote_items(*)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to accept quote: ${error.message}`);
    }

    if (!data) {
      throw new Error('Quote not found');
    }

    // Log activity
    await logActivity(data.org_id, 'quote', quoteId, 'status_updated', {
      quote_number: data.number,
      new_status: 'accepted'
    });

    return data;
  },

  // Convert quote to invoice
  convertToInvoice: async (quoteId: string): Promise<InvoiceWithItems> => {
    const quote = await quoteAPI.get(quoteId);
    
    // Check if quote is accepted
    if (quote.status !== 'accepted') {
      throw new Error('Only accepted quotes can be converted to invoices');
    }
    
    // Check if invoice already exists for this quote by querying invoices table
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('quote_id', quoteId)
      .single();
    
    if (existingInvoice) {
      throw new Error('Invoice already exists for this quote');
    }
    
    // Create invoice data from quote
    const invoiceData = {
      client_id: quote.client_id,
      job_id: quote.job_id,
      quote_id: quote.id,
      items: quote.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        taxable: item.taxable
      })),
      tax_rate_pct: quote.tax_rate_pct,
      discount_amt: quote.discount_amt,
      currency: quote.currency,
      terms: quote.terms
    };
    
    // Create the invoice using the invoice API
    const invoice = await invoiceAPI.create(quote.org_id, invoiceData);
    
    // Update the quote to mark it as expired (since it's been converted)
    await supabase
      .from('quotes')
      .update({ 
        status: 'expired',
        updated_at: new Date().toISOString()
      })
      .eq('id', quoteId);
    
    // Log activity
    await logActivity(quote.org_id, 'quote', quoteId, 'status_updated', {
      quote_number: quote.number,
      invoice_number: invoice.number,
      invoice_id: invoice.id,
      new_status: 'converted_to_invoice'
    });
    
    return invoice;
  }
};
