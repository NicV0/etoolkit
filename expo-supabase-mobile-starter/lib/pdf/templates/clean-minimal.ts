// import { PDFTemplate } from '../generators'; // unused

// Base64 encoded default logo (simple placeholder)
// const DEFAULT_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzNiODJmNiIvPgo8dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmVMb2dvPC90ZXh0Pgo8L3N2Zz4K'; // unused

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
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 10px;
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
