// Export all schemas and types from the main schemas file
export * from './schemas';

// Export schema consistency utilities
export * from './schema-consistency';

// Re-export validation helper functions
export {
  validateClient,
  validateQuote,
  validateInvoice,
  validatePayment,
  validatePricebookItem,
  validateJob,
  validateOrganization,
  validateUser,
  safeValidate,
  createPartialSchema,
  partialClientSchema,
  partialQuoteSchema,
  partialInvoiceSchema,
  partialPaymentSchema,
  partialPricebookItemSchema,
  partialJobSchema,
  partialOrganizationSchema,
  partialUserSchema,
} from './schemas';

// Export all types
export type {
  Client,
  ClientFormData,
  Quote,
  QuoteFormData,
  QuoteItem,
  Invoice,
  InvoiceFormData,
  InvoiceItem,
  Payment,
  PaymentFormData,
  PricebookItem,
  PricebookItemFormData,
  Job,
  JobFormData,
  Organization,
  OrganizationFormData,
  User,
  UserFormData,
  ActivityLog,
  Address,
  Contact,
} from './schemas';
