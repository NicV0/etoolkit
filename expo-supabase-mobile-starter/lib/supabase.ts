import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Database } from '../types/database'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage adapter that uses both SecureStore and AsyncStorage
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      // Try SecureStore first for sensitive data
      const value = await SecureStore.getItemAsync(key)
      if (value) return value
      
      // Fallback to AsyncStorage for non-sensitive data
      return await AsyncStorage.getItem(key)
    } catch (error) {
      console.warn('Storage getItem error:', error)
      return null
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Use SecureStore for auth-related keys
      if (key.includes('auth') || key.includes('token')) {
        await SecureStore.setItemAsync(key, value)
      } else {
        await AsyncStorage.setItem(key, value)
      }
    } catch (error) {
      console.warn('Storage setItem error:', error)
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key)
      await AsyncStorage.removeItem(key)
    } catch (error) {
      console.warn('Storage removeItem error:', error)
    }
  }
}

// Create typed Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Client-Info': 'etoolkit-mobile'
    }
  }
})

// Enhanced client with typed helpers
export class EToolkitClient {
  private client = supabase

  // Auth helpers
  async signInWithEmail(email: string) {
    return this.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'etoolkit://auth'
      }
    })
  }

  async signOut() {
    return this.client.auth.signOut()
  }

  async getCurrentUser() {
    const { data: { user } } = await this.client.auth.getUser()
    return user
  }

  async getCurrentSession() {
    const { data: { session } } = await this.client.auth.getSession()
    return session
  }

  // Organization helpers
  async getCurrentOrganization() {
    const user = await this.getCurrentUser()
    if (!user) return null

    const { data: profile } = await this.client
      .from('profiles')
      .select('org_id, organizations(*)')
      .eq('user_id', user.id)
      .single()

    return profile?.organizations || null
  }

  async createOrganization(data: {
    name: string
    trade: string
    size?: string
    plan?: string
  }) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Create organization
    const { data: org, error: orgError } = await this.client
      .from('organizations')
      .insert({
        ...data,
        created_by: user.id
      })
      .select()
      .single()

    if (orgError) throw orgError

    // Create profile for user
    const { error: profileError } = await this.client
      .from('profiles')
      .insert({
        user_id: user.id,
        org_id: org.id,
        role: 'owner'
      })

    if (profileError) throw profileError

    // Create default settings
    const { error: settingsError } = await this.client
      .from('settings')
      .insert({
        org_id: org.id,
        currency: 'USD',
        default_tax_pct: '0',
        numbering_prefix_quote: 'Q',
        numbering_prefix_invoice: 'INV'
      })

    if (settingsError) throw settingsError

    return org
  }

  // Client helpers
  async getClients(orgId: string, filters?: {
    status?: string
    search?: string
  }) {
    let query = this.client
      .from('clients')
      .select('*')
      .eq('org_id', orgId)
      .order('name')

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async createClient(orgId: string, data: {
    name: string
    phone?: string
    email?: string
    address_line1?: string
    city?: string
    state?: string
    postal?: string
    notes?: string
  }) {
    const { data: client, error } = await this.client
      .from('clients')
      .insert({
        ...data,
        org_id: orgId
      })
      .select()
      .single()

    if (error) throw error
    return client
  }

  // Quote helpers
  async getQuotes(orgId: string, filters?: {
    status?: string
    clientId?: string
  }) {
    let query = this.client
      .from('quotes')
      .select(`
        *,
        clients(name),
        quote_items(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async createQuote(orgId: string, data: {
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
  }) {
    // Generate quote number
    const { data: settings } = await this.client
      .from('settings')
      .select('numbering_prefix_quote')
      .eq('org_id', orgId)
      .single()

    const prefix = settings?.numbering_prefix_quote || 'Q'
    const number = `${prefix}${Date.now()}`

    // Create quote
    const { data: quote, error: quoteError } = await this.client
      .from('quotes')
      .insert({
        org_id: orgId,
        number,
        client_id: data.client_id,
        job_id: data.job_id,
        status: 'draft',
        tax_rate_pct: data.tax_rate_pct?.toString() || '0',
        discount_amt: data.discount_amt?.toString() || '0',
        terms: data.terms
      })
      .select()
      .single()

    if (quoteError) throw quoteError

    // Create quote items
    const items = data.items.map((item, index) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity.toString(),
      unit_price: item.unit_price.toString(),
      taxable: item.taxable ?? true,
      line_total: (item.quantity * item.unit_price).toString(),
      sort_order: index
    }))

    const { error: itemsError } = await this.client
      .from('quote_items')
      .insert(items)

    if (itemsError) throw itemsError

    return quote
  }

  // Invoice helpers
  async getInvoices(orgId: string, filters?: {
    status?: string
    clientId?: string
  }) {
    let query = this.client
      .from('invoices')
      .select(`
        *,
        clients(name),
        invoice_items(*),
        payments(*)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async recordPayment(invoiceId: string, data: {
    method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
    amount: number
    note?: string
  }) {
    const { data: payment, error } = await this.client
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        method: data.method,
        amount: data.amount.toString(),
        note: data.note
      })
      .select()
      .single()

    if (error) throw error
    return payment
  }

  // Pricebook helpers
  async getPricebookItems(orgId: string, filters?: {
    category?: string
    active?: boolean
    isQuickPick?: boolean
  }) {
    let query = this.client
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

    if (filters?.isQuickPick !== undefined) {
      query = query.eq('is_quick_pick', filters.isQuickPick)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  // Activity logging
  async logActivity(orgId: string, data: {
    entity_type: string
    entity_id: string
    action: 'created' | 'updated' | 'deleted' | 'sent' | 'viewed' | 'paid'
    meta?: any
  }) {
    const user = await this.getCurrentUser()
    
    const { error } = await this.client
      .from('activities')
      .insert({
        org_id: orgId,
        actor_id: user?.id || null,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        action: data.action,
        meta: data.meta
      })

    if (error) {
      console.warn('Failed to log activity:', error)
    }
  }
}

// Export singleton instance
export const etoolkit = new EToolkitClient()
