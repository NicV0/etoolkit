import { supabase } from '../supabase'
import { pricebookItemSchema, PricebookItemFormData } from '../validation'
import { logActivity } from '../db/mutations'

export interface PricebookFilters {
  category?: string
  active?: boolean
  is_quick_pick?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface PricebookItem {
  id: string
  org_id: string
  code?: string
  name: string
  category?: string
  unit: string
  unit_price: number
  taxable: boolean
  active: boolean
  is_quick_pick: boolean
  created_at: string
  updated_at: string
}

export interface CreatePricebookItemData extends PricebookItemFormData {
  code?: string
}

export interface UpdatePricebookItemData extends Partial<PricebookItemFormData> {
  code?: string
}

export interface PricebookCategory {
  category: string
  count: number
  total_value: number
}

export const pricebookAPI = {
  // List pricebook items with optional filtering
  list: async (orgId: string, filters?: PricebookFilters): Promise<PricebookItem[]> => {
    let query = supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .order('name')

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active)
    }

    if (filters?.is_quick_pick !== undefined) {
      query = query.eq('is_quick_pick', filters.is_quick_pick)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,category.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch pricebook items: ${error.message}`)
    }

    return data || []
  },

  // Get single pricebook item
  get: async (itemId: string): Promise<PricebookItem> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('id', itemId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch pricebook item: ${error.message}`)
    }

    return data
  },

  // Create new pricebook item
  create: async (orgId: string, data: CreatePricebookItemData): Promise<PricebookItem> => {
    // Validate input data
    const validatedData = pricebookItemSchema.parse(data)

    // Check quick pick limit for free plan
    if (validatedData.is_quick_pick) {
      const { data: org } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', orgId)
        .single()

      if (org?.plan === 'free') {
        const { count } = await supabase
          .from('pricebook_items')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('is_quick_pick', true)

        if (count && count >= 10) {
          throw new Error('Free plan limited to 10 quick pick items. Upgrade to add more.')
        }
      }
    }

    const { data: item, error } = await supabase
      .from('pricebook_items')
      .insert({
        ...validatedData,
        org_id: orgId
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create pricebook item: ${error.message}`)
    }

    // Log activity
    await logActivity(orgId, 'pricebook_item', item.id, 'created', {
      item_name: item.name,
      unit_price: item.unit_price
    })

    return item
  },

  // Update existing pricebook item
  update: async (itemId: string, data: UpdatePricebookItemData): Promise<PricebookItem> => {
    // Validate input data
    const validatedData = pricebookItemSchema.partial().parse(data)

    // Check quick pick limit if setting to true
    if (validatedData.is_quick_pick === true) {
      const { data: item } = await supabase
        .from('pricebook_items')
        .select('org_id')
        .eq('id', itemId)
        .single()

      if (item) {
        const { data: org } = await supabase
          .from('organizations')
          .select('plan')
          .eq('id', item.org_id)
          .single()

        if (org?.plan === 'free') {
          const { count } = await supabase
            .from('pricebook_items')
            .select('*', { count: 'exact', head: true })
            .eq('org_id', item.org_id)
            .eq('is_quick_pick', true)

          if (count && count >= 10) {
            throw new Error('Free plan limited to 10 quick pick items. Upgrade to add more.')
          }
        }
      }
    }

    const { data: updatedItem, error } = await supabase
      .from('pricebook_items')
      .update(validatedData)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update pricebook item: ${error.message}`)
    }

    // Log activity
    await logActivity(updatedItem.org_id, 'pricebook_item', itemId, 'updated', {
      item_name: updatedItem.name
    })

    return updatedItem
  },

  // Delete pricebook item
  delete: async (itemId: string): Promise<void> => {
    const { data: item, error: fetchError } = await supabase
      .from('pricebook_items')
      .select('org_id, name')
      .eq('id', itemId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch pricebook item: ${fetchError.message}`)
    }

    const { error } = await supabase
      .from('pricebook_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      throw new Error(`Failed to delete pricebook item: ${error.message}`)
    }

    // Log activity
    await logActivity(item.org_id, 'pricebook_item', itemId, 'deleted', {
      item_name: item.name
    })
  },

  // Search pricebook items
  search: async (orgId: string, query: string): Promise<PricebookItem[]> => {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('active', true)
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
      .order('name')

    if (error) {
      throw new Error(`Failed to search pricebook items: ${error.message}`)
    }

    return data || []
  },

  // Get quick pick items
  getQuickPicks: async (orgId: string): Promise<PricebookItem[]> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_quick_pick', true)
      .eq('active', true)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch quick pick items: ${error.message}`)
    }

    return data || []
  },

  // Get categories
  getCategories: async (orgId: string): Promise<PricebookCategory[]> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('category, unit_price')
      .eq('org_id', orgId)
      .eq('active', true)

    if (error) {
      throw new Error(`Failed to fetch pricebook categories: ${error.message}`)
    }

    const categories = data.reduce((acc, item) => {
      const category = item.category || 'Uncategorized'
      if (!acc[category]) {
        acc[category] = { category, count: 0, total_value: 0 }
      }
      acc[category].count++
      acc[category].total_value += item.unit_price || 0
      return acc
    }, {} as Record<string, PricebookCategory>)

    return Object.values(categories).sort((a, b) => a.category.localeCompare(b.category))
  },

  // Bulk import pricebook items
  bulkImport: async (orgId: string, items: CreatePricebookItemData[]): Promise<{ success: number; errors: string[] }> => {
    const errors: string[] = []
    let successCount = 0

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const rowNumber = i + 1

      try {
        await pricebookAPI.create(orgId, item)
        successCount++
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Log bulk import activity
    if (successCount > 0) {
      await logActivity(orgId, 'pricebook_item', 'bulk', 'imported', {
        count: successCount,
        errors_count: errors.length
      })
    }

    return { success: successCount, errors }
  },

  // Export pricebook to CSV
  exportCSV: async (orgId: string, filters?: PricebookFilters): Promise<string> => {
    const items = await pricebookAPI.list(orgId, filters)

    // Define headers
    const headers = ['Code', 'Name', 'Category', 'Unit', 'Unit Price', 'Taxable', 'Active', 'Quick Pick']

    // Convert items to rows
    const rows = items.map(item => [
      item.code || '',
      item.name,
      item.category || '',
      item.unit,
      item.unit_price,
      item.taxable ? 'Yes' : 'No',
      item.active ? 'Yes' : 'No',
      item.is_quick_pick ? 'Yes' : 'No'
    ])

    // Build CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`))
      .join('\n')

    return csvContent
  },

  // Get pricebook statistics
  getStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('active, is_quick_pick, unit_price, category')
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to fetch pricebook stats: ${error.message}`)
    }

    const stats = {
      total: data.length,
      active: data.filter(item => item.active).length,
      inactive: data.filter(item => !item.active).length,
      quickPicks: data.filter(item => item.is_quick_pick).length,
      categories: new Set(data.map(item => item.category).filter(Boolean)).size,
      averagePrice: data.length > 0 ? data.reduce((sum, item) => sum + (item.unit_price || 0), 0) / data.length : 0,
      totalValue: data.reduce((sum, item) => sum + (item.unit_price || 0), 0)
    }

    return stats
  },

  // Toggle quick pick status
  toggleQuickPick: async (itemId: string): Promise<PricebookItem> => {
    const item = await pricebookAPI.get(itemId)
    const newQuickPickStatus = !item.is_quick_pick

    return pricebookAPI.update(itemId, { is_quick_pick: newQuickPickStatus })
  },

  // Toggle active status
  toggleActive: async (itemId: string): Promise<PricebookItem> => {
    const item = await pricebookAPI.get(itemId)
    const newActiveStatus = !item.active

    return pricebookAPI.update(itemId, { active: newActiveStatus })
  },

  // Get items by category
  getByCategory: async (orgId: string, category: string): Promise<PricebookItem[]> => {
    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('category', category)
      .eq('active', true)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch items by category: ${error.message}`)
    }

    return data || []
  },

  // Suggest items based on description
  suggestItems: async (orgId: string, description: string): Promise<PricebookItem[]> => {
    if (!description.trim()) {
      return []
    }

    const { data, error } = await supabase
      .from('pricebook_items')
      .select('*')
      .eq('org_id', orgId)
      .eq('active', true)
      .or(`name.ilike.%${description}%,code.ilike.%${description}%`)
      .order('is_quick_pick', { ascending: false })
      .order('name')
      .limit(10)

    if (error) {
      throw new Error(`Failed to suggest items: ${error.message}`)
    }

    return data || []
  }
}
