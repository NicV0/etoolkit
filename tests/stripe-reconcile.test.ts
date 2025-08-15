import { describe, it, expect } from 'vitest';

type Event = { id: string; type: string; data: any };
function nextStateFromStripe(e: Event) {
  if (e.type === 'payment_intent.succeeded') return { invoiceStatus: 'PAID', payment: { status: 'succeeded' } };
  if (e.type === 'payment_intent.payment_failed') return { invoiceStatus: 'OPEN', payment: { status: 'payment_failed' } };
  if (e.type === 'invoice.paid') return { invoiceStatus: 'PAID' };
  return { invoiceStatus: null };
}

describe('reconcile', () => {
  it('marks invoice PAID on payment_intent.succeeded', () => {
    const res = nextStateFromStripe({ id: 'evt_1', type: 'payment_intent.succeeded', data: {} });
    expect(res.invoiceStatus).toBe('PAID');
  });
  it('keeps invoice OPEN on failure', () => {
    const res = nextStateFromStripe({ id: 'evt_2', type: 'payment_intent.payment_failed', data: {} });
    expect(res.invoiceStatus).toBe('OPEN');
  });
});
