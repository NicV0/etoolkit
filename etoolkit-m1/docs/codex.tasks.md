# Codex Tasks (Authoritative)

## Task A — Initialize repo & app
1. Create the folder structure in §2.
2. Generate `apps/mobile/package.json` with scripts: `start`, `ios`, `android`, `test`.
3. Add `tsconfig.json`, `babel.config.js`, `app.config.ts`, `eas.json`, `.env.example`.
4. Add root `.gitignore` to ignore `node_modules`, `.expo`, `build`, `dist`, `.env`, `*.log`, `.DS_Store`.
**Done when**: `cd apps/mobile && npm install && npm start` shows Expo dev tools and typecheck passes.

## Task B — SQL & RLS
1. Write `supabase/sql/schema.sql` with tables in §4.
2. Write `supabase/sql/rls_policies.sql` with policies in §4.
3. README: add exact `supabase` CLI commands to run both (see Quick Start).
**Done when**: Inserting a client without phone fails; selecting another org’s rows is denied by RLS.

## Task C — Edge functions
1. Implement `bootstrap-org/index.ts` per §5.1.
2. Implement `kitai/index.ts` per §5.2.
3. Implement `stripe-webhook/index.ts` per §5.3.
4. README: commands to deploy; secrets to set.
**Done when**: All 3 deploy; webhook returns 400 on bad signature.

## Task D — Supabase client & org context
1. Create `lib/supabase.ts` with AsyncStorage; `detectSessionInUrl:false`.
2. Create `lib/bootstrap.ts` with `callBootstrapOrg()` deriving function host.
3. Create `lib/org.tsx` to load membership or bootstrap and provide `orgId`.
**Done when**: Fresh login yields `orgId`; reload works.

## Task E — Auth screens
1. `/app/index.tsx` magic link with `signInWithOtp`.
2. `/app/auth-callback.tsx` `exchangeCodeForSession` then route to `/(tabs)/clients`.
**Done when**: Magic link completes and session persists.

## Task F — Clients tab
1. `/(tabs)/clients.tsx` list clients for `orgId`.
2. Modal create form with `name`, `email`, `phone`, `address` (validate phone).
3. Insert with `org_id`, update list optimistically.
**Done when**: Create works; missing phone blocks save.

## Task G — Quote builder & save draft
1. `/(tabs)/billing.tsx` items add/remove; totals; terms; contract.
2. `features/billing/api.ts` `saveQuoteDraft()` finds or creates client (requires phone) then inserts `quotes` + `quote_items`.
3. Navigate to `/quote/[id]` on success.
**Done when**: Draft rows exist.

## Task H — Preview & Export
1. `/quote/[id].tsx` fetch quote + items, compute totals.
2. `lib/quote-template.ts` → HTML → `expo-print` → PDF; `expo-sharing`.
**Done when**: PDF exports with proper totals and branding.

## Task I — Settings API (brand)
1. `features/settings/api.ts` `upsertOrgBrand()` returns `{ ok:true }`.
**Done when**: Upsert returns ok for `{ brand_color:'#0ea5e9' }`.

## Task J — Telemetry hooks
1. Add wrappers to emit events listed in §8.
**Done when**: Calls are no‑ops without keys; no runtime errors.

## Task K — Unit tests
1. Keep existing test.
2. Add case: two items + zero tax + no contract; assert totals and Contract section absent.
**Done when**: `npm test` passes.
