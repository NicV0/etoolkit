import Stripe from 'npm:stripe@^14.0.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  try {
    const whsec = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!whsec) return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });
    const url = Deno.env.get('SUPABASE_URL')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
    const admin = createClient(url, service, { auth: { persistSession: false } });

    const sig = req.headers.get('stripe-signature') || '';
    const raw = await req.text();
    const event = stripe.webhooks.constructEvent(raw, sig, whsec);

    const { error: dup } = await admin
      .from('webhook_events')
      .insert({ id: event.id, type: event.type, raw: event })
      .select('id');
    if (dup && (dup as any).code === '23505')
      return new Response(JSON.stringify({ ok: true, dedup: true }), {
        headers: { 'Content-Type': 'application/json' },
      });

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = (pi.metadata || {}) as any;
      const invoice_id = meta.invoice_id as string | undefined;
      const org_id = meta.org_id as string | undefined;
      const amount = pi.amount_received || pi.amount || 0;
      const currency = pi.currency?.toUpperCase() || 'USD';
      if (invoice_id && org_id) {
        await admin
          .from('payments')
          .insert({
            org_id,
            invoice_id,
            provider_payment_intent_id: pi.id,
            amount_cents: amount,
            currency,
            status: pi.status,
            raw: pi,
          })
          .select('id');
        await admin.from('invoices').update({ status: 'PAID' }).eq('id', invoice_id);
      }
    }

    if (event.type === 'invoice.paid') {
      const inv = event.data.object as Stripe.Invoice;
      const stripe_invoice_id = inv.id;
      await admin
        .from('invoices')
        .update({ status: 'PAID' })
        .eq('stripe_invoice_id', stripe_invoice_id);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const meta = (pi.metadata || {}) as any;
      const invoice_id = meta.invoice_id as string | undefined;
      const org_id = meta.org_id as string | undefined;
      const amount = pi.amount || 0;
      const currency = pi.currency?.toUpperCase() || 'USD';
      if (invoice_id && org_id) {
        await admin
          .from('payments')
          .insert({
            org_id,
            invoice_id,
            provider_payment_intent_id: pi.id,
            amount_cents: amount,
            currency,
            status: pi.status,
            raw: pi,
          })
          .select('id');
        await admin.from('invoices').update({ status: 'OPEN' }).eq('id', invoice_id);
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(`Invalid signature or error: ${err.message || 'unknown'}`, {
      status: 400,
    });
  }
});
