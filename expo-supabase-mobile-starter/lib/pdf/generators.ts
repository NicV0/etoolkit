import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../supabase'
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
      content: /* eslint-disable @typescript-eslint/no-unused-vars */
        `
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
              border-bottom: 2px solid #333;
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
            }
            .client-info {
              margin-bottom: 30px;
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
            }
            .invoice-table th, .invoice-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left; 
            }
            .invoice-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .totals { 
              margin-top: 20px; 
              text-align: right; 
              font-size: 16px;
            }
            .totals table {
              margin-left: auto;
              border-collapse: collapse;
            }
            .totals td {
              padding: 8px 16px;
              border-bottom: 1px solid #ddd;
            }
            .totals .total-row {
              font-weight: bold;
              font-size: 18px;
              border-top: 2px solid #333;
            }
            .footer { 
              margin-top: 40px; 
              font-size: 12px; 
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status.draft { background-color: #f0f0f0; color: #666; }
            .status.sent { background-color: #e3f2fd; color: #1976d2; }
            .status.accepted { background-color: #e8f5e8; color: #388e3c; }
            .status.paid { background-color: #e8f5e8; color: #388e3c; }
          </style>
        </head>
        <body>
          <div class="header">
            {{#if logo_url}}
            <img src="{{logo_url}}" alt="Company Logo" class="logo">
            {{/if}}
            <h1>{{org_name}}</h1>
            <p>{{org_address}}</p>
            {{#if org_phone}}<p>Phone: {{org_phone}}</p>{{/if}}
            {{#if org_email}}<p>Email: {{org_email}}</p>{{/if}}
          </div>
          
          <div class="document-info">
            <div>
              <h2>{{document_type}} #{{number}}</h2>
              <p><strong>Date:</strong> {{date}}</p>
              {{#if due_date}}<p><strong>Due Date:</strong> {{due_date}}</p>{{/if}}
            </div>
            <div>
              <span class="status {{status}}">{{status}}</span>
            </div>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>{{client_name}}</strong></p>
            <p>{{client_address}}</p>
            {{#if client_phone}}<p>Phone: {{client_phone}}</p>{{/if}}
            {{#if client_email}}<p>Email: {{client_email}}</p>{{/if}}
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {{#items}}
              <tr>
                <td>{{description}}</td>
                <td>{{quantity}}</td>
                <td>${{unit_price}}</td>
                <td>${{line_total}}</td>
              </tr>
              {{/items}}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr><td>Subtotal:</td><td>${{subtotal}}</td></tr>
              {{#if discount_amt}}
              <tr><td>Discount:</td><td>-${{discount_amt}}</td></tr>
              {{/if}}
              {{#if tax_total}}
              <tr><td>Tax:</td><td>${{tax_total}}</td></tr>
              {{/if}}
              <tr class="total-row">
                <td>Total:</td>
                <td>${{total}}</td>
              </tr>
              {{#if balance_due}}
              <tr class="total-row">
                <td>Balance Due:</td>
                <td>${{balance_due}}</td>
              </tr>
              {{/if}}
            </table>
          </div>
          
          {{#if notes}}
          <div class="notes">
            <h3>Notes:</h3>
            <p>{{notes}}</p>
          </div>
          {{/if}}
          
          {{#if terms}}
          <div class="footer">
            <h3>Terms & Conditions:</h3>
            <p>{{terms}}</p>
          </div>
          {{/if}}
        </body>
        </html>
      ` /* eslint-enable @typescript-eslint/no-unused-vars */
    }
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
      content: /* eslint-disable @typescript-eslint/no-unused-vars */
        `
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
              margin-bottom: 40px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .client-info {
              margin-bottom: 40px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 40px;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .invoice-table th, .invoice-table td { 
              padding: 15px; 
              text-align: left; 
            }
            .invoice-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              font-weight: 600;
            }
            .invoice-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .totals { 
              margin-top: 30px; 
              text-align: right; 
              font-size: 16px;
            }
            .totals table {
              margin-left: auto;
              border-collapse: collapse;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .totals td {
              padding: 12px 20px;
              background: white;
            }
            .totals .total-row {
              font-weight: bold;
              font-size: 18px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .footer { 
              margin-top: 40px; 
              font-size: 12px; 
              color: #666;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .status {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status.draft { background-color: #f0f0f0; color: #666; }
            .status.sent { background-color: #e3f2fd; color: #1976d2; }
            .status.accepted { background-color: #e8f5e8; color: #388e3c; }
            .status.paid { background-color: #e8f5e8; color: #388e3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              {{#if logo_url}}
              <img src="{{logo_url}}" alt="Company Logo" class="logo">
              {{/if}}
              <h1>{{org_name}}</h1>
              <p>{{org_address}}</p>
              {{#if org_phone}}<p>Phone: {{org_phone}}</p>{{/if}}
              {{#if org_email}}<p>Email: {{org_email}}</p>{{/if}}
            </div>
            
            <div class="content">
              <div class="document-info">
                <div>
                  <h2>{{document_type}} #{{number}}</h2>
                  <p><strong>Date:</strong> {{date}}</p>
                  {{#if due_date}}<p><strong>Due Date:</strong> {{due_date}}</p>{{/if}}
                </div>
                <div>
                  <span class="status {{status}}">{{status}}</span>
                </div>
              </div>
              
              <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>{{client_name}}</strong></p>
                <p>{{client_address}}</p>
                {{#if client_phone}}<p>Phone: {{client_phone}}</p>{{/if}}
                {{#if client_email}}<p>Email: {{client_email}}</p>{{/if}}
              </div>
              
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {{#items}}
                  <tr>
                    <td>{{description}}</td>
                    <td>{{quantity}}</td>
                    <td>${{unit_price}}</td>
                    <td>${{line_total}}</td>
                  </tr>
                  {{/items}}
                </tbody>
              </table>
              
              <div class="totals">
                <table>
                  <tr><td>Subtotal:</td><td>${{subtotal}}</td></tr>
                  {{#if discount_amt}}
                  <tr><td>Discount:</td><td>-${{discount_amt}}</td></tr>
                  {{/if}}
                  {{#if tax_total}}
                  <tr><td>Tax:</td><td>${{tax_total}}</td></tr>
                  {{/if}}
                  <tr class="total-row">
                    <td>Total:</td>
                    <td>${{total}}</td>
                  </tr>
                  {{#if balance_due}}
                  <tr class="total-row">
                    <td>Balance Due:</td>
                    <td>${{balance_due}}</td>
                  </tr>
                  {{/if}}
                </table>
              </div>
              
              {{#if notes}}
              <div class="notes">
                <h3>Notes:</h3>
                <p>{{notes}}</p>
              </div>
              {{/if}}
              
              {{#if terms}}
              <div class="footer">
                <h3>Terms & Conditions:</h3>
                <p>{{terms}}</p>
              </div>
              {{/if}}
            </div>
          </div>
        </body>
        </html>
      ` /* eslint-enable @typescript-eslint/no-unused-vars */
    }
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
      content: /* eslint-disable @typescript-eslint/no-unused-vars */
        `
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
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px;
              border: 2px solid #000;
            }
            .invoice-table th, .invoice-table td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left; 
            }
            .invoice-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .totals { 
              margin-top: 20px; 
              text-align: right; 
              font-size: 14px;
            }
            .totals table {
              margin-left: auto;
              border-collapse: collapse;
              border: 2px solid #000;
            }
            .totals td {
              padding: 8px 16px;
              border: 1px solid #000;
            }
            .totals .total-row {
              font-weight: bold;
              font-size: 16px;
              background-color: #f0f0f0;
            }
            .footer { 
              margin-top: 40px; 
              font-size: 12px; 
              border-top: 1px solid #000;
              padding-top: 20px;
            }
            .status {
              display: inline-block;
              padding: 4px 8px;
              border: 1px solid #000;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status.draft { background-color: #f0f0f0; }
            .status.sent { background-color: #e3f2fd; }
            .status.accepted { background-color: #e8f5e8; }
            .status.paid { background-color: #e8f5e8; }
          </style>
        </head>
        <body>
          <div class="header">
            {{#if logo_url}}
            <img src="{{logo_url}}" alt="Company Logo" class="logo">
            {{/if}}
            <h1>{{org_name}}</h1>
            <p>{{org_address}}</p>
            {{#if org_phone}}<p>Phone: {{org_phone}}</p>{{/if}}
            {{#if org_email}}<p>Email: {{org_email}}</p>{{/if}}
          </div>
          
          <div class="document-info">
            <div>
              <h2>{{document_type}} #{{number}}</h2>
              <p><strong>Date:</strong> {{date}}</p>
              {{#if due_date}}<p><strong>Due Date:</strong> {{due_date}}</p>{{/if}}
            </div>
            <div>
              <span class="status {{status}}">{{status}}</span>
            </div>
          </div>
          
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>{{client_name}}</strong></p>
            <p>{{client_address}}</p>
            {{#if client_phone}}<p>Phone: {{client_phone}}</p>{{/if}}
            {{#if client_email}}<p>Email: {{client_email}}</p>{{/if}}
          </div>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {{#items}}
              <tr>
                <td>{{description}}</td>
                <td>{{quantity}}</td>
                <td>${{unit_price}}</td>
                <td>${{line_total}}</td>
              </tr>
              {{/items}}
            </tbody>
          </table>
          
          <div class="totals">
            <table>
              <tr><td>Subtotal:</td><td>${{subtotal}}</td></tr>
              {{#if discount_amt}}
              <tr><td>Discount:</td><td>-${{discount_amt}}</td></tr>
              {{/if}}
              {{#if tax_total}}
              <tr><td>Tax:</td><td>${{tax_total}}</td></tr>
              {{/if}}
              <tr class="total-row">
                <td>Total:</td>
                <td>${{total}}</td>
              </tr>
              {{#if balance_due}}
              <tr class="total-row">
                <td>Balance Due:</td>
                <td>${{balance_due}}</td>
              </tr>
              {{/if}}
            </table>
          </div>
          
          {{#if notes}}
          <div class="notes">
            <h3>Notes:</h3>
            <p>{{notes}}</p>
          </div>
          {{/if}}
          
          {{#if terms}}
          <div class="footer">
            <h3>Terms & Conditions:</h3>
            <p>{{terms}}</p>
          </div>
          {{/if}}
        </body>
        </html>
      ` /* eslint-enable @typescript-eslint/no-unused-vars */
    }
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
          await generator.uploadPDF(uri, data, options.filename)
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
      const value = (data as any)[variable]
      return value ? content : ''
    })
    
    return html
  }

  /**
   * Render items array
   */
  private renderItems(items: any[]): string {
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
  private async uploadPDF(uri: string, data: PDFData, filename?: string): Promise<void> {
    try {
      const orgId = 'org-id' // This should come from context
      const documentType = data.document_type
      const documentId = data.number
      
      const path = await uploadDocument(uri, orgId, documentType, documentId)
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
  static async generateQuotePDF(quoteData: any, options?: PDFGenerationOptions): Promise<string> {
    const data: PDFData = {
      document_type: 'quote',
      ...quoteData
    }
    return PDFGenerator.generatePDF(data, options)
  }

  /**
   * Generate invoice PDF (convenience method)
   */
  static async generateInvoicePDF(invoiceData: any, options?: PDFGenerationOptions): Promise<string> {
    const data: PDFData = {
      document_type: 'invoice',
      ...invoiceData
    }
    return PDFGenerator.generatePDF(data, options)
  }
}

// Convenience functions for common PDF operations
export const PDFUtils = {
  /**
   * Generate quote PDF
   */
  generateQuotePDF: async (quoteData: any, options?: PDFGenerationOptions): Promise<string> => {
    const data: PDFData = {
      document_type: 'quote',
      ...quoteData
    }
    return PDFGenerator.generatePDF(data, options)
  },

  /**
   * Generate invoice PDF
   */
  generateInvoicePDF: async (invoiceData: any, options?: PDFGenerationOptions): Promise<string> => {
    const data: PDFData = {
      document_type: 'invoice',
      ...invoiceData
    }
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
