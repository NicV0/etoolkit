import { z } from 'zod'
import { clientSchema, jobSchema, pricebookItemSchema, quoteSchema, invoiceSchema, paymentSchema, organizationSchema, settingsSchema } from '../validation'

// Database constraint definitions (matching schema.sql)
export const DATABASE_CONSTRAINTS = {
  // Organizations table
  organizations: {
    name: { maxLength: null, required: true },
    trade: { maxLength: null, required: true },
    size: { enum: ['solo', 'small', 'medium', 'large'], required: false },
    plan: { enum: ['free', 'pro', 'enterprise'], required: true, default: 'free' }
  },
  
  // Clients table
  clients: {
    name: { maxLength: null, required: true },
    phone: { maxLength: null, required: false },
    email: { maxLength: null, required: false },
    address_line1: { maxLength: null, required: false },
    address_line2: { maxLength: null, required: false },
    city: { maxLength: null, required: false },
    state: { maxLength: null, required: false },
    postal: { maxLength: null, required: false },
    country: { maxLength: null, required: false, default: 'US' },
    notes: { maxLength: null, required: false },
    status: { enum: ['active', 'inactive', 'prospect'], required: false, default: 'active' }
  },
  
  // Jobs table
  jobs: {
    title: { maxLength: null, required: true },
    description: { maxLength: null, required: false },
    status: { enum: ['pending', 'in_progress', 'completed', 'cancelled'], required: false, default: 'pending' },
    due_date: { type: 'date', required: false },
    location: { maxLength: null, required: false }
  },
  
  // Pricebook items table
  pricebook_items: {
    code: { maxLength: null, required: false },
    name: { maxLength: null, required: true },
    category: { maxLength: null, required: false },
    unit: { maxLength: null, required: false, default: 'each' },
    unit_price: { type: 'decimal', precision: 10, scale: 2, required: true },
    taxable: { type: 'boolean', required: false, default: true },
    active: { type: 'boolean', required: false, default: true },
    is_quick_pick: { type: 'boolean', required: false, default: false }
  },
  
  // Quotes table
  quotes: {
    number: { maxLength: null, required: true },
    client_id: { type: 'uuid', required: true },
    job_id: { type: 'uuid', required: false },
    status: { enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], required: false, default: 'draft' },
    currency: { maxLength: 3, required: false, default: 'USD' },
    tax_rate_pct: { type: 'decimal', precision: 5, scale: 2, required: false, default: 0 },
    discount_amt: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    subtotal: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    tax_total: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    total: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    terms: { maxLength: null, required: false },
    valid_until: { type: 'date', required: false }
  },
  
  // Invoices table
  invoices: {
    number: { maxLength: null, required: true },
    client_id: { type: 'uuid', required: true },
    job_id: { type: 'uuid', required: false },
    quote_id: { type: 'uuid', required: false },
    status: { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], required: false, default: 'draft' },
    currency: { maxLength: 3, required: false, default: 'USD' },
    tax_rate_pct: { type: 'decimal', precision: 5, scale: 2, required: false, default: 0 },
    discount_amt: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    subtotal: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    tax_total: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    total: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    balance_due: { type: 'decimal', precision: 10, scale: 2, required: false, default: 0 },
    issue_date: { type: 'date', required: false, default: 'now()' },
    due_date: { type: 'date', required: false }
  },
  
  // Payments table
  payments: {
    invoice_id: { type: 'uuid', required: true },
    method: { enum: ['cash', 'check', 'credit_card', 'bank_transfer', 'other'], required: true },
    amount: { type: 'decimal', precision: 10, scale: 2, required: true },
    received_at: { type: 'timestamp', required: false, default: 'now()' },
    note: { maxLength: null, required: false },
    external_id: { maxLength: null, required: false }
  },
  
  // Settings table
  settings: {
    currency: { maxLength: 3, required: false, default: 'USD' },
    default_tax_pct: { type: 'decimal', precision: 5, scale: 2, required: false, default: 0 },
    numbering_prefix_quote: { maxLength: 10, required: false, default: 'Q' },
    numbering_prefix_invoice: { maxLength: 10, required: false, default: 'INV' },
    logo_url: { maxLength: null, required: false },
    legal_name: { maxLength: null, required: false },
    address_json: { type: 'jsonb', required: false },
    terms_default: { maxLength: null, required: false }
  }
} as const

// Validation schema definitions
export const VALIDATION_SCHEMAS = {
  client: clientSchema,
  job: jobSchema,
  pricebookItem: pricebookItemSchema,
  quote: quoteSchema,
  invoice: invoiceSchema,
  payment: paymentSchema,
  organization: organizationSchema,
  settings: settingsSchema
} as const

export interface SchemaInconsistency {
  table: string
  field: string
  issue: 'missing_field' | 'type_mismatch' | 'constraint_mismatch' | 'enum_mismatch' | 'required_mismatch'
  validationSchema: string
  databaseConstraint: string
  description: string
}

export class SchemaConsistencyChecker {
  /**
   * Check for inconsistencies between validation schemas and database constraints
   */
  static checkConsistency(): SchemaInconsistency[] {
    const inconsistencies: SchemaInconsistency[] = []
    
    // Check client schema
    this.checkClientSchema(inconsistencies)
    
    // Check job schema
    this.checkJobSchema(inconsistencies)
    
    // Check pricebook item schema
    this.checkPricebookItemSchema(inconsistencies)
    
    // Check quote schema
    this.checkQuoteSchema(inconsistencies)
    
    // Check invoice schema
    this.checkInvoiceSchema(inconsistencies)
    
    // Check payment schema
    this.checkPaymentSchema(inconsistencies)
    
    // Check organization schema
    this.checkOrganizationSchema(inconsistencies)
    
    // Check settings schema
    this.checkSettingsSchema(inconsistencies)
    
    return inconsistencies
  }
  
  private static checkClientSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = clientSchema.shape
    const constraints = DATABASE_CONSTRAINTS.clients
    
    // Check required fields
    if (!schema.name._def.typeName === 'ZodString') {
      inconsistencies.push({
        table: 'clients',
        field: 'name',
        issue: 'type_mismatch',
        validationSchema: 'string',
        databaseConstraint: 'text',
        description: 'Name field type mismatch'
      })
    }
    
    // Check status enum
    const statusEnum = schema.status._def.values
    const dbStatusEnum = constraints.status.enum
    if (statusEnum && dbStatusEnum && !this.arraysEqual(statusEnum, dbStatusEnum)) {
      inconsistencies.push({
        table: 'clients',
        field: 'status',
        issue: 'enum_mismatch',
        validationSchema: statusEnum.join(', '),
        databaseConstraint: dbStatusEnum.join(', '),
        description: 'Status enum values mismatch'
      })
    }
  }
  
  private static checkJobSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = jobSchema.shape
    const constraints = DATABASE_CONSTRAINTS.jobs
    
    // Check status enum
    const statusEnum = schema.status._def.values
    const dbStatusEnum = constraints.status.enum
    if (statusEnum && dbStatusEnum && !this.arraysEqual(statusEnum, dbStatusEnum)) {
      inconsistencies.push({
        table: 'jobs',
        field: 'status',
        issue: 'enum_mismatch',
        validationSchema: statusEnum.join(', '),
        databaseConstraint: dbStatusEnum.join(', '),
        description: 'Job status enum values mismatch'
      })
    }
  }
  
  private static checkPricebookItemSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = pricebookItemSchema.shape
    const constraints = DATABASE_CONSTRAINTS.pricebook_items
    
    // Check unit_price type (should be decimal in DB, number in validation)
    if (schema.unit_price._def.typeName !== 'ZodNumber') {
      inconsistencies.push({
        table: 'pricebook_items',
        field: 'unit_price',
        issue: 'type_mismatch',
        validationSchema: 'number',
        databaseConstraint: 'decimal(10,2)',
        description: 'Unit price should be handled as string in validation for decimal precision'
      })
    }
  }
  
  private static checkQuoteSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = quoteSchema.shape
    const constraints = DATABASE_CONSTRAINTS.quotes
    
    // Check status enum
    const statusEnum = ['draft', 'sent', 'accepted', 'rejected', 'expired']
    const dbStatusEnum = constraints.status.enum
    if (dbStatusEnum && !this.arraysEqual(statusEnum, dbStatusEnum)) {
      inconsistencies.push({
        table: 'quotes',
        field: 'status',
        issue: 'enum_mismatch',
        validationSchema: statusEnum.join(', '),
        databaseConstraint: dbStatusEnum.join(', '),
        description: 'Quote status enum values mismatch'
      })
    }
  }
  
  private static checkInvoiceSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = invoiceSchema.shape
    const constraints = DATABASE_CONSTRAINTS.invoices
    
    // Check status enum
    const statusEnum = ['draft', 'sent', 'paid', 'overdue', 'cancelled']
    const dbStatusEnum = constraints.status.enum
    if (dbStatusEnum && !this.arraysEqual(statusEnum, dbStatusEnum)) {
      inconsistencies.push({
        table: 'invoices',
        field: 'status',
        issue: 'enum_mismatch',
        validationSchema: statusEnum.join(', '),
        databaseConstraint: dbStatusEnum.join(', '),
        description: 'Invoice status enum values mismatch'
      })
    }
  }
  
  private static checkPaymentSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = paymentSchema.shape
    const constraints = DATABASE_CONSTRAINTS.payments
    
    // Check method enum
    const methodEnum = schema.method._def.values
    const dbMethodEnum = constraints.method.enum
    if (methodEnum && dbMethodEnum && !this.arraysEqual(methodEnum, dbMethodEnum)) {
      inconsistencies.push({
        table: 'payments',
        field: 'method',
        issue: 'enum_mismatch',
        validationSchema: methodEnum.join(', '),
        databaseConstraint: dbMethodEnum.join(', '),
        description: 'Payment method enum values mismatch'
      })
    }
  }
  
  private static checkOrganizationSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = organizationSchema.shape
    const constraints = DATABASE_CONSTRAINTS.organizations
    
    // Check size enum
    const sizeEnum = schema.size._def.values
    const dbSizeEnum = constraints.size.enum
    if (sizeEnum && dbSizeEnum && !this.arraysEqual(sizeEnum, dbSizeEnum)) {
      inconsistencies.push({
        table: 'organizations',
        field: 'size',
        issue: 'enum_mismatch',
        validationSchema: sizeEnum.join(', '),
        databaseConstraint: dbSizeEnum.join(', '),
        description: 'Organization size enum values mismatch'
      })
    }
    
    // Check plan enum
    const planEnum = schema.plan._def.values
    const dbPlanEnum = constraints.plan.enum
    if (planEnum && dbPlanEnum && !this.arraysEqual(planEnum, dbPlanEnum)) {
      inconsistencies.push({
        table: 'organizations',
        field: 'plan',
        issue: 'enum_mismatch',
        validationSchema: planEnum.join(', '),
        databaseConstraint: dbPlanEnum.join(', '),
        description: 'Organization plan enum values mismatch'
      })
    }
  }
  
  private static checkSettingsSchema(inconsistencies: SchemaInconsistency[]): void {
    const schema = settingsSchema.shape
    const constraints = DATABASE_CONSTRAINTS.settings
    
    // Check currency length
    const currencyMaxLength = schema.currency._def.maxLength
    const dbCurrencyMaxLength = constraints.currency.maxLength
    if (currencyMaxLength !== dbCurrencyMaxLength) {
      inconsistencies.push({
        table: 'settings',
        field: 'currency',
        issue: 'constraint_mismatch',
        validationSchema: `maxLength: ${currencyMaxLength}`,
        databaseConstraint: `maxLength: ${dbCurrencyMaxLength}`,
        description: 'Currency field max length mismatch'
      })
    }
  }
  
  private static arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false
    return a.every((val, index) => val === b[index])
  }
  
  /**
   * Generate a report of schema inconsistencies
   */
  static generateReport(): string {
    const inconsistencies = this.checkConsistency()
    
    if (inconsistencies.length === 0) {
      return '✅ All validation schemas are consistent with database constraints.'
    }
    
    let report = `⚠️  Found ${inconsistencies.length} schema inconsistency(ies):\n\n`
    
    inconsistencies.forEach((inconsistency, index) => {
      report += `${index + 1}. **${inconsistency.table}.${inconsistency.field}**\n`
      report += `   Issue: ${inconsistency.issue}\n`
      report += `   Description: ${inconsistency.description}\n`
      report += `   Validation Schema: ${inconsistency.validationSchema}\n`
      report += `   Database Constraint: ${inconsistency.databaseConstraint}\n\n`
    })
    
    return report
  }
  
  /**
   * Validate a specific schema against database constraints
   */
  static validateSchema(schemaName: keyof typeof VALIDATION_SCHEMAS): SchemaInconsistency[] {
    const inconsistencies: SchemaInconsistency[] = []
    
    switch (schemaName) {
      case 'client':
        this.checkClientSchema(inconsistencies)
        break
      case 'job':
        this.checkJobSchema(inconsistencies)
        break
      case 'pricebookItem':
        this.checkPricebookItemSchema(inconsistencies)
        break
      case 'quote':
        this.checkQuoteSchema(inconsistencies)
        break
      case 'invoice':
        this.checkInvoiceSchema(inconsistencies)
        break
      case 'payment':
        this.checkPaymentSchema(inconsistencies)
        break
      case 'organization':
        this.checkOrganizationSchema(inconsistencies)
        break
      case 'settings':
        this.checkSettingsSchema(inconsistencies)
        break
    }
    
    return inconsistencies
  }
}

// Export utility functions
export const checkSchemaConsistency = () => SchemaConsistencyChecker.checkConsistency()
export const generateConsistencyReport = () => SchemaConsistencyChecker.generateReport()
export const validateSpecificSchema = (schemaName: keyof typeof VALIDATION_SCHEMAS) => 
  SchemaConsistencyChecker.validateSchema(schemaName)
