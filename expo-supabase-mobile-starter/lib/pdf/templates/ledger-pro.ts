// import { PDFTemplate } from '../generators'; // unused

// Base64 encoded ledger logo
// const LEDGER_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJsZWRnZXJHcmFkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNzFhMjE7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM3NDE1MTtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0idXJsKCNsZWRnZXJHcmFkKSIvPgo8dGV4dCB4PSI4MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5lTG9nbzwvdGV4dD4KPC9zdmc+Cg=='; // unused

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
