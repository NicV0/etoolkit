// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';
import Stripe from 'npm:stripe@^15.8.0';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
    const stripeSk = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSk) return new Response('Stripe not configured', { status: 503 });

    const { invoice_id } = await req.json().catch(()=>({}));
    if (!invoice_id) return new Response('Missing invoice_id', { status: 400 });

    const auth = req.headers.get('Authorization') || '';
    const user = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
    const admin = createClient(url, service, { auth: { persistSession: false } });

    const { data: me } = await user.auth.getUser();
    if (!me?.user) return new Response('Unauthorized', { status: 401 });

    const { data: inv, error } = await user
      .from('invoices')
      .select('id, org_id, status, stripe_payment_intent_id')
      .eq('id', invoice_id)
      .maybeSingle();
    if (error || !inv) return new Response('Invoice not found', { status: 404 });

    const { data: role } = await admin
      .from('memberships')
      .select('role')
      .eq('org_id', inv.org_id)
      .eq('user_id', me.user.id)
      .maybeSingle();
    if (!role || (role.role !== 'OWNER' && role.role !== 'ADMIN')) return new Response('Forbidden', { status: 403 });

    const stripe = new Stripe(stripeSk, { apiVersion: '2023-10-16' });
    const piId = inv.stripe_payment_intent_id;
    if (!piId) return new Response('No payment intent', { status: 400 });
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (pi.status !== 'succeeded') return new Response('Only succeeded payments can be refunded', { status: 400 });

    const chId = typeof pi.latest_charge === 'string' ? pi.latest_charge : (pi.latest_charge as any)?.id;
    if (!chId) return new Response('No charge found', { status: 400 });

    await stripe.refunds.create({ charge: chId as string });
    return new Response('OK');
  } catch (e:any) {
    return new Response(e?.message||'error', { status: 400 });
  }
});
