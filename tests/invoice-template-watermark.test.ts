import { describe, it, expect } from 'vitest';
import { renderInvoiceHTML } from '../apps/mobile/lib/invoice-template';

describe('invoice watermark', ()=>{
  it('shows watermark for free plan', ()=>{
    const html = renderInvoiceHTML({ company:{}, client:{}, items:[], totals:{subtotal:0,tax:0}, plan:'free' });
    expect(html).toContain('eToolkit • Free');
  });
  it('no watermark for pro', ()=>{
    const html = renderInvoiceHTML({ company:{}, client:{}, items:[], totals:{subtotal:0,tax:0}, plan:'pro' });
    expect(html).not.toContain('eToolkit • Free');
  });
});
