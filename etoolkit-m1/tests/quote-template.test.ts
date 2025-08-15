import { describe, it, expect } from 'vitest';
import { renderQuoteHTML, computeTotals } from '../apps/mobile/lib/quote-template';

const org = { name: 'Demo Org', brand_color: '#123456', company_name: 'Demo Org' } as any;
const client = { name: 'Jane Smith', phone: '555-1234', email: 'jane@example.com' };

describe('quote HTML template', () => {
  it('computes totals and renders QUOTE chip + Contract (present)', () => {
    const items = [
      { name: 'Labor', qty: 2, rate_cents: 10000 },
      { name: 'Part', qty: 1, rate_cents: 2500 }
    ];
    const t = computeTotals(items, 7, 500);
    expect(t.subtotal).toBe(22500);
    expect(t.tax).toBe(Math.round(22500 * 0.07));
    expect(t.total).toBe(22500 + Math.round(22500 * 0.07) - 500);

    const html = renderQuoteHTML({
      org,
      client,
      items,
      taxPercent: 7,
      discountCents: 500,
      terms: 'Net 15',
      contractText: 'Workmanlike manner.'
    });
    expect(html).toContain('QUOTE');
    expect(html).toContain('#123456');
    expect(html).toContain('Workmanlike manner.');
    expect(html).toContain('Contract');
  });

  it('multiple items, zero tax, no contract → correct totals and no Contract section', () => {
    const items = [
      { name: 'Service Call', qty: 1, rate_cents: 7500 },
      { name: 'Diagnostic Hour', qty: 2, rate_cents: 9500 }
    ];
    const t = computeTotals(items, 0, 0);
    // subtotal = 1*7500 + 2*9500 = 26500
    expect(t.subtotal).toBe(26500);
    expect(t.tax).toBe(0);
    expect(t.total).toBe(26500);

    const html = renderQuoteHTML({
      org,
      client,
      items,
      taxPercent: 0,
      discountCents: 0,
      terms: 'Net 30',
      contractText: ''
    });
    expect(html).toContain('QUOTE');
    expect(html).not.toContain('Contract</strong>');
  });
});
