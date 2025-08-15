import { describe, it, expect } from 'vitest';

function mapPiStatusToInvoice(s: string) {
  if (s==='succeeded') return 'PAID';
  if (s==='processing') return 'PROCESSING';
  if (s==='canceled') return 'VOID';
  return 'OPEN';
}

describe('stripe → invoice status', ()=>{
  it('succeeded → PAID', ()=> expect(mapPiStatusToInvoice('succeeded')).toBe('PAID'));
  it('processing → PROCESSING', ()=> expect(mapPiStatusToInvoice('processing')).toBe('PROCESSING'));
  it('canceled → VOID', ()=> expect(mapPiStatusToInvoice('canceled')).toBe('VOID'));
  it('requires_payment_method → OPEN', ()=> expect(mapPiStatusToInvoice('requires_payment_method')).toBe('OPEN'));
});
