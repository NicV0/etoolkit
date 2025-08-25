export function renderInvoiceHTML({
  orgName,
  logoUri,
  invoiceNo,
  clientName,
  total,
}: {
  orgName: string;
  logoUri?: string;
  invoiceNo: string;
  clientName: string;
  total: string;
}) {
  return `
  <html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
  body { font-family: Inter, -apple-system, Segoe UI, Roboto, sans-serif; padding: 24px; color: #111827; }
  .header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .title { font-size:24px; font-weight:700; } .section { margin-bottom:16px; } .muted { color:#6B7280; }
  .total { font-size:20px; font-weight:700; } img { height:40px; }
  table { width:100%; border-collapse:collapse; margin-top:12px; }
  th, td { padding:8px; border-bottom:1px solid #E5E7EB; text-align:left; font-size:14px; }
  </style></head><body>
  <div class="header">
    <div class="title">Invoice ${invoiceNo}</div>
    ${logoUri ? `<img src="${logoUri}" />` : `<div class="muted">${orgName}</div>`}
  </div>
  <div class="section">
    <div><strong>Billed To:</strong> ${clientName}</div>
    <div class="muted">Thank you for your business.</div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
    <tbody><tr><td>Service item</td><td>1</td><td>$1,500.00</td><td>$1,500.00</td></tr></tbody>
  </table>
  <div style="display:flex; justify-content:flex-end; margin-top:12px;"><div class="total">Total: ${total}</div></div>
  </body></html>`;
}