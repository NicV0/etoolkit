import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ 
          data: {
            id: 'test-invoice-id',
            org_id: 'test-org-id',
            number: 'INV-001',
            client_id: 'test-client-id',
            quote_id: 'test-quote-id',
            status: 'draft',
            currency: 'USD',
            tax_rate_pct: 8.5,
            discount_amt: 0,
            subtotal: 200,
            tax_total: 17,
            total: 217,
            balance_due: 217,
            items: []
          }, 
          error: null 
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-quote-id', status: 'expired' }, 
            error: null 
          }))
        }))
      }))
    }))
  }))
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Import after mocking
import { quoteAPI } from '../../lib/api/quotes';
import { APIErrorHandler } from '../../lib/error-handling';

describe('Quote to Invoice Conversion - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertToInvoice', () => {
    it('should successfully convert an accepted quote to invoice', async () => {
      // Mock the quote data
      const mockQuote = {
        id: 'test-quote-id',
        org_id: 'test-org-id',
        number: 'Q-001',
        client_id: 'test-client-id',
        status: 'accepted' as const,
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        subtotal: 200,
        tax_total: 17,
        total: 217,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: { id: 'test-client-id', name: 'Test Client', email: 'test@example.com' },
        items: [
          {
            id: 'item-1',
            description: 'Test Item 1',
            quantity: 2,
            unit_price: 100,
            taxable: true,
            line_total: 200
          }
        ]
      };

      // Mock quoteAPI.get to return our mock quote
      jest.spyOn(quoteAPI, 'get').mockResolvedValue(mockQuote);

      // Test the conversion
      const result = await quoteAPI.convertToInvoice('test-quote-id');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.client_id).toBe(mockQuote.client_id);
      expect(result.quote_id).toBe(mockQuote.id);
      expect(result.status).toBe('draft');
      expect(result.currency).toBe(mockQuote.currency);
      expect(result.total).toBe(mockQuote.total);

      // Verify supabase calls were made
      expect(mockSupabase.from).toHaveBeenCalledWith('quotes');
      expect(mockSupabase.from).toHaveBeenCalledWith('invoices');
    });

    it('should fail to convert a non-accepted quote', async () => {
      // Mock a non-accepted quote
      const mockQuote = {
        id: 'test-quote-id',
        org_id: 'test-org-id',
        number: 'Q-001',
        client_id: 'test-client-id',
        status: 'draft' as const,
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        subtotal: 200,
        tax_total: 17,
        total: 217,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: { id: 'test-client-id', name: 'Test Client', email: 'test@example.com' },
        items: []
      };

      jest.spyOn(quoteAPI, 'get').mockResolvedValue(mockQuote);

      // Test the conversion - should throw an error
      await expect(quoteAPI.convertToInvoice('test-quote-id')).rejects.toThrow(
        'Only accepted quotes can be converted to invoices'
      );
    });

    it('should fail if invoice already exists for quote', async () => {
      // Mock an accepted quote
      const mockQuote = {
        id: 'test-quote-id',
        org_id: 'test-org-id',
        number: 'Q-001',
        client_id: 'test-client-id',
        status: 'accepted' as const,
        currency: 'USD',
        tax_rate_pct: 8.5,
        discount_amt: 0,
        subtotal: 200,
        tax_total: 17,
        total: 217,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: { id: 'test-client-id', name: 'Test Client', email: 'test@example.com' },
        items: []
      };

      jest.spyOn(quoteAPI, 'get').mockResolvedValue(mockQuote);

      // Mock that an invoice already exists
      const originalFrom = mockSupabase.from;
      (mockSupabase.from as any) = jest.fn().mockImplementation((table: string) => {
        if (table === 'invoices') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ 
                  data: { id: 'existing-invoice-id' }, 
                  error: null 
                }))
              }))
            }))
          };
        }
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          })),
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ 
                data: {
                  id: 'test-invoice-id',
                  org_id: 'test-org-id',
                  number: 'INV-001',
                  client_id: 'test-client-id',
                  quote_id: 'test-quote-id',
                  status: 'draft',
                  currency: 'USD',
                  tax_rate_pct: 8.5,
                  discount_amt: 0,
                  subtotal: 200,
                  tax_total: 17,
                  total: 217,
                  balance_due: 217,
                  items: []
                }, 
                error: null 
              }))
            }))
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ 
                  data: { id: 'test-quote-id', status: 'expired' }, 
                  error: null 
                }))
              }))
            }))
          }))
        };
      });

      // Test the conversion - should throw an error
      await expect(quoteAPI.convertToInvoice('test-quote-id')).rejects.toThrow(
        'Invoice already exists for this quote'
      );
    });
  });

  describe('APIErrorHandler', () => {
    it('should handle successful operations', async () => {
      const mockOperation = jest.fn<() => Promise<string>>().mockResolvedValue('success');
      
      const result = await APIErrorHandler.wrapAsync(
        mockOperation,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.error).toBeUndefined();
    });

    it('should handle failed operations', async () => {
      const mockError = new Error('Test error');
      const mockOperation = jest.fn<() => Promise<never>>().mockRejectedValue(mockError);

      const result = await APIErrorHandler.wrapAsync(
        mockOperation,
        'test_operation',
        'test_entity'
      );

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });
});
