export interface CompanyInfo {
  name?: string;
  phone?: string;
  color?: string;
}

export interface ClientInfo {
  name?: string;
  email?: string;
}

export interface Item {
  name: string;
  qty: number;
  rate: number;
}

export interface Totals {
  subtotal: number;
  tax: number;
}

export interface QuoteTemplateInput {
  company: CompanyInfo;
  client: ClientInfo;
  items: Item[];
  totals: Totals;
  terms?: string;
  contract?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function renderQuoteHTML(input: QuoteTemplateInput): string {
  const { company, client, items, totals, terms, contract } = input;
  const color = company.color || '#1e3a8a';
  const companyName = company.name || '';
  const companyPhone = company.phone || '';
  const initials = companyName ? companyName.charAt(0).toUpperCase() : '';
  const date = new Date().toLocaleDateString('en-US');

  const itemRows = items
    .map((item) => {
      const lineTotal = item.qty * item.rate;
      return `<tr><td>${escapeHtml(item.name)}</td><td>${item.qty}</td><td>${formatCurrency(item.rate)}</td><td>${formatCurrency(lineTotal)}</td></tr>`;
    })
    .join('');

  const itemsTable = `<table class="items"><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>`;

  const subtotal = formatCurrency(totals.subtotal);
  const tax = formatCurrency(totals.tax);
  const total = formatCurrency(totals.subtotal + totals.tax);

  const termsSection = terms
    ? `<h3>Terms</h3><p>${escapeHtml(terms)}</p>`
    : '';
  const contractSection = contract
    ? `<h3>Contract</h3><pre>${escapeHtml(contract)}</pre>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111; }
.header { display: flex; justify-content: space-between; align-items: center; }
.initials { background: ${color}; color: #fff; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 20px; border-radius: 8px; }
.items { width: 100%; border-collapse: collapse; margin-top: 24px; }
.items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.totals { margin-top: 16px; width: 200px; float: right; }
.totals td { padding: 4px 0; }
pre { white-space: pre-wrap; background: #f9fafb; padding: 8px; border-radius: 4px; }
</style>
</head>
<body>
<div class="header">
  <div class="initials">${escapeHtml(initials)}</div>
  <div style="text-align:right">
    <div>${escapeHtml(companyName)}</div>
    <div>${escapeHtml(companyPhone)}</div>
  </div>
</div>
<h1 style="margin-top:24px">QUOTE</h1>
<div><strong>Bill To:</strong> ${escapeHtml(client.name || '')}</div>
<div>${escapeHtml(client.email || '')}</div>
<div style="margin-top:8px">Date: ${escapeHtml(date)}</div>
${itemsTable}
<table class="totals">
  <tr><td>Subtotal</td><td style="text-align:right">${subtotal}</td></tr>
  <tr><td>Tax</td><td style="text-align:right">${tax}</td></tr>
  <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${total}</strong></td></tr>
</table>
${termsSection}
${contractSection}
</body>
</html>`;
}
