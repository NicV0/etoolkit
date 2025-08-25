// PDF template system based on mobile-app patterns
import { colors } from '../theme/tokens';

// Base template interface
export interface PDFTemplate {
  name: string;
  description: string;
  render: (data: any) => string;
}

// Common data interfaces
export interface InvoiceData {
  orgName: string;
  orgLogo?: string;
  orgAddress?: string;
  orgPhone?: string;
  orgEmail?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    taxable: boolean;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  terms?: string;
  notes?: string;
}

export interface QuoteData {
  orgName: string;
  orgLogo?: string;
  orgAddress?: string;
  orgPhone?: string;
  orgEmail?: string;
  quoteNumber: string;
  issueDate: string;
  validUntil: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    taxable: boolean;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  terms?: string;
  notes?: string;
}

// Base CSS styles
const baseStyles = `
  * { box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0; 
    padding: 20px; 
    color: #333; 
    line-height: 1.6;
  }
  .header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
    margin-bottom: 30px; 
    padding-bottom: 20px; 
    border-bottom: 2px solid #e5e7eb;
  }
  .org-info { flex: 1; }
  .org-logo { 
    max-width: 150px; 
    max-height: 60px; 
    margin-bottom: 10px;
  }
  .org-name { 
    font-size: 24px; 
    font-weight: bold; 
    color: #1f2937; 
    margin-bottom: 5px;
  }
  .org-details { 
    font-size: 14px; 
    color: #6b7280; 
    line-height: 1.4;
  }
  .document-info { 
    text-align: right; 
    flex: 1;
  }
  .document-title { 
    font-size: 28px; 
    font-weight: bold; 
    color: #1f2937; 
    margin-bottom: 5px;
  }
  .document-number { 
    font-size: 18px; 
    color: #6b7280; 
    margin-bottom: 10px;
  }
  .document-dates { 
    font-size: 14px; 
    color: #6b7280;
  }
  .client-section { 
    margin-bottom: 30px; 
    padding: 20px; 
    background: #f9fafb; 
    border-radius: 8px;
  }
  .client-title { 
    font-size: 16px; 
    font-weight: bold; 
    color: #1f2937; 
    margin-bottom: 10px;
  }
  .client-name { 
    font-size: 18px; 
    font-weight: bold; 
    color: #1f2937; 
    margin-bottom: 5px;
  }
  .client-details { 
    font-size: 14px; 
    color: #6b7280; 
    line-height: 1.4;
  }
  .items-table { 
    width: 100%; 
    border-collapse: collapse; 
    margin-bottom: 30px;
  }
  .items-table th { 
    background: #f3f4f6; 
    padding: 12px; 
    text-align: left; 
    font-weight: bold; 
    color: #1f2937; 
    border-bottom: 2px solid #e5e7eb;
  }
  .items-table td { 
    padding: 12px; 
    border-bottom: 1px solid #e5e7eb; 
    vertical-align: top;
  }
  .items-table .description { width: 40%; }
  .items-table .quantity { width: 15%; text-align: center; }
  .items-table .price { width: 20%; text-align: right; }
  .items-table .total { width: 25%; text-align: right; font-weight: bold; }
  .taxable { font-size: 12px; color: #6b7280; }
  .totals-section { 
    margin-left: auto; 
    width: 300px; 
    margin-bottom: 30px;
  }
  .total-row { 
    display: flex; 
    justify-content: space-between; 
    padding: 8px 0; 
    border-bottom: 1px solid #e5e7eb;
  }
  .total-row.grand-total { 
    font-size: 18px; 
    font-weight: bold; 
    color: #1f2937; 
    border-bottom: 2px solid #1f2937;
    padding-top: 12px;
  }
  .terms-section { 
    margin-bottom: 20px; 
    padding: 20px; 
    background: #f9fafb; 
    border-radius: 8px;
  }
  .terms-title { 
    font-size: 16px; 
    font-weight: bold; 
    color: #1f2937; 
    margin-bottom: 10px;
  }
  .terms-content { 
    font-size: 14px; 
    color: #6b7280; 
    line-height: 1.5;
  }
  .notes-section { 
    font-size: 14px; 
    color: #6b7280; 
    line-height: 1.5;
  }
  .footer { 
    margin-top: 40px; 
    padding-top: 20px; 
    border-top: 1px solid #e5e7eb; 
    text-align: center; 
    font-size: 12px; 
    color: #9ca3af;
  }
`;

// Clean Minimal Template
export const cleanMinimalTemplate: PDFTemplate = {
  name: 'Clean Minimal',
  description: 'A clean, minimal design with focus on readability',
  render: (data: InvoiceData | QuoteData) => {
    const isInvoice = 'invoiceNumber' in data;
    const documentTitle = isInvoice ? 'INVOICE' : 'QUOTE';
    const documentNumber = isInvoice ? data.invoiceNumber : data.quoteNumber;
    const issueDate = isInvoice ? data.issueDate : data.issueDate;
    const dueDate = isInvoice ? data.dueDate : data.validUntil;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${documentTitle} ${documentNumber}</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="header">
          <div class="org-info">
            ${data.orgLogo ? `<img src="${data.orgLogo}" alt="Logo" class="org-logo">` : ''}
            <div class="org-name">${data.orgName}</div>
            ${data.orgAddress ? `<div class="org-details">${data.orgAddress}</div>` : ''}
            ${data.orgPhone ? `<div class="org-details">${data.orgPhone}</div>` : ''}
            ${data.orgEmail ? `<div class="org-details">${data.orgEmail}</div>` : ''}
          </div>
          <div class="document-info">
            <div class="document-title">${documentTitle}</div>
            <div class="document-number">${documentNumber}</div>
            <div class="document-dates">
              <div>Issue Date: ${issueDate}</div>
              <div>${isInvoice ? 'Due Date' : 'Valid Until'}: ${dueDate}</div>
            </div>
          </div>
        </div>
        
        <div class="client-section">
          <div class="client-title">${isInvoice ? 'Bill To' : 'Quote For'}</div>
          <div class="client-name">${data.clientName}</div>
          ${data.clientAddress ? `<div class="client-details">${data.clientAddress}</div>` : ''}
          ${data.clientEmail ? `<div class="client-details">${data.clientEmail}</div>` : ''}
          ${data.clientPhone ? `<div class="client-details">${data.clientPhone}</div>` : ''}
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th class="description">Description</th>
              <th class="quantity">Qty</th>
              <th class="price">Unit Price</th>
              <th class="total">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td class="description">
                  ${item.description}
                  ${item.taxable ? '<div class="taxable">Taxable</div>' : ''}
                </td>
                <td class="quantity">${item.quantity}</td>
                <td class="price">$${item.unitPrice.toFixed(2)}</td>
                <td class="total">$${item.lineTotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${data.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${data.taxRate}%):</span>
            <span>$${data.taxAmount.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>$${data.total.toFixed(2)}</span>
          </div>
        </div>
        
        ${data.terms ? `
          <div class="terms-section">
            <div class="terms-title">Terms & Conditions</div>
            <div class="terms-content">${data.terms}</div>
          </div>
        ` : ''}
        
        ${data.notes ? `
          <div class="notes-section">
            <strong>Notes:</strong> ${data.notes}
          </div>
        ` : ''}
        
        <div class="footer">
          Thank you for your business
        </div>
      </body>
      </html>
    `;
  }
};

// Professional Template
export const professionalTemplate: PDFTemplate = {
  name: 'Professional',
  description: 'A professional design with enhanced styling',
  render: (data: InvoiceData | QuoteData) => {
    const isInvoice = 'invoiceNumber' in data;
    const documentTitle = isInvoice ? 'INVOICE' : 'QUOTE';
    const documentNumber = isInvoice ? data.invoiceNumber : data.quoteNumber;
    const issueDate = isInvoice ? data.issueDate : data.issueDate;
    const dueDate = isInvoice ? data.dueDate : data.validUntil;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${documentTitle} ${documentNumber}</title>
        <style>
          ${baseStyles}
          body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .document-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .org-name, .document-title { color: white !important; }
          .org-details, .document-number, .document-dates { color: rgba(255,255,255,0.9) !important; }
          .client-section {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            border: none;
          }
          .items-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .totals-section {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
          }
          .grand-total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 15px 20px !important;
            border-radius: 6px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="document-container">
          ${cleanMinimalTemplate.render(data)}
        </div>
      </body>
      </html>
    `;
  }
};

// Template registry
export const templates: Record<string, PDFTemplate> = {
  'clean-minimal': cleanMinimalTemplate,
  'professional': professionalTemplate,
};

// Template utilities
export const getTemplate = (name: string): PDFTemplate => {
  const template = templates[name];
  if (!template) {
    throw new Error(`Template "${name}" not found`);
  }
  return template;
};

export const listTemplates = (): Array<{ name: string; description: string }> => {
  return Object.values(templates).map(template => ({
    name: template.name,
    description: template.description,
  }));
};

// Render function for backward compatibility
export const renderInvoiceHTML = (data: InvoiceData): string => {
  return cleanMinimalTemplate.render(data);
};

export const renderQuoteHTML = (data: QuoteData): string => {
  return cleanMinimalTemplate.render(data);
};
