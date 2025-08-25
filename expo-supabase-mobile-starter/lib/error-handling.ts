/**
 * Error handling utilities for the application
 * Provides centralized error handling, logging, and user-friendly error messages
 */

export enum ErrorType {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Authentication errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Data validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  
  // External service errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  STRIPE_ERROR = 'STRIPE_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  
  // File and storage errors
  FILE_ERROR = 'FILE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  
  // System errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  stack?: string;
  context?: {
    userId?: string;
    orgId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    url?: string;
    userAgent?: string;
    ipAddress?: string;
    retryAttempts?: number;
    timeout?: number;
  };
}

export interface ErrorHandlerConfig {
  logErrors: boolean;
  showUserMessages: boolean;
  reportToAnalytics: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class AppErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCount: Map<ErrorType, number> = new Map();
  private retryCount: Map<string, number> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      logErrors: true,
      showUserMessages: true,
      reportToAnalytics: true,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Create a new application error
   */
  createError(
    type: ErrorType,
    message: string,
    userMessage?: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    details?: Record<string, unknown>,
    context?: AppError['context']
  ): AppError {
    const error: AppError = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      userMessage: userMessage || this.getDefaultUserMessage(type),
      timestamp: new Date().toISOString(),
      details,
      context,
    };

    // Add stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, this.createError);
    }

    return error;
  }

  /**
   * Handle an error with appropriate logging and user notification
   */
  handleError(error: Error | AppError | unknown, context?: AppError['context']): AppError {
    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
      if (context) {
        appError.context = { ...appError.context, ...context };
      }
    } else {
      appError = this.convertToAppError(error, context);
    }

    // Increment error count
    const currentCount = this.errorCount.get(appError.type) || 0;
    this.errorCount.set(appError.type, currentCount + 1);

    // Log error
    if (this.config.logErrors) {
      this.logError(appError);
    }

    // Report to analytics
    if (this.config.reportToAnalytics) {
      this.reportError(appError);
    }

    return appError;
  }

  /**
   * Handle async operations with error handling
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context?: AppError['context']
  ): Promise<{ data: T | null; error: AppError | null }> {
    try {
      const data = await operation();
      return { data, error: null };
    } catch (error) {
      const appError = this.handleError(error, context);
      return { data: null, error: appError };
    }
  }

  /**
   * Retry an operation with exponential backoff
   */
  async retry<T>(
    operation: () => Promise<T>,
    operationId: string,
    context?: AppError['context']
  ): Promise<T> {
    const currentRetries = this.retryCount.get(operationId) || 0;

    if (currentRetries >= this.config.maxRetries) {
      throw this.createError(
        ErrorType.NETWORK_ERROR,
        `Operation failed after ${this.config.maxRetries} retries`,
        'The operation failed. Please try again later.',
        ErrorSeverity.HIGH,
        { operationId, retryCount: currentRetries },
        context
      );
    }

    try {
      const result = await operation();
      this.retryCount.delete(operationId);
      return result;
    } catch (error) {
      this.retryCount.set(operationId, currentRetries + 1);
      
      // Wait before retrying
      await this.delay(this.config.retryDelay * Math.pow(2, currentRetries));
      
      return this.retry(operation, operationId, context);
    }
  }

  /**
   * Validate input data and return validation errors
   */
  validateInput<T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    context?: AppError['context']
  ): { isValid: true; data: T } | { isValid: false; error: AppError } {
    try {
      if (validator(data)) {
        return { isValid: true, data };
      } else {
        return {
          isValid: false,
          error: this.createError(
            ErrorType.VALIDATION_ERROR,
            'Input validation failed',
            'Please check your input and try again.',
            ErrorSeverity.LOW,
            { data },
            context
          ),
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: this.createError(
          ErrorType.VALIDATION_ERROR,
          'Input validation error',
          'Please check your input and try again.',
          ErrorSeverity.LOW,
          { originalError: error },
          context
        ),
      };
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<ErrorType, number> {
    const stats: Record<ErrorType, number> = {} as Record<ErrorType, number>;
    
    for (const [type, count] of this.errorCount.entries()) {
      stats[type] = count;
    }
    
    return stats;
  }

  /**
   * Clear error statistics
   */
  clearErrorStats(): void {
    this.errorCount.clear();
    this.retryCount.clear();
  }

  /**
   * Check if an error is retryable
   */
  isRetryableError(error: AppError): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.TIMEOUT_ERROR,
      ErrorType.CONNECTION_ERROR,
      ErrorType.EXTERNAL_SERVICE_ERROR,
    ];

    return retryableTypes.includes(error.type) && error.severity !== ErrorSeverity.CRITICAL;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: AppError): string {
    if (error.severity === ErrorSeverity.CRITICAL) {
      return 'A critical error occurred. Please contact support.';
    }

    return error.userMessage || this.getDefaultUserMessage(error.type);
  }

  /**
   * Check if error should be shown to user
   */
  shouldShowToUser(error: AppError): boolean {
    return this.config.showUserMessages && error.severity !== ErrorSeverity.LOW;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'severity' in error &&
      'message' in error &&
      'userMessage' in error &&
      'timestamp' in error
    );
  }

  private convertToAppError(error: unknown, context?: AppError['context']): AppError {
    if (error instanceof Error) {
      return this.createError(
        ErrorType.UNKNOWN_ERROR,
        error.message,
        'An unexpected error occurred. Please try again.',
        ErrorSeverity.MEDIUM,
        { originalError: error.message },
        context
      );
    }

    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      'Unknown error occurred',
      'An unexpected error occurred. Please try again.',
      ErrorSeverity.MEDIUM,
      { originalError: error },
      context
    );
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
      [ErrorType.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      [ErrorType.CONNECTION_ERROR]: 'Unable to connect to the server. Please try again.',
      [ErrorType.AUTHENTICATION_ERROR]: 'Please log in again.',
      [ErrorType.AUTHORIZATION_ERROR]: 'You don\'t have permission to perform this action.',
      [ErrorType.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
      [ErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
      [ErrorType.INVALID_INPUT]: 'Invalid input provided. Please check your data.',
      [ErrorType.MISSING_REQUIRED_FIELD]: 'Required information is missing.',
      [ErrorType.DATABASE_ERROR]: 'Database error occurred. Please try again.',
      [ErrorType.CONSTRAINT_VIOLATION]: 'Data constraint violation. Please check your input.',
      [ErrorType.DUPLICATE_ENTRY]: 'This record already exists.',
      [ErrorType.RECORD_NOT_FOUND]: 'The requested record was not found.',
      [ErrorType.BUSINESS_RULE_VIOLATION]: 'This action violates business rules.',
      [ErrorType.INSUFFICIENT_PERMISSIONS]: 'You don\'t have sufficient permissions.',
      [ErrorType.INVALID_STATE_TRANSITION]: 'Invalid state transition.',
      [ErrorType.EXTERNAL_SERVICE_ERROR]: 'External service error. Please try again later.',
      [ErrorType.STRIPE_ERROR]: 'Payment processing error. Please try again.',
      [ErrorType.EMAIL_ERROR]: 'Email sending failed. Please try again.',
      [ErrorType.FILE_ERROR]: 'File operation failed. Please try again.',
      [ErrorType.STORAGE_ERROR]: 'Storage operation failed. Please try again.',
      [ErrorType.UPLOAD_ERROR]: 'File upload failed. Please try again.',
      [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
      [ErrorType.INTERNAL_ERROR]: 'Internal server error. Please try again later.',
      [ErrorType.CONFIGURATION_ERROR]: 'Configuration error. Please contact support.',
    };

    return messages[type] || messages[ErrorType.UNKNOWN_ERROR];
  }

  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = this.formatLogMessage(error);
    
    console[logLevel](logMessage);
    
    // In a real app, you might want to send this to a logging service
    // like Sentry, LogRocket, or your own logging infrastructure
  }

  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  }

  private formatLogMessage(error: AppError): string {
    return `[${error.type}] ${error.message} - ${error.timestamp}${error.context ? ` - Context: ${JSON.stringify(error.context)}` : ''}`;
  }

  private reportError(error: AppError): void {
    // In a real app, you would send this to your analytics service
    // For now, we'll just log it
    console.log('Error reported to analytics:', {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      timestamp: error.timestamp,
      context: error.context,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create a default error handler instance
export const errorHandler = new AppErrorHandler();

// Export convenience functions
export const createError = errorHandler.createError.bind(errorHandler);
export const handleError = errorHandler.handleError.bind(errorHandler);
export const handleAsync = errorHandler.handleAsync.bind(errorHandler);
export const retry = errorHandler.retry.bind(errorHandler);
export const validateInput = errorHandler.validateInput.bind(errorHandler);

// Export error type guards
export const isNetworkError = (error: AppError): boolean => 
  [ErrorType.NETWORK_ERROR, ErrorType.TIMEOUT_ERROR, ErrorType.CONNECTION_ERROR].includes(error.type);

export const isAuthError = (error: AppError): boolean =>
  [ErrorType.AUTHENTICATION_ERROR, ErrorType.AUTHORIZATION_ERROR, ErrorType.SESSION_EXPIRED].includes(error.type);

export const isValidationError = (error: AppError): boolean =>
  [ErrorType.VALIDATION_ERROR, ErrorType.INVALID_INPUT, ErrorType.MISSING_REQUIRED_FIELD].includes(error.type);

export const isDatabaseError = (error: AppError): boolean =>
  [ErrorType.DATABASE_ERROR, ErrorType.CONSTRAINT_VIOLATION, ErrorType.DUPLICATE_ENTRY, ErrorType.RECORD_NOT_FOUND].includes(error.type);

export const isCriticalError = (error: AppError): boolean => error.severity === ErrorSeverity.CRITICAL;

// Export APIError for backward compatibility
export class APIError implements AppError {
  public id: string;
  public timestamp: string;
  public userMessage: string;
  public code?: string;
  public details?: Record<string, unknown>;
  public stack?: string;
  public context?: {
    userId?: string;
    orgId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    url?: string;
    userAgent?: string;
    ipAddress?: string;
  };

  constructor(
    public message: string,
    public statusCode: number,
    public endpoint?: string,
    public severity: ErrorSeverity = ErrorSeverity.HIGH
  ) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date().toISOString();
    this.userMessage = `Request failed (${statusCode})`;
    this.type = ErrorType.EXTERNAL_SERVICE_ERROR;
  }

  public type: ErrorType;
}

// Standalone function for generating error IDs
const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Export aliases for backward compatibility
export const APIErrorHandler = {
  handle: (error: unknown, operation?: string, entity?: string) => {
    const appError = errorHandler.handleError(error, { action: operation, entityType: entity });
    return {
      message: appError.message,
      code: appError.type,
      operation,
      entity,
      timestamp: appError.timestamp,
      details: appError.details,
      status: 400
    };
  },
  wrap: async <T>(operation: () => Promise<T>, operationName?: string, entity?: string) => {
    try {
      const data = await operation();
      return { success: true, data, error: undefined };
    } catch (error) {
      const appError = errorHandler.handleError(error, { action: operationName, entityType: entity });
      return { 
        success: false, 
        data: undefined, 
        error: {
          message: appError.message,
          operation: operationName,
          entity
        }
      };
    }
  },
  wrapAsync: async <T>(operation: () => Promise<T>, operationName?: string, entity?: string) => {
    try {
      const data = await operation();
      return { success: true, data, error: undefined };
    } catch (error) {
      const appError = errorHandler.handleError(error, { action: operationName, entityType: entity });
      return { 
        success: false, 
        data: undefined, 
        error: {
          message: appError.message,
          operation: operationName,
          entity
        }
      };
    }
  },
  // Add new methods for better error handling
  withRetry: async <T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 1000,
    operationName?: string, 
    entity?: string
  ) => {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const data = await operation();
        return { success: true, data, error: undefined, attempts: attempt };
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    
    const appError = errorHandler.handleError(lastError, { 
      action: operationName, 
      entityType: entity,
      retryAttempts: maxRetries 
    });
    
    return { 
      success: false, 
      data: undefined, 
      error: {
        message: appError.message,
        operation: operationName,
        entity,
        attempts: maxRetries
      },
      attempts: maxRetries
    };
  },
  
  withTimeout: async <T>(
    operation: () => Promise<T>, 
    timeoutMs: number = 10000,
    operationName?: string, 
    entity?: string
  ) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    });
    
    try {
      const data = await Promise.race([operation(), timeoutPromise]);
      return { success: true, data, error: undefined };
    } catch (error) {
      const appError = errorHandler.handleError(error, { 
        action: operationName, 
        entityType: entity,
        timeout: timeoutMs 
      });
      
      return { 
        success: false, 
        data: undefined, 
        error: {
          message: appError.message,
          operation: operationName,
          entity,
          timeout: timeoutMs
        }
      };
    }
  },
  
  withValidation: async <T>(
    operation: () => Promise<T>,
    validator: (data: T) => boolean | Promise<boolean>,
    operationName?: string, 
    entity?: string
  ) => {
    try {
      const data = await operation();
      
      const isValid = await validator(data);
      if (!isValid) {
        throw new Error('Data validation failed');
      }
      
      return { success: true, data, error: undefined };
    } catch (error) {
      const appError = errorHandler.handleError(error, { 
        action: operationName, 
        entityType: entity 
      });
      
      return { 
        success: false, 
        data: undefined, 
        error: {
          message: appError.message,
          operation: operationName,
          entity
        }
      };
    }
  }
};

// Export missing functions that tests expect
export const createErrorResponse = (message: string, code?: string, details?: string) => ({
  success: false,
  error: {
    message,
    code: code || 'UNKNOWN_ERROR',
    details,
    timestamp: new Date().toISOString()
  }
});

export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  data
});

export const createValidationError = (message: string, code?: string, details?: string) => ({
  success: false,
  error: {
    message,
    code: code || 'VALIDATION_ERROR',
    details,
    timestamp: new Date().toISOString()
  }
});

export const createNotFoundError = (resource: string, id?: string) => ({
  success: false,
  error: {
    message: `${resource} with ID ${id} not found`,
    code: 'RECORD_NOT_FOUND',
    details: `Entity: ${resource}, ID: ${id}`,
    timestamp: new Date().toISOString()
  }
});

export const createUnauthorizedError = (message = 'Unauthorized', operation?: string) => ({
  success: false,
  error: {
    message: `Unauthorized to perform ${operation}`,
    code: 'AUTHENTICATION_ERROR',
    details: `Operation: ${operation}`,
    timestamp: new Date().toISOString()
  }
});

// Export constants
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'RECORD_NOT_FOUND',
  UNAUTHORIZED: 'AUTHENTICATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER: 'UNKNOWN_ERROR',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR'
} as const;

export const ErrorMessages = {
  VALIDATION_FAILED: 'Data validation failed',
  NOT_FOUND: 'The resource you\'re looking for doesn\'t exist',
  UNAUTHORIZED: 'You need to sign in to access this resource',
  NETWORK_ERROR: 'Network connection error',
  SERVER: 'Something went wrong on our end. Please try again later',
  FORBIDDEN: 'Access forbidden',
  CONFLICT: 'Resource conflict',
  RATE_LIMITED: 'Rate limit exceeded',
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
} as const;
