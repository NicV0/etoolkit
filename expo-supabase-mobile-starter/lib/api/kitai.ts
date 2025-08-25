import { supabase } from '../supabase';
import { kitAI } from '../kitai';
import type { KitAIMessage, KitAIThread, UUID } from '../types';

export interface KitAISearchResult {
  id: string;
  title: string;
  description: string;
  type: 'client' | 'pricebook' | 'quote' | 'invoice';
  relevance: number;
}

export interface KitAIDraftSuggestion {
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
  confidence: number;
}

// Simplified API with explicit typing to avoid deep inference
export const kitaiAPI = {
  // Get messages for a specific thread
  getMessages: async (threadId: UUID, limit: number = 50): Promise<KitAIMessage[]> => {
    const { data, error } = await supabase
      .from('kitai_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch KitAI messages: ${error.message}`);
    }

    return (data as KitAIMessage[]) || [];
  },

  // Get all threads for an organization
  getThreads: async (orgId: UUID): Promise<KitAIThread[]> => {
    const { data, error } = await supabase
      .from('kitai_threads')
      .select('*')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch KitAI threads: ${error.message}`);
    }

    return (data as KitAIThread[]) || [];
  },

  // Create a new message
  createMessage: async (threadId: UUID, role: 'user' | 'assistant', content: string): Promise<KitAIMessage> => {
    const { data, error } = await supabase
      .from('kitai_messages')
      .insert({
        thread_id: threadId,
        role,
        content
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create KitAI message: ${error.message}`);
    }

    // Update thread's updated_at
    await supabase
      .from('kitai_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId);

    return data as KitAIMessage;
  },

  // Create a new thread
  createThread: async (orgId: UUID, title?: string): Promise<KitAIThread> => {
    const { data, error } = await supabase
      .from('kitai_threads')
      .insert({
        org_id: orgId,
        title: title || 'New Conversation',
        user_id: 'system' // You'll need to get the actual user ID
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create KitAI thread: ${error.message}`);
    }

    return data as KitAIThread;
  },

  // Delete a thread
  deleteThread: async (threadId: UUID): Promise<void> => {
    // Delete all messages in the thread first
    await supabase
      .from('kitai_messages')
      .delete()
      .eq('thread_id', threadId);

    // Delete the thread
    const { error } = await supabase
      .from('kitai_threads')
      .delete()
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to delete KitAI thread: ${error.message}`);
    }
  },

  // Process a query using KitAI
  processQuery: async (orgId: UUID, query: string, threadId?: UUID): Promise<{
    response: string;
    suggestions?: KitAIDraftSuggestion[];
    searchResults?: KitAISearchResult[];
  }> => {
    try {
      // Initialize KitAI if not already done
      await kitAI.initialize();

      // Process the query
      const result = await kitAI.processQuery(query, orgId);

      // Create or update thread if provided
      if (threadId) {
        await kitaiAPI.createMessage(threadId, 'user', query);
        await kitaiAPI.createMessage(threadId, 'assistant', typeof result === 'string' ? result : JSON.stringify(result));
      }

      return {
        response: typeof result === 'string' ? result : 'Query processed successfully',
        suggestions: (result as any)?.suggestions || [],
        searchResults: (result as any)?.searchResults || []
      };
    } catch (error) {
      throw new Error(`Failed to process KitAI query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Search for clients using KitAI
  searchClients: async (orgId: UUID, query: string): Promise<KitAISearchResult[]> => {
    try {
      await kitAI.initialize();
      const results = await kitAI.searchClients(query, orgId);
      return results as KitAISearchResult[];
    } catch (error) {
      throw new Error(`Failed to search clients with KitAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Search for pricebook items using KitAI
  searchPricebook: async (orgId: UUID, query: string): Promise<KitAISearchResult[]> => {
    try {
      await kitAI.initialize();
      const results = await kitAI.searchPricebook(query, orgId);
      return results as KitAISearchResult[];
    } catch (error) {
      throw new Error(`Failed to search pricebook with KitAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get quick actions from KitAI
  getQuickActions: async (orgId: UUID): Promise<string[]> => {
    try {
      await kitAI.initialize();
      return await kitAI.getQuickActions(orgId);
    } catch (error) {
      throw new Error(`Failed to get quick actions from KitAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Suggest line items for quotes/invoices
  suggestLineItems: async (orgId: UUID, description: string): Promise<KitAIDraftSuggestion[]> => {
    try {
      await kitAI.initialize();
      const suggestions = await kitAI.suggestLineItems(description, orgId);
      return suggestions as KitAIDraftSuggestion[];
    } catch (error) {
      throw new Error(`Failed to get line item suggestions from KitAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Create a draft quote using KitAI
  createDraftQuote: async (orgId: UUID, clientId: UUID, items: KitAIDraftSuggestion[]): Promise<any> => {
    try {
      await kitAI.initialize();
      return await kitAI.createDraftQuote(clientId, items);
    } catch (error) {
      throw new Error(`Failed to create draft quote with KitAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get privacy settings
  getPrivacySettings: async (): Promise<any> => {
    try {
      await kitAI.initialize();
      return await kitAI.getPrivacySettings();
    } catch (error) {
      throw new Error(`Failed to get KitAI privacy settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (settings: any): Promise<void> => {
    try {
      await kitAI.initialize();
      await kitAI.updatePrivacySettings(settings);
    } catch (error) {
      throw new Error(`Failed to update KitAI privacy settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get search statistics
  getSearchStats: async (): Promise<any> => {
    try {
      await kitAI.initialize();
      return await kitAI.getSearchStats();
    } catch (error) {
      throw new Error(`Failed to get KitAI search stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Clear all KitAI data
  clearAllData: async (): Promise<void> => {
    try {
      await kitAI.initialize();
      await kitAI.clearAllData();
    } catch (error) {
      throw new Error(`Failed to clear KitAI data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Index data for offline search
  indexData: async (orgId: UUID, entities: Array<{
    type: 'client' | 'pricebook' | 'quote' | 'invoice';
    data: Record<string, unknown>;
  }>): Promise<void> => {
    try {
      await kitAI.initialize();
      await kitAI.indexData(entities);
    } catch (error) {
      throw new Error(`Failed to index data for KitAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get conversation history
  getConversationHistory: async (orgId: UUID, limit: number = 10): Promise<KitAIThread[]> => {
    const { data, error } = await supabase
      .from('kitai_threads')
      .select('*')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch conversation history: ${error.message}`);
    }

    return (data as KitAIThread[]) || [];
  },

  // Update thread title
  updateThreadTitle: async (threadId: UUID, title: string): Promise<void> => {
    const { error } = await supabase
      .from('kitai_threads')
      .update({ title })
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to update thread title: ${error.message}`);
    }
  },

  // Get thread summary
  getThreadSummary: async (threadId: UUID): Promise<{
    messageCount: number;
    lastMessage: string;
    createdDate: string;
    title: string;
  }> => {
    const [threadData, messagesData] = await Promise.all([
      supabase
        .from('kitai_threads')
        .select('*')
        .eq('id', threadId)
        .single(),
      supabase
        .from('kitai_messages')
        .select('content, created_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(1)
    ]);

    if (threadData.error) {
      throw new Error(`Failed to fetch thread data: ${threadData.error.message}`);
    }

    const messageCount = await supabase
      .from('kitai_messages')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', threadId);

    return {
      messageCount: messageCount.count || 0,
      lastMessage: messagesData.data?.[0]?.content || 'No messages',
      createdDate: threadData.data.created_at,
      title: threadData.data.title
    };
  }
};
