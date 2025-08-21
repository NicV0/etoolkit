import { 
  APIErrorHandler, 
  createErrorResponse, 
  createSuccessResponse, 
  createValidationError, 
  createNotFoundError, 
  createUnauthorizedError,
  ErrorCodes,
  ErrorMessages
} from '../../lib/error-handling'

describe('Error Handling', () => {
  describe('APIErrorHandler', () => {
    describe('handle', () => {
      it('should handle standard errors', () => {
        const error = new Error('Test error message')
        const result = APIErrorHandler.handle(error, 'test_operation', 'test_entity')
        
        expect(result.message).toBe('Test error message')
        expect(result.code).toBe('UNKNOWN_ERROR')
        expect(result.operation).toBe('test_operation')
        expect(result.entity).toBe('test_entity')
        expect(result.timestamp).toBeDefined()
      })

      it('should handle unknown errors', () => {
        const result = APIErrorHandler.handle('string error', 'test_operation')
        
        expect(result.message).toBe('An unexpected error occurred')
        expect(result.code).toBe('UNKNOWN_ERROR')
        expect(result.operation).toBe('test_operation')
      })

      it('should handle Supabase errors', () => {
        const supabaseError = {
          message: 'Database constraint violation',
          code: '23505',
          details: 'Key (email)=(test@example.com) already exists',
          hint: 'Consider using a different email address'
        }
        
        const result = APIErrorHandler.handle(supabaseError, 'create_user', 'users')
        
        expect(result.message).toBe('Database constraint violation')
        expect(result.code).toBe('23505')
        expect(result.details).toBe('Key (email)=(test@example.com) already exists')
        expect(result.status).toBe(400)
      })
    })

    describe('wrap', () => {
      it('should wrap successful operations', async () => {
        const operation = () => Promise.resolve('success')
        const result = await APIErrorHandler.wrap(operation, 'test_operation', 'test_entity')
        
        expect(result.success).toBe(true)
        expect(result.data).toBe('success')
        expect(result.error).toBeUndefined()
      })

      it('should wrap failed operations', async () => {
        const operation = () => Promise.reject(new Error('Operation failed'))
        const result = await APIErrorHandler.wrap(operation, 'test_operation', 'test_entity')
        
        expect(result.success).toBe(false)
        expect(result.data).toBeUndefined()
        expect(result.error).toBeDefined()
        expect(result.error?.message).toBe('Operation failed')
        expect(result.error?.operation).toBe('test_operation')
      })
    })

    describe('wrapAsync', () => {
      it('should wrap async operations successfully', async () => {
        const operation = async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'async success'
        }
        
        const result = await APIErrorHandler.wrapAsync(operation, 'async_operation', 'test_entity')
        
        expect(result.success).toBe(true)
        expect(result.data).toBe('async success')
      })

      it('should wrap async operations with errors', async () => {
        const operation = async () => {
          await new Promise(resolve => setTimeout(resolve, 10))
          throw new Error('Async operation failed')
        }
        
        const result = await APIErrorHandler.wrapAsync(operation, 'async_operation', 'test_entity')
        
        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Async operation failed')
      })
    })
  })

  describe('Response Helpers', () => {
    describe('createErrorResponse', () => {
      it('should create error response with default code', () => {
        const result = createErrorResponse('Test error message')
        
        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Test error message')
        expect(result.error?.code).toBe(ErrorCodes.BUSINESS_LOGIC_ERROR)
        expect(result.error?.timestamp).toBeDefined()
      })

      it('should create error response with custom code', () => {
        const result = createErrorResponse('Validation failed', ErrorCodes.VALIDATION_ERROR, 'Field required')
        
        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Validation failed')
        expect(result.error?.code).toBe(ErrorCodes.VALIDATION_ERROR)
        expect(result.error?.details).toBe('Field required')
      })
    })

    describe('createSuccessResponse', () => {
      it('should create success response', () => {
        const data = { id: '123', name: 'Test' }
        const result = createSuccessResponse(data)
        
        expect(result.success).toBe(true)
        expect(result.data).toEqual(data)
        expect(result.error).toBeUndefined()
      })
    })

    describe('createValidationError', () => {
      it('should create validation error', () => {
        const result = createValidationError('email', 'Invalid email format')
        
        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('email: Invalid email format')
        expect(result.error?.code).toBe(ErrorCodes.VALIDATION_ERROR)
        expect(result.error?.details).toBe('Field validation failed for: email')
      })
    })

    describe('createNotFoundError', () => {
      it('should create not found error', () => {
        const result = createNotFoundError('client', '123')
        
        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('client with ID 123 not found')
        expect(result.error?.code).toBe(ErrorCodes.NOT_FOUND)
        expect(result.error?.details).toBe('Entity: client, ID: 123')
      })
    })

    describe('createUnauthorizedError', () => {
      it('should create unauthorized error', () => {
        const result = createUnauthorizedError('delete_client')
        
        expect(result.success).toBe(false)
        expect(result.error?.message).toBe('Unauthorized to perform delete_client')
        expect(result.error?.code).toBe(ErrorCodes.UNAUTHORIZED)
        expect(result.error?.details).toBe('Operation: delete_client')
      })
    })
  })

  describe('Error Codes', () => {
    it('should have all required error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ErrorCodes.NOT_FOUND).toBe('NOT_FOUND')
      expect(ErrorCodes.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ErrorCodes.FORBIDDEN).toBe('FORBIDDEN')
      expect(ErrorCodes.CONFLICT).toBe('CONFLICT')
      expect(ErrorCodes.RATE_LIMITED).toBe('RATE_LIMITED')
      expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR')
      expect(ErrorCodes.STORAGE_ERROR).toBe('STORAGE_ERROR')
      expect(ErrorCodes.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(ErrorCodes.FILE_ERROR).toBe('FILE_ERROR')
      expect(ErrorCodes.BUSINESS_LOGIC_ERROR).toBe('BUSINESS_LOGIC_ERROR')
    })
  })

  describe('Error Messages', () => {
    it('should have all required error messages', () => {
      expect(ErrorMessages.VALIDATION_FAILED).toBe('Data validation failed')
      expect(ErrorMessages.NOT_FOUND).toBe('Resource not found')
      expect(ErrorMessages.UNAUTHORIZED).toBe('Unauthorized access')
      expect(ErrorMessages.FORBIDDEN).toBe('Access forbidden')
      expect(ErrorMessages.CONFLICT).toBe('Resource conflict')
      expect(ErrorMessages.RATE_LIMITED).toBe('Rate limit exceeded')
      expect(ErrorMessages.NETWORK_ERROR).toBe('Network connection error')
      expect(ErrorMessages.STORAGE_ERROR).toBe('File storage error')
      expect(ErrorMessages.DATABASE_ERROR).toBe('Database operation failed')
      expect(ErrorMessages.INVALID_INPUT).toBe('Invalid input provided')
      expect(ErrorMessages.MISSING_REQUIRED_FIELD).toBe('Required field is missing')
      expect(ErrorMessages.FILE_TOO_LARGE).toBe('File size exceeds limit')
      expect(ErrorMessages.UNSUPPORTED_FILE_TYPE).toBe('File type not supported')
      expect(ErrorMessages.QUOTE_CONVERSION_FAILED).toBe('Quote conversion to invoice failed')
      expect(ErrorMessages.PAYMENT_RECORDING_FAILED).toBe('Payment recording failed')
      expect(ErrorMessages.CSV_IMPORT_FAILED).toBe('CSV import failed')
      expect(ErrorMessages.PDF_GENERATION_FAILED).toBe('PDF generation failed')
    })
  })

  describe('Integration Tests', () => {
    it('should handle complex error scenarios', async () => {
      // Simulate a complex operation that might fail
      const complexOperation = async () => {
        // Simulate validation error
        if (Math.random() > 0.5) {
          throw new Error('Validation failed')
        }
        
        // Simulate database error
        if (Math.random() > 0.7) {
          const dbError = {
            message: 'Database connection failed',
            code: 'CONNECTION_ERROR',
            details: 'Connection timeout'
          }
          throw dbError
        }
        
        return 'success'
      }

      const results = await Promise.allSettled([
        APIErrorHandler.wrapAsync(complexOperation, 'complex_operation', 'test_entity'),
        APIErrorHandler.wrapAsync(complexOperation, 'complex_operation', 'test_entity'),
        APIErrorHandler.wrapAsync(complexOperation, 'complex_operation', 'test_entity')
      ])

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          expect(result.value).toHaveProperty('success')
          expect(result.value).toHaveProperty('error')
          if (result.value.success) {
            expect(result.value.data).toBe('success')
          } else {
            expect(result.value.error).toBeDefined()
            expect(result.value.error?.operation).toBe('complex_operation')
            expect(result.value.error?.entity).toBe('test_entity')
          }
        }
      })
    })

    it('should handle error chaining', () => {
      const originalError = new Error('Original error')
      const wrappedError = APIErrorHandler.handle(originalError, 'wrapped_operation')
      
      expect(wrappedError.message).toBe('Original error')
      expect(wrappedError.operation).toBe('wrapped_operation')
      
      const errorResponse = createErrorResponse(wrappedError.message, wrappedError.code, wrappedError.details)
      expect(errorResponse.error?.message).toBe('Original error')
    })
  })
})
