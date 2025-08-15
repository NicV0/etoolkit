import Stripe from 'npm:stripe@^14.0.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const auth = req.headers.get('Authorization');
  if (!auth) return new Response('Unauthorized', { status: 401 });

  const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: userRes } = await userClient.auth.getUser();
  const uid = userRes?.user?.id;
  if (!uid) return new Response('Unauthorized', { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string;

  async function assertOrgForClient(client_id: string) {
    const { data, error } = await admin.from('clients').select('id, org_id').eq('id', client_id).single();
    if (error || !data) throw new Error('Client not found');
    const { data: m } = await admin.from('memberships').select('id').eq('org_id', data.org_id).eq('user_id', uid).maybeSingle();
    if (!m) throw new Error('Forbidden');
    return data.org_id as string;
  }

  async function assertOrgForInvoice(invoice_id: string) {
    const { data, error } = await admin.from('invoices').select('id, org_id').eq('id', invoice_id).single();
    if (error || !data) throw new Error('Invoice not found');
    const { data: m } = await admin.from('memberships').select('id').eq('org_id', data.org_id).eq('user_id', uid).maybeSingle();
    if (!m) throw new Error('Forbidden');
    return data.org_id as string;
  }

  try {
    if (action === 'ensure_customer') {
      const client_id = body.client_id as string;
      if (!client_id) throw new Error('client_id required');
      const org_id = await assertOrgForClient(client_id);
      let { data: c } = await admin
        .from('clients')
        .select('id, name, email, phone, stripe_customer_id')
        .eq('id', client_id)
        .single();
      if (!c) throw new Error('Client not found');
      if (!c.stripe_customer_id) {
        const cust = await stripe.customers.create({
          name: c.name || undefined,
          email: c.email || undefined,
          phone: c.phone || undefined,
          metadata: { client_id, org_id },
        });
        const { data: upd, error: uerr } = await admin
          .from('clients')
          .update({ stripe_customer_id: cust.id })
          .eq('id', client_id)
          .select('stripe_customer_id')
          .single();
        if (uerr) throw uerr;
        return new Response(JSON.stringify({ stripe_customer_id: upd!.stripe_customer_id }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ stripe_customer_id: c.stripe_customer_id }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_payment_link') {
      const invoice_id = body.invoice_id as string;
      if (!invoice_id) throw new Error('invoice_id required');
      const org_id = await assertOrgForInvoice(invoice_id);
      const { data: inv } = await admin.from('invoices').select('*').eq('id', invoice_id).single();
      const cents = inv!.total_cents || 0;
      const currency = (inv!.currency || 'USD').toLowerCase();
      const product = await stripe.products.create({ name: `Invoice ${inv!.number}` });
      const price = await stripe.prices.create({ unit_amount: cents, currency, product: product.id });
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: { invoice_id, org_id },
      });
      await admin.from('invoices').update({ stripe_payment_link_url: link.url }).eq('id', invoice_id);
      return new Response(JSON.stringify({ url: link.url }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Bad Request', { status: 400 });
  } catch (e: any) {
    const msg = e?.message || 'error';
    return new Response(msg === 'Forbidden' ? msg : `Error: ${msg}`, {
      status: msg === 'Forbidden' ? 403 : 400,
    });
  }
});
