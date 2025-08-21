import { z } from 'zod'
import { isValidAmount, isValidPercentage } from './calculations'

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
export const postalCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code')

// Client validation
export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  address_line1: z.string().max(100, 'Address too long').optional(),
  address_line2: z.string().max(100, 'Address too long').optional(),
  city: z.string().max(50, 'City too long').optional(),
  state: z.string().max(2, 'State must be 2 characters').optional(),
  postal: postalCodeSchema.optional().or(z.literal('')),
  country: z.string().max(2, 'Country must be 2 characters').default('US'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active')
})

export type ClientFormData = z.infer<typeof clientSchema>

// Job validation
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  due_date: z.string().optional(), // ISO date string
  location: z.string().max(100, 'Location too long').optional(),
  client_id: z.string().uuid('Invalid client ID').optional()
})

export type JobFormData = z.infer<typeof jobSchema>

// Pricebook item validation
export const pricebookItemSchema = z.object({
  code: z.string().max(20, 'Code too long').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.string().max(50, 'Category too long').optional(),
  unit: z.string().max(20, 'Unit too long').default('each'),
  unit_price: z.number().min(0, 'Price must be positive'),
  taxable: z.boolean().default(true),
  active: z.boolean().default(true),
  is_quick_pick: z.boolean().default(false)
})

export type PricebookItemFormData = z.infer<typeof pricebookItemSchema>

// Line item validation
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().min(0, 'Price must be positive'),
  taxable: z.boolean().default(true)
})

export type LineItemFormData = z.infer<typeof lineItemSchema>

// Quote validation
export const quoteSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  job_id: z.string().uuid('Invalid job ID').optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
  tax_rate_pct: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%'),
  discount_amt: z.number().min(0, 'Discount must be positive'),
  terms: z.string().max(1000, 'Terms too long').optional(),
  valid_until: z.string().optional() // ISO date string
})

export type QuoteFormData = z.infer<typeof quoteSchema>

// Invoice validation
export const invoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  job_id: z.string().uuid('Invalid job ID').optional(),
  quote_id: z.string().uuid('Invalid quote ID').optional(),
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
  tax_rate_pct: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%'),
  discount_amt: z.number().min(0, 'Discount must be positive'),
  due_date: z.string().optional() // ISO date string
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

// Payment validation
export const paymentSchema = z.object({
  method: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'other']),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().max(200, 'Note too long').optional(),
  external_id: z.string().max(100, 'External ID too long').optional()
})

export type PaymentFormData = z.infer<typeof paymentSchema>

// Organization validation
export const organizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  trade: z.string().min(1, 'Trade is required').max(50, 'Trade too long'),
  size: z.enum(['solo', 'small', 'medium', 'large']).optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free')
})

export type OrganizationFormData = z.infer<typeof organizationSchema>

// Settings validation
export const settingsSchema = z.object({
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  default_tax_pct: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%'),
  numbering_prefix_quote: z.string().max(10, 'Prefix too long').default('Q'),
  numbering_prefix_invoice: z.string().max(10, 'Prefix too long').default('INV'),
  logo_url: z.string().url('Invalid logo URL').optional(),
  legal_name: z.string().max(100, 'Legal name too long').optional(),
  terms_default: z.string().max(1000, 'Terms too long').optional()
})

export type SettingsFormData = z.infer<typeof settingsSchema>

// Business rule validation functions
export const validateClientData = (data: unknown): ClientFormData => {
  return clientSchema.parse(data)
}

export const validateJobData = (data: unknown): JobFormData => {
  return jobSchema.parse(data)
}

export const validatePricebookItemData = (data: unknown): PricebookItemFormData => {
  return pricebookItemSchema.parse(data)
}

export const validateQuoteData = (data: unknown): QuoteFormData => {
  return quoteSchema.parse(data)
}

export const validateInvoiceData = (data: unknown): InvoiceFormData => {
  return invoiceSchema.parse(data)
}

export const validatePaymentData = (data: unknown): PaymentFormData => {
  return paymentSchema.parse(data)
}

export const validateOrganizationData = (data: unknown): OrganizationFormData => {
  return organizationSchema.parse(data)
}

export const validateSettingsData = (data: unknown): SettingsFormData => {
  return settingsSchema.parse(data)
}

// Custom validation functions
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

export const validatePhone = (phone: string): boolean => {
  try {
    phoneSchema.parse(phone)
    return true
  } catch {
    return false
  }
}

export const validatePostalCode = (postal: string): boolean => {
  try {
    postalCodeSchema.parse(postal)
    return true
  } catch {
    return false
  }
}

export const validateAmount = (amount: number): boolean => {
  return isValidAmount(amount)
}

export const validatePercentage = (percentage: number): boolean => {
  return isValidPercentage(percentage)
}

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const validateDate = (date: string): boolean => {
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
}

export const validateFutureDate = (date: string): boolean => {
  const parsed = new Date(date)
  const now = new Date()
  return !isNaN(parsed.getTime()) && parsed > now
}

export const validatePastDate = (date: string): boolean => {
  const parsed = new Date(date)
  const now = new Date()
  return !isNaN(parsed.getTime()) && parsed < now
}

// Business logic validation
export const validateQuoteTotals = (
  items: LineItemFormData[],
  taxRate: number,
  discountAmount: number,
  expectedTotal: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  
  // Calculate tax on taxable items
  const taxableItems = items.filter(item => item.taxable)
  const taxableSubtotal = taxableItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const taxAmount = (taxableSubtotal * taxRate) / 100
  
  // Calculate total
  const calculatedTotal = subtotal + taxAmount - discountAmount
  
  // Compare with expected total (allow small tolerance for rounding)
  const tolerance = 0.01
  if (Math.abs(calculatedTotal - expectedTotal) > tolerance) {
    errors.push(`Total mismatch: calculated ${calculatedTotal.toFixed(2)}, expected ${expectedTotal.toFixed(2)}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateInvoiceTotals = (
  items: LineItemFormData[],
  taxRate: number,
  discountAmount: number,
  expectedTotal: number,
  payments: PaymentFormData[] = []
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Validate quote totals first
  const quoteValidation = validateQuoteTotals(items, taxRate, discountAmount, expectedTotal)
  errors.push(...quoteValidation.errors)
  
  // Validate payments
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
  if (totalPayments > expectedTotal) {
    errors.push('Total payments exceed invoice total')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateQuickPickLimit = (
  currentQuickPicks: number,
  plan: 'free' | 'pro' | 'enterprise'
): { isValid: boolean; limit: number; remaining: number } => {
  const limits = {
    free: 5,
    pro: 25,
    enterprise: Infinity
  }
  
  const limit = limits[plan]
  const remaining = limit - currentQuickPicks
  
  return {
    isValid: currentQuickPicks < limit,
    limit,
    remaining
  }
}

export const validateStorageLimit = (
  currentUsage: number, // in bytes
  plan: 'free' | 'pro' | 'enterprise'
): { isValid: boolean; limit: number; remaining: number } => {
  const limits = {
    free: 100 * 1024 * 1024, // 100MB
    pro: 1024 * 1024 * 1024, // 1GB
    enterprise: 10 * 1024 * 1024 * 1024 // 10GB
  }
  
  const limit = limits[plan]
  const remaining = limit - currentUsage
  
  return {
    isValid: currentUsage < limit,
    limit,
    remaining
  }
}

export const validateFileSize = (
  fileSize: number,
  fileType: string,
  plan: 'free' | 'pro' | 'enterprise'
): { isValid: boolean; maxSize: number } => {
  const maxSizes = {
    free: 5 * 1024 * 1024, // 5MB
    pro: 10 * 1024 * 1024, // 10MB
    enterprise: 50 * 1024 * 1024 // 50MB
  }
  
  const maxSize = maxSizes[plan]
  
  return {
    isValid: fileSize <= maxSize,
    maxSize
  }
}

// Form validation helpers
export const createFormValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): { isValid: boolean; errors: Record<string, string> } => {
    try {
      schema.parse(data)
      return { isValid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        return { isValid: false, errors }
      }
      return { isValid: false, errors: { _form: 'Validation failed' } }
    }
  }
}

// Export form validators
export const validateClientForm = createFormValidator(clientSchema)
export const validateJobForm = createFormValidator(jobSchema)
export const validatePricebookItemForm = createFormValidator(pricebookItemSchema)
export const validateQuoteForm = createFormValidator(quoteSchema)
export const validateInvoiceForm = createFormValidator(invoiceSchema)
export const validatePaymentForm = createFormValidator(paymentSchema)
export const validateOrganizationForm = createFormValidator(organizationSchema)
export const validateSettingsForm = createFormValidator(settingsSchema)
