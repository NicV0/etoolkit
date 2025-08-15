// deno-lint-ignore-file no-explicit-any
import { createClient } from "npm:@supabase/supabase-js@^2.45.0";
import Stripe from "npm:stripe@^15.8.0";

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
    const stripeSk = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSk) return new Response('Stripe not configured', { status: 503 });

    const body = await req.json().catch(()=>({}));
    const { invoice_id } = body as { invoice_id?: string };
    const auth = req.headers.get('Authorization') || '';

    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
    const admin = createClient(url, service, { auth: { persistSession: false } });
    const stripe = new Stripe(stripeSk, { apiVersion: '2023-10-16' });

    const { data: who } = await userClient.auth.getUser();
    if (!who?.user) return new Response('Unauthorized', { status: 401 });

    const { data: inv, error: e1 } = await userClient
      .from('invoices')
      .select('id, org_id, customer_id, totalcents:total_cents, currency, client_email')
      .eq('id', invoice_id)
      .maybeSingle();
    if (e1 || !inv) return new Response('Invoice not found', { status: 404 });

    const { data: cust } = await admin
      .from('customers')
      .select('id, org_id, name, email, stripe_customer_id')
      .eq('id', inv.customer_id)
      .maybeSingle();

    let stripeCustomerId = cust?.stripe_customer_id as string | undefined;
    if (!stripeCustomerId) {
      const sc = await stripe.customers.create({
        name: cust?.name || undefined,
        email: inv.client_email || cust?.email || undefined,
        metadata: { app: 'etoolkit', org_id: inv.org_id, customer_id: inv.customer_id }
      });
      stripeCustomerId = sc.id;
      await admin.from('customers').update({ stripe_customer_id: sc.id }).eq('id', cust?.id);
    }

    const amount = inv.totalcents || 0;
    if (!amount || amount < 50) return new Response('Amount too low', { status: 400 });

    // Reuse existing PI if still requires payment
    const { data: existing } = await admin
      .from('invoices')
      .select('stripe_payment_intent_id')
      .eq('id', invoice_id)
      .maybeSingle();

    let piId = existing?.stripe_payment_intent_id as string | undefined;
    let clientSecret: string | undefined;

    if (piId) {
      const pi = await stripe.paymentIntents.retrieve(piId);
      if (pi.status === 'requires_payment_method' || pi.status === 'requires_action') {
        clientSecret = pi.client_secret || undefined;
      } else {
        piId = undefined; // create a new one below
      }
    }

    if (!piId) {
      const pi = await stripe.paymentIntents.create({
        amount,
        currency: inv.currency || 'usd',
        customer: stripeCustomerId,
        automatic_payment_methods: { enabled: true },
        metadata: { app: 'etoolkit', invoice_id, org_id: inv.org_id }
      });
      piId = pi.id; clientSecret = pi.client_secret || undefined;
      await admin.from('invoices').update({ stripe_payment_intent_id: piId }).eq('id', invoice_id);
    }

    return new Response(JSON.stringify({ clientSecret, customerId: stripeCustomerId }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(e?.message || 'error', { status: 400 });
  }
});
