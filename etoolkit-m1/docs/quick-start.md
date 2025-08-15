### Quick Start — Mobile

```bash
# 1) Install deps
cd etoolkit-m1/apps/mobile
npm install

# 2) Env
cp .env.example .env
# Fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# 3) Run
npm start
# Optional:
npm run ios
```

### Quick Start — Supabase (Local via CLI)

```bash
# Install CLI (macOS):
brew install supabase/tap/supabase

# Start local stack
supabase start

# Apply schema + RLS using psql against local Postgres (default 54322)
export PGURL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
psql "$PGURL" -f supabase/sql/schema.sql
psql "$PGURL" -f supabase/sql/rls_policies.sql

# (Optional) Inspect tables
psql "$PGURL" -c "\dt public.*"
```

### Quick Start — Edge Functions (Local + Deploy)

```bash
# Secrets for functions (project-level)
supabase secrets set \
  SUPABASE_URL=https://<ref>.supabase.co \
  SUPABASE_ANON_KEY=<anon> \
  SUPABASE_SERVICE_ROLE=<service-role-key> \
  STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>

# Serve locally (each in a separate terminal if desired)
supabase functions serve bootstrap-org
supabase functions serve kitai
supabase functions serve stripe-webhook

# Deploy to hosted project
supabase functions deploy bootstrap-org
supabase functions deploy kitai
supabase functions deploy stripe-webhook
```

### Quick Start — Stripe CLI test (webhook)

```bash
# Forward events to local stripe-webhook function
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook

# Send a test event
stripe trigger payment_intent.succeeded
# Expect: HTTP 200 { ok: true }

# Bad signature test
# (Stop the listener or change secret) → expect HTTP 400 with error
```

### RLS Acceptance (manual)

```sql
-- Should FAIL: missing phone
insert into public.clients (org_id, name) values ('<org-uuid>', 'No Phone');

-- Using a different user (auth.uid()!= member), any of these should return 0 rows:
select * from public.clients where org_id = '<other-org-uuid>';
```
