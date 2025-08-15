// deno-lint-ignore-file no-explicit-any
import Stripe from 'npm:stripe@^15.8.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const stripeSk = Deno.env.get('STRIPE_SECRET_KEY');
    const url = Deno.env.get('SUPABASE_URL')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
    if (!stripeSk) return new Response('Stripe not configured', { status: 503 });

    const { invoice_id } = await req.json().catch(()=>({}));
    if (!invoice_id) return new Response('Missing invoice_id', { status: 400 });

    const admin = createClient(url, service, { auth: { persistSession: false } });
    const { data: inv, error } = await admin.from('invoices').select('id, org_id, total_cents, currency').eq('id', invoice_id).maybeSingle();
    if (error || !inv) return new Response('Invoice not found', { status: 404 });

    const stripe = new Stripe(stripeSk, { apiVersion: '2023-10-16' });

    const cs = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: inv.currency || 'usd', product_data: { name: `Invoice ${inv.id}` }, unit_amount: inv.total_cents || 0 }, quantity: 1 }],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      metadata: { invoice_id: inv.id, org_id: inv.org_id, app: 'etoolkit' },
    });
    return new Response(JSON.stringify({ url: cs.url }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e:any) {
    return new Response(e?.message||'error', { status: 400 });
  }
});
