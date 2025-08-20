# Expo + Supabase Mobile Starter (Path A)

**What you get**
- Expo (with Expo Router), TypeScript, React Native
- Supabase Auth (email+password, magic links), session persisted in SecureStore
- Theming + basic UI components
- Env management + sanity check script
- EAS config, OTA updates ready
- Lint/format/test + GitHub Actions CI
- Push notifications scaffold (opt-in later)

## Quickstart

```bash
# 1) Create the project folder from this preset
# (Option A) Using this repo's files directly:
#   unzip the zip and cd into it, OR clone/copy files into a new folder

# 2) Install deps
npm install

# 3) Copy env template and fill values
cp .env.example .env
# Edit .env to set SUPABASE_URL and SUPABASE_ANON_KEY

# 4) Run sanity check (verifies env vars)
npm run env:check

# 5) Start
npm run start
# iOS:  npm run ios   | Android: npm run android
```

## Required secrets
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Folder map
- `app/` — Expo Router routes (auth + app)
- `components/` — Reusable UI
- `hooks/` — React hooks (auth provider)
- `lib/` — Clients (supabase), utilities
- `services/` — OS services (secure storage, notifications)
- `theme/` — Colors, spacing
- `scripts/` — dev scripts
- `test/` — unit tests

## EAS
Set up EAS if you plan to build binaries:
```bash
npm run eas:login
npm run eas:init
```

## Notes
- This starter prefers **native Supabase Auth**. If you want OAuth, enable providers in Supabase, then wire to `signInWithOAuth` where noted.
- For push, finish the steps in `services/notifications.ts` and Expo docs.
