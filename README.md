# etoolkit

## Supabase Edge Functions

### Deploy KitAI and Stripe Webhook

```bash
supabase functions deploy kitai
supabase functions deploy stripe-webhook
```

### Set Secrets

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Webhook Configuration

Create an endpoint in the Stripe dashboard pointing to:

```
https://<project-ref>.functions.supabase.co/stripe-webhook
```

Send test events and ensure valid signatures.

## EAS Build (iOS dev)

```bash
expo login
cd apps/mobile
eas init --id <project-id-if-any>
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://<ref>.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <anon>
eas build -p ios --profile development
```

## Tests

Run unit tests with:

```bash
npm test
```
