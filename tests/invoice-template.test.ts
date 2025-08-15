import { describe, it, expect } from 'vitest';
import { renderInvoiceHTML } from '../apps/mobile/lib/invoice-template';

describe('renderInvoiceHTML (invoice)', () => {
  it('renders totals and invoice number', () => {
    const html = renderInvoiceHTML({
      company: { name: 'Acme', color: '#000' },
      client: { name: 'Jane' },
      invoice: { number: 'INV-12345', status: 'OPEN' },
      items: [{ name: 'Labor', qty: 2, rate: 50 }],
      totals: { subtotal: 100, tax: 8, total: 108 },
      terms: 'Net 15',
    });
    expect(html).toContain('INV-12345');
    expect(html).toContain('$108.00');
    expect(html).toContain('INVOICE');
  });

  it('omits terms when empty and handles zero tax', () => {
    const html = renderInvoiceHTML({
      company: { name: 'Acme' }, client: { name: 'X' },
      invoice: { number: 'INV-1', status: 'OPEN' },
      items: [{ name: 'A', qty: 1, rate: 10 }, { name: 'B', qty: 3, rate: 2.5 }],
      totals: { subtotal: 17.5, tax: 0, total: 17.5 }
    });
    expect(html).not.toContain('Terms');
    expect(html).toContain('$17.50');
  });
});
