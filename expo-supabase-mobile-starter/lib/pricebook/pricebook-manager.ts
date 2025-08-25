// import { supabase } from '../supabase'
import { pricebookAPI } from '../api/pricebook'
import { logActivity } from '../db/mutations'
import { Decimal } from 'decimal.js-light'

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

export interface CreatePricebookItemData {
  code?: string
  name: string
  category?: string
  unit: string
  unit_price: number
  taxable: boolean
  active: boolean
  is_quick_pick: boolean
}

export interface UpdatePricebookItemData extends Partial<CreatePricebookItemData> {}

export interface PricebookCategory {
  category: string
  count: number
  total_value: number
}

export interface QuickPickItem {
  id: string
  name: string
  unit_price: number
  unit: string
  category?: string
}

export interface TradeSpecificData {
  plumbing: QuickPickItem[]
  electrical: QuickPickItem[]
  hvac: QuickPickItem[]
  roofing: QuickPickItem[]
  carpentry: QuickPickItem[]
  general: QuickPickItem[]
}

export class PricebookManager {
  private orgId: string
  private plan: 'free' | 'pro' = 'free'

  constructor(orgId: string, plan: 'free' | 'pro' = 'free') {
    this.orgId = orgId
    this.plan = plan
  }

  // Create new pricebook item
  async createItem(data: CreatePricebookItemData): Promise<PricebookItem> {
    try {
      const item = await pricebookAPI.create(this.orgId, data)
      
      // Log activity
      await logActivity(this.orgId, 'pricebook_item', item.id, 'created', { name: item.name, category: item.category })

      return item
    } catch (error) {
      throw new Error(`Failed to create pricebook item: ${error}`)
    }
  }

  // Update existing pricebook item
  async updateItem(itemId: string, data: UpdatePricebookItemData): Promise<PricebookItem> {
    try {
      const item = await pricebookAPI.update(itemId, data)
      
      // Log activity
      await logActivity(this.orgId, 'pricebook_item', item.id, 'updated', { name: item.name, category: item.category })

      return item
    } catch (error) {
      throw new Error(`Failed to update pricebook item: ${error}`)
    }
  }

  // Delete pricebook item
  async deleteItem(itemId: string): Promise<void> {
    try {
      const item = await pricebookAPI.get(itemId)
      await pricebookAPI.delete(itemId)
      
      // Log activity
      await logActivity(this.orgId, 'pricebook_item', itemId, 'deleted', { name: item.name, category: item.category })
    } catch (error) {
      throw new Error(`Failed to delete pricebook item: ${error}`)
    }
  }

  // Get all pricebook items with filtering
  async getItems(filters?: {
    category?: string
    active?: boolean
    is_quick_pick?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<PricebookItem[]> {
    try {
      return await pricebookAPI.list(this.orgId, filters)
    } catch (error) {
      throw new Error(`Failed to fetch pricebook items: ${error}`)
    }
  }

  // Get single pricebook item
  async getItem(itemId: string): Promise<PricebookItem> {
    try {
      return await pricebookAPI.get(itemId)
    } catch (error) {
      throw new Error(`Failed to fetch pricebook item: ${error}`)
    }
  }

  // Get Quick Picks (with plan gating)
  async getQuickPicks(): Promise<QuickPickItem[]> {
    try {
      const items = await pricebookAPI.list(this.orgId, {
        isQuickPick: true,
        active: true
      })

      // Apply plan limits
      const maxQuickPicks = this.plan === 'pro' ? 50 : 10
      return items.slice(0, maxQuickPicks).map(item => ({
        id: item.id,
        name: item.name,
        unit_price: item.unit_price,
        unit: item.unit,
        category: item.category
      }))
    } catch (error) {
      throw new Error(`Failed to fetch Quick Picks: ${error}`)
    }
  }

  // Get categories with statistics
  async getCategories(): Promise<PricebookCategory[]> {
    try {
      const items = await this.getItems({ active: true })
      
      const categories = items.reduce((acc, item) => {
        const category = item.category || 'Uncategorized'
        const existing = acc.find(c => c.category === category)
        
        if (existing) {
          existing.count++
          existing.total_value += item.unit_price
        } else {
          acc.push({
            category,
            count: 1,
            total_value: item.unit_price
          })
        }
        
        return acc
      }, [] as PricebookCategory[])

      return categories.sort((a, b) => b.count - a.count)
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error}`)
    }
  }

  // Bulk import pricebook items
  async bulkImport(items: CreatePricebookItemData[]): Promise<{
    success: number
    errors: string[]
  }> {
    try {
      return await pricebookAPI.bulkImport(this.orgId, items)
    } catch (error) {
      throw new Error(`Failed to bulk import items: ${error}`)
    }
  }

  // Get trade-specific seed data
  getTradeSeedData(trade: string): QuickPickItem[] {
    const tradeData: Record<string, QuickPickItem[]> = {
      plumbing: [
        { id: 'plumb-1', name: 'PVC Pipe 1"', unit_price: 2.50, unit: 'ft', category: 'Pipes' },
        { id: 'plumb-2', name: 'Copper Pipe 3/4"', unit_price: 4.75, unit: 'ft', category: 'Pipes' },
        { id: 'plumb-3', name: 'PVC Elbow 90°', unit_price: 1.25, unit: 'each', category: 'Fittings' },
        { id: 'plumb-4', name: 'Ball Valve 1"', unit_price: 12.99, unit: 'each', category: 'Valves' },
        { id: 'plumb-5', name: 'P-Trap Assembly', unit_price: 8.50, unit: 'each', category: 'Drains' }
      ],
      electrical: [
        { id: 'elec-1', name: 'Romex 12/2', unit_price: 0.85, unit: 'ft', category: 'Wire' },
        { id: 'elec-2', name: 'Outlet Box', unit_price: 2.99, unit: 'each', category: 'Boxes' },
        { id: 'elec-3', name: 'GFCI Outlet', unit_price: 15.99, unit: 'each', category: 'Outlets' },
        { id: 'elec-4', name: 'Circuit Breaker 15A', unit_price: 8.50, unit: 'each', category: 'Breakers' },
        { id: 'elec-5', name: 'LED Recessed Light', unit_price: 24.99, unit: 'each', category: 'Lighting' }
      ],
      hvac: [
        { id: 'hvac-1', name: 'Air Filter 16x20x1', unit_price: 12.99, unit: 'each', category: 'Filters' },
        { id: 'hvac-2', name: 'Thermostat Wire', unit_price: 0.45, unit: 'ft', category: 'Wire' },
        { id: 'hvac-3', name: 'Duct Tape', unit_price: 3.99, unit: 'roll', category: 'Supplies' },
        { id: 'hvac-4', name: 'Refrigerant R-410A', unit_price: 45.00, unit: 'lb', category: 'Refrigerant' },
        { id: 'hvac-5', name: 'Condensate Pump', unit_price: 89.99, unit: 'each', category: 'Pumps' }
      ],
      roofing: [
        { id: 'roof-1', name: 'Asphalt Shingles', unit_price: 85.00, unit: 'square', category: 'Shingles' },
        { id: 'roof-2', name: 'Roofing Nails', unit_price: 12.99, unit: 'box', category: 'Fasteners' },
        { id: 'roof-3', name: 'Ice & Water Shield', unit_price: 45.00, unit: 'roll', category: 'Underlayment' },
        { id: 'roof-4', name: 'Ridge Cap Shingles', unit_price: 95.00, unit: 'square', category: 'Shingles' },
        { id: 'roof-5', name: 'Flashing 12"', unit_price: 8.50, unit: 'ft', category: 'Flashing' }
      ],
      carpentry: [
        { id: 'carp-1', name: '2x4 Stud 8ft', unit_price: 3.50, unit: 'each', category: 'Lumber' },
        { id: 'carp-2', name: 'Plywood 4x8 1/2"', unit_price: 28.99, unit: 'sheet', category: 'Plywood' },
        { id: 'carp-3', name: 'Drywall 4x8 1/2"', unit_price: 12.99, unit: 'sheet', category: 'Drywall' },
        { id: 'carp-4', name: 'Drywall Screws', unit_price: 8.99, unit: 'box', category: 'Fasteners' },
        { id: 'carp-5', name: 'Paint Primer', unit_price: 24.99, unit: 'gallon', category: 'Paint' }
      ]
    }

    return tradeData[trade.toLowerCase()] || tradeData.general || []
  }

  // Seed pricebook with trade-specific data
  async seedTradeData(trade: string): Promise<{
    success: number
    errors: string[]
  }> {
    try {
      const seedItems = this.getTradeSeedData(trade)
      const itemsToCreate = seedItems.map(item => ({
        code: item.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        unit_price: item.unit_price,
        taxable: true,
        active: true,
        is_quick_pick: true
      }))

      return await this.bulkImport(itemsToCreate)
    } catch (error) {
      throw new Error(`Failed to seed trade data: ${error}`)
    }
  }

  // Search pricebook items with fuzzy matching
  async searchItems(query: string, limit: number = 20): Promise<PricebookItem[]> {
    try {
      const items = await this.getItems({ search: query, limit })
      
      // Simple fuzzy matching (can be enhanced with more sophisticated algorithms)
      const searchTerm = query.toLowerCase()
      return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.code?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      throw new Error(`Failed to search items: ${error}`)
    }
  }

  // Calculate line item total with tax
  calculateLineTotal(quantity: number, unitPrice: number, taxable: boolean, taxRate: number = 0): number {
    const subtotal = new Decimal(quantity).times(unitPrice)
    if (taxable && taxRate > 0) {
      const tax = subtotal.times(taxRate / 100)
      return subtotal.plus(tax).toNumber()
    }
    return subtotal.toNumber()
  }

  // Get pricebook statistics
  async getStatistics(): Promise<{
    totalItems: number
    activeItems: number
    quickPicks: number
    categories: number
    totalValue: number
  }> {
    try {
      const items = await this.getItems()
      const categories = await this.getCategories()
      
      return {
        totalItems: items.length,
        activeItems: items.filter(item => item.active).length,
        quickPicks: items.filter(item => item.is_quick_pick).length,
        categories: categories.length,
        totalValue: items.reduce((sum, item) => sum + item.unit_price, 0)
      }
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error}`)
    }
  }
}

// Export singleton instance
export const createPricebookManager = (orgId: string, plan: 'free' | 'pro' = 'free') => {
  return new PricebookManager(orgId, plan)
}
