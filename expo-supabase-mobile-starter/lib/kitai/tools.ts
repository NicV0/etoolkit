import { supabase } from '../supabase';
import { getDatabase } from '../sqlite';

export interface KitAITool {
  name: string;
  description: string;
  execute: (query: string, orgId: string) => Promise<any>;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'client' | 'pricebook' | 'quote' | 'invoice';
  relevance: number;
}

export interface DraftSuggestion {
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
  confidence: number;
}

export class KitAITools {
  private static instance: KitAITools;

  static getInstance(): KitAITools {
    if (!KitAITools.instance) {
      KitAITools.instance = new KitAITools();
    }
    return KitAITools.instance;
  }

  /**
   * Search for clients by name, email, or phone
   */
  async searchClients(query: string, orgId: string): Promise<SearchResult[]> {
    try {
      // Try online search first
      const { data: onlineResults, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, status')
        .eq('org_id', orgId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return onlineResults?.map(client => ({
        id: client.id,
        title: client.name,
        description: `${client.email} • ${client.phone}`,
        type: 'client' as const,
        relevance: this.calculateRelevance(query, client.name, client.email, client.phone)
      })) || [];

    } catch (error) {
      console.warn('Online client search failed, falling back to offline:', error);
      
      // Fallback to offline SQLite search
      return this.searchClientsOffline(query, orgId);
    }
  }

  /**
   * Search pricebook items by name, code, or category
   */
  async searchPricebook(query: string, orgId: string): Promise<SearchResult[]> {
    try {
      const { data: onlineResults, error } = await supabase
        .from('pricebook_items')
        .select('id, name, code, category, unit_price, unit')
        .eq('org_id', orgId)
        .eq('active', true)
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return onlineResults?.map(item => ({
        id: item.id,
        title: item.name,
        description: `${item.code} • $${item.unit_price} per ${item.unit}`,
        type: 'pricebook' as const,
        relevance: this.calculateRelevance(query, item.name, item.code, item.category)
      })) || [];

    } catch (error) {
      console.warn('Online pricebook search failed, falling back to offline:', error);
      return this.searchPricebookOffline(query, orgId);
    }
  }

  /**
   * Suggest line items based on description
   */
  async suggestLineItems(description: string, orgId: string): Promise<DraftSuggestion[]> {
    try {
      // Search for similar items in pricebook
      const { data: similarItems, error } = await supabase
        .from('pricebook_items')
        .select('name, unit_price, category, unit')
        .eq('org_id', orgId)
        .eq('active', true)
        .or(`name.ilike.%${description}%,category.ilike.%${description}%`)
        .limit(5);

      if (error) throw error;

      return similarItems?.map(item => ({
        description: item.name,
        quantity: 1,
        unitPrice: parseFloat(item.unit_price),
        category: item.category,
        confidence: this.calculateConfidence(description, item.name, item.category)
      })) || [];

    } catch (error) {
      console.warn('Line item suggestion failed:', error);
      return [];
    }
  }

  /**
   * Create a draft quote structure
   */
  async createDraftQuote(clientId: string, items: DraftSuggestion[]): Promise<any> {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id, name, org_id')
        .eq('id', clientId)
        .single();

      if (!client) throw new Error('Client not found');

      const quoteData = {
        org_id: client.org_id,
        client_id: clientId,
        status: 'draft',
        currency: 'USD',
        tax_rate_pct: 0,
        discount_amt: 0,
        subtotal: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        tax_total: 0,
        total: items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        terms: '',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Add quote items
      const quoteItems = items.map(item => ({
        quote_id: quote.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        taxable: true,
        line_total: item.quantity * item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      return quote;

    } catch (error) {
      console.error('Failed to create draft quote:', error);
      throw error;
    }
  }

  /**
   * Get quick actions based on context
   */
  async getQuickActions(orgId: string): Promise<string[]> {
    try {
      const actions = [
        'Create new quote',
        'Add new client',
        'Record payment',
        'Send invoice',
        'View overdue invoices',
        'Export data',
      ];

      // Add context-specific actions based on recent activity
      const { data: recentQuotes } = await supabase
        .from('quotes')
        .select('status')
        .eq('org_id', orgId)
        .eq('status', 'sent')
        .limit(5);

      if (recentQuotes && recentQuotes.length > 0) {
        actions.push('Follow up on quotes');
      }

      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('org_id', orgId)
        .eq('status', 'sent')
        .lt('due_date', new Date().toISOString())
        .limit(1);

      if (overdueInvoices && overdueInvoices.length > 0) {
        actions.push('Send payment reminders');
      }

      return actions;

    } catch (error) {
      console.warn('Failed to get quick actions:', error);
      return [
        'Create new quote',
        'Add new client',
        'Record payment',
      ];
    }
  }

  /**
   * Process natural language queries
   */
  async processQuery(query: string, orgId: string): Promise<any> {
    const lowerQuery = query.toLowerCase();

    // Handle different types of queries
    if (lowerQuery.includes('client') || lowerQuery.includes('customer')) {
      return this.searchClients(query.replace(/client|customer/gi, '').trim(), orgId);
    }

    if (lowerQuery.includes('price') || lowerQuery.includes('item') || lowerQuery.includes('service')) {
      return this.searchPricebook(query.replace(/price|item|service/gi, '').trim(), orgId);
    }

    if (lowerQuery.includes('quote') || lowerQuery.includes('estimate')) {
      // Search for quotes
      return this.searchQuotes(query.replace(/quote|estimate/gi, '').trim(), orgId);
    }

    if (lowerQuery.includes('invoice') || lowerQuery.includes('bill')) {
      // Search for invoices
      return this.searchInvoices(query.replace(/invoice|bill/gi, '').trim(), orgId);
    }

    // Default to client search
    return this.searchClients(query, orgId);
  }

  // Private helper methods

  private calculateRelevance(query: string, ...fields: string[]): number {
    const lowerQuery = query.toLowerCase();
    let relevance = 0;

    fields.forEach(field => {
      if (!field) return;
      const lowerField = field.toLowerCase();
      
      if (lowerField.startsWith(lowerQuery)) relevance += 10;
      else if (lowerField.includes(lowerQuery)) relevance += 5;
      else if (lowerField.includes(lowerQuery.split(' ')[0])) relevance += 2;
    });

    return relevance;
  }

  private calculateConfidence(description: string, itemName: string, category: string): number {
    const desc = description.toLowerCase();
    const name = itemName.toLowerCase();
    const cat = category.toLowerCase();

    let confidence = 0;

    if (name.includes(desc) || desc.includes(name)) confidence += 50;
    if (cat.includes(desc) || desc.includes(cat)) confidence += 30;
    
    // Word matching
    const descWords = desc.split(' ');
    const nameWords = name.split(' ');
    const matches = descWords.filter(word => nameWords.includes(word)).length;
    confidence += matches * 10;

    return Math.min(confidence, 100);
  }

  private async searchClientsOffline(query: string, orgId: string): Promise<SearchResult[]> {
    try {
      const db = getDatabase();
      const results = await db.getAllAsync(
        `SELECT id, name, email, phone, status 
         FROM clients 
         WHERE org_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)
         LIMIT 10`,
        [orgId, `%${query}%`, `%${query}%`, `%${query}%`]
      );

      return results.map((client: any) => ({
        id: client.id,
        title: client.name,
        description: `${client.email} • ${client.phone}`,
        type: 'client' as const,
        relevance: this.calculateRelevance(query, client.name, client.email, client.phone)
      }));

    } catch (error) {
      console.warn('Offline client search failed:', error);
      return [];
    }
  }

  private async searchPricebookOffline(query: string, orgId: string): Promise<SearchResult[]> {
    try {
      const db = getDatabase();
      const results = await db.getAllAsync(
        `SELECT id, name, code, category, unit_price, unit 
         FROM pricebook_items 
         WHERE org_id = ? AND active = 1 AND (name LIKE ? OR code LIKE ? OR category LIKE ?)
         LIMIT 10`,
        [orgId, `%${query}%`, `%${query}%`, `%${query}%`]
      );

      return results.map((item: any) => ({
        id: item.id,
        title: item.name,
        description: `${item.code} • $${item.unit_price} per ${item.unit}`,
        type: 'pricebook' as const,
        relevance: this.calculateRelevance(query, item.name, item.code, item.category)
      }));

    } catch (error) {
      console.warn('Offline pricebook search failed:', error);
      return [];
    }
  }

  private async searchQuotes(query: string, orgId: string): Promise<SearchResult[]> {
    try {
      const { data: results, error } = await supabase
        .from('quotes')
        .select('id, number, status, total, clients(name)')
        .eq('org_id', orgId)
        .or(`number.ilike.%${query}%,clients.name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return results?.map(quote => ({
        id: quote.id,
        title: `Quote ${quote.number}`,
        description: `${quote.clients?.name || 'Unknown Client'} • $${quote.total} • ${quote.status}`,
        type: 'quote' as const,
        relevance: this.calculateRelevance(query, quote.number, quote.clients?.name || '')
      })) || [];

    } catch (error) {
      console.warn('Quote search failed:', error);
      return [];
    }
  }

  private async searchInvoices(query: string, orgId: string): Promise<SearchResult[]> {
    try {
      const { data: results, error } = await supabase
        .from('invoices')
        .select('id, number, status, total, clients(name)')
        .eq('org_id', orgId)
        .or(`number.ilike.%${query}%,clients.name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      return results?.map(invoice => ({
        id: invoice.id,
        title: `Invoice ${invoice.number}`,
        description: `${invoice.clients?.name || 'Unknown Client'} • $${invoice.total} • ${invoice.status}`,
        type: 'invoice' as const,
        relevance: this.calculateRelevance(query, invoice.number, invoice.clients?.name || '')
      })) || [];

    } catch (error) {
      console.warn('Invoice search failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const kitAITools = KitAITools.getInstance();
