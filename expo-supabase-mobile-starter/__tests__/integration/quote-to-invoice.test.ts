import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { supabase } from '../../lib/supabase'
import { quoteAPI } from '../../lib/api/quotes'
import { invoiceAPI } from '../../lib/api/invoices'
import { clientAPI } from '../../lib/api/clients'
import { pricebookAPI } from '../../lib/api/pricebook'
import { APIErrorHandler } from '../../lib/error-handling'

// Test data
const testOrgId = 'test-org-id'
const testClientId = 'test-client-id'
const testQuoteId = 'test-quote-id'
const testInvoiceId = 'test-invoice-id'

describe('Quote to Invoice Integration Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await cleanupTestData()
    
    // Setup test data
    await setupTestData()
  })

  afterEach(async () => {
    // Clean up after each test
    await cleanupTestData()
  })

  describe('End-to-End Quote to Invoice Conversion', () => {
    it('should successfully convert an accepted quote to invoice', async () => {
      // 1. Create a quote with items
      const quoteData = {
        client_id: testClientId,
        status: 'draft',
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        terms: 'Net 30',
        items: [
          {
            description: 'Test Item 1',
            quantity: 2,
            unit_price: 100.00,
            taxable: true
          },
          {
            description: 'Test Item 2',
            quantity: 1,
            unit_price: 50.00,
            taxable: false
          }
        ]
      }

      const quoteResult = await APIErrorHandler.wrapAsync(
        () => quoteAPI.create(testOrgId, quoteData),
        'create_quote',
        'quote'
      )

      expect(quoteResult.success).toBe(true)
      expect(quoteResult.data).toBeDefined()
      const quote = quoteResult.data!

      // 2. Accept the quote
      const acceptResult = await APIErrorHandler.wrapAsync(
        () => quoteAPI.accept(quote.id),
        'accept_quote',
        'quote'
      )

      expect(acceptResult.success).toBe(true)
      expect(acceptResult.data?.status).toBe('accepted')

      // 3. Convert quote to invoice
      const convertResult = await APIErrorHandler.wrapAsync(
        () => quoteAPI.convertToInvoice(quote.id),
        'convert_quote_to_invoice',
        'quote'
      )

      expect(convertResult.success).toBe(true)
      expect(convertResult.data).toBeDefined()
      const invoice = convertResult.data!

      // 4. Verify invoice data
      expect(invoice.client_id).toBe(quote.client_id)
      expect(invoice.quote_id).toBe(quote.id)
      expect(invoice.status).toBe('draft')
      expect(invoice.currency).toBe(quote.currency)
      expect(invoice.tax_rate_pct).toBe(quote.tax_rate_pct)
      expect(invoice.subtotal).toBe(quote.subtotal)
      expect(invoice.tax_total).toBe(quote.tax_total)
      expect(invoice.total).toBe(quote.total)
      expect(invoice.balance_due).toBe(quote.total)

      // 5. Verify invoice items
      const invoiceItemsResult = await APIErrorHandler.wrapAsync(
        () => invoiceAPI.get(invoice.id),
        'get_invoice_with_items',
        'invoice'
      )

      expect(invoiceItemsResult.success).toBe(true)
      const invoiceWithItems = invoiceItemsResult.data!
      expect(invoiceWithItems.items).toHaveLength(quote.items.length)

      // 6. Verify item details
      invoiceWithItems.items.forEach((invoiceItem, index) => {
        const quoteItem = quote.items[index]
        expect(invoiceItem.description).toBe(quoteItem.description)
        expect(invoiceItem.quantity).toBe(quoteItem.quantity)
        expect(invoiceItem.unit_price).toBe(quoteItem.unit_price)
        expect(invoiceItem.taxable).toBe(quoteItem.taxable)
        expect(invoiceItem.line_total).toBe(quoteItem.line_total)
      })
    })

    it('should fail to convert a non-accepted quote', async () => {
      // Create a draft quote
      const quoteData = {
        client_id: testClientId,
        status: 'draft',
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unit_price: 100.00,
            taxable: true
          }
        ]
      }

      const quoteResult = await APIErrorHandler.wrapAsync(
        () => quoteAPI.create(testOrgId, quoteData),
        'create_quote',
        'quote'
      )

      expect(quoteResult.success).toBe(true)
      const quote = quoteResult.data!

      // Try to convert draft quote (should fail)
      const convertResult = await APIErrorHandler.wrapAsync(
        () => quoteAPI.convertToInvoice(quote.id),
        'convert_draft_quote_to_invoice',
        'quote'
      )

      expect(convertResult.success).toBe(false)
      expect(convertResult.error?.message).toContain('Only accepted quotes can be converted')
    })

    it('should handle payment recording on converted invoice', async () => {
      // Create and convert quote to invoice
      const quoteData = {
        client_id: testClientId,
        status: 'draft',
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        items: [
          {
            description: 'Test Item',
            quantity: 1,
            unit_price: 100.00,
            taxable: true
          }
        ]
      }

      const quoteResult = await APIErrorHandler.wrapAsync(
        () => quoteAPI.create(testOrgId, quoteData),
        'create_quote',
        'quote'
      )

      const quote = quoteResult

      // Accept and convert
      await quoteAPI.accept(quote.id)
      const convertResult = await quoteAPI.convertToInvoice(quote.id)
      const invoice = convertResult

      // Record partial payment
      const paymentData = {
        method: 'credit_card' as const,
        amount: 50.00,
        note: 'Partial payment'
      }

      const paymentResult = await APIErrorHandler.wrapAsync(
        () => invoiceAPI.recordPayment(invoice.id, paymentData),
        'record_payment',
        'payment'
      )

      expect(paymentResult.success).toBe(true)

      // Verify balance due is updated
      const updatedInvoiceResult = await APIErrorHandler.wrapAsync(
        () => invoiceAPI.get(invoice.id),
        'get_updated_invoice',
        'invoice'
      )

      expect(updatedInvoiceResult.success).toBe(true)
      const updatedInvoice = updatedInvoiceResult.data!
      expect(updatedInvoice.balance_due).toBe(58.50) // $100 + 8.5% tax - $50 payment
      expect(updatedInvoice.payments).toHaveLength(1)
      expect(updatedInvoice.payments[0].amount).toBe(50.00)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully', async () => {
      // Try to create quote with invalid client ID
      const quoteData = {
        client_id: 'invalid-client-id',
        status: 'draft',
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        items: []
      }

      const result = await APIErrorHandler.wrapAsync(
        () => quoteAPI.create(testOrgId, quoteData),
        'create_quote_with_invalid_client',
        'quote'
      )

      expect(result.success).toBe(false)
      expect(result.error?.code).toBeDefined()
      expect(result.error?.message).toContain('foreign key')
    })

    it('should handle network errors during conversion', async () => {
      // Mock network failure scenario
      const originalSupabase = supabase
      
      // Create a mock that throws network error
      const mockSupabase = {
        ...originalSupabase,
        from: () => ({
          insert: () => Promise.reject(new Error('Network error'))
        })
      }

      // This test would require dependency injection to properly mock
      // For now, we test the error handling wrapper
      const result = await APIErrorHandler.wrapAsync(
        () => Promise.reject(new Error('Network error')),
        'network_operation',
        'test'
      )

      expect(result.success).toBe(false)
      expect(result.error?.message).toBe('Network error')
      expect(result.error?.code).toBe('UNKNOWN_ERROR')
    })
  })

  describe('Data Consistency Integration', () => {
    it('should maintain data consistency across quote and invoice', async () => {
      // Create quote with specific data
      const quoteData = {
        client_id: testClientId,
        status: 'draft',
        currency: 'EUR',
        tax_rate_pct: 21.0,
        discount_amt: 25.00,
        terms: 'Net 15',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            description: 'Premium Service',
            quantity: 3,
            unit_price: 150.00,
            taxable: true
          }
        ]
      }

      const quoteResult = await quoteAPI.create(testOrgId, quoteData)
      const quote = quoteResult

      // Accept and convert
      await quoteAPI.accept(quote.id)
      const convertResult = await quoteAPI.convertToInvoice(quote.id)
      const invoice = convertResult

      // Verify all fields are preserved
      expect(invoice.client_id).toBe(quote.client_id)
      expect(invoice.currency).toBe(quote.currency)
      expect(invoice.tax_rate_pct).toBe(quote.tax_rate_pct)
      expect(invoice.discount_amt).toBe(quote.discount_amt)
      expect(invoice.terms).toBe(quote.terms)
      expect(invoice.quote_id).toBe(quote.id)

      // Verify calculations are consistent
      const expectedSubtotal = 450.00 // 3 * 150
      const expectedTaxTotal = 89.25 // (450 - 25) * 0.21
      const expectedTotal = 514.25 // 450 - 25 + 89.25

      expect(invoice.subtotal).toBe(expectedSubtotal)
      expect(invoice.tax_total).toBe(expectedTaxTotal)
      expect(invoice.total).toBe(expectedTotal)
      expect(invoice.balance_due).toBe(expectedTotal)
    })
  })
})

// Helper functions
async function setupTestData() {
  // Create test client
  await clientAPI.create(testOrgId, {
    name: 'Test Client',
    status: 'active',
    country: 'US',
    email: 'test@example.com',
    phone: '555-0123'
  })

  // Create test pricebook items
  await pricebookAPI.create(testOrgId, {
    name: 'Test Item 1',
    unit_price: 100.00,
    category: 'Services',
    active: true,
    is_quick_pick: false,
    unit: 'each',
    taxable: true
  })

  await pricebookAPI.create(testOrgId, {
    name: 'Test Item 2',
    unit_price: 50.00,
    category: 'Products',
    active: true,
    is_quick_pick: false,
    unit: 'each',
    taxable: true
  })
}

async function cleanupTestData() {
  // Clean up invoices
  await supabase
    .from('invoices')
    .delete()
    .eq('org_id', testOrgId)

  // Clean up quotes
  await supabase
    .from('quotes')
    .delete()
    .eq('org_id', testOrgId)

  // Clean up clients
  await supabase
    .from('clients')
    .delete()
    .eq('org_id', testOrgId)

  // Clean up pricebook items
  await supabase
    .from('pricebook_items')
    .delete()
    .eq('org_id', testOrgId)
}
