import { describe, expect, it } from 'vitest';
import { renderQuoteHTML } from '../apps/mobile/lib/quote-template';

describe('renderQuoteHTML', () => {
  it('renders items and totals in HTML', () => {
    const html = renderQuoteHTML({
      company: { name: 'Acme Inc', phone: '123', color: '#ff0000' },
      client: { name: 'Client A', email: 'a@example.com' },
      items: [ { name: 'Service', qty: 2, rate: 50 } ],
      totals: { subtotal: 100, tax: 8 },
      terms: 'Pay within 30 days',
      contract: 'No sharing.'
    });
    expect(html).toContain('Service');
    expect(html).toContain('$100.00');
    expect(html).toContain('Contract');
  });

  it('omits Contract section when empty, handles zero tax & multiple items', () => {
    const html = renderQuoteHTML({
      company: { name: 'Co', phone: '555', color: '#0ea5e9' },
      client: { name: 'Client', email: '' },
      items: [ { name: 'A', qty: 1, rate: 10 }, { name: 'B', qty: 3, rate: 2.5 } ],
      totals: { subtotal: 17.5, tax: 0 },
      terms: 'Net 15',
    });
    expect(html).toContain('$17.50');
    expect(html).toContain('Total');
    expect(html).not.toContain('Contract');
  });

  it('renders safely with empty items', () => {
    const html = renderQuoteHTML({
      company: { name: 'Co' },
      client: { name: 'X' },
      items: [],
      totals: { subtotal: 0, tax: 0 }
    });
    expect(html).toContain('QUOTE');
  });
});
