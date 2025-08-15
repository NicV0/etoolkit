export function renderInvoiceHTML(input: {
  company: { name?: string; phone?: string; color?: string };
  client: { name?: string; email?: string };
  invoice: { number: string; status: string; date?: string };
  items: { name: string; qty: number; rate: number }[];
  totals: { subtotal: number; tax: number; total: number };
  terms?: string;
}) {
  const color = input.company.color || '#1e3a8a';
  const rows = input.items.map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${it.qty}</td>
      <td>$${it.rate.toFixed(2)}</td>
      <td style="text-align:right">$${(it.qty*it.rate).toFixed(2)}</td>
    </tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,system-ui; padding:24px; color:#111}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .logo{background:${color};color:#fff;border-radius:12px;padding:10px 14px;font-weight:800}
    .chip{font-size:12px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,0.06)}
    .muted{opacity:.7;font-size:12px}
    table{width:100%;border-collapse:collapse}
    th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
    th{background:${color}10}
    .totals{margin-top:8px;float:right;min-width:260px}
  </style></head><body>
    <div class="header">
      <div style="display:flex;gap:12px;align-items:center">
        <div class="logo">${(input.company.name||'ET').slice(0,2).toUpperCase()}</div>
        <div>
          <div style="font-weight:700">${input.company.name||'Your Company'}</div>
          <div class="muted">${input.company.phone||''}</div>
        </div>
      </div>
      <div>
        <div class="chip">INVOICE</div>
        <div class="muted" style="text-align:right">No. ${input.invoice.number}<br/>${input.invoice.status}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div>
        <div class="muted">Bill To</div>
        <div style="font-weight:600">${input.client.name||''}</div>
        <div class="muted">${input.client.email||''}</div>
      </div>
      <div>
        <div class="muted">Date</div>
        <div style="font-weight:600">${input.invoice.date||new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div style="display:flex;justify-content:space-between"><span class="muted">Subtotal</span><span>$${input.totals.subtotal.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">Tax</span><span>$${input.totals.tax.toFixed(2)}</span></div>
      <div style="height:1px;background:#eee;margin:8px 0"></div>
      <div style="display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:${color}">$${input.totals.total.toFixed(2)}</span></div>
    </div>

    ${input.terms?`<div style="margin-top:18px"><div class="muted">Terms</div><div>${input.terms}</div></div>`:''}
  </body></html>`;
}
