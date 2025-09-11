## PR Checklist

- [ ] Style guardrails: No inline color literals (hex/rgb/rgba/hsl) and no one-off spacing/fontSize numbers. All color, spacing, and typography must come from expo-supabase-mobile-starter/lib/theme/tokens.ts.
- [ ] No imports from lib/theme/index.ts or lib/theme/_deprecated/**; only import from lib/theme/tokens.ts.
- [ ] UI uses semantic aliases from tokens.ts where applicable (avoid hardcoding token primitives directly in components when a semantic alias exists).
- [ ] Ran locally: npm run lint:theme, npm run typecheck, npm test

## Description

## Screenshots / Videos (optional)

## Notes

- If your PR intentionally fixes or refactors existing style audit violations, update the baseline by running:
  - cd expo-supabase-mobile-starter
  - node scripts/check-style-audit.js --write-baseline
  Commit the updated .github/style-audit-baseline.json with your changes.
