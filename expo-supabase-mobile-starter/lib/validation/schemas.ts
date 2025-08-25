import { z } from 'zod';

// Base schemas for common fields
export const baseEntitySchema = z.object({
  id: z.string().uuid().optional(),
  org_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().default('US'),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.string().optional(),
});

// Client schemas
export const clientSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Client name is required').max(255, 'Client name too long'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  type: z.enum(['individual', 'business']).default('business'),
  address: addressSchema.optional(),
  contacts: z.array(contactSchema).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tax_id: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  source: z.string().optional(),
  credit_limit: z.number().min(0).optional(),
  payment_terms: z.number().min(0).optional(),
});

export const clientFormSchema = clientSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
});

// Quote schemas
export const quoteItemSchema = z.object({
  id: z.string().uuid().optional(),
  quote_id: z.string().uuid().optional(),
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  discount_pct: z.number().min(0).max(100).default(0),
  taxable: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const quoteSchema = baseEntitySchema.extend({
  number: z.string().min(1, 'Quote number is required'),
  client_id: z.string().uuid('Invalid client ID'),
  job_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).default('draft'),
  currency: z.string().default('USD'),
  tax_rate_pct: z.number().min(0).max(100).default(0),
  discount_amt: z.number().min(0).default(0),
  subtotal: z.number().min(0).default(0),
  tax_amt: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  valid_until: z.string().datetime().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(quoteItemSchema).default([]),
  sent_at: z.string().datetime().optional(),
  accepted_at: z.string().datetime().optional(),
  rejected_at: z.string().datetime().optional(),
  rejection_reason: z.string().optional(),
});

export const quoteFormSchema = quoteSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
  subtotal: true,
  tax_amt: true,
  total: true,
  sent_at: true,
  accepted_at: true,
  rejected_at: true,
});

// Invoice schemas
export const invoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  invoice_id: z.string().uuid().optional(),
  description: z.string().min(1, 'Item description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  discount_pct: z.number().min(0).max(100).default(0),
  taxable: z.boolean().default(true),
  sort_order: z.number().default(0),
});

export const invoiceSchema = baseEntitySchema.extend({
  number: z.string().min(1, 'Invoice number is required'),
  quote_id: z.string().uuid().optional(),
  client_id: z.string().uuid('Invalid client ID'),
  job_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  currency: z.string().default('USD'),
  tax_rate_pct: z.number().min(0).max(100).default(0),
  discount_amt: z.number().min(0).default(0),
  subtotal: z.number().min(0).default(0),
  tax_amt: z.number().min(0).default(0),
  total: z.number().min(0).default(0),
  due_date: z.string().datetime().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).default([]),
  sent_at: z.string().datetime().optional(),
  paid_at: z.string().datetime().optional(),
  payment_method: z.string().optional(),
  stripe_payment_intent_id: z.string().optional(),
  stripe_payment_link_id: z.string().optional(),
});

export const invoiceFormSchema = invoiceSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
  subtotal: true,
  tax_amt: true,
  total: true,
  sent_at: true,
  paid_at: true,
});

// Payment schemas
export const paymentSchema = baseEntitySchema.extend({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  amount: z.number().positive('Payment amount must be positive'),
  currency: z.string().default('USD'),
  method: z.enum(['stripe', 'cash', 'check', 'bank_transfer', 'other']),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  stripe_payment_intent_id: z.string().optional(),
  processed_at: z.string().datetime().optional(),
});

export const paymentFormSchema = paymentSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
  processed_at: true,
});

// Pricebook schemas
export const pricebookItemSchema = baseEntitySchema.extend({
  code: z.string().optional(),
  name: z.string().min(1, 'Item name is required').max(255, 'Item name too long'),
  category: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  taxable: z.boolean().default(true),
  active: z.boolean().default(true),
  is_quick_pick: z.boolean().default(false),
  description: z.string().optional(),
  cost: z.number().min(0).optional(),
  supplier: z.string().optional(),
  supplier_code: z.string().optional(),
});

export const pricebookItemFormSchema = pricebookItemSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
});

// Job schemas
export const jobSchema = baseEntitySchema.extend({
  title: z.string().min(1, 'Job title is required').max(255, 'Job title too long'),
  client_id: z.string().uuid('Invalid client ID'),
  status: z.enum(['planning', 'in_progress', 'completed', 'cancelled']).default('planning'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  description: z.string().optional(),
  address: addressSchema.optional(),
  estimated_hours: z.number().min(0).optional(),
  actual_hours: z.number().min(0).optional(),
  estimated_cost: z.number().min(0).optional(),
  actual_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const jobFormSchema = jobSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
});

// Organization schemas
export const organizationSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Organization name is required').max(255, 'Organization name too long'),
  type: z.enum(['individual', 'business']).default('business'),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  website: z.string().url('Invalid website URL').optional(),
  tax_id: z.string().optional(),
  logo_url: z.string().url('Invalid logo URL').optional(),
  branding: z.object({
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
    secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
    logo_url: z.string().url('Invalid logo URL').optional(),
    company_name: z.string().optional(),
    tagline: z.string().optional(),
  }).optional(),
  settings: z.object({
    default_currency: z.string().default('USD'),
    default_tax_rate: z.number().min(0).max(100).default(0),
    invoice_terms: z.string().optional(),
    quote_terms: z.string().optional(),
    payment_terms_days: z.number().min(0).default(30),
    auto_number_quotes: z.boolean().default(true),
    auto_number_invoices: z.boolean().default(true),
    quote_prefix: z.string().default('Q'),
    invoice_prefix: z.string().default('INV'),
    next_quote_number: z.number().min(1).default(1),
    next_invoice_number: z.number().min(1).default(1),
  }).optional(),
});

export const organizationFormSchema = organizationSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
});

// User schemas
export const userSchema = baseEntitySchema.extend({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['owner', 'admin', 'user']).default('user'),
  active: z.boolean().default(true),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  phone: z.string().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }).default({}),
  }).optional(),
});

export const userFormSchema = userSchema.omit({
  id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
});

// Activity log schemas
export const activityLogSchema = baseEntitySchema.extend({
  user_id: z.string().uuid('Invalid user ID'),
  action: z.string().min(1, 'Action is required'),
  entity_type: z.enum(['client', 'quote', 'invoice', 'payment', 'pricebook', 'job', 'user']),
  entity_id: z.string().uuid('Invalid entity ID'),
  details: z.record(z.unknown()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

// Export all schemas
export const schemas = {
  // Base schemas
  baseEntity: baseEntitySchema,
  address: addressSchema,
  contact: contactSchema,
  
  // Entity schemas
  client: clientSchema,
  clientForm: clientFormSchema,
  quote: quoteSchema,
  quoteForm: quoteFormSchema,
  quoteItem: quoteItemSchema,
  invoice: invoiceSchema,
  invoiceForm: invoiceFormSchema,
  invoiceItem: invoiceItemSchema,
  payment: paymentSchema,
  paymentForm: paymentFormSchema,
  pricebookItem: pricebookItemSchema,
  pricebookItemForm: pricebookItemFormSchema,
  job: jobSchema,
  jobForm: jobFormSchema,
  organization: organizationSchema,
  organizationForm: organizationFormSchema,
  user: userSchema,
  userForm: userFormSchema,
  activityLog: activityLogSchema,
} as const;

// Type exports
export type Client = z.infer<typeof clientSchema>;
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type QuoteItem = z.infer<typeof quoteItemSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentFormData = z.infer<typeof paymentFormSchema>;
export type PricebookItem = z.infer<typeof pricebookItemSchema>;
export type PricebookItemFormData = z.infer<typeof pricebookItemFormSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobFormData = z.infer<typeof jobFormSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
export type User = z.infer<typeof userSchema>;
export type UserFormData = z.infer<typeof userFormSchema>;
export type ActivityLog = z.infer<typeof activityLogSchema>;
export type Address = z.infer<typeof addressSchema>;
export type Contact = z.infer<typeof contactSchema>;

// Validation helper functions
export const validateClient = (data: unknown): Client => {
  return clientSchema.parse(data);
};

export const validateQuote = (data: unknown): Quote => {
  return quoteSchema.parse(data);
};

export const validateInvoice = (data: unknown): Invoice => {
  return invoiceSchema.parse(data);
};

export const validatePayment = (data: unknown): Payment => {
  return paymentSchema.parse(data);
};

export const validatePricebookItem = (data: unknown): PricebookItem => {
  return pricebookItemSchema.parse(data);
};

export const validateJob = (data: unknown): Job => {
  return jobSchema.parse(data);
};

export const validateOrganization = (data: unknown): Organization => {
  return organizationSchema.parse(data);
};

export const validateUser = (data: unknown): User => {
  return userSchema.parse(data);
};

// Safe validation functions that return errors instead of throwing
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
};

// Partial validation for updates
export const createPartialSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
  return schema.partial();
};

export const partialClientSchema = createPartialSchema(clientSchema);
export const partialQuoteSchema = createPartialSchema(quoteSchema);
export const partialInvoiceSchema = createPartialSchema(invoiceSchema);
export const partialPaymentSchema = createPartialSchema(paymentSchema);
export const partialPricebookItemSchema = createPartialSchema(pricebookItemSchema);
export const partialJobSchema = createPartialSchema(jobSchema);
export const partialOrganizationSchema = createPartialSchema(organizationSchema);
export const partialUserSchema = createPartialSchema(userSchema);
