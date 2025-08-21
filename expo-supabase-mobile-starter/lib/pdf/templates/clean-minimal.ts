import { PDFTemplate } from '../generators';

// Base64 encoded default logo (simple placeholder)
const DEFAULT_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzNiODJmNiIvPgo8dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmVMb2dvPC90ZXh0Pgo8L3N2Zz4K';

export const cleanMinimalTemplate = {
  id: 'clean-minimal',
  name: 'Clean Minimal',
  isPaid: false,
  variables: ['org_name', 'org_address', 'document_type', 'number', 'date', 'client_name', 'client_address', 'items', 'subtotal', 'tax_total', 'total', 'terms'],
  content: `
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
  `
}
