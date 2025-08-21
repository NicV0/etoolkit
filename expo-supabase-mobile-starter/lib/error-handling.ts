import { PostgrestError } from '@supabase/supabase-js'

export interface APIError {
  message: string
  code?: string
  details?: string
  status?: number
  timestamp: string
  operation?: string
  entity?: string
}

export interface APIResult<T> {
  data?: T
  success: boolean
  error?: APIError
}

export class APIErrorHandler {
  static handle(error: unknown, operation: string, entity?: string): APIError {
    const timestamp = new Date().toISOString()
    
    // Handle Supabase errors
    if (error instanceof Error && 'code' in error) {
      const supabaseError = error as PostgrestError
      return {
        message: supabaseError.message || 'Database operation failed',
        code: supabaseError.code,
        details: supabaseError.details,
        status: supabaseError.hint ? 400 : 500,
        timestamp,
        operation,
        entity
      }
    }
    
    // Handle standard errors
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'UNKNOWN_ERROR',
        timestamp,
        operation,
        entity
      }
    }
    
    // Handle unknown errors
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      timestamp,
      operation,
      entity
    }
  }
  
  static wrap<T>(
    operation: () => Promise<T>,
    operationName: string,
    entity?: string
  ): Promise<APIResult<T>> {
    return operation()
      .then(data => ({ data, success: true }))
      .catch(error => ({
        success: false,
        error: this.handle(error, operationName, entity)
      }))
  }
  
  static async wrapAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
    entity?: string
  ): Promise<APIResult<T>> {
    try {
      const data = await operation()
      return { data, success: true }
    } catch (error) {
      return {
        success: false,
        error: this.handle(error, operationName, entity)
      }
    }
  }
}

// Common error messages
export const ErrorMessages = {
  VALIDATION_FAILED: 'Data validation failed',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  CONFLICT: 'Resource conflict',
  RATE_LIMITED: 'Rate limit exceeded',
  NETWORK_ERROR: 'Network connection error',
  STORAGE_ERROR: 'File storage error',
  DATABASE_ERROR: 'Database operation failed',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  FILE_TOO_LARGE: 'File size exceeds limit',
  UNSUPPORTED_FILE_TYPE: 'File type not supported',
  QUOTE_CONVERSION_FAILED: 'Quote conversion to invoice failed',
  PAYMENT_RECORDING_FAILED: 'Payment recording failed',
  CSV_IMPORT_FAILED: 'CSV import failed',
  PDF_GENERATION_FAILED: 'PDF generation failed'
}

// Error codes mapping
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR'
}

// Helper function to create consistent error responses
export const createErrorResponse = (
  message: string,
  code: string = ErrorCodes.BUSINESS_LOGIC_ERROR,
  details?: string
): APIResult<never> => ({
  success: false,
  error: {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  }
})

// Helper function to create success responses
export const createSuccessResponse = <T>(data: T): APIResult<T> => ({
  data,
  success: true
})

// Validation error helper
export const createValidationError = (field: string, message: string): APIResult<never> =>
  createErrorResponse(
    `${field}: ${message}`,
    ErrorCodes.VALIDATION_ERROR,
    `Field validation failed for: ${field}`
  )

// Not found error helper
export const createNotFoundError = (entity: string, id: string): APIResult<never> =>
  createErrorResponse(
    `${entity} with ID ${id} not found`,
    ErrorCodes.NOT_FOUND,
    `Entity: ${entity}, ID: ${id}`
  )

// Unauthorized error helper
export const createUnauthorizedError = (operation: string): APIResult<never> =>
  createErrorResponse(
    `Unauthorized to perform ${operation}`,
    ErrorCodes.UNAUTHORIZED,
    `Operation: ${operation}`
  )
