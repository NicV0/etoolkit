// import { PDFTemplate } from '../generators'; // unused

// Base64 encoded modern logo
// const MODERN_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTQwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJtb2Rlcm5HcmFkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzNiODJmNjtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0idXJsKCNtb2Rlcm5HcmFkKSIvPgo8dGV4dCB4PSI3MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5lTG9nbzwvdGV4dD4KPC9zdmc+Cg=='; // unused

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
