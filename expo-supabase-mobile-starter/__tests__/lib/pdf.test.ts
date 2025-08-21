import { PDFGenerator, PDFTemplate, PDFGenerationOptions } from '../../lib/pdf/generators';
import { cleanMinimalTemplate, modernProTemplate, ledgerProTemplate } from '../../lib/pdf/templates';

// Mock expo-print
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file://test.pdf' })
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  deleteAsync: jest.fn().mockResolvedValue(undefined)
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined)
}));

// Mock supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'test/path.pdf' }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://test.com/logo.png' } })
      })
    }
  }
}));

describe('PDF Generation System', () => {
  let pdfGenerator: PDFGenerator;
  let mockQuote: any;
  let mockInvoice: any;
  let mockClient: any;
  let mockOrganization: any;

  beforeEach(() => {
    pdfGenerator = PDFGenerator.getInstance();
    
    mockQuote = {
      id: 'quote-123',
      number: 'Q-2024-001',
      status: 'draft',
      subtotal: 1000,
      tax_total: 100,
      discount_amt: 50,
      total: 1050,
      created_at: '2024-01-15T10:00:00Z',
      valid_until: '2024-02-15T10:00:00Z',
      terms: 'Net 30 days',
      items: [
        {
          description: 'Test Item 1',
          quantity: 2,
          unitPrice: 500,
          lineTotal: 1000,
          taxable: true
        }
      ]
    };

    mockInvoice = {
      id: 'invoice-123',
      number: 'INV-2024-001',
      status: 'sent',
      subtotal: 1000,
      tax_total: 100,
      discount_amt: 50,
      total: 1050,
      balance_due: 1050,
      issue_date: '2024-01-15T10:00:00Z',
      due_date: '2024-02-15T10:00:00Z',
      terms: 'Net 30 days',
      items: [
        {
          description: 'Test Item 1',
          quantity: 2,
          unitPrice: 500,
          lineTotal: 1000,
          taxable: true
        }
      ]
    };

    mockClient = {
      id: 'client-123',
      name: 'Test Client',
      company: 'Test Company',
      email: 'test@example.com',
      phone: '555-1234',
      address_line1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      postal: '12345'
    };

    mockOrganization = {
      id: 'org-123',
      name: 'Test Organization',
      legal_name: 'Test Organization LLC',
      currency: 'USD',
      logo_url: 'logos/test-logo.png',
      address_json: {
        address_line1: '456 Org St',
        city: 'Org City',
        state: 'OS',
        postal: '67890'
      },
      phone: '555-5678',
      email: 'org@example.com',
      website: 'https://testorg.com'
    };
  });

  describe('PDFGenerator', () => {
    test('should be a singleton', () => {
      const instance1 = PDFGenerator.getInstance();
      const instance2 = PDFGenerator.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should initialize with default templates', () => {
      const templates = PDFGenerator.getAvailableTemplates();
      expect(templates).toHaveLength(3);
      expect(templates.map((t: any) => t.name)).toContain('Clean Minimal');
      expect(templates.map((t: any) => t.name)).toContain('Modern Pro');
      expect(templates.map((t: any) => t.name)).toContain('Ledger Pro');
    });

    test('should add custom template', () => {
      const customTemplate: PDFTemplate = {
        id: 'custom',
        name: 'Custom Template',
        isPaid: false,
        content: '<html><body>Custom content</body></html>',
        variables: []
      };

      PDFGenerator.addTemplateWithId('custom', customTemplate);
      const templates = PDFGenerator.getAvailableTemplates();
      expect(templates.map((t: any) => t.name)).toContain('Custom Template');
    });
  });

  describe('Quote PDF Generation', () => {
    test('should generate quote PDF successfully', async () => {
      const result = await PDFGenerator.generateQuotePDF(
        mockQuote
      );

      expect(result).toBe('test/path.pdf');
    });

    test('should generate quote PDF with custom options', async () => {
      const options: PDFGenerationOptions = {
        quality: 'high'
      };

      const result = await PDFGenerator.generateQuotePDF(
        mockQuote,
        options
      );

      expect(result).toBe('test/path.pdf');
    });

    test('should handle missing optional fields', async () => {
      const minimalQuote = {
        ...mockQuote,
        terms: undefined,
        valid_until: undefined
      };

      const result = await PDFGenerator.generateQuotePDF(
        minimalQuote
      );

      expect(result).toBe('test/path.pdf');
    });
  });

  describe('Invoice PDF Generation', () => {
    test('should generate invoice PDF successfully', async () => {
      const result = await PDFGenerator.generateInvoicePDF(
        mockInvoice
      );

      expect(result).toBe('test/path.pdf');
    });

    test('should generate invoice PDF with balance due', async () => {
      const invoiceWithBalance = {
        ...mockInvoice,
        balance_due: 500
      };

      const result = await PDFGenerator.generateInvoicePDF(
        invoiceWithBalance
      );

      expect(result).toBe('test/path.pdf');
    });
  });

  describe('HTML Generation', () => {
    test('should escape HTML properly', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const escaped = (pdfGenerator as any).escapeHtml(maliciousInput);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });

    test('should format currency correctly', () => {
      const formatted = (pdfGenerator as any).formatCurrency(1234.56, 'USD');
      expect(formatted).toMatch(/\$1,234\.56/);
    });

    test('should format date correctly', () => {
      const date = '2024-01-15T10:00:00Z';
      const formatted = (pdfGenerator as any).formatDate(date);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    test('should format address correctly', () => {
      const address = {
        address_line1: '123 Test St',
        address_line2: 'Suite 100',
        city: 'Test City',
        state: 'TS',
        postal: '12345',
        country: 'USA'
      };

      const formatted = (pdfGenerator as any).formatAddress(address);
      expect(formatted).toContain('123 Test St');
      expect(formatted).toContain('Test City');
    });
  });

  describe('Items Table Generation', () => {
    test('should generate items table with items', () => {
      const items = [
        {
          description: 'Item 1',
          quantity: 2,
          unitPrice: 100,
          lineTotal: 200,
          taxable: true
        },
        {
          description: 'Item 2',
          quantity: 1,
          unitPrice: 50,
          lineTotal: 50,
          taxable: false
        }
      ];

      const tableHtml = (pdfGenerator as any).generateItemsTable(items);
      expect(tableHtml).toContain('Item 1');
      expect(tableHtml).toContain('Item 2');
      expect(tableHtml).toContain('2');
      expect(tableHtml).toContain('100');
    });

    test('should handle empty items array', () => {
      const tableHtml = (pdfGenerator as any).generateItemsTable([]);
      expect(tableHtml).toContain('No items');
    });
  });

  describe('Signature Block Generation', () => {
    test('should generate signature block', () => {
      const signatureHtml = (pdfGenerator as any).generateSignatureBlock();
      expect(signatureHtml).toContain('Client Signature');
      expect(signatureHtml).toContain('Date');
      expect(signatureHtml).toContain('border-b');
    });
  });

  describe('Error Handling', () => {
    test('should handle PDF generation errors', async () => {
      const { printToFileAsync } = require('expo-print');
      printToFileAsync.mockRejectedValueOnce(new Error('PDF generation failed'));

      await expect(
        pdfGenerator.generateQuotePDF(mockQuote, mockClient, mockOrganization)
      ).rejects.toThrow('Failed to generate PDF');
    });

    test('should handle file upload errors', async () => {
      const { supabase } = require('../../lib/supabase');
      supabase.storage.from().upload.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        pdfGenerator.generateQuotePDF(mockQuote, mockClient, mockOrganization)
      ).rejects.toThrow('Failed to upload PDF');
    });

    test('should handle missing logo gracefully', async () => {
      const { supabase } = require('../../lib/supabase');
      supabase.storage.from().createSignedUrl.mockRejectedValueOnce(new Error('Logo not found'));

      const options: PDFGenerationOptions = {
        includeLogo: true
      };

      // Should not throw error, just continue without logo
      const result = await pdfGenerator.generateQuotePDF(
        mockQuote,
        mockClient,
        mockOrganization,
        options
      );

      expect(result).toBe('test/path.pdf');
    });
  });

  describe('Template System', () => {
    test('should use default template when none specified', async () => {
      const result = await pdfGenerator.generateQuotePDF(
        mockQuote,
        mockClient,
        mockOrganization
      );

      expect(result).toBe('test/path.pdf');
    });

    test('should use specified template', async () => {
      const options: PDFGenerationOptions = {
        template: modernProTemplate
      };

      const result = await pdfGenerator.generateQuotePDF(
        mockQuote,
        mockClient,
        mockOrganization,
        options
      );

      expect(result).toBe('test/path.pdf');
    });
  });

  describe('File Management', () => {
    test('should clean up local files after upload', async () => {
      const { deleteAsync } = require('expo-file-system');
      
      await pdfGenerator.generateQuotePDF(mockQuote, mockClient, mockOrganization);
      
      expect(deleteAsync).toHaveBeenCalledWith('file://test.pdf', { idempotent: true });
    });

    test('should handle file cleanup errors gracefully', async () => {
      const { deleteAsync } = require('expo-file-system');
      deleteAsync.mockRejectedValueOnce(new Error('Delete failed'));

      // Should not throw error, just log it
      const result = await pdfGenerator.generateQuotePDF(mockQuote, mockClient, mockOrganization);
      expect(result).toBe('test/path.pdf');
    });
  });

  describe('Sharing Functionality', () => {
    test('should share PDF successfully', async () => {
      const { shareAsync } = require('expo-sharing');
      
      await pdfGenerator.sharePDF('file://test.pdf', 'test.pdf');
      
      expect(shareAsync).toHaveBeenCalledWith('file://test.pdf', {
        mimeType: 'application/pdf',
        dialogTitle: 'test.pdf'
      });
    });

    test('should handle sharing when not available', async () => {
      const { isAvailableAsync } = require('expo-sharing');
      isAvailableAsync.mockResolvedValueOnce(false);

      // Should not throw error when sharing is not available
      await expect(
        pdfGenerator.sharePDF('file://test.pdf', 'test.pdf')
      ).resolves.toBeUndefined();
    });
  });
});
