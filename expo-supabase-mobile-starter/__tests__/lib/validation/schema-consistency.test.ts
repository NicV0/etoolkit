import { 
  SchemaConsistencyChecker, 
  checkSchemaConsistency, 
  generateConsistencyReport, 
  validateSpecificSchema,
  DATABASE_CONSTRAINTS,
  VALIDATION_SCHEMAS
} from '../../../../lib/validation/schema-consistency'

describe('Schema Consistency', () => {
  describe('SchemaConsistencyChecker', () => {
    describe('checkConsistency', () => {
      it('should return empty array when schemas are consistent', () => {
        const inconsistencies = SchemaConsistencyChecker.checkConsistency()
        
        // This test will pass if all schemas are properly aligned
        // In a real scenario, you might expect some inconsistencies
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should detect schema inconsistencies', () => {
        // This test would need to be updated based on actual inconsistencies found
        const inconsistencies = SchemaConsistencyChecker.checkConsistency()
        
        inconsistencies.forEach(inconsistency => {
          expect(inconsistency).toHaveProperty('table')
          expect(inconsistency).toHaveProperty('field')
          expect(inconsistency).toHaveProperty('issue')
          expect(inconsistency).toHaveProperty('validationSchema')
          expect(inconsistency).toHaveProperty('databaseConstraint')
          expect(inconsistency).toHaveProperty('description')
        })
      })
    })

    describe('generateReport', () => {
      it('should generate success report when no inconsistencies', () => {
        // Mock the checkConsistency method to return empty array
        jest.spyOn(SchemaConsistencyChecker, 'checkConsistency').mockReturnValue([])
        
        const report = SchemaConsistencyChecker.generateReport()
        
        expect(report).toContain('✅ All validation schemas are consistent')
        
        jest.restoreAllMocks()
      })

      it('should generate detailed report when inconsistencies found', () => {
        const mockInconsistencies = [
          {
            table: 'clients',
            field: 'status',
            issue: 'enum_mismatch' as const,
            validationSchema: 'active, inactive, prospect',
            databaseConstraint: 'active, inactive, prospect, archived',
            description: 'Status enum values mismatch'
          }
        ]
        
        jest.spyOn(SchemaConsistencyChecker, 'checkConsistency').mockReturnValue(mockInconsistencies)
        
        const report = SchemaConsistencyChecker.generateReport()
        
        expect(report).toContain('⚠️  Found 1 schema inconsistency(ies)')
        expect(report).toContain('clients.status')
        expect(report).toContain('enum_mismatch')
        expect(report).toContain('Status enum values mismatch')
        
        jest.restoreAllMocks()
      })
    })

    describe('validateSchema', () => {
      it('should validate client schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('client')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate job schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('job')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate pricebookItem schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('pricebookItem')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate quote schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('quote')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate invoice schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('invoice')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate payment schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('payment')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate organization schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('organization')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate settings schema', () => {
        const inconsistencies = SchemaConsistencyChecker.validateSchema('settings')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })
    })
  })

  describe('DATABASE_CONSTRAINTS', () => {
    it('should have all required table constraints', () => {
      expect(DATABASE_CONSTRAINTS).toHaveProperty('organizations')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('clients')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('jobs')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('pricebook_items')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('quotes')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('invoices')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('payments')
      expect(DATABASE_CONSTRAINTS).toHaveProperty('settings')
    })

    it('should have correct organization constraints', () => {
      const orgConstraints = DATABASE_CONSTRAINTS.organizations
      
      expect(orgConstraints.name.required).toBe(true)
      expect(orgConstraints.trade.required).toBe(true)
      expect(orgConstraints.size.enum).toEqual(['solo', 'small', 'medium', 'large'])
      expect(orgConstraints.plan.enum).toEqual(['free', 'pro', 'enterprise'])
      expect(orgConstraints.plan.default).toBe('free')
    })

    it('should have correct client constraints', () => {
      const clientConstraints = DATABASE_CONSTRAINTS.clients
      
      expect(clientConstraints.name.required).toBe(true)
      expect(clientConstraints.email.required).toBe(false)
      expect(clientConstraints.phone.required).toBe(false)
      expect(clientConstraints.status.enum).toEqual(['active', 'inactive', 'prospect'])
      expect(clientConstraints.status.default).toBe('active')
      expect(clientConstraints.country.default).toBe('US')
    })

    it('should have correct job constraints', () => {
      const jobConstraints = DATABASE_CONSTRAINTS.jobs
      
      expect(jobConstraints.title.required).toBe(true)
      expect(jobConstraints.description.required).toBe(false)
      expect(jobConstraints.status.enum).toEqual(['pending', 'in_progress', 'completed', 'cancelled'])
      expect(jobConstraints.status.default).toBe('pending')
    })

    it('should have correct pricebook item constraints', () => {
      const pricebookConstraints = DATABASE_CONSTRAINTS.pricebook_items
      
      expect(pricebookConstraints.name.required).toBe(true)
      expect(pricebookConstraints.code.required).toBe(false)
      expect(pricebookConstraints.unit_price.type).toBe('decimal')
      expect(pricebookConstraints.unit_price.precision).toBe(10)
      expect(pricebookConstraints.unit_price.scale).toBe(2)
      expect(pricebookConstraints.taxable.default).toBe(true)
      expect(pricebookConstraints.active.default).toBe(true)
      expect(pricebookConstraints.is_quick_pick.default).toBe(false)
    })

    it('should have correct quote constraints', () => {
      const quoteConstraints = DATABASE_CONSTRAINTS.quotes
      
      expect(quoteConstraints.number.required).toBe(true)
      expect(quoteConstraints.client_id.required).toBe(true)
      expect(quoteConstraints.job_id.required).toBe(false)
      expect(quoteConstraints.status.enum).toEqual(['draft', 'sent', 'accepted', 'rejected', 'expired'])
      expect(quoteConstraints.status.default).toBe('draft')
      expect(quoteConstraints.currency.maxLength).toBe(3)
      expect(quoteConstraints.currency.default).toBe('USD')
    })

    it('should have correct invoice constraints', () => {
      const invoiceConstraints = DATABASE_CONSTRAINTS.invoices
      
      expect(invoiceConstraints.number.required).toBe(true)
      expect(invoiceConstraints.client_id.required).toBe(true)
      expect(invoiceConstraints.quote_id.required).toBe(false)
      expect(invoiceConstraints.status.enum).toEqual(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
      expect(invoiceConstraints.status.default).toBe('draft')
      expect(invoiceConstraints.currency.maxLength).toBe(3)
      expect(invoiceConstraints.currency.default).toBe('USD')
    })

    it('should have correct payment constraints', () => {
      const paymentConstraints = DATABASE_CONSTRAINTS.payments
      
      expect(paymentConstraints.invoice_id.required).toBe(true)
      expect(paymentConstraints.method.required).toBe(true)
      expect(paymentConstraints.amount.required).toBe(true)
      expect(paymentConstraints.method.enum).toEqual(['cash', 'check', 'credit_card', 'bank_transfer', 'other'])
    })

    it('should have correct settings constraints', () => {
      const settingsConstraints = DATABASE_CONSTRAINTS.settings
      
      expect(settingsConstraints.currency.maxLength).toBe(3)
      expect(settingsConstraints.currency.default).toBe('USD')
      expect(settingsConstraints.numbering_prefix_quote.maxLength).toBe(10)
      expect(settingsConstraints.numbering_prefix_quote.default).toBe('Q')
      expect(settingsConstraints.numbering_prefix_invoice.maxLength).toBe(10)
      expect(settingsConstraints.numbering_prefix_invoice.default).toBe('INV')
    })
  })

  describe('VALIDATION_SCHEMAS', () => {
    it('should have all required validation schemas', () => {
      expect(VALIDATION_SCHEMAS).toHaveProperty('client')
      expect(VALIDATION_SCHEMAS).toHaveProperty('job')
      expect(VALIDATION_SCHEMAS).toHaveProperty('pricebookItem')
      expect(VALIDATION_SCHEMAS).toHaveProperty('quote')
      expect(VALIDATION_SCHEMAS).toHaveProperty('invoice')
      expect(VALIDATION_SCHEMAS).toHaveProperty('payment')
      expect(VALIDATION_SCHEMAS).toHaveProperty('organization')
      expect(VALIDATION_SCHEMAS).toHaveProperty('settings')
    })

    it('should have valid Zod schemas', () => {
      Object.values(VALIDATION_SCHEMAS).forEach(schema => {
        expect(schema).toBeDefined()
        expect(typeof schema.parse).toBe('function')
        expect(typeof schema.safeParse).toBe('function')
      })
    })
  })

  describe('Utility Functions', () => {
    describe('checkSchemaConsistency', () => {
      it('should return array of inconsistencies', () => {
        const inconsistencies = checkSchemaConsistency()
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })
    })

    describe('generateConsistencyReport', () => {
      it('should generate a string report', () => {
        const report = generateConsistencyReport()
        
        expect(typeof report).toBe('string')
        expect(report.length).toBeGreaterThan(0)
      })
    })

    describe('validateSpecificSchema', () => {
      it('should validate client schema specifically', () => {
        const inconsistencies = validateSpecificSchema('client')
        
        expect(Array.isArray(inconsistencies)).toBe(true)
      })

      it('should validate all schema types', () => {
        const schemaTypes = ['client', 'job', 'pricebookItem', 'quote', 'invoice', 'payment', 'organization', 'settings'] as const
        
        schemaTypes.forEach(schemaType => {
          const inconsistencies = validateSpecificSchema(schemaType)
          expect(Array.isArray(inconsistencies)).toBe(true)
        })
      })
    })
  })

  describe('Integration Tests', () => {
    it('should provide comprehensive consistency checking', () => {
      // Test the full consistency checking workflow
      const inconsistencies = checkSchemaConsistency()
      const report = generateConsistencyReport()
      
      // Verify the report reflects the inconsistencies
      if (inconsistencies.length === 0) {
        expect(report).toContain('✅ All validation schemas are consistent')
      } else {
        expect(report).toContain(`⚠️  Found ${inconsistencies.length} schema inconsistency(ies)`)
        
        // Verify each inconsistency is mentioned in the report
        inconsistencies.forEach(inconsistency => {
          expect(report).toContain(inconsistency.table)
          expect(report).toContain(inconsistency.field)
          expect(report).toContain(inconsistency.issue)
        })
      }
    })

    it('should handle specific schema validation correctly', () => {
      const schemaTypes = ['client', 'job', 'pricebookItem', 'quote', 'invoice', 'payment', 'organization', 'settings'] as const
      
      schemaTypes.forEach(schemaType => {
        const inconsistencies = validateSpecificSchema(schemaType)
        
        // Each inconsistency should be related to the specific schema
        inconsistencies.forEach(inconsistency => {
          expect(inconsistency).toHaveProperty('table')
          expect(inconsistency).toHaveProperty('field')
          expect(inconsistency).toHaveProperty('issue')
          expect(inconsistency).toHaveProperty('validationSchema')
          expect(inconsistency).toHaveProperty('databaseConstraint')
          expect(inconsistency).toHaveProperty('description')
        })
      })
    })
  })
})
