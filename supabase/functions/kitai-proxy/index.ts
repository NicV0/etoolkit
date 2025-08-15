import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const url = Deno.env.get('SUPABASE_URL')!, service = Deno.env.get('SUPABASE_SERVICE_ROLE')!;
    const openai = Deno.env.get('OPENAI_API_KEY');
    if (!openai) return new Response('Cloud disabled', { status: 501 });

    const body = await req.json().catch(()=>({}));
    const { org_id, query, topk = 6 } = body;
    if (!org_id || !query) return new Response('Missing fields', { status: 400 });

    const sb = createClient(url, service, { auth: { persistSession: false } });
    const { data: rows } = await sb.from('quotes').select('id, terms, contract_text').eq('org_id', org_id).limit(50);
    const context = (rows||[]).map(r=> `Quote ${r.id}: ${r.terms||''} ${r.contract_text||''}`).join('\n');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openai}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are KitAI for trades. Answer with bullet points, cite IDs when relevant. Never invent data outside provided context.' },
          { role: 'user', content: `Context:\n${context}\n\nQuestion: ${query}` }
        ],
        temperature: 0.2,
      })
    });
    const j = await res.json();
    const text = j?.choices?.[0]?.message?.content || 'No answer';
    return new Response(JSON.stringify({ text }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e:any) {
    return new Response(e?.message||'error', { status: 400 });
  }
});
