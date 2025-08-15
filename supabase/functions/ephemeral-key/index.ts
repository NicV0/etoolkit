// deno-lint-ignore-file no-explicit-any
import Stripe from "npm:stripe@^15.8.0";

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const stripeSk = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSk) return new Response('Stripe not configured', { status: 503 });
  const { customerId } = await req.json().catch(()=>({}));
  if (!customerId) return new Response('Missing customerId', { status: 400 });
  const stripe = new Stripe(stripeSk, { apiVersion: '2023-10-16' });
  const ek = await stripe.ephemeralKeys.create({ customer: customerId }, { apiVersion: '2023-10-16' });
  return new Response(JSON.stringify(ek), { headers: { 'Content-Type': 'application/json' } });
});
