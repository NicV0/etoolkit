import { supabase } from '../supabase';
import { pricebookItemSchema, PricebookItemFormData } from '../validation';
import { logActivity } from '../db/mutations';

export interface PricebookFilters {
  category?: string;
  active?: boolean;
  isQuickPick?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PricebookItem {
  id: string;
  org_id: string;
  code?: string;
  name: string;
  category?: string;
  unit: string;
  unit_price: number;
  taxable: boolean;
  active: boolean;
  is_quick_pick: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePricebookItemData extends PricebookItemFormData {
  org_id?: string;
}

export interface UpdatePricebookItemData extends Partial<PricebookItemFormData> {
  active?: boolean;
  is_quick_pick?: boolean;
}

export const pricebookAPI = {
  // List pricebook items with optional filtering
  list: async (orgId: string, filters?: PricebookFilters): Promise<PricebookItem[]> => {
    let query = supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }

    if (filters?.isQuickPick !== undefined) {
      query = query.eq('is_quick_pick', filters.isQuickPick);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,category.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch pricebook items: ${error.message}`);
    }

    return data || [];
  },

  // Get single pricebook item
  get: async (itemId: string): Promise<PricebookItem> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch pricebook item: ${error.message}`);
    }

    return data;
  },

  // Create new pricebook item
  create: async (orgId: string, data: CreatePricebookItemData): Promise<PricebookItem> => {
    // Validate input data
    const validatedData = pricebookItemSchema.parse(data);

    const { data: item, error } = await supabase
      .from('pricebook_items')
      .insert({
        ...validatedData,
        org_id: orgId,
        name: validatedData.name || 'New Item', // Ensure name is always provided
        unit_price: validatedData.unit_price || 0 // Ensure unit_price is always provided
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pricebook item: ${error.message}`);
    }

    // Log activity
    await logActivity(orgId, 'pricebook_item', item.id, 'created', {
      item_name: item.name,
      category: item.category
    });

    return item;
  },

  // Update existing pricebook item
  update: async (itemId: string, data: UpdatePricebookItemData): Promise<PricebookItem> => {
    // Validate input data
    const validatedData = pricebookItemSchema.partial().parse(data);

    const { data: item, error } = await supabase
      .from('pricebook_items')
      .update(validatedData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pricebook item: ${error.message}`);
    }

    // Log activity
    await logActivity(item.org_id, 'pricebook_item', itemId, 'updated', {
      item_name: item.name,
      category: item.category
    });

    return item;
  },

  // Delete pricebook item
  delete: async (itemId: string): Promise<void> => {
    const { data: item, error: fetchError } = await supabase
      .from('pricebook_items')
      .select('org_id, name')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch pricebook item: ${fetchError.message}`);
    }

    const { error } = await supabase
      .from('pricebook_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to delete pricebook item: ${error.message}`);
    }

    // Log activity
    await logActivity(item.org_id, 'pricebook_item', itemId, 'deleted', {
      item_name: item.name
    });
  },

  // Get quick pick items
  getQuickPickItems: async (orgId: string): Promise<PricebookItem[]> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('active', true)
      .eq('is_quick_pick', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch quick pick items: ${error.message}`);
    }

    return data || [];
  },

  // Search pricebook items
  search: async (orgId: string, query: string): Promise<PricebookItem[]> => {
    if (!query.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('active', true)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name');

    if (error) {
      throw new Error(`Failed to search pricebook items: ${error.message}`);
    }

    return data || [];
  },

  // Get categories
  getCategories: async (orgId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('category')
      .eq('org_id', orgId)
      .not('category', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    return categories.sort();
  },

  // Bulk update items
  bulkUpdate: async (orgId: string, itemIds: string[], updates: UpdatePricebookItemData): Promise<PricebookItem[]> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .update(updates)
      .eq('org_id', orgId)
      .in('id', itemIds)
      .select();

    if (error) {
      throw new Error(`Failed to bulk update pricebook items: ${error.message}`);
    }

    // Log activity for each updated item
    for (const item of data) {
      await logActivity(orgId, 'pricebook_item', item.id, 'updated', {
        item_name: item.name,
        bulk_update: true
      });
    }

    return data || [];
  },

  // Import pricebook items from CSV
  importCSV: async (orgId: string, csvData: string): Promise<{ success: number; errors: string[] }> => {
    const { parse } = await import('papaparse');
    
    const results = parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_')
    });

    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < results.data.length; i++) {
      const row = results.data[i] as Record<string, unknown>;
      const rowNumber = i + 2; // +2 because of 0-based index and header row

      try {
        // Map CSV columns to our schema
        const itemData: CreatePricebookItemData = {
          name: String(row.name || ''),
          code: String(row.code || ''),
          category: String(row.category || ''),
          unit: String(row.unit || 'each'),
          unit_price: parseFloat(String(row.unit_price || '0')),
          taxable: Boolean(row.taxable),
          active: Boolean(row.active !== 'false'),
          is_quick_pick: Boolean(row.is_quick_pick)
        };

        // Validate the data
        const validatedData = pricebookItemSchema.parse(itemData);

        // Create the item
        await supabase
          .from('pricebook_items')
          .insert({
            ...validatedData,
            org_id: orgId,
            name: validatedData.name || 'New Item', // Ensure name is always provided
            unit_price: validatedData.unit_price || 0 // Ensure unit_price is always provided
          });

        successCount++;
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log import activity
    if (successCount > 0) {
      await logActivity(orgId, 'pricebook_item', 'bulk', 'imported', {
        count: successCount,
        errors_count: errors.length
      });
    }

    return { success: successCount, errors };
  },

  // Bulk import pricebook items
  bulkImport: async (orgId: string, items: CreatePricebookItemData[]): Promise<{ success: number; errors: string[] }> => {
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        // Validate the data
        const validatedData = pricebookItemSchema.parse(item);

        // Create the item
        await supabase
          .from('pricebook_items')
          .insert({
            ...validatedData,
            org_id: orgId,
            name: validatedData.name || 'New Item',
            unit_price: validatedData.unit_price || 0
          });

        successCount++;
      } catch (error) {
        errors.push(`Item ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log import activity
    if (successCount > 0) {
      await logActivity(orgId, 'pricebook_item', 'bulk', 'imported', {
        count: successCount,
        errors_count: errors.length
      });
    }

    return { success: successCount, errors };
  },

  // Export pricebook items to CSV
  exportCSV: async (orgId: string, filters?: PricebookFilters): Promise<string> => {
    const items = await pricebookAPI.list(orgId, filters);

    // Convert to CSV format
    const headers = ['Name', 'Code', 'Category', 'Unit', 'Unit Price', 'Taxable', 'Active', 'Quick Pick'];
    const rows = items.map(item => [
      item.name,
      item.code || '',
      item.category || '',
      item.unit,
      item.unit_price,
      item.taxable ? 'Yes' : 'No',
      item.active ? 'Yes' : 'No',
      item.is_quick_pick ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  },

  // Get pricebook statistics
  getStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('active, is_quick_pick, category, unit_price')
      .eq('org_id', orgId);

    if (error) {
      throw new Error(`Failed to fetch pricebook stats: ${error.message}`);
    }

    const stats = {
      total: data.length,
      active: data.filter(item => item.active).length,
      inactive: data.filter(item => !item.active).length,
      quickPick: data.filter(item => item.is_quick_pick).length,
      categories: [...new Set(data.map(item => item.category).filter(Boolean))].length,
      averagePrice: data.length > 0 
        ? data.reduce((sum, item) => sum + (item.unit_price || 0), 0) / data.length 
        : 0,
      byCategory: data.reduce((acc, item) => {
        if (item.category) {
          acc[item.category] = (acc[item.category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    };

    return stats;
  }
};
