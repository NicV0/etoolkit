Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const body = await req.json();
    const { to, subject, html, text } = body || {};
    if (!to || !subject || !html) return new Response('Missing fields', { status: 400 });
    const key = Deno.env.get('RESEND_API_KEY');
    if (!key) {
      console.log('[email:test]', { to, subject, len: html.length });
      return new Response(JSON.stringify({ ok: true, test: true }), { headers:{ 'Content-Type':'application/json' } });
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ from: 'eToolkit <no-reply@etoolkit.app>', to, subject, html, text })
    });
    const j = await res.json();
    if (!res.ok) return new Response(`Resend error: ${j?.message||res.statusText}`, { status: 400 });
    return new Response(JSON.stringify({ ok:true, id: j?.id }), { headers:{ 'Content-Type':'application/json' } });
  } catch (e: any) {
    return new Response('Error', { status: 500 });
  }
});
