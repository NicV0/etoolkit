// deno-lint-ignore-file no-explicit-any
import Stripe from "npm:stripe@^15.8.0";
import { createClient } from "npm:@supabase/supabase-js@^2.45.0";

Deno.serve(async (req) => {
  const stripeSk = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
  if (!stripeSk || !webhookSecret) return new Response('Stripe not configured', { status: 503 });

  const stripe = new Stripe(stripeSk, { apiVersion: '2023-10-16' });
  const admin = createClient(url, service, { auth: { persistSession: false } });

  const sig = req.headers.get('Stripe-Signature') || '';
  const raw = await req.text();

  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(raw, sig, webhookSecret); }
  catch (err: any) { return new Response(`Signature error: ${err.message}`, { status: 400 }); }

  // Idempotency: skip if we've seen this event id
  const { data: seen } = await admin.from('webhook_events').select('id').eq('id', event.id).maybeSingle();
  if (seen?.id) return new Response('Already processed', { status: 200 });

  const type = event.type;
  const obj: any = event.data.object;

  async function markSeen() { await admin.from('webhook_events').insert({ id: event.id }); }

  try {
    if (type === 'payment_intent.succeeded' || type === 'payment_intent.processing' || type === 'payment_intent.payment_failed' || type === 'payment_intent.canceled') {
      const pi = obj as Stripe.PaymentIntent;
      const invoiceId = (pi.metadata as any)?.invoice_id;
      const orgId = (pi.metadata as any)?.org_id;
      if (invoiceId) {
        const status = pi.status === 'succeeded' ? 'PAID' : pi.status === 'processing' ? 'PROCESSING' : pi.status === 'canceled' ? 'VOID' : 'OPEN';
        if (status === 'PAID') {
          await admin.from('payments').insert({
            org_id: orgId,
            invoice_id: invoiceId,
            provider_payment_id: pi.id,
            amount_cents: pi.amount_received || pi.amount || 0,
            currency: pi.currency || 'usd',
            status: 'succeeded',
            raw: pi as any
          });
        }
        await admin.from('invoices').update({ status, stripe_payment_intent_id: pi.id }).eq('id', invoiceId);
      }
      await markSeen();
      return new Response('OK', { status: 200 });
    }

    if (type === 'charge.refunded') {
      const ch = obj as Stripe.Charge;
      const piId = ch.payment_intent as string | undefined;
      if (piId) {
        const { data: inv } = await admin.from('invoices').select('id, org_id').eq('stripe_payment_intent_id', piId).maybeSingle();
        if (inv?.id) {
          await admin.from('payments').insert({
            org_id: inv.org_id,
            invoice_id: inv.id,
            provider_payment_id: ch.id,
            amount_cents: -(ch.amount_refunded || 0),
            currency: ch.currency || 'usd',
            status: 'refunded',
            raw: ch as any
          });
          await admin.from('invoices').update({ status: 'VOID' }).eq('id', inv.id);
        }
      }
      await markSeen();
      return new Response('OK', { status: 200 });
    }

    // Ignore other events for now
    await markSeen();
    return new Response('Ignored', { status: 200 });
  } catch (e: any) {
    return new Response(`Error: ${e?.message || 'unknown'}`, { status: 400 });
  }
});
