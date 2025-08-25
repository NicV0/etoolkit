import { z } from 'zod';
import { schemas } from './schemas';

/**
 * Schema consistency validation utilities
 * This module provides tools to validate data consistency across different schemas
 */

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CrossSchemaValidationContext {
  orgId: string;
  userId: string;
  timestamp: string;
}

/**
 * Validates that a client can be referenced by other entities
 */
export const validateClientReference = (
  clientId: string,
  context: CrossSchemaValidationContext
): SchemaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!clientId) {
    errors.push('Client ID is required');
  }

  if (clientId && !z.string().uuid().safeParse(clientId).success) {
    errors.push('Client ID must be a valid UUID');
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validates that an invoice can be created from a quote
 */
export const validateQuoteToInvoice = (
  quoteData: unknown,
  context: CrossSchemaValidationContext
): SchemaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const quote = schemas.quote.parse(quoteData);
    
    // Validate quote status
    if (quote.status !== 'accepted') {
      errors.push('Can only create invoice from accepted quotes');
    }

    // Validate quote has items
    if (!quote.items || quote.items.length === 0) {
      errors.push('Quote must have at least one item');
    }

    // Validate quote is not expired
    if (quote.valid_until && new Date(quote.valid_until) < new Date()) {
      errors.push('Quote has expired');
    }

    // Validate client reference
    const clientValidation = validateClientReference(quote.client_id, context);
    if (!clientValidation.isValid) {
      errors.push(...clientValidation.errors);
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      errors.push('Invalid quote data');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validates that a payment can be applied to an invoice
 */
export const validatePaymentToInvoice = (
  paymentData: unknown,
  invoiceData: unknown,
  context: CrossSchemaValidationContext
): SchemaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const payment = schemas.payment.parse(paymentData);
    const invoice = schemas.invoice.parse(invoiceData);

    // Validate payment amount
    if (payment.amount <= 0) {
      errors.push('Payment amount must be positive');
    }

    // Validate payment currency matches invoice
    if (payment.currency !== invoice.currency) {
      errors.push('Payment currency must match invoice currency');
    }

    // Validate payment doesn't exceed invoice total
    if (payment.amount > invoice.total) {
      warnings.push('Payment amount exceeds invoice total');
    }

    // Validate invoice status
    if (invoice.status === 'cancelled') {
      errors.push('Cannot apply payment to cancelled invoice');
    }

    // Validate invoice reference
    if (payment.invoice_id !== invoice.id) {
      errors.push('Payment invoice ID must match invoice ID');
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      errors.push('Invalid payment or invoice data');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validates that pricebook items are consistent
 */
export const validatePricebookConsistency = (
  items: unknown[],
  context: CrossSchemaValidationContext
): SchemaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const validatedItems: any[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const item = schemas.pricebookItem.parse(items[i]);
      validatedItems.push(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(`Item ${i + 1}: ${error.errors.map(e => e.message).join(', ')}`);
      } else {
        errors.push(`Item ${i + 1}: Invalid data`);
      }
    }
  }

  // Check for duplicate codes
  const codes = validatedItems.map(item => item.code).filter(Boolean);
  const duplicateCodes = codes.filter((code, index) => codes.indexOf(code) !== index);
  if (duplicateCodes.length > 0) {
    warnings.push(`Duplicate codes found: ${duplicateCodes.join(', ')}`);
  }

  // Check for duplicate names
  const names = validatedItems.map(item => item.name);
  const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    warnings.push(`Duplicate names found: ${duplicateNames.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validates that job data is consistent
 */
export const validateJobConsistency = (
  jobData: unknown,
  context: CrossSchemaValidationContext
): SchemaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const job = schemas.job.parse(jobData);

    // Validate client reference
    const clientValidation = validateClientReference(job.client_id, context);
    if (!clientValidation.isValid) {
      errors.push(...clientValidation.errors);
    }

    // Validate date consistency
    if (job.start_date && job.end_date) {
      const startDate = new Date(job.start_date);
      const endDate = new Date(job.end_date);
      
      if (startDate > endDate) {
        errors.push('Start date cannot be after end date');
      }
    }

    // Validate hours consistency
    if (job.estimated_hours && job.actual_hours) {
      if (job.actual_hours > job.estimated_hours * 2) {
        warnings.push('Actual hours significantly exceed estimated hours');
      }
    }

    // Validate cost consistency
    if (job.estimated_cost && job.actual_cost) {
      if (job.actual_cost > job.estimated_cost * 1.5) {
        warnings.push('Actual cost significantly exceeds estimated cost');
      }
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      errors.push('Invalid job data');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Validates organization settings consistency
 */
export const validateOrganizationSettings = (
  orgData: unknown,
  context: CrossSchemaValidationContext
): SchemaValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const org = schemas.organization.parse(orgData);

    if (org.settings) {
      // Validate tax rate
      if (org.settings.default_tax_rate > 100) {
        errors.push('Default tax rate cannot exceed 100%');
      }

      // Validate payment terms
      if (org.settings.payment_terms_days > 365) {
        warnings.push('Payment terms exceed one year');
      }

      // Validate prefixes
      if (org.settings.quote_prefix && org.settings.quote_prefix.length > 10) {
        warnings.push('Quote prefix is quite long');
      }

      if (org.settings.invoice_prefix && org.settings.invoice_prefix.length > 10) {
        warnings.push('Invoice prefix is quite long');
      }

      // Validate numbering
      if (org.settings.next_quote_number < 1) {
        errors.push('Next quote number must be at least 1');
      }

      if (org.settings.next_invoice_number < 1) {
        errors.push('Next invoice number must be at least 1');
      }
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      errors.push('Invalid organization data');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};

/**
 * Comprehensive validation for all schemas
 */
export const validateAllSchemas = (
  data: Record<string, unknown>,
  context: CrossSchemaValidationContext
): Record<string, SchemaValidationResult> => {
  const results: Record<string, SchemaValidationResult> = {};

  // Validate clients
  if (data.clients) {
    results.clients = validateClientReference(data.clients as string, context);
  }

  // Validate quotes
  if (data.quotes) {
    results.quotes = validateQuoteToInvoice(data.quotes, context);
  }

  // Validate invoices
  if (data.invoices) {
    try {
      schemas.invoice.parse(data.invoices);
      results.invoices = { isValid: true, errors: [], warnings: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        results.invoices = {
          isValid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          warnings: []
        };
      } else {
        results.invoices = { isValid: false, errors: ['Invalid invoice data'], warnings: [] };
      }
    }
  }

  // Validate payments
  if (data.payments && data.invoices) {
    results.payments = validatePaymentToInvoice(data.payments, data.invoices, context);
  }

  // Validate pricebook items
  if (data.pricebookItems) {
    results.pricebookItems = validatePricebookConsistency(data.pricebookItems as unknown[], context);
  }

  // Validate jobs
  if (data.jobs) {
    results.jobs = validateJobConsistency(data.jobs, context);
  }

  // Validate organization
  if (data.organization) {
    results.organization = validateOrganizationSettings(data.organization, context);
  }

  return results;
};

/**
 * Utility to format validation results for display
 */
export const formatValidationResults = (results: Record<string, SchemaValidationResult>): string => {
  const lines: string[] = [];

  for (const [schema, result] of Object.entries(results)) {
    lines.push(`\n${schema.toUpperCase()}:`);
    
    if (result.isValid) {
      lines.push('  ✅ Valid');
    } else {
      lines.push('  ❌ Invalid');
    }

    if (result.errors.length > 0) {
      lines.push('  Errors:');
      result.errors.forEach(error => lines.push(`    - ${error}`));
    }

    if (result.warnings.length > 0) {
      lines.push('  Warnings:');
      result.warnings.forEach(warning => lines.push(`    - ${warning}`));
    }
  }

  return lines.join('\n');
};

/**
 * Type guard to check if validation result is valid
 */
export const isValid = (result: SchemaValidationResult): result is SchemaValidationResult & { isValid: true } => {
  return result.isValid;
};

/**
 * Type guard to check if validation result has errors
 */
export const hasErrors = (result: SchemaValidationResult): boolean => {
  return result.errors.length > 0;
};

/**
 * Type guard to check if validation result has warnings
 */
export const hasWarnings = (result: SchemaValidationResult): boolean => {
  return result.warnings.length > 0;
};
