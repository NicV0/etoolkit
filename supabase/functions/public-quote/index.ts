import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

function renderQuoteHTML(opts: any) {
  const items = (opts.items || [])
    .map((it: any) => `<li>${it.name} x ${it.qty} @ $${it.rate.toFixed(2)}</li>`) 
    .join('');
  return `<!DOCTYPE html><html><body style="font-family: sans-serif;">
    <h1 style="color:${opts.company.color}">${opts.company.name}</h1>
    <ul>${items}</ul>
    <p>Subtotal: $${opts.totals.subtotal.toFixed(2)}</p>
    <p>Tax: $${opts.totals.tax.toFixed(2)}</p>
  </body></html>`;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token') || '';
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE')!, { auth:{ persistSession:false } });
    const { data: link } = await sb
      .from('public_links')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!link || link.kind !== 'quote') return new Response('Not Found', { status: 404 });

    const { data: q } = await sb.from('quotes').select('*').eq('id', link.entity_id).single();
    const { data: items } = await sb.from('quote_items').select('*').eq('quote_id', link.entity_id);
    const { data: feat } = await sb.from('org_features').select('brand_color, company_name, logo_url').eq('org_id', link.org_id).maybeSingle();

    const subtotal = (items||[]).reduce((s,it)=> s + (it.qty||0)*((it.rate_cents||0)/100), 0);
    const tax = subtotal * ((q?.tax_percent||0)/100);
    const html = renderQuoteHTML({
      company: { name: feat?.company_name||'Your Company', color: feat?.brand_color||'#1e3a8a' },
      client: { name: 'Client' },
      items: (items||[]).map(it=> ({ name: it.name, qty: it.qty, rate: (it.rate_cents||0)/100 })),
      totals: { subtotal, tax },
      terms: q?.terms||'',
      contract: q?.contract_text||''
    });
    return new Response(html, { headers:{ 'Content-Type':'text/html; charset=utf-8' } });
  } catch (e: any) {
    return new Response('Error', { status: 500 });
  }
});
