export function renderInvoiceHTML(input: {
  company: { name?: string; phone?: string; color?: string };
  client: { name?: string; email?: string };
  items: { name: string; qty: number; rate: number }[];
  totals: { subtotal: number; tax: number };
  number?: string;
  status?: string; // OPEN|PAID|VOID
  terms?: string;
  plan?: 'free'|'pro';
}) {
  const color = input.company.color || '#1e3a8a';
  const rows = input.items.map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${it.qty}</td>
      <td>$${it.rate.toFixed(2)}</td>
      <td style="text-align:right">$${(it.qty*it.rate).toFixed(2)}</td>
    </tr>`).join('');
  const total = input.totals.subtotal + input.totals.tax;
  const watermark = input.plan==='free' ? `<div class="wm">eToolkit • Free</div>` : '';
  const paid = input.status==='PAID' ? `<div class="badge">PAID</div>` : '';
  const voided = input.status==='VOID' ? `<div class="badge void">VOID</div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,system-ui; padding:24px; color:#111; position:relative}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .logo{background:${color};color:#fff;border-radius:12px;padding:10px 14px;font-weight:800}
    .chip{font-size:12px;padding:6px 10px;border-radius:999px;background:rgba(0,0,0,0.06)}
    table{width:100%;border-collapse:collapse}
    th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
    th{background:${color}10}
    .totals{margin-top:8px;float:right;min-width:260px}
    .muted{opacity:.7;font-size:12px}
    .section{margin-top:18px}
    .badge{position:absolute;right:24px;top:24px;background:${color};color:#fff;padding:6px 10px;border-radius:10px;font-weight:700}
    .badge.void{background:#ef4444}
    .wm{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:800;color:rgba(0,0,0,0.06);transform:rotate(-24deg);pointer-events:none}
  </style></head><body>
    ${watermark}
    ${paid}${voided}
    <div class="header">
      <div style="display:flex;gap:12px;align-items:center">
        <div class="logo">${(input.company.name||'ET').slice(0,2).toUpperCase()}</div>
        <div>
          <div style="font-weight:700">${input.company.name||'Your Company'}</div>
          <div class="muted">${input.company.phone||''}</div>
        </div>
      </div>
      <div class="chip">INVOICE ${input.number?`• ${input.number}`:''}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div>
        <div class="muted">Bill To</div>
        <div style="font-weight:600">${input.client.name||''}</div>
        <div class="muted">${input.client.email||''}</div>
      </div>
      <div>
        <div class="muted">Date</div>
        <div style="font-weight:600">${new Date().toLocaleDateString()}</div>
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
      <div style="display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:${color}">$${total.toFixed(2)}</span></div>
    </div>
    ${input.terms?`<div class="section"><div class="muted">Terms</div><div>${input.terms}</div></div>`:''}
  </body></html>`;
}
