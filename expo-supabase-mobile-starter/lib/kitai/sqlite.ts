import { getDatabase } from '../sqlite';

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
  metadata: any;
  relevance: number;
}

export class KitAISQLite {
  private static instance: KitAISQLite;
  private db: any = null;

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
  async indexClient(client: any): Promise<void> {
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
        entityId: client.id,
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
  async indexPricebookItem(item: any): Promise<void> {
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
        entityId: item.id,
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
  async indexQuote(quote: any): Promise<void> {
    try {
      const searchText = `${quote.number} ${quote.clients?.name || ''} ${quote.status}`.toLowerCase();
      const metadata = JSON.stringify({
        number: quote.number,
        clientName: quote.clients?.name,
        status: quote.status,
        total: quote.total,
        currency: quote.currency,
      });

      await this.upsertSearchIndex({
        id: `quote_${quote.id}`,
        entityType: 'quote',
        entityId: quote.id,
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
  async indexInvoice(invoice: any): Promise<void> {
    try {
      const searchText = `${invoice.number} ${invoice.clients?.name || ''} ${invoice.status}`.toLowerCase();
      const metadata = JSON.stringify({
        number: invoice.number,
        clientName: invoice.clients?.name,
        status: invoice.status,
        total: invoice.total,
        balanceDue: invoice.balance_due,
        currency: invoice.currency,
      });

      await this.upsertSearchIndex({
        id: `invoice_${invoice.id}`,
        entityId: invoice.id,
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
      const lowerQuery = query.toLowerCase();
      const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
      
      let sql = `
        SELECT id, entity_type, entity_id, search_text, metadata, last_updated
        FROM kitai_search_index
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      // Filter by entity types if specified
      if (entityTypes && entityTypes.length > 0) {
        const placeholders = entityTypes.map(() => '?').join(',');
        sql += ` AND entity_type IN (${placeholders})`;
        params.push(...entityTypes);
      }
      
      // Add search conditions
      const searchConditions = queryWords.map(() => 'search_text LIKE ?');
      sql += ` AND (${searchConditions.join(' AND ')})`;
      params.push(...queryWords.map(word => `%${word}%`));
      
      sql += ` ORDER BY last_updated DESC LIMIT 20`;
      
      const results = await this.db.getAllAsync(sql, params);
      
      return results.map((row: any) => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        searchText: row.search_text,
        metadata: JSON.parse(row.metadata || '{}'),
        relevance: this.calculateRelevance(lowerQuery, row.search_text),
      })).sort((a: SearchIndexEntry, b: SearchIndexEntry) => b.relevance - a.relevance);
      
    } catch (error) {
      console.error('Failed to search offline index:', error);
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
    try {
      const indexId = `${entityType}_${entityId}`;
      await this.db.runAsync(
        'DELETE FROM kitai_search_index WHERE id = ?',
        [indexId]
      );
    } catch (error) {
      console.error('Failed to remove from search index:', error);
    }
  }

  /**
   * Clear all search indexes
   */
  async clearIndex(): Promise<void> {
    try {
      await this.db.runAsync('DELETE FROM kitai_search_index');
    } catch (error) {
      console.error('Failed to clear search index:', error);
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<{
    totalEntries: number;
    byType: Record<string, number>;
    lastUpdated: string;
  }> {
    try {
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
      typeResults.forEach((row: any) => {
        byType[row.entity_type] = row.count;
      });
      
      return {
        totalEntries: totalResult?.count || 0,
        byType,
        lastUpdated: lastUpdatedResult?.last_updated || '',
      };
    } catch (error) {
      console.error('Failed to get index stats:', error);
      return {
        totalEntries: 0,
        byType: {},
        lastUpdated: '',
      };
    }
  }

  /**
   * Bulk index multiple entities
   */
  async bulkIndex(entities: Array<{
    type: 'client' | 'pricebook' | 'quote' | 'invoice';
    data: any;
  }>): Promise<void> {
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
      console.error('Failed to bulk index entities:', error);
      throw error;
    }
  }

  /**
   * Clean up old entries
   */
  async cleanupOldEntries(daysOld: number = 30): Promise<number> {
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

  // Private helper methods

  private async upsertSearchIndex(entry: OfflineSearchIndex): Promise<void> {
    await this.db.runAsync(
      `INSERT OR REPLACE INTO kitai_search_index 
       (id, entity_type, entity_id, search_text, metadata, last_updated)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entry.id, entry.entityType, entry.entityId, entry.searchText, entry.metadata, entry.lastUpdated]
    );
  }

  private calculateRelevance(query: string, searchText: string): number {
    const queryWords = query.split(/\s+/);
    const searchWords = searchText.split(/\s+/);
    
    let relevance = 0;
    
    for (const queryWord of queryWords) {
      for (const searchWord of searchWords) {
        if (searchWord.startsWith(queryWord)) {
          relevance += 10;
        } else if (searchWord.includes(queryWord)) {
          relevance += 5;
        }
      }
    }
    
    return relevance;
  }
}

// Export singleton instance
export const kitAISQLite = KitAISQLite.getInstance();
