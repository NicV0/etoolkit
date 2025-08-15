type Item = { name: string; qty: number; rate_cents: number };

export function computeTotals(items: Item[], taxPercent: number, discountCents: number) {
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate_cents, 0);
  const tax = Math.round(subtotal * (taxPercent / 100));
  const total = subtotal + tax - discountCents;
  return { subtotal, tax, total };
}

interface RenderArgs {
  org: { name: string; brand_color?: string; company_name?: string };
  client: { name: string; phone?: string; email?: string };
  items: Item[];
  taxPercent: number;
  discountCents: number;
  terms: string;
  contractText: string;
}

export function renderQuoteHTML(args: RenderArgs) {
  const { org, client, items, taxPercent, discountCents, terms, contractText } = args;
  const { subtotal, tax, total } = computeTotals(items, taxPercent, discountCents);
  const color = org.brand_color || '#000000';
  let contractSection = '';
  if (contractText) {
    contractSection = `<div><strong>Contract</strong><p>${contractText}</p></div>`;
  }
  const html = `
    <div>
      <div style="color:${color}"><strong>QUOTE</strong></div>
      <div>${client.name}</div>
      <ul>
        ${items
          .map(i => `<li>${i.name}: ${i.qty} x ${i.rate_cents}</li>`)
          .join('')}
      </ul>
      <div>Subtotal: ${subtotal}</div>
      <div>Tax: ${tax}</div>
      <div>Total: ${total}</div>
      <div>${terms}</div>
      ${contractSection}
    </div>
  `;
  return html;
}
