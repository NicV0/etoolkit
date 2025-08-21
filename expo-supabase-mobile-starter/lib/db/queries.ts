import { supabase } from '../supabase'
import type { 
  Client, 
  Quote, 
  Invoice, 
  PricebookItem, 
  Job, 
  Document,
  Organization,
  Profile,
  Activity,
  Reminder
} from '../../types/database'

// Organization queries
export const getOrgClients = async (orgId: string, status?: string) => {
  let query = supabase
    .from('clients')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Client[]
}

export const getOrgQuotes = async (orgId: string, status?: string) => {
  let query = supabase
    .from('quotes')
    .select(`
      *,
      clients(name, email),
      quote_items(*)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as (Quote & { clients: { name: string; email: string | null } })[]
}

export const getOrgInvoices = async (orgId: string, status?: string) => {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      clients(name, email),
      invoice_items(*),
      payments(*)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as (Invoice & { 
    clients: { name: string; email: string | null }
    invoice_items: any[]
    payments: any[]
  })[]
}

export const getPricebookItems = async (orgId: string, category?: string) => {
  let query = supabase
    .from('pricebook_items')
    .select('*')
    .eq('org_id', orgId)
    .eq('active', true)
    .order('name')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data as PricebookItem[]
}

export const getQuickPickItems = async (orgId: string) => {
  const { data, error } = await supabase
    .from('pricebook_items')
    .select('*')
    .eq('org_id', orgId)
    .eq('active', true)
    .eq('is_quick_pick', true)
    .order('name')

  if (error) throw error
  return data as PricebookItem[]
}

// Client queries
export const getClientDetails = async (clientId: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      jobs(*),
      documents(*)
    `)
    .eq('id', clientId)
    .single()

  if (error) throw error
  return data as Client & { jobs: Job[]; documents: Document[] }
}

export const searchClients = async (orgId: string, query: string) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('org_id', orgId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name')

  if (error) throw error
  return data as Client[]
}

// Quote queries
export const getQuoteWithItems = async (quoteId: string) => {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      clients(*),
      jobs(*),
      quote_items(*)
    `)
    .eq('id', quoteId)
    .single()

  if (error) throw error
  return data as Quote & { 
    clients: Client
    jobs: Job
    quote_items: any[]
  }
}

export const getQuoteByNumber = async (orgId: string, number: string) => {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      clients(*),
      quote_items(*)
    `)
    .eq('org_id', orgId)
    .eq('number', number)
    .single()

  if (error) throw error
  return data as Quote & { 
    clients: Client
    quote_items: any[]
  }
}

// Invoice queries
export const getInvoiceWithItems = async (invoiceId: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients(*),
      jobs(*),
      invoice_items(*),
      payments(*)
    `)
    .eq('id', invoiceId)
    .single()

  if (error) throw error
  return data as Invoice & { 
    clients: Client
    jobs: Job
    invoice_items: any[]
    payments: any[]
  }
}

export const getInvoiceByNumber = async (orgId: string, number: string) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      clients(*),
      invoice_items(*),
      payments(*)
    `)
    .eq('org_id', orgId)
    .eq('number', number)
    .single()

  if (error) throw error
  return data as Invoice & { 
    clients: Client
    invoice_items: any[]
    payments: any[]
  }
}

// Job queries
export const getOrgJobs = async (orgId: string, status?: string) => {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      clients(name, email)
    `)
    .eq('org_id', orgId)
    .order('due_date', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as (Job & { clients: { name: string; email: string | null } })[]
}

export const getClientJobs = async (clientId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('client_id', clientId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data as Job[]
}

// Document queries
export const getClientDocuments = async (clientId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Document[]
}

export const getJobDocuments = async (jobId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Document[]
}

// Settings queries
export const getOrgSettings = async (orgId: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('org_id', orgId)
    .single()

  if (error) throw error
  return data
}

// Template queries
export const getOrgTemplates = async (orgId: string, type?: 'quote' | 'invoice' | 'receipt') => {
  let query = supabase
    .from('templates')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// Activity queries
export const getRecentActivities = async (orgId: string, limit: number = 10) => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      profiles(display_name)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as (Activity & { profiles: { display_name: string | null } })[]
}

export const getEntityActivities = async (orgId: string, entityType: string, entityId: string) => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      profiles(display_name)
    `)
    .eq('org_id', orgId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Activity & { profiles: { display_name: string | null } })[]
}

// Reminder queries
export const getOrgReminders = async (orgId: string, done?: boolean) => {
  let query = supabase
    .from('reminders')
    .select('*')
    .eq('org_id', orgId)
    .order('due_at', { ascending: true })

  if (done !== undefined) {
    query = query.eq('done', done)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Reminder[]
}

export const getUpcomingReminders = async (orgId: string, days: number = 7) => {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('org_id', orgId)
    .eq('done', false)
    .gte('due_at', new Date().toISOString())
    .lte('due_at', futureDate.toISOString())
    .order('due_at', { ascending: true })

  if (error) throw error
  return data as Reminder[]
}

// Dashboard queries
export const getDashboardStats = async (orgId: string) => {
  // Get counts for different entities
  const [clients, quotes, invoices, jobs] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact' }).eq('org_id', orgId),
    supabase.from('quotes').select('id', { count: 'exact' }).eq('org_id', orgId),
    supabase.from('invoices').select('id', { count: 'exact' }).eq('org_id', orgId),
    supabase.from('jobs').select('id', { count: 'exact' }).eq('org_id', orgId)
  ])

  // Get recent activities
  const activities = await getRecentActivities(orgId, 5)

  // Get upcoming reminders
  const reminders = await getUpcomingReminders(orgId, 3)

  return {
    counts: {
      clients: clients.count || 0,
      quotes: quotes.count || 0,
      invoices: invoices.count || 0,
      jobs: jobs.count || 0
    },
    recentActivities: activities,
    upcomingReminders: reminders
  }
}

// Search queries
export const searchPricebook = async (orgId: string, query: string) => {
  const { data, error } = await supabase
    .from('pricebook_items')
    .select('*')
    .eq('org_id', orgId)
    .eq('active', true)
    .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
    .order('name')

  if (error) throw error
  return data as PricebookItem[]
}

// Analytics queries
export const getRevenueStats = async (orgId: string, days: number = 30) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('invoices')
    .select('total, status, created_at')
    .eq('org_id', orgId)
    .gte('created_at', startDate.toISOString())
    .in('status', ['paid', 'sent'])

  if (error) throw error
  return data
}

export const getQuoteConversionStats = async (orgId: string, days: number = 30) => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('quotes')
    .select('status, created_at')
    .eq('org_id', orgId)
    .gte('created_at', startDate.toISOString())

  if (error) throw error
  return data
}
