import { z } from 'zod'

// Client import schema
export const clientImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address_line1: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  postal: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'prospect']).default('active')
})

// CSV column mappers
export const csvColumnMappers = {
  mapHeaders: (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {}
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().replace(/\s+/g, '_')
      
      if (lowerHeader.includes('name') || lowerHeader.includes('client')) {
        mapping.name = header
      } else if (lowerHeader.includes('email')) {
        mapping.email = header
      } else if (lowerHeader.includes('phone')) {
        mapping.phone = header
      } else if (lowerHeader.includes('address')) {
        mapping.address_line1 = header
      } else if (lowerHeader.includes('city')) {
        mapping.city = header
      } else if (lowerHeader.includes('state')) {
        mapping.state = header
      } else if (lowerHeader.includes('postal') || lowerHeader.includes('zip')) {
        mapping.postal = header
      } else if (lowerHeader.includes('country')) {
        mapping.country = header
      } else if (lowerHeader.includes('notes') || lowerHeader.includes('comments')) {
        mapping.notes = header
      } else if (lowerHeader.includes('status')) {
        mapping.status = header
      }
    })
    
    return mapping
  }
}

// CSV import configuration
export interface CSVImportConfig {
  hasHeader: boolean
  delimiter: string
  skipEmptyLines: boolean
  transformHeader: boolean
  maxRows?: number
  validateData?: boolean
}
