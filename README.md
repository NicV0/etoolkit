# etoolkit

## Stripe payments

### Environment variables

- `STRIPE_SECRET_KEY` – Stripe secret key (test)
- `STRIPE_WEBHOOK_SECRET` – webhook signing secret
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`

### Local webhook testing with Stripe CLI

```bash
stripe login
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
stripe trigger payment_intent.succeeded
stripe trigger charge.refunded
```

### Deploy Supabase functions

```bash
supabase functions deploy create-payment-intent --no-verify-jwt=false
supabase functions deploy ephemeral-key --no-verify-jwt=true
supabase functions deploy stripe-webhook --no-verify-jwt=true
```
