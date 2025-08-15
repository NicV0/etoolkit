// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
  const emailKey = Deno.env.get('RESEND_API_KEY');
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { invoice_id, to } = await req.json().catch(()=>({}));
  if (!invoice_id || !to) return new Response('Missing fields', { status: 400 });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: inv } = await admin.from('invoices').select('id, org_id, total_cents, currency').eq('id', invoice_id).maybeSingle();

  if (!emailKey) return new Response('Email disabled', { status: 501 });

  const ck = await fetch(`${url}/functions/v1/create-checkout-session`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ invoice_id }) }).then(r=>r.json()).catch(()=>({ url: null }));
  const link = ck.url || 'Contact us to pay.';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${emailKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'eToolkit <billing@etoolkit.app>',
      to: [to],
      subject: `Invoice ${inv?.id}`,
      html: `<p>You have an invoice for ${(inv?.total_cents||0)/100} ${(inv?.currency||'USD').toUpperCase()}.</p><p><a href="${link}">Pay securely</a></p>`
    })
  });

  await admin.from('outbound_emails').insert({ org_id: inv?.org_id, invoice_id, to_email: to, subject: `Invoice ${inv?.id}` });
  return new Response('OK');
});
