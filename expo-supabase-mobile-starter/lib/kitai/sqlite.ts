import { getDatabase } from '../sqlite';
import * as SQLite from 'expo-sqlite';

export interface OfflineSearchIndex {
  id: string;
  entityType: 'client' | 'pricebook' | 'quote' | 'invoice';
  entityId: string;
  searchText: string;
  metadata: string; // JSON string of additional data
  lastUpdated: string;
}

export interface SearchIndexEntry {
  id: string;
  entityType: string;
  entityId: string;
  searchText: string;
  metadata: Record<string, unknown>;
  relevance: number;
}

export class KitAISQLite {
  private static instance: KitAISQLite;
  private db: SQLite.SQLiteDatabase | null = null;

  static getInstance(): KitAISQLite {
    if (!KitAISQLite.instance) {
      KitAISQLite.instance = new KitAISQLite();
    }
    return KitAISQLite.instance;
  }

  /**
   * Initialize the SQLite database and create search index
   */
  async initialize(): Promise<void> {
    try {
      this.db = getDatabase();
      await this.createSearchIndexTable();
    } catch (error) {
      console.error('Failed to initialize KitAI SQLite:', error);
      throw error;
    }
  }

  /**
   * Create the search index table
   */
  private async createSearchIndexTable(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS kitai_search_index (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        search_text TEXT NOT NULL,
        metadata TEXT,
        last_updated TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_kitai_entity_type ON kitai_search_index(entity_type);
      CREATE INDEX IF NOT EXISTS idx_kitai_search_text ON kitai_search_index(search_text);
      CREATE INDEX IF NOT EXISTS idx_kitai_last_updated ON kitai_search_index(last_updated);
    `;

    await this.db.execAsync(createTableSQL);
  }

  /**
   * Index a client for search
   */
  async indexClient(client: Record<string, unknown>): Promise<void> {
    try {
      const searchText = `${client.name} ${client.email} ${client.phone} ${client.company || ''}`.toLowerCase();
      const metadata = JSON.stringify({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        status: client.status,
      });

      await this.upsertSearchIndex({
        id: `client_${client.id}`,
        entityType: 'client',
        entityId: String(client.id),
        searchText,
        metadata,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to index client:', error);
    }
  }

  /**
   * Index a pricebook item for search
   */
  async indexPricebookItem(item: Record<string, unknown>): Promise<void> {
    try {
      const searchText = `${item.name} ${item.code} ${item.category} ${item.description || ''}`.toLowerCase();
      const metadata = JSON.stringify({
        name: item.name,
        code: item.code,
        category: item.category,
        unitPrice: item.unit_price,
        unit: item.unit,
        description: item.description,
        active: item.active,
      });

      await this.upsertSearchIndex({
        id: `pricebook_${item.id}`,
        entityType: 'pricebook',
        entityId: String(item.id),
        searchText,
        metadata,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to index pricebook item:', error);
    }
  }

  /**
   * Index a quote for search
   */
  async indexQuote(quote: Record<string, unknown>): Promise<void> {
    try {
      const clients = quote.clients as Record<string, unknown> | undefined;
      const searchText = `${quote.number} ${clients?.name || ''} ${quote.status}`.toLowerCase();
      const metadata = JSON.stringify({
        number: quote.number,
        clientName: clients?.name,
        status: quote.status,
        total: quote.total,
        currency: quote.currency,
      });

      await this.upsertSearchIndex({
        id: `quote_${quote.id}`,
        entityType: 'quote',
        entityId: String(quote.id),
        searchText,
        metadata,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to index quote:', error);
    }
  }

  /**
   * Index an invoice for search
   */
  async indexInvoice(invoice: Record<string, unknown>): Promise<void> {
    try {
      const clients = invoice.clients as Record<string, unknown> | undefined;
      const searchText = `${invoice.number} ${clients?.name || ''} ${invoice.status}`.toLowerCase();
      const metadata = JSON.stringify({
        number: invoice.number,
        clientName: clients?.name,
        status: invoice.status,
        total: invoice.total,
        balanceDue: invoice.balance_due,
        currency: invoice.currency,
      });

      await this.upsertSearchIndex({
        id: `invoice_${invoice.id}`,
        entityId: String(invoice.id),
        entityType: 'invoice',
        searchText,
        metadata,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to index invoice:', error);
    }
  }

  /**
   * Search across all indexed entities
   */
  async search(query: string, entityTypes?: string[]): Promise<SearchIndexEntry[]> {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      const lowerQuery = query.toLowerCase();
      const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
      
      let sql = `
        SELECT id, entity_type, entity_id, search_text, metadata, last_updated
        FROM kitai_search_index
        WHERE 1=1
      `;
      
      const params: SQLite.SQLiteBindValue[] = [];
      
      // Filter by entity types if specified
      if (entityTypes && entityTypes.length > 0) {
        const placeholders = entityTypes.map(() => '?').join(',');
        sql += ` AND entity_type IN (${placeholders})`;
        params.push(...entityTypes);
      }
      
      // Add search conditions for each word
      queryWords.forEach((word, index) => {
        sql += ` AND search_text LIKE ?`;
        params.push(`%${word}%`);
      });
      
      sql += ` ORDER BY last_updated DESC LIMIT 50`;
      
      const results = await this.db.getAllAsync(sql, ...params);
      
      return results.map((row: unknown) => {
        const typedRow = row as Record<string, unknown>;
        return {
          id: String(typedRow.id),
          entityType: String(typedRow.entity_type),
          entityId: String(typedRow.entity_id),
          searchText: String(typedRow.search_text),
          metadata: JSON.parse(String(typedRow.metadata || '{}')),
          relevance: this.calculateRelevance(lowerQuery, String(typedRow.search_text)),
        };
      });
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Search for clients
   */
  async searchClients(query: string): Promise<SearchIndexEntry[]> {
    return this.search(query, ['client']);
  }

  /**
   * Search for pricebook items
   */
  async searchPricebook(query: string): Promise<SearchIndexEntry[]> {
    return this.search(query, ['pricebook']);
  }

  /**
   * Search for quotes
   */
  async searchQuotes(query: string): Promise<SearchIndexEntry[]> {
    return this.search(query, ['quote']);
  }

  /**
   * Search for invoices
   */
  async searchInvoices(query: string): Promise<SearchIndexEntry[]> {
    return this.search(query, ['invoice']);
  }

  /**
   * Remove an entity from the search index
   */
  async removeFromIndex(entityType: string, entityId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const sql = 'DELETE FROM kitai_search_index WHERE entity_type = ? AND entity_id = ?';
    await this.db.runAsync(sql, entityType, entityId);
  }

  /**
   * Clear all search index data
   */
  async clearIndex(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    await this.db.runAsync('DELETE FROM kitai_search_index');
  }

  /**
   * Get search index statistics
   */
  async getIndexStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    lastUpdated: string | null;
  }> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const totalResult = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM kitai_search_index'
    );
    
         const typeResults = await this.db.getAllAsync(
       'SELECT entity_type, COUNT(*) as count FROM kitai_search_index GROUP BY entity_type'
     );
     
     const lastUpdatedResult = await this.db.getFirstAsync(
       'SELECT MAX(last_updated) as last_updated FROM kitai_search_index'
     );
     
     const byType: Record<string, number> = {};
     typeResults.forEach((row: unknown) => {
       const typedRow = row as Record<string, unknown>;
       byType[String(typedRow.entity_type)] = Number(typedRow.count);
     });
     
     return {
       total: Number((totalResult as Record<string, unknown>)?.count || 0),
       byType,
       lastUpdated: (lastUpdatedResult as Record<string, unknown>)?.last_updated ? String((lastUpdatedResult as Record<string, unknown>).last_updated) : null,
     };
  }

  /**
   * Bulk index multiple entities
   */
  async bulkIndex(entities: Array<{
    type: 'client' | 'pricebook' | 'quote' | 'invoice';
    data: Record<string, unknown>;
  }>): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      await this.db.execAsync('BEGIN TRANSACTION');
      
      for (const entity of entities) {
        switch (entity.type) {
          case 'client':
            await this.indexClient(entity.data);
            break;
          case 'pricebook':
            await this.indexPricebookItem(entity.data);
            break;
          case 'quote':
            await this.indexQuote(entity.data);
            break;
          case 'invoice':
            await this.indexInvoice(entity.data);
            break;
        }
      }
      
      await this.db.execAsync('COMMIT');
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }

  /**
   * Clean up old entries
   */
  async cleanupOldEntries(daysOld: number = 30): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await this.db.runAsync(
        'DELETE FROM kitai_search_index WHERE last_updated < ?',
        [cutoffDate.toISOString()]
      );
      
      return result.changes || 0;
    } catch (error) {
      console.error('Failed to cleanup old entries:', error);
      return 0;
    }
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevance(query: string, searchText: string): number {
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const searchWords = searchText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    let score = 0;
    
    queryWords.forEach(queryWord => {
      searchWords.forEach(searchWord => {
        if (searchWord.includes(queryWord)) {
          score += 1;
        }
        if (searchWord === queryWord) {
          score += 2; // Exact match gets higher score
        }
      });
    });
    
    return score;
  }

  /**
   * Upsert search index entry
   */
  private async upsertSearchIndex(entry: OfflineSearchIndex): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    const sql = `
      INSERT OR REPLACE INTO kitai_search_index 
      (id, entity_type, entity_id, search_text, metadata, last_updated)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.runAsync(
      sql,
      entry.id,
      entry.entityType,
      entry.entityId,
      entry.searchText,
      entry.metadata,
      entry.lastUpdated
    );
  }

  /**
   * Update entity in search index
   */
  async updateIndex(entityType: string, entityId: string, data: Record<string, unknown>): Promise<void> {
    // Remove old entry and add new one
    await this.removeFromIndex(entityType, entityId);
    
    switch (entityType) {
      case 'client':
        await this.indexClient(data);
        break;
      case 'pricebook':
        await this.indexPricebookItem(data);
        break;
      case 'quote':
        await this.indexQuote(data);
        break;
      case 'invoice':
        await this.indexInvoice(data);
        break;
    }
  }
}

// Export singleton instance
export const kitAISQLite = KitAISQLite.getInstance();
