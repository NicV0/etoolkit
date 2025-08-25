import { supabase } from '../supabase'
import { clientSchema, ClientFormData } from '../validation'
import { logActivity } from '../db/mutations'
// import { uploadDocument, deleteDocument } from '../storage'
import { parse } from 'papaparse'

export interface ClientFilters {
  status?: 'active' | 'inactive' | 'prospect'
  search?: string
  limit?: number
  offset?: number
}

export interface ClientWithJobs {
  id: string
  org_id: string
  name: string
  phone?: string
  email?: string
  address_line1?: string
  city?: string
  state?: string
  postal?: string
  notes?: string
  status: 'active' | 'inactive' | 'prospect'
  created_at: string
  updated_at: string
  jobs: Array<{
    id: string
    title: string
    status: string
    due_date?: string
  }>
}

export interface ClientSearchResult {
  id: string
  name: string
  phone?: string
  email?: string
  status: string
  match_type: 'name' | 'email' | 'phone'
}

export const clientAPI = {
  // List clients with optional filtering
  list: async (orgId: string, filters?: ClientFilters): Promise<ClientWithJobs[]> => {
    let query = supabase
      .from('clients')
      .select(`
        *,
        jobs (
          id,
          title,
          status,
          due_date
        )
      `)
      .eq('org_id', orgId)
      .order('name')

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`)
    }

    return data || []
  },

  // Get single client with full details
  get: async (clientId: string): Promise<ClientWithJobs> => {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        jobs (
          id,
          title,
          description,
          status,
          due_date,
          location
        )
      `)
      .eq('id', clientId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch client: ${error.message}`)
    }

    return data
  },

  // Create new client
  create: async (orgId: string, data: ClientFormData): Promise<ClientWithJobs> => {
    // Validate input data
    const validatedData = clientSchema.parse(data)

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        ...validatedData,
        org_id: orgId,
        name: validatedData.name || 'New Client' // Ensure name is always provided
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`)
    }

    // Log activity
    await logActivity(orgId, 'client', client.id, 'created', {
      client_name: client.name
    })

    return {
      ...client,
      jobs: [] // Initialize with empty jobs array
    }
  },

  // Update existing client
  update: async (clientId: string, data: Partial<ClientFormData>): Promise<ClientWithJobs> => {
    // Validate input data
    const validatedData = clientSchema.partial().parse(data)

    const { data: client, error } = await supabase
      .from('clients')
      .update(validatedData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`)
    }

    // Log activity
    await logActivity(client.org_id, 'client', clientId, 'updated', {
      client_name: client.name
    })

    return {
      ...client,
      jobs: [] // Initialize with empty jobs array
    }
  },

  // Delete client (soft delete by setting status to inactive)
  delete: async (clientId: string): Promise<void> => {
    const { data: client, error: fetchError } = await supabase
      .from('clients')
      .select('org_id, name')
      .eq('id', clientId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch client: ${fetchError.message}`)
    }

    const { error } = await supabase
      .from('clients')
      .update({ status: 'inactive' })
      .eq('id', clientId)

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`)
    }

    // Log activity
    await logActivity(client.org_id, 'client', clientId, 'deleted', {
      client_name: client.name
    })
  },

  // Search clients with ranking
  search: async (orgId: string, query: string): Promise<ClientSearchResult[]> => {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone, email, status')
      .eq('org_id', orgId)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('name')

    if (error) {
      throw new Error(`Failed to search clients: ${error.message}`)
    }

    // Rank results by match type
    const results: ClientSearchResult[] = []
    const queryLower = query.toLowerCase()

    data?.forEach(client => {
      if (client.name.toLowerCase().includes(queryLower)) {
        results.push({
          ...client,
          match_type: 'name' as const
        })
      } else if (client.email?.toLowerCase().includes(queryLower)) {
        results.push({
          ...client,
          match_type: 'email' as const
        })
      } else if (client.phone?.includes(query)) {
        results.push({
          ...client,
          match_type: 'phone' as const
        })
      }
    })

    return results
  },

  // Import clients from CSV
  importCSV: async (orgId: string, csvData: string): Promise<{ success: number; errors: string[] }> => {
    const results = parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_')
    })

    const errors: string[] = []
    let successCount = 0

    for (let i = 0; i < results.data.length; i++) {
      const row = results.data[i] as Record<string, unknown>
      const rowNumber = i + 2 // +2 because of 0-based index and header row

      try {
        // Map CSV columns to our schema
        const clientData: ClientFormData = {
          name: String(row.name || row.client_name || ''),
          email: String(row.email || ''),
          phone: String(row.phone || row.phone_number || ''),
          address_line1: String(row.address || row.address_line1 || ''),
          city: String(row.city || ''),
          state: String(row.state || ''),
          postal: String(row.postal || row.postal_code || row.zip || ''),
          notes: String(row.notes || row.comments || ''),
          status: (String(row.status || 'active') as 'active' | 'inactive' | 'prospect'),
          country: String(row.country || 'US')
        }

        // Validate the data
        const validatedData = clientSchema.parse(clientData)

        // Create the client
        await supabase
          .from('clients')
          .insert({
            ...validatedData,
            org_id: orgId,
            name: validatedData.name || 'New Client' // Ensure name is always provided
          })

        successCount++
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Log import activity
    if (successCount > 0) {
      await logActivity(orgId, 'client', 'bulk', 'imported', {
        count: successCount,
        errors_count: errors.length
      })
    }

    return { success: successCount, errors }
  },

  // Export clients to CSV
  exportCSV: async (orgId: string, filters?: ClientFilters): Promise<string> => {
    const clients = await clientAPI.list(orgId, filters)

    // Convert to CSV format
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Postal', 'Status', 'Notes']
    const rows = clients.map(client => [
      client.name,
      client.email || '',
      client.phone || '',
      client.address_line1 || '',
      client.city || '',
      client.state || '',
      client.postal || '',
      client.status,
      client.notes || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  },

  // Get client statistics
  getStats: async (orgId: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('status')
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to fetch client stats: ${error.message}`)
    }

    const stats = {
      total: data.length,
      active: data.filter(c => c.status === 'active').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      prospect: data.filter(c => c.status === 'prospect').length
    }

    return stats
  }
}
