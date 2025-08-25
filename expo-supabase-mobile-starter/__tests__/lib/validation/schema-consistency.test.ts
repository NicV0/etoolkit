import { describe, it, expect } from '@jest/globals'
import { 
  validateClientReference,
  validateQuoteToInvoice,
  validatePaymentToInvoice,
  validatePricebookConsistency,
  validateJobConsistency,
  validateOrganizationSettings,
  validateAllSchemas,
  formatValidationResults,
  isValid,
  hasErrors,
  hasWarnings,
  type SchemaValidationResult,
  type CrossSchemaValidationContext
} from '../../../lib/validation/schema-consistency'

describe('Schema Validation Functions', () => {
  const mockContext: CrossSchemaValidationContext = {
    orgId: 'test-org-id',
    userId: 'test-user-id',
    timestamp: new Date().toISOString()
  }

  describe('validateClientReference', () => {
    it('should validate valid client ID', () => {
      const result = validateClientReference('123e4567-e89b-12d3-a456-426614174000', mockContext)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid client ID', () => {
      const result = validateClientReference('invalid-uuid', mockContext)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Client ID must be a valid UUID')
    })

    it('should reject empty client ID', () => {
      const result = validateClientReference('', mockContext)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Client ID is required')
    })
  })

  describe('validateQuoteToInvoice', () => {
    it('should validate accepted quote', () => {
      const quoteData = {
        status: 'accepted',
        items: [{ description: 'Test item', quantity: 1, unit_price: 100 }],
        client_id: '123e4567-e89b-12d3-a456-426614174000'
      }
      const result = validateQuoteToInvoice(quoteData, mockContext)
      expect(result.isValid).toBe(true)
    })

    it('should reject non-accepted quote', () => {
      const quoteData = {
        status: 'draft',
        items: [{ description: 'Test item', quantity: 1, unit_price: 100 }],
        client_id: '123e4567-e89b-12d3-a456-426614174000'
      }
      const result = validateQuoteToInvoice(quoteData, mockContext)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Can only create invoice from accepted quotes')
    })
  })

  describe('validateAllSchemas', () => {
    it('should validate all schemas', () => {
      const data = {
        clients: '123e4567-e89b-12d3-a456-426614174000',
        quotes: {
          status: 'accepted',
          items: [{ description: 'Test item', quantity: 1, unit_price: 100 }],
          client_id: '123e4567-e89b-12d3-a456-426614174000'
        }
      }
      const results = validateAllSchemas(data, mockContext)
      expect(typeof results).toBe('object')
      expect(results.clients).toBeDefined()
      expect(results.quotes).toBeDefined()
    })
  })

  describe('formatValidationResults', () => {
    it('should format results correctly', () => {
      const results: Record<string, SchemaValidationResult> = {
        test: {
          isValid: true,
          errors: [],
          warnings: []
        }
      }
      const formatted = formatValidationResults(results)
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('TEST')
      expect(formatted).toContain('✅ Valid')
    })
  })

  describe('Utility functions', () => {
    it('should check if result is valid', () => {
      const validResult: SchemaValidationResult = { isValid: true, errors: [], warnings: [] }
      const invalidResult: SchemaValidationResult = { isValid: false, errors: ['error'], warnings: [] }
      
      expect(isValid(validResult)).toBe(true)
      expect(isValid(invalidResult)).toBe(false)
    })

    it('should check for errors', () => {
      const resultWithErrors: SchemaValidationResult = { isValid: false, errors: ['error'], warnings: [] }
      const resultWithoutErrors: SchemaValidationResult = { isValid: true, errors: [], warnings: [] }
      
      expect(hasErrors(resultWithErrors)).toBe(true)
      expect(hasErrors(resultWithoutErrors)).toBe(false)
    })

    it('should check for warnings', () => {
      const resultWithWarnings: SchemaValidationResult = { isValid: true, errors: [], warnings: ['warning'] }
      const resultWithoutWarnings: SchemaValidationResult = { isValid: true, errors: [], warnings: [] }
      
      expect(hasWarnings(resultWithWarnings)).toBe(true)
      expect(hasWarnings(resultWithoutWarnings)).toBe(false)
    })
  })
})
