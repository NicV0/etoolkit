import { PDFTemplate } from '../generators';

// Base64 encoded ledger logo
const LEDGER_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJsZWRnZXJHcmFkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNzFhMjE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM3NDE1MTtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0idXJsKCNsZWRnZXJHcmFkKSIvPgo8dGV4dCB4PSI4MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5lTG9nbzwvdGV4dD4KPC9zdmc+Cg==';

export const ledgerProTemplate = {
  id: 'ledger-pro',
  name: 'Ledger Pro',
  isPaid: true,
  variables: ['org_name', 'org_address', 'document_type', 'number', 'date', 'client_name', 'client_address', 'items', 'subtotal', 'tax_total', 'total', 'terms'],
  content: `
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
  `
}
