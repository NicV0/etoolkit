import Stripe from 'npm:stripe@^14.0.0';

const stripe = new Stripe('sk_test_123', { apiVersion: '2024-06-20' });

Deno.serve(async (req) => {
  try {
    const whsec = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!whsec) return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });

    const sig = req.headers.get('stripe-signature') || '';
    const raw = await req.text();

    const event = stripe.webhooks.constructEvent(raw, sig, whsec);
    console.log(JSON.stringify({ id: event.id, type: event.type }));

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(`Invalid signature: ${err.message || 'unknown'}`, { status: 400 });
  }
});
