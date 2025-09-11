# Phase 1 — F1 Subtasks Checklist

Use expo-supabase-mobile-starter/lib/theme/tokens.ts as the single source of truth.

F1-2a: Theme Tokens Guardrail
- [x] Align tokens.ts to navy palette per FRONTEND_PLAN
  - Base #0F2234; Surface #122A40; Raised #17344D; Accent-1 #3AA1FF; Accent-2 #6CA8FF
  - Success #3CCB8E; Warning #FFB020; Danger #FF5A5A
  - Text Primary #EAF2FB; Secondary #B6C7DA; Muted #7F95AC; Divider #23425F
- [x] Focus ring uses #6CA8FF
- [x] Interactive states: hover ~+10% luminance, pressed ~-12–15%
- [x] CI scripts wired
  - npm run theme:check (disallow deprecated imports)
  - npm run style:audit (no inline colors/one-off spacing/typography)

F1-3: Primitives consume tokens only
- [x] Button consumes semantic tokens (no inline hex, spacing/typography from tokens)
- [ ] Verify remaining primitives (Card, Section, Row, IconButton, Input, Select, Tag, Badge, Pill, Toast, Meter, EmptyState, HelpOverlay)

F1-8: Test IDs & Style Audit
- [ ] Ensure testIDs per spec on primitives
- [x] Style audit script present and runnable

How to verify locally
- npm run f1-verify
- If initial run shows existing issues, snapshot baseline: npm run style:audit:baseline
- Re-run f1-verify; ensure no new issues are introduced
