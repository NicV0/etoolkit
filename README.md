# etoolkit

## Stripe Integration Setup

1. Set environment variables on Supabase functions:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE`
2. Deploy `stripe-sync` and `stripe-webhook` edge functions.
3. In Stripe dashboard, add webhook endpoint `https://<ref>.functions.supabase.co/stripe-webhook` listening to:
   `payment_intent.succeeded`, `payment_intent.payment_failed`, and `invoice.paid`.
4. From the mobile app, open an invoice and tap **Send Pay Link** to generate a payment link and share it with a client.
5. Use Stripe test cards (e.g., `4242 4242 4242 4242`) to complete payment and verify invoice status and payments table updates.

Run unit tests with `npm test`.
