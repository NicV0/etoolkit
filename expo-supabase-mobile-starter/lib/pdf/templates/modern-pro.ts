import { PDFTemplate } from '../generators';

// Base64 encoded modern logo
const MODERN_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTQwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJtb2Rlcm5HcmFkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNiODJmNjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0idXJsKCNtb2Rlcm5HcmFkKSIvPgo8dGV4dCB4PSI3MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5lTG9nbzwvdGV4dD4KPC9zdmc+Cg==';

export const modernProTemplate = {
  id: 'modern-pro',
  name: 'Modern Pro',
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
  `
}
