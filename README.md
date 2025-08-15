# etoolkit

## Quick Start

### Mobile App

```bash
cd apps/mobile
cp .env.example .env
npm install
npm start
```

### Supabase

Deploy database schema:

```bash
supabase db reset --db-url "postgresql://..." # optional for local
# or run in SQL editor:
#   paste supabase/sql/schema.sql
#   then supabase/sql/rls_policies.sql
```

Deploy edge function:

```bash
supabase functions deploy bootstrap-org
```

Set function secrets:

```bash
supabase secrets set --project-ref <ref> \
  SUPABASE_URL=https://<ref>.supabase.co \
  SUPABASE_ANON_KEY=<anon-key> \
  SUPABASE_SERVICE_ROLE=<service-role>
```
