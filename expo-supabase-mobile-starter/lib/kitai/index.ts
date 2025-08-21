// KitAI - Local AI Assistant for eToolkit
// Provides intelligent search, suggestions, and automation tools

import { KitAITools } from './tools';
import { PrivacyControls } from './privacy';
import { KitAISQLite } from './sqlite';

// Get singleton instances
const kitAITools = KitAITools.getInstance();
const privacyControls = PrivacyControls.getInstance();
const kitAISQLite = KitAISQLite.getInstance();

export { kitAITools, privacyControls, kitAISQLite };

// Re-export types for convenience
export type { 
  SearchResult, 
  DraftSuggestion 
} from './tools';

export type { 
  PrivacySettings, 
  PrivacyConsent 
} from './privacy';

export type { 
  OfflineSearchIndex, 
  SearchIndexEntry 
} from './sqlite';

// Main KitAI class that orchestrates all functionality
export class KitAI {
  private static instance: KitAI;

  static getInstance(): KitAI {
    if (!KitAI.instance) {
      KitAI.instance = new KitAI();
    }
    return KitAI.instance;
  }

  /**
   * Initialize KitAI with all components
   */
  async initialize(): Promise<void> {
    try {
      // Initialize SQLite search index
      await kitAISQLite.initialize();
      
      // Check privacy consent
      const hasConsent = await privacyControls.hasConsent();
      if (!hasConsent) {
        console.log('KitAI: Privacy consent not given, using default settings');
      }
      
      console.log('KitAI: Initialized successfully');
    } catch (error) {
      console.error('KitAI: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Process a natural language query
   */
  async processQuery(query: string, orgId: string): Promise<any> {
    try {
      // Check privacy settings
      const allowDataCollection = await privacyControls.isDataCollectionAllowed();
      
      if (!allowDataCollection) {
        console.log('KitAI: Data collection disabled, using offline search only');
        return await kitAISQLite.search(query);
      }

      // Use online tools with offline fallback
      return await kitAITools.processQuery(query, orgId);
    } catch (error) {
      console.error('KitAI: Query processing failed:', error);
      
      // Fallback to offline search
      return await kitAISQLite.search(query);
    }
  }

  /**
   * Get quick actions based on context
   */
  async getQuickActions(orgId: string): Promise<string[]> {
    try {
      return await kitAITools.getQuickActions(orgId);
    } catch (error) {
      console.error('KitAI: Failed to get quick actions:', error);
      return [
        'Create new quote',
        'Add new client',
        'Record payment',
      ];
    }
  }

  /**
   * Search for clients
   */
  async searchClients(query: string, orgId: string): Promise<any[]> {
    try {
      return await kitAITools.searchClients(query, orgId);
    } catch (error) {
      console.error('KitAI: Client search failed:', error);
      return await kitAISQLite.searchClients(query);
    }
  }

  /**
   * Search for pricebook items
   */
  async searchPricebook(query: string, orgId: string): Promise<any[]> {
    try {
      return await kitAITools.searchPricebook(query, orgId);
    } catch (error) {
      console.error('KitAI: Pricebook search failed:', error);
      return await kitAISQLite.searchPricebook(query);
    }
  }

  /**
   * Suggest line items for quotes/invoices
   */
  async suggestLineItems(description: string, orgId: string): Promise<any[]> {
    try {
      return await kitAITools.suggestLineItems(description, orgId);
    } catch (error) {
      console.error('KitAI: Line item suggestion failed:', error);
      return [];
    }
  }

  /**
   * Create a draft quote
   */
  async createDraftQuote(clientId: string, items: any[]): Promise<any> {
    try {
      return await kitAITools.createDraftQuote(clientId, items);
    } catch (error) {
      console.error('KitAI: Draft quote creation failed:', error);
      throw error;
    }
  }

  /**
   * Index data for offline search
   */
  async indexData(entities: Array<{
    type: 'client' | 'pricebook' | 'quote' | 'invoice';
    data: any;
  }>): Promise<void> {
    try {
      await kitAISQLite.bulkIndex(entities);
    } catch (error) {
      console.error('KitAI: Failed to index data:', error);
    }
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<any> {
    return await privacyControls.getPrivacySettings();
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: any): Promise<void> {
    await privacyControls.updatePrivacySettings(settings);
  }

  /**
   * Get search index statistics
   */
  async getSearchStats(): Promise<any> {
    return await kitAISQLite.getIndexStats();
  }

  /**
   * Clear all KitAI data
   */
  async clearAllData(): Promise<void> {
    try {
      await kitAISQLite.clearIndex();
      await privacyControls.clearAllData();
    } catch (error) {
      console.error('KitAI: Failed to clear data:', error);
    }
  }
}

// Export singleton instance
export const kitAI = KitAI.getInstance();
