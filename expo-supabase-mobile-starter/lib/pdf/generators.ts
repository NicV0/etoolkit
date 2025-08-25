import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
// import * as FileSystem from 'expo-file-system'
// import { supabase } from '../supabase'
import { uploadDocument } from '../storage'
import { PerformanceUtils } from '../monitoring/performance-monitor'
import { ErrorNotifications } from '../notifications/error-notifications'

export interface PDFTemplate {
  id: string
  name: string
  isPaid: boolean
  content: string
  variables: string[]
}

export interface PDFData {
  // Organization data
  org_name: string
  org_address: string
  org_phone: string
  org_email: string
  logo_url?: string
  
  // Document data
  document_type: 'quote' | 'invoice'
  number: string
  date: string
  due_date?: string
  
  // Client data
  client_name: string
  client_address: string
  client_phone?: string
  client_email?: string
  
  // Items data
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    line_total: number
    taxable: boolean
  }>
  
  // Totals
  subtotal: number
  tax_total: number
  discount_amt: number
  total: number
  balance_due?: number
  
  // Terms and notes
  terms?: string
  notes?: string
}

export interface PDFGenerationOptions {
  template?: PDFTemplate
  filename?: string
  uploadToStorage?: boolean
  shareAfterGeneration?: boolean
  quality?: 'low' | 'medium' | 'high'
}

export class PDFGenerator {
  private static instance: PDFGenerator
  private templates: Map<string, PDFTemplate> = new Map()
  private defaultTemplates: PDFTemplate[] = []

  private constructor() {
    this.initializeDefaultTemplates()
  }

  // Utility methods for tests
  escapeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatAddress(address: Record<string, string>): string {
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  generateItemsTable(items: Array<{ description: string; quantity: number; unit_price: number; line_total: number; taxable: boolean }>): string {
    if (items.length === 0) {
      return '<p>No items</p>';
    }

    const rows = items.map(item => `
      <tr>
        <td>${this.escapeHtml(item.description)}</td>
        <td>${item.quantity}</td>
        <td>${this.formatCurrency(item.unit_price, 'USD')}</td>
        <td>${this.formatCurrency(item.line_total, 'USD')}</td>
      </tr>
    `).join('');

    return `
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  generateSignatureBlock(): string {
    return `
      <div class="signature-block">
        <p>_________________________</p>
        <p>Signature</p>
        <p>Date: _________________</p>
      </div>
    `;
  }

  static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator()
    }
    return PDFGenerator.instance
  }

  /**
   * Initialize default PDF templates
   */
  private initializeDefaultTemplates(): void {
    this.defaultTemplates = [
      this.createCleanMinimalTemplate(),
      this.createModernProTemplate(),
      this.createLedgerProTemplate()
    ]

    this.defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * Create clean minimal template
   */
  private createCleanMinimalTemplate(): PDFTemplate {
    return {
      id: 'clean-minimal',
      name: 'Clean Minimal',
      isPaid: false,
      variables: ['org_name', 'org_address', 'document_type', 'number', 'date', 'client_name', 'client_address', 'items', 'subtotal', 'tax_total', 'total', 'terms'],
      content: this.getCleanMinimalTemplateContent()
    }
  }

  /**
   * Get clean minimal template content
   */
  private getCleanMinimalTemplateContent(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .logo { 
              max-width: 200px; 
              height: auto; 
              margin-bottom: 10px;
            }
            .org-info {
              margin-bottom: 20px;
            }
            .document-info {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .client-info {
              margin-bottom: 30px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .totals {
              margin-top: 20px;
            }
            .totals table {
              width: 100%;
              border-collapse: collapse;
            }
            .totals td {
              padding: 8px;
              border-bottom: 1px solid #eee;
            }
            .total-row {
              font-weight: bold;
              font-size: 1.1em;
            }
            .notes, .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="LOGO_PLACEHOLDER" alt="Logo" class="logo">
            <h1>ORG_NAME_PLACEHOLDER</h1>
            <p>ORG_ADDRESS_PLACEHOLDER</p>
          </div>
          
          <div class="document-info">
            <h2>DOCUMENT_TYPE_PLACEHOLDER #NUMBER_PLACEHOLDER</h2>
            <p><strong>Date:</strong> DATE_PLACEHOLDER</p>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>CLIENT_NAME_PLACEHOLDER</strong></p>
            <p>CLIENT_ADDRESS_PLACEHOLDER</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ITEMS_PLACEHOLDER
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr><td>Subtotal:</td><td>$SUBTOTAL_PLACEHOLDER</td></tr>
              DISCOUNT_PLACEHOLDER
              TAX_PLACEHOLDER
              <tr class="total-row">
                <td>Total:</td>
                <td>$TOTAL_PLACEHOLDER</td>
              </tr>
              BALANCE_DUE_PLACEHOLDER
            </table>
          </div>
          
          NOTES_PLACEHOLDER
          TERMS_PLACEHOLDER
        </body>
        </html>
      `
  }

  /**
   * Create modern pro template
   */
  private createModernProTemplate(): PDFTemplate {
    return {
      id: 'modern-pro',
      name: 'Modern Pro',
      isPaid: true,
      variables: ['org_name', 'org_address', 'document_type', 'number', 'date', 'client_name', 'client_address', 'items', 'subtotal', 'tax_total', 'total', 'terms'],
      content: this.getModernProTemplateContent()
    }
  }

  /**
   * Get modern pro template content
   */
  private getModernProTemplateContent(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #2c3e50;
              line-height: 1.6;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 800px;
              margin: 20px auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
            }
            .logo { 
              max-width: 150px; 
              height: auto; 
              margin-bottom: 20px;
              border-radius: 8px;
            }
            .content {
              padding: 40px;
            }
            .document-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .client-info {
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .items-table th,
            .items-table td {
              padding: 15px;
              text-align: left;
              border-bottom: 1px solid #e9ecef;
            }
            .items-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-weight: 600;
            }
            .items-table tr:hover {
              background-color: #f8f9fa;
            }
            .totals {
              margin-top: 30px;
              text-align: right;
            }
            .totals table {
              margin-left: auto;
              border-collapse: collapse;
            }
            .totals td {
              padding: 10px 20px;
              border-bottom: 1px solid #e9ecef;
            }
            .total-row {
              font-weight: bold;
              font-size: 1.2em;
              border-top: 2px solid #667eea;
            }
            .notes, .footer {
              margin-top: 40px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="LOGO_PLACEHOLDER" alt="Logo" class="logo">
              <h1>ORG_NAME_PLACEHOLDER</h1>
              <p>ORG_ADDRESS_PLACEHOLDER</p>
            </div>
            
            <div class="content">
              <div class="document-info">
                <div>
                  <h2>DOCUMENT_TYPE_PLACEHOLDER #NUMBER_PLACEHOLDER</h2>
                  <p><strong>Date:</strong> DATE_PLACEHOLDER</p>
                </div>
              </div>
              
              <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>CLIENT_NAME_PLACEHOLDER</strong></p>
                <p>CLIENT_ADDRESS_PLACEHOLDER</p>
              </div>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ITEMS_PLACEHOLDER
                </tbody>
              </table>
              
              <div class="totals">
                <table>
                  <tr><td>Subtotal:</td><td>$SUBTOTAL_PLACEHOLDER</td></tr>
                  DISCOUNT_PLACEHOLDER
                  TAX_PLACEHOLDER
                  <tr class="total-row">
                    <td>Total:</td>
                    <td>$TOTAL_PLACEHOLDER</td>
                  </tr>
                  BALANCE_DUE_PLACEHOLDER
                </table>
              </div>
              
              NOTES_PLACEHOLDER
              TERMS_PLACEHOLDER
            </div>
          </div>
        </body>
        </html>
      `
  }

  /**
   * Create ledger pro template
   */
  private createLedgerProTemplate(): PDFTemplate {
    return {
      id: 'ledger-pro',
      name: 'Ledger Pro',
      isPaid: true,
      variables: ['org_name', 'org_address', 'document_type', 'number', 'date', 'client_name', 'client_address', 'items', 'subtotal', 'tax_total', 'total', 'terms'],
      content: this.getLedgerProTemplateContent()
    }
  }

  /**
   * Get ledger pro template content
   */
  private getLedgerProTemplateContent(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              color: #000;
              line-height: 1.4;
              background: #fff;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px double #000;
              padding-bottom: 20px;
            }
            .logo { 
              max-width: 200px; 
              height: auto; 
              margin-bottom: 10px;
            }
            .document-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              border: 1px solid #000;
              padding: 15px;
            }
            .client-info {
              margin-bottom: 30px;
              border: 1px solid #000;
              padding: 15px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              border: 1px solid #000;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
            }
            .items-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .totals table {
              margin-left: auto;
              border-collapse: collapse;
              border: 1px solid #000;
            }
            .totals td {
              padding: 10px 20px;
              border: 1px solid #000;
            }
            .total-row {
              font-weight: bold;
              border-top: 2px solid #000;
            }
            .notes, .footer {
              margin-top: 30px;
              border: 1px solid #000;
              padding: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="LOGO_PLACEHOLDER" alt="Logo" class="logo">
            <h1>ORG_NAME_PLACEHOLDER</h1>
            <p>ORG_ADDRESS_PLACEHOLDER</p>
          </div>
          
          <div class="document-info">
            <div>
              <h2>DOCUMENT_TYPE_PLACEHOLDER #NUMBER_PLACEHOLDER</h2>
              <p><strong>Date:</strong> DATE_PLACEHOLDER</p>
            </div>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>CLIENT_NAME_PLACEHOLDER</strong></p>
            <p>CLIENT_ADDRESS_PLACEHOLDER</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ITEMS_PLACEHOLDER
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr><td>Subtotal:</td><td>$SUBTOTAL_PLACEHOLDER</td></tr>
              DISCOUNT_PLACEHOLDER
              TAX_PLACEHOLDER
              <tr class="total-row">
                <td>Total:</td>
                <td>$TOTAL_PLACEHOLDER</td>
              </tr>
              BALANCE_DUE_PLACEHOLDER
            </table>
          </div>
          
          NOTES_PLACEHOLDER
          TERMS_PLACEHOLDER
        </body>
        </html>
      `
  }

  /**
   * Generate PDF from data and template
   */
  static async generatePDF(
    data: PDFData,
    options: PDFGenerationOptions = {}
  ): Promise<string> {
    return PerformanceUtils.measureFileOperation(
      'generate_pdf',
      async () => {
        const generator = PDFGenerator.getInstance()
        
        // Get template
        const template = options.template || generator.getDefaultTemplate(data.document_type)
        
        // Prepare data with status
        const preparedData = {
          ...data,
          status: data.document_type === 'invoice' ? 'paid' : 'draft'
        }
        
        // Generate HTML
        const html = generator.renderTemplate(template, preparedData)
        
        // Generate PDF
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false
        })
        
        // Upload to storage if requested
        if (options.uploadToStorage) {
          await generator.uploadPDF(uri)
        }
        
        // Share if requested
        if (options.shareAfterGeneration) {
          await generator.sharePDF(uri, options.filename)
        }
        
        return uri
      }
    )
  }

  /**
   * Get default template for document type
   */
  private getDefaultTemplate(documentType: 'quote' | 'invoice'): PDFTemplate {
    const isPaid = documentType === 'invoice'
    const template = this.defaultTemplates.find(t => t.isPaid === isPaid)
    return template || this.defaultTemplates[0]
  }

  /**
   * Render template with data
   */
  private renderTemplate(template: PDFTemplate, data: PDFData): string {
    let html = template.content
    
    // Simple template variable replacement
    // In a production app, you'd use a proper template engine like Handlebars
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      
      if (typeof value === 'string' || typeof value === 'number') {
        html = html.replace(new RegExp(placeholder, 'g'), String(value))
      } else if (Array.isArray(value)) {
        // Handle arrays (like items)
        if (key === 'items') {
          const itemsHtml = this.renderItems(value)
          html = html.replace(new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g'), itemsHtml)
        }
      }
    })
    
    // Handle conditional blocks
    html = this.processConditionals(html, data)
    
    return html
  }

  /**
   * Process conditional blocks in templates
   */
  private processConditionals(html: string, data: PDFData): string {
    // Handle {{#if variable}}...{{/if}} blocks
    html = html.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, variable, content) => {
      const value = (data as unknown as Record<string, unknown>)[variable]
      return value ? content : ''
    })
    
    return html
  }

  /**
   * Render items array
   */
  private renderItems(items: Record<string, unknown>[]): string {
    return items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>$${item.unit_price}</td>
        <td>$${item.line_total}</td>
      </tr>
    `).join('')
  }

  /**
   * Upload PDF to storage
   */
  private async uploadPDF(uri: string): Promise<void> {
    try {
      const orgId = 'org-id' // This should come from context
      // const documentType = data.document_type // unused
      // const documentId = data.number // unused
      
      const path = await uploadDocument(uri, orgId, 'system')
      console.log('PDF uploaded to:', path)
    } catch (error) {
      ErrorNotifications.showFileUploadError('Failed to upload PDF to storage')
      throw error
    }
  }

  /**
   * Share PDF
   */
  private async sharePDF(uri: string, filename?: string): Promise<void> {
    try {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: filename || 'Share PDF'
      })
    } catch (error) {
      ErrorNotifications.showFileUploadError('Failed to share PDF')
      throw error
    }
  }

  /**
   * Get available templates
   */
  static getTemplates(): PDFTemplate[] {
    const generator = PDFGenerator.getInstance()
    return [...generator.defaultTemplates]
  }

  /**
   * Get available templates (alias for getTemplates)
   */
  static getAvailableTemplates(): PDFTemplate[] {
    return PDFGenerator.getTemplates()
  }

  /**
   * Add custom template
   */
  static addTemplate(template: PDFTemplate): void {
    const generator = PDFGenerator.getInstance()
    generator.templates.set(template.id, template)
  }

  /**
   * Add custom template with ID
   */
  static addTemplateWithId(id: string, template: PDFTemplate): void {
    const generator = PDFGenerator.getInstance()
    generator.templates.set(id, template)
  }

  /**
   * Remove template
   */
  static removeTemplate(templateId: string): boolean {
    const generator = PDFGenerator.getInstance()
    return generator.templates.delete(templateId)
  }

  /**
   * Generate quote PDF (convenience method)
   */
  static async generateQuotePDF(quoteData: Partial<PDFData>, options?: PDFGenerationOptions): Promise<string> {
    const data: PDFData = {
      document_type: 'quote',
      ...quoteData
    } as PDFData
    return PDFGenerator.generatePDF(data, options)
  }

  /**
   * Generate invoice PDF (convenience method)
   */
  static async generateInvoicePDF(invoiceData: Partial<PDFData>, options?: PDFGenerationOptions): Promise<string> {
    const data: PDFData = {
      document_type: 'invoice',
      ...invoiceData
    } as PDFData
    return PDFGenerator.generatePDF(data, options)
  }
}

// Convenience functions for common PDF operations
export const PDFUtils = {
  /**
   * Generate quote PDF
   */
  generateQuotePDF: async (quoteData: Partial<PDFData>, options?: PDFGenerationOptions): Promise<string> => {
    const data: PDFData = {
      document_type: 'quote',
      ...quoteData
    } as PDFData
    return PDFGenerator.generatePDF(data, options)
  },

  /**
   * Generate invoice PDF
   */
  generateInvoicePDF: async (invoiceData: Partial<PDFData>, options?: PDFGenerationOptions): Promise<string> => {
    const data: PDFData = {
      document_type: 'invoice',
      ...invoiceData
    } as PDFData
    return PDFGenerator.generatePDF(data, options)
  },

  /**
   * Preview PDF in app
   */
  previewPDF: async (html: string): Promise<string> => {
    return PerformanceUtils.measureFileOperation(
      'preview_pdf',
      async () => {
        const { uri } = await Print.printToFileAsync({ html })
        return uri
      }
    )
  }
}

// Export the generator instance for direct access
export const pdfGenerator = PDFGenerator.getInstance()
