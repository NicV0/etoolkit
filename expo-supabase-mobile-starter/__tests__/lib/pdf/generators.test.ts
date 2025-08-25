import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { PDFGenerator, PDFUtils } from '../../../lib/pdf/generators'
import { cleanMinimalTemplate } from '../../../lib/pdf/templates/clean-minimal'
import { modernProTemplate } from '../../../lib/pdf/templates/modern-pro'
import { ledgerProTemplate } from '../../../lib/pdf/templates/ledger-pro'

// Mock expo-print and expo-sharing
const mockPrintToFileAsync = jest.fn() as any
const mockShareAsync = jest.fn() as any
const mockUploadDocument = jest.fn() as any

mockPrintToFileAsync.mockResolvedValue({ uri: 'file://test.pdf' })
mockShareAsync.mockResolvedValue(undefined)
mockUploadDocument.mockResolvedValue('test/path/document.pdf')

jest.mock('expo-print', () => ({
  printToFileAsync: mockPrintToFileAsync
}))

jest.mock('expo-sharing', () => ({
  shareAsync: mockShareAsync
}))

jest.mock('../../../lib/storage', () => ({
  uploadDocument: mockUploadDocument
}))

describe('PDF Generation System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PDFGenerator', () => {
    it('should be a singleton', () => {
      const instance1 = PDFGenerator.getInstance()
      const instance2 = PDFGenerator.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should initialize with default templates', () => {
      const templates = PDFGenerator.getTemplates()
      expect(templates).toHaveLength(3)
      expect(templates.map(t => t.id)).toContain('clean-minimal')
      expect(templates.map(t => t.id)).toContain('modern-pro')
      expect(templates.map(t => t.id)).toContain('ledger-pro')
    })

    it('should add custom template', () => {
      const customTemplate = {
        id: 'custom-template',
        name: 'Custom Template',
        isPaid: false,
        variables: ['org_name'],
        content: '<html><body>{{org_name}}</body></html>'
      }

      PDFGenerator.addTemplate(customTemplate)
      const templates = PDFGenerator.getTemplates()
      expect(templates.find(t => t.id === 'custom-template')).toBeDefined()
    })

    it('should remove template', () => {
      const result = PDFGenerator.removeTemplate('custom-template')
      expect(result).toBe(true)
      
      const templates = PDFGenerator.getTemplates()
      expect(templates.find(t => t.id === 'custom-template')).toBeUndefined()
    })
  })

  describe('PDF Generation', () => {
    const mockPDFData = {
      org_name: 'Test Company',
      org_address: '123 Test St, Test City, TC 12345',
      org_phone: '555-0123',
      org_email: 'test@company.com',
      document_type: 'quote' as const,
      number: 'Q-001',
      date: '2024-01-15',
      due_date: '2024-02-15',
      client_name: 'Test Client',
      client_address: '456 Client Ave, Client City, CC 67890',
      client_phone: '555-0456',
      client_email: 'client@test.com',
      items: [
        {
          description: 'Test Item 1',
          quantity: 2,
          unit_price: 100.00,
          line_total: 200.00,
          taxable: true
        },
        {
          description: 'Test Item 2',
          quantity: 1,
          unit_price: 50.00,
          line_total: 50.00,
          taxable: false
        }
      ],
      subtotal: 250.00,
      tax_total: 17.50,
      discount_amt: 0,
      total: 267.50,
      terms: 'Net 30'
    }

    it('should generate PDF with default template', async () => {
      const uri = await PDFGenerator.generatePDF(mockPDFData)
      expect(uri).toBe('file://test.pdf')
    })

    it('should generate PDF with specific template', async () => {
      const uri = await PDFGenerator.generatePDF(mockPDFData, {
        template: modernProTemplate
      })
      expect(uri).toBe('file://test.pdf')
    })

    it('should generate PDF with upload to storage', async () => {
      const uri = await PDFGenerator.generatePDF(mockPDFData, {
        uploadToStorage: true
      })
      expect(uri).toBe('file://test.pdf')
    })

    it('should generate PDF with sharing', async () => {
      const uri = await PDFGenerator.generatePDF(mockPDFData, {
        shareAfterGeneration: true
      })
      expect(uri).toBe('file://test.pdf')
    })

    it('should handle invoice data correctly', async () => {
      const invoiceData = {
        ...mockPDFData,
        document_type: 'invoice' as const,
        number: 'INV-001',
        balance_due: 267.50
      }

      const uri = await PDFGenerator.generatePDF(invoiceData)
      expect(uri).toBe('file://test.pdf')
    })
  })

  describe('PDF Utils', () => {
    const mockQuoteData = {
      org_name: 'Test Company',
      org_address: '123 Test St',
      org_phone: '555-0123',
      org_email: 'test@company.com',
      document_type: 'quote' as const,
      number: 'Q-001',
      date: '2024-01-15',
      client_name: 'Test Client',
      client_address: '456 Client Ave',
      items: [
        {
          description: 'Test Item',
          quantity: 1,
          unit_price: 100.00,
          line_total: 100.00,
          taxable: true
        }
      ],
      subtotal: 100.00,
      tax_total: 7.00,
      discount_amt: 0,
      total: 107.00
    }

    const mockInvoiceData = {
      ...mockQuoteData,
      document_type: 'invoice' as const,
      number: 'INV-001',
      balance_due: 107.00
    }

    it('should generate quote PDF', async () => {
      const uri = await PDFUtils.generateQuotePDF(mockQuoteData)
      expect(uri).toBe('file://test.pdf')
    })

    it('should generate invoice PDF', async () => {
      const uri = await PDFUtils.generateInvoicePDF(mockInvoiceData)
      expect(uri).toBe('file://test.pdf')
    })

    it('should preview PDF', async () => {
      const html = '<html><body>Test</body></html>'
      const uri = await PDFUtils.previewPDF(html)
      expect(uri).toBe('file://test.pdf')
    })
  })

  describe('Template Rendering', () => {
    it('should render clean minimal template correctly', () => {
      const template = cleanMinimalTemplate
      expect(template.id).toBe('clean-minimal')
      expect(template.name).toBe('Clean Minimal')
      expect(template.isPaid).toBe(false)
      expect(template.variables).toContain('org_name')
      expect(template.content).toContain('<!DOCTYPE html>')
    })

    it('should render modern pro template correctly', () => {
      const template = modernProTemplate
      expect(template.id).toBe('modern-pro')
      expect(template.name).toBe('Modern Pro')
      expect(template.isPaid).toBe(true)
      expect(template.variables).toContain('org_name')
      expect(template.content).toContain('<!DOCTYPE html>')
    })

    it('should render ledger pro template correctly', () => {
      const template = ledgerProTemplate
      expect(template.id).toBe('ledger-pro')
      expect(template.name).toBe('Ledger Pro')
      expect(template.isPaid).toBe(true)
      expect(template.variables).toContain('org_name')
      expect(template.content).toContain('<!DOCTYPE html>')
    })
  })

  describe('Error Handling', () => {
    it('should handle PDF generation errors gracefully', async () => {
      // Mock expo-print to throw an error
      mockPrintToFileAsync.mockRejectedValueOnce(new Error('PDF generation failed'))

      const mockData = {
        org_name: 'Test Company',
        org_address: '123 Test St',
        org_phone: '555-0123',
        org_email: 'test@company.com',
        document_type: 'quote' as const,
        number: 'Q-001',
        date: '2024-01-15',
        client_name: 'Test Client',
        client_address: '456 Client Ave',
        items: [],
        subtotal: 0,
        tax_total: 0,
        discount_amt: 0,
        total: 0
      }

      await expect(PDFGenerator.generatePDF(mockData)).rejects.toThrow('PDF generation failed')
    })

    it('should handle missing required data', async () => {
      const incompleteData = {
        org_name: 'Test Company',
        // Missing required fields
        document_type: 'quote' as const,
        number: 'Q-001',
        date: '2024-01-15'
      }

      // This should still work as the template engine handles missing variables
      const uri = await PDFGenerator.generatePDF(incompleteData as any)
      expect(uri).toBe('file://test.pdf')
    })
  })

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData = {
        org_name: 'Test Company',
        org_address: '123 Test St',
        org_phone: '555-0123',
        org_email: 'test@company.com',
        document_type: 'quote' as const,
        number: 'Q-001',
        date: '2024-01-15',
        client_name: 'Test Client',
        client_address: '456 Client Ave',
        items: Array.from({ length: 100 }, (_, i) => ({
          description: `Item ${i + 1}`,
          quantity: 1,
          unit_price: 10.00,
          line_total: 10.00,
          taxable: true
        })),
        subtotal: 1000.00,
        tax_total: 70.00,
        discount_amt: 0,
        total: 1070.00
      }

      const startTime = Date.now()
      const uri = await PDFGenerator.generatePDF(largeData)
      const endTime = Date.now()

      expect(uri).toBe('file://test.pdf')
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})
