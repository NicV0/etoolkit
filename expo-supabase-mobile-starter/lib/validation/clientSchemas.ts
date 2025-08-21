import { z } from 'zod'

// Define the base client schema here to avoid circular imports
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  address_line1: z.string().max(100, 'Address too long').optional(),
  address_line2: z.string().max(100, 'Address too long').optional(),
  city: z.string().max(50, 'City too long').optional(),
  state: z.string().max(2, 'State must be 2 characters').optional(),
  postal: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code').optional().or(z.literal('')),
  country: z.string().max(2, 'Country must be 2 characters').default('US'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active')
})

// Enhanced client schema for import operations
export const clientImportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  address_line1: z.string().max(100, 'Address too long').optional(),
  address_line2: z.string().max(100, 'Address too long').optional(),
  city: z.string().max(50, 'City too long').optional(),
  state: z.string().max(2, 'State must be 2 characters').optional(),
  postal: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code').optional().or(z.literal('')),
  country: z.string().max(2, 'Country must be 2 characters').default('US'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  // Additional fields for import
  client_name: z.string().optional(), // Alternative field name
  phone_number: z.string().optional(), // Alternative field name
  postal_code: z.string().optional(), // Alternative field name
  zip: z.string().optional(), // Alternative field name
  comments: z.string().optional() // Alternative field name
})

export type ClientImportData = z.infer<typeof clientImportSchema>

// Client update schema (all fields optional)
export const clientUpdateSchema = clientSchema.partial()

export type ClientUpdateData = z.infer<typeof clientUpdateSchema>

// Client search schema
export const clientSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  limit: z.number().min(1).max(100).default(20)
})

export type ClientSearchData = z.infer<typeof clientSearchSchema>

// Client filters schema
export const clientFiltersSchema = z.object({
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

export type ClientFiltersData = z.infer<typeof clientFiltersSchema>

// CSV import configuration schema
export const csvImportConfigSchema = z.object({
  hasHeader: z.boolean().default(true),
  delimiter: z.string().length(1).default(','),
  skipEmptyLines: z.boolean().default(true),
  transformHeader: z.boolean().default(true),
  // Column mapping
  columnMapping: z.object({
    name: z.string().default('name'),
    email: z.string().default('email'),
    phone: z.string().default('phone'),
    address: z.string().default('address_line1'),
    city: z.string().default('city'),
    state: z.string().default('state'),
    postal: z.string().default('postal'),
    notes: z.string().default('notes'),
    status: z.string().default('status')
  }).optional()
})

export type CSVImportConfig = z.infer<typeof csvImportConfigSchema>

// Bulk operation schema
export const clientBulkOperationSchema = z.object({
  operation: z.enum(['delete', 'update_status', 'export']),
  clientIds: z.array(z.string().uuid('Invalid client ID')).min(1, 'At least one client ID required'),
  // For update_status operation
  newStatus: z.enum(['active', 'inactive', 'prospect']).optional(),
  // For export operation
  format: z.enum(['csv', 'json']).optional().default('csv')
})

export type ClientBulkOperationData = z.infer<typeof clientBulkOperationSchema>

// Client statistics schema
export const clientStatsSchema = z.object({
  total: z.number().min(0),
  active: z.number().min(0),
  inactive: z.number().min(0),
  prospect: z.number().min(0)
})

export type ClientStats = z.infer<typeof clientStatsSchema>

// Client validation for specific operations
export const clientValidationSchemas = {
  // For creating new clients
  create: clientSchema,
  
  // For updating existing clients
  update: clientUpdateSchema,
  
  // For importing from CSV
  import: clientImportSchema,
  
  // For searching clients
  search: clientSearchSchema,
  
  // For filtering clients
  filters: clientFiltersSchema,
  
  // For bulk operations
  bulk: clientBulkOperationSchema,
  
  // For statistics
  stats: clientStatsSchema
}

// Helper function to validate client data for specific operation
export const validateClientData = (
  data: unknown,
  operation: keyof typeof clientValidationSchemas
): any => {
  const schema = clientValidationSchemas[operation]
  return schema.parse(data)
}

// Helper function to safely validate client data (returns errors instead of throwing)
export const safeValidateClientData = (
  data: unknown,
  operation: keyof typeof clientValidationSchemas
): { success: boolean; data?: any; errors?: string[] } => {
  try {
    const validatedData = validateClientData(data, operation)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error']
    }
  }
}

// CSV column mapping utilities
export const csvColumnMappers = {
  // Standard column names
  standard: {
    name: ['name', 'client_name', 'clientname'],
    email: ['email', 'email_address'],
    phone: ['phone', 'phone_number', 'phonenumber', 'tel'],
    address: ['address', 'address_line1', 'addressline1', 'street'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    postal: ['postal', 'postal_code', 'zip', 'zipcode', 'postcode'],
    notes: ['notes', 'comments', 'description'],
    status: ['status', 'client_status']
  },
  
  // Find the best matching column name
  findColumn: (header: string, targetField: keyof typeof csvColumnMappers.standard): string | null => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '')
    const possibleNames = csvColumnMappers.standard[targetField]
    
    for (const name of possibleNames) {
      if (normalizedHeader.includes(name.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
        return header
      }
    }
    
    return null
  },
  
  // Map CSV headers to our schema
  mapHeaders: (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {}
    
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim()
      
      // Try to match each field
      for (const [field, possibleNames] of Object.entries(csvColumnMappers.standard)) {
        if (possibleNames.some(name => normalizedHeader.includes(name.toLowerCase()))) {
          mapping[field] = header
          break
        }
      }
    })
    
    return mapping
  }
}
