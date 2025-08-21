import { supabase } from './supabase'
import { etoolkit } from './supabase'

export interface NumberingSettings {
  prefix: string
  startNumber: number
  padding: number
  suffix?: string
  resetMonthly: boolean
  resetYearly: boolean
}

export interface GeneratedNumber {
  number: string
  sequence: number
}

/**
 * Get organization numbering settings
 */
export const getNumberingSettings = async (orgId: string, type: 'quote' | 'invoice') => {
  const { data: settings } = await supabase
    .from('settings')
    .select('numbering_prefix_quote, numbering_prefix_invoice')
    .eq('org_id', orgId)
    .single()

  const prefix = type === 'quote' 
    ? settings?.numbering_prefix_quote || 'Q'
    : settings?.numbering_prefix_invoice || 'INV'

  return {
    prefix,
    startNumber: 1,
    padding: 4,
    suffix: '',
    resetMonthly: false,
    resetYearly: false
  } as NumberingSettings
}

/**
 * Generate next number for quotes or invoices
 */
export const generateNextNumber = async (
  orgId: string, 
  type: 'quote' | 'invoice'
): Promise<GeneratedNumber> => {
  const settings = await getNumberingSettings(orgId, type)
  
  // Get current date for monthly/yearly resets
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  
  // Build the query to find the latest number
  let query = supabase
    .from(type === 'quote' ? 'quotes' : 'invoices')
    .select('number')
    .eq('org_id', orgId)
    .order('number', { ascending: false })
    .limit(1)

  // Add date filters if resetting monthly or yearly
  if (settings.resetMonthly) {
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).toISOString()
    const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString()
    query = query.gte('created_at', startOfMonth).lte('created_at', endOfMonth)
  } else if (settings.resetYearly) {
    const startOfYear = new Date(currentYear, 0, 1).toISOString()
    const endOfYear = new Date(currentYear, 11, 31).toISOString()
    query = query.gte('created_at', startOfYear).lte('created_at', endOfYear)
  }

  const { data: latest } = await query

  let nextSequence = settings.startNumber

  if (latest && latest.length > 0) {
    const latestNumber = latest[0].number
    const extractedSequence = extractSequenceFromNumber(latestNumber, settings)
    nextSequence = extractedSequence + 1
  }

  // Generate the formatted number
  const formattedNumber = formatNumber(nextSequence, settings, currentYear, currentMonth)

  return {
    number: formattedNumber,
    sequence: nextSequence
  }
}

/**
 * Extract sequence number from formatted number
 */
export const extractSequenceFromNumber = (
  formattedNumber: string, 
  settings: NumberingSettings
): number => {
  // Remove prefix and suffix
  let sequence = formattedNumber.replace(settings.prefix, '')
  if (settings.suffix) {
    sequence = sequence.replace(settings.suffix, '')
  }

  // Remove any date components (YYYY, MM)
  sequence = sequence.replace(/\d{4}/g, '') // Remove year
  sequence = sequence.replace(/\d{2}/g, '') // Remove month (if it's 2 digits)

  // Remove any non-numeric characters
  sequence = sequence.replace(/[^0-9]/g, '')

  return parseInt(sequence) || 0
}

/**
 * Format number according to settings
 */
export const formatNumber = (
  sequence: number,
  settings: NumberingSettings,
  year?: number,
  month?: number
): string => {
  let formatted = settings.prefix

  // Add year if resetting yearly
  if (settings.resetYearly && year) {
    formatted += year.toString()
  }

  // Add month if resetting monthly
  if (settings.resetMonthly && month) {
    formatted += month.toString().padStart(2, '0')
  }

  // Add padded sequence number
  formatted += sequence.toString().padStart(settings.padding, '0')

  // Add suffix if specified
  if (settings.suffix) {
    formatted += settings.suffix
  }

  return formatted
}

/**
 * Generate quote number
 */
export const generateQuoteNumber = async (orgId: string): Promise<string> => {
  const result = await generateNextNumber(orgId, 'quote')
  return result.number
}

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = async (orgId: string): Promise<string> => {
  const result = await generateNextNumber(orgId, 'invoice')
  return result.number
}

/**
 * Validate number format
 */
export const validateNumberFormat = (
  number: string, 
  settings: NumberingSettings
): boolean => {
  const expectedFormat = formatNumber(1, settings)
  const pattern = expectedFormat
    .replace(/\d/g, '\\d')
    .replace(/[A-Z]/g, '[A-Z]')
    .replace(/[a-z]/g, '[a-z]')
    .replace(/[0-9]/g, '\\d')

  const regex = new RegExp(`^${pattern}$`)
  return regex.test(number)
}

/**
 * Check if number already exists
 */
export const checkNumberExists = async (
  orgId: string,
  number: string,
  type: 'quote' | 'invoice'
): Promise<boolean> => {
  const table = type === 'quote' ? 'quotes' : 'invoices'
  
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('org_id', orgId)
    .eq('number', number)
    .single()

  return !!data
}

/**
 * Generate unique number with collision handling
 */
export const generateUniqueNumber = async (
  orgId: string,
  type: 'quote' | 'invoice',
  maxAttempts: number = 10
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const number = await generateNextNumber(orgId, type)
    const exists = await checkNumberExists(orgId, number.number, type)
    
    if (!exists) {
      return number.number
    }
    
    // If collision occurs, wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  throw new Error(`Failed to generate unique ${type} number after ${maxAttempts} attempts`)
}

/**
 * Update numbering settings
 */
export const updateNumberingSettings = async (
  orgId: string,
  settings: Partial<NumberingSettings>
): Promise<void> => {
  const updates: any = {}
  
  if (settings.prefix) {
    updates.numbering_prefix_quote = settings.prefix
    updates.numbering_prefix_invoice = settings.prefix
  }

  const { error } = await supabase
    .from('settings')
    .update(updates)
    .eq('org_id', orgId)

  if (error) throw error
}

/**
 * Get numbering statistics
 */
export const getNumberingStats = async (orgId: string, type: 'quote' | 'invoice') => {
  const table = type === 'quote' ? 'quotes' : 'invoices'
  
  const { data, error } = await supabase
    .from(table)
    .select('number, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const stats = {
    total: data.length,
    thisYear: data.filter(item => {
      const itemYear = new Date(item.created_at).getFullYear()
      return itemYear === currentYear
    }).length,
    thisMonth: data.filter(item => {
      const itemDate = new Date(item.created_at)
      return itemDate.getFullYear() === currentYear && 
             itemDate.getMonth() + 1 === currentMonth
    }).length,
    latestNumber: data[0]?.number || 'None'
  }

  return stats
}

/**
 * Reset numbering sequence
 */
export const resetNumberingSequence = async (
  orgId: string,
  type: 'quote' | 'invoice',
  newStartNumber: number = 1
): Promise<void> => {
  // This would typically be done by updating settings
  // For now, we'll just log the reset
  console.log(`Resetting ${type} numbering sequence to ${newStartNumber} for org ${orgId}`)
  
  // In a real implementation, you might want to:
  // 1. Update settings with new start number
  // 2. Create a backup of existing numbers
  // 3. Notify users about the reset
}

/**
 * Generate test numbers for preview
 */
export const generateTestNumbers = (
  settings: NumberingSettings,
  count: number = 5
): string[] => {
  const numbers: string[] = []
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  for (let i = 1; i <= count; i++) {
    const number = formatNumber(i, settings, currentYear, currentMonth)
    numbers.push(number)
  }

  return numbers
}

/**
 * Parse number to extract components
 */
export const parseNumber = (
  number: string,
  settings: NumberingSettings
): {
  prefix: string
  year?: number
  month?: number
  sequence: number
  suffix?: string
} => {
  let remaining = number

  // Extract prefix
  if (!remaining.startsWith(settings.prefix)) {
    throw new Error('Invalid number format: missing prefix')
  }
  remaining = remaining.substring(settings.prefix.length)

  // Extract year if present
  let year: number | undefined
  if (settings.resetYearly && remaining.length >= 4) {
    year = parseInt(remaining.substring(0, 4))
    remaining = remaining.substring(4)
  }

  // Extract month if present
  let month: number | undefined
  if (settings.resetMonthly && remaining.length >= 2) {
    month = parseInt(remaining.substring(0, 2))
    remaining = remaining.substring(2)
  }

  // Extract suffix
  let suffix: string | undefined
  if (settings.suffix && remaining.endsWith(settings.suffix)) {
    suffix = settings.suffix
    remaining = remaining.substring(0, remaining.length - settings.suffix.length)
  }

  // Extract sequence
  const sequence = parseInt(remaining) || 0

  return {
    prefix: settings.prefix,
    year,
    month,
    sequence,
    suffix
  }
}
