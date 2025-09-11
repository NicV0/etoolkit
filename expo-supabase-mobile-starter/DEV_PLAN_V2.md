# Development Plan V2 (Sharpeners)

# GPT Model Assignment Guide (for token budgeting)

- Routine/standard app, UI, and CRUD code: use gpt-4
- Complex flows, advanced RLS/a11y, anything AI/logic-heavy: use gpt-5
- Each sub-task below is tagged for recommended model. Before starting a phase, check for gpt-5 warnings.

## Phase 1 — Foundations & Theme

F1-1: Expo app setup (TS, Router), env, lint/format — gpt-4
F1-2: Theme tokens (colors, type, spacing, radii, shadows) — gpt-4
F1-3: Primitives (Card, Section, Row, etc) use tokens — gpt-4
F1-4: 4 Tabs (Dashboard/Clients/Documents/Billing) — gpt-4
F1-5: Loading states (list shimmers, spinners) — gpt-4
F1-6: A11y defaults (labels, roles, focus, contrast) — gpt-5 ⚠️ (accessibility edge cases)
F1-7: Splash/launch screen with logo — gpt-4
F1-8: Test IDs, style audit scripts — gpt-4

## Phase 2 — Auth & Security

A2-1: Supabase auth/email/pass — gpt-4
A2-2: Secure token storage (SecureStore) — gpt-4
A2-3: Onboarding, privacy/disclaimers — gpt-4
A2-4: Lock screen (biometric/PIN), relock timeout — gpt-5 ⚠️
A2-5: Settings: lock timeout — gpt-4
A2-6: Sign-out flow, session clear — gpt-4
A2-7: Analytics: app_open event — gpt-4

## Phase 3 — Database & RLS

D3-1: Create schema (tables/fields) — gpt-4
D3-2: document_items discount fields — gpt-4
D3-3: document_counters table — gpt-4
D3-4: SQL views — gpt-4
D3-5: RLS policies for all tables — gpt-5 ⚠️ (critical for multi-tenant data safety)
D3-6: DB indexes — gpt-4
D3-7: Quota tables — gpt-4
D3-8: Storage triggers — gpt-4
D3-9: Seed default clauses — gpt-4
D3-10: Allowed MIME/type guard (server) — gpt-4

## Phase 4 — Documents (Core)

DOC4-1: Documents list (filters/search) — gpt-4
DOC4-2: Create wizard (multi-step) — gpt-5 ⚠️
DOC4-3: Line items table, math — gpt-4
DOC4-4: Totals/discount/taxes — gpt-4
DOC4-5: Numbering from counters — gpt-4
DOC4-6: Branding/templates/watermark rules — gpt-5 ⚠️
DOC4-7: PDF preview/export, immutable Vault — gpt-5 ⚠️
DOC4-8: Set sent status on Share — gpt-4
DOC4-9: Increment Free daily export counter — gpt-4
DOC4-10: Long document pagination test — gpt-4

## Phase 5 — Pricebook (MVP)

PB5-1: Picker bottom sheet — gpt-4
PB5-2: Manager modal (CRUD, pin, active) — gpt-4
PB5-3: Persist recents; respect Active — gpt-4
PB5-4: Suggested category chips — gpt-4
PB5-5: Add never overwrites existing rows — gpt-4

## Phase 6 — Clients

CL6-1: Clients list (search, open badge) — gpt-4
CL6-2: Client detail header (deep links) — gpt-4
CL6-3: Storage meter/CTA ≥90% — gpt-4
CL6-4: Vault upload/retag/search/preview (caps/tags) — gpt-5 ⚠️
CL6-5: Notes (rich, ai.polish-text) — gpt-5 ⚠️
CL6-6: Client Defaults (tax, payment, reminders) — gpt-4
CL6-7: HelpOverlay (“?”) slides — gpt-4

## Phase 7 — Billing (Manual Ledger)

B7-1: Billing views (Unpaid/Paid/All) — gpt-4
B7-2: Payments, mark paid/partial — gpt-4
B7-3: Partial payments math, verifications — gpt-4
B7-4: Overdue reminders, schedule/cancel — gpt-5 ⚠️
B7-5: Local notification scheduling/cancel — gpt-5 ⚠️
B7-6: Dashboard cards update on changes — gpt-4

## Phase 8 — Dashboard

DB8-1: Snapshot cards — gpt-4
DB8-2: Quick actions row — gpt-4
DB8-3: Activity feed (20, doc/payment/vault events) — gpt-4
DB8-4: Inline ai.reminder-email — gpt-5 ⚠️
DB8-5: Deep links from entries — gpt-4

## Phase 9 — AI, Quotas, Settings, CSV

AI9-1: Context builder (client/items/notes) — gpt-5 ⚠️
AI9-2: AI assist buttons (suggest lines, etc) — gpt-5 ⚠️
AI9-3: Undo snackbar; quota decrement — gpt-4
AI9-4: Quota meters (storage/exports/AI) — gpt-4
AI9-5: Upgrade modals/plan toggle — gpt-4
ST9-6: Settings — gpt-4
ST9-7: CSV export Clients & Docs — gpt-4
ST9-8: Cap block errors — gpt-4

## Phase 10 — QA, A11y & Performance

Q10-1: Unit/integration/e2e tests — gpt-4
Q10-2: A11y audit (labels, contrast, focus order) — gpt-5 ⚠️
Q10-3: Performance budgets tracking — gpt-4
Q10-4: Synthetic long-invoice/pagination — gpt-4
Q10-5: Edge tests: caps/quota/offline — gpt-4
Q10-6: Analytics events — gpt-4

Warning: Tasks marked with gpt-5 require advanced reasoning/edge-case handling. Use gpt-5 judiciously for these to save API tokens. All others may safely use gpt-4 for implementation.

## Phase 1 — Foundations & Theme

F1-2a: Theme Tokens Guardrail
- ESLint rule: disallow imports from lib/theme/index.ts and lib/theme/_deprecated/**
- CI gate: run scripts/check-disallowed-imports.js; fail if violations are found
- PR checklist: "No inline colors/spacing/typography; tokens only"
- Deprecate old theme module: move to lib/theme/_deprecated/index.ts, add DEPRECATED header, hard-fail on import; delete in Phase 2+

F1-3: Primitives use tokens exclusively
- All primitives consume colors, spacing, radii, shadows, typography exclusively from tokens.ts

F1-8: Test IDs & Style Audit
- Ensure testIDs per spec, and style audit verifies no inline hex or ad-hoc spacing in app/ and components/

## Semantic Aliases (Contract)
Use these names across UI and components; they map to tokens.ts values.

colors:
- background.base, background.surface, background.elevated
- text.primary, text.secondary, text.muted
- accent.primary, accent.primaryHover, accent.primaryPressed
- state.success, state.warning, state.danger
- border.subtle
- interactive.fill, interactive.fillHover, interactive.fillPressed, interactive.outline, interactive.outlineHover, interactive.outlinePressed
- focus.ring

radii:
- sm=8, md=12, lg=16, xl=20

shadows:
- card, popover, modal (soft, depth-based)

spacing:
- xs=8, sm=12, md=16, lg=24, xl=32

type:
- titleXL(28–32), section(20), body(16), meta(13–14)

## Interactive State Scale
- Hover = accent +10–12% luminance
- Pressed = accent −12–15% luminance
- Focus ring: focus.ring high contrast

## ThemeProvider (stub)
- Keep tokens static MVP; provide a stub ThemeProvider for future light theme swap.

## QA Gates (Phase 10 additions)
- Lint: import/no-restricted-paths for deprecated theme
- Style audit script: grep for hex/rgb colors and one-off spacing (allow only in tokens.ts)
- Design Tokens screen: render sample components tied to aliases
- Snapshot tokens.ts to catch accidental changes

## Acceptance Criteria (Epic 0)
- No imports from lib/theme/index.ts
- No inline colors/spacing/typography outside tokens.ts
- All primitives consume semantic aliases
- Unified hover/pressed behavior across interactive components
- A11y: 44dp min targets; contrast ≥ 4.5:1


Phase 1 — Foundations & Theme

F1-1: Expo app setup (TS, Router), env, lint/format

F1-2: Theme tokens (colors, type, spacing, radii, shadows)

F1-3: Primitives (Card, Section, Row, Button.Primary/Secondary, IconButton, Input, Select, Tag, Badge, Pill, Toast, Meter, EmptyState, HelpOverlay)

F1-4: 4 Tabs (Dashboard, Clients, Documents, Billing) with icons/labels

F1-5: Loading states (list shimmers, button spinners)

F1-6: A11y defaults (labels, roles, focus order, contrast)

F1-7: Splash/launch screen with logo

F1-8: Test IDs scaffold per spec

Phase 2 — Auth & Security

A2-1: Supabase auth (email/password), session persistence

A2-2: Secure token storage (SecureStore)

A2-3: Onboarding (trade_type capture, privacy/disclaimers)

A2-4: Lock screen (biometric/PIN), relock timeout (Off/30s/60s/5m; default 60s)

A2-5: Settings: lock timeout control

A2-6: Sign out flow

A2-7: Analytics: app_open

Phase 3 — Database & RLS

D3-1: Create schema per plan (incl. documents.tax_rate, documents.version)

D3-2: document_items discounts fields (type, value_cents, percent)

D3-3: document_counters table (per user/type/year)

D3-4: Views (v_outstanding_invoices, v_paid_this_month)

D3-5: RLS policies all tables (incl. parent checks)

D3-6: Indexes (documents, payments, vault_files, pricebook_items)

D3-7: Quota tables (usage_exports, usage_ai)

D3-8: Storage triggers for storage_used_bytes

D3-9: Seed default clauses

D3-10: Allowed MIME/type guard (server)

Phase 4 — Documents (Core)

DOC4-1: Documents list (filters: Type/Status/Date/Client; search)

DOC4-2: Create wizard (Type → Client → Details → Branding → Preview → Save & Share)

DOC4-3: Line items table (qty, unit_price_cents, taxable, per-line discount)

DOC4-4: Totals math (integer cents; line discount → tax → invoice-level discount)

DOC4-5: Numbering from counters (--)

DOC4-6: Branding snapshot; templates; watermark rules

DOC4-7: PDF preview/export, save immutable PDF to Vault (auto-tag Billing)

DOC4-8: Set sent status on Share; overflow “Mark as Sent”

DOC4-9: Increment Free daily export counter

DOC4-10: Long-invoice pagination test

Phase 5 — Pricebook (MVP)

PB5-1: Picker bottom sheet (multi-add, pinned/recent/categories/search)

PB5-2: Manager modal (CRUD, pin, active)

PB5-3: Persist recents on use; respect Active

PB5-4: Suggested non-binding category chips

PB5-5: Ensure add never overwrites existing rows

Phase 6 — Clients

CL6-1: Clients list (search, open balance badge)

CL6-2: Client detail header (call/sms/email deep links)

CL6-3: Storage meter (global) with upgrade CTA ≥90%

CL6-4: Vault section (upload with caps, tag filters, search, preview/retag/rename/delete)

CL6-5: Notes (rich; ai.polish-text)

CL6-6: Client Defaults (tax rate, payment instructions, reminders cadence)

CL6-7: HelpOverlay (“?”) slides

Phase 7 — Billing (Manual Ledger)

B7-1: Billing views (Unpaid | Paid This Month | All)

B7-2: Payments (mark paid, record partial; method/date/note)

B7-3: Partial payments math; outstanding verification

B7-4: Overdue reminders (7/14/30) per-invoice toggle

B7-5: Local notification scheduling/canceling

B7-6: Dashboard cards update on changes

Phase 8 — Dashboard

DB8-1: Snapshot cards (Outstanding, Paid This Month, Active Clients)

DB8-2: Quick actions row (new invoice/quote/contract, upload)

DB8-3: Activity feed (20): doc created/sent/paid, partial payments, vault add/delete, clause added, reminder scheduled/canceled

DB8-4: Inline ai.reminder-email for unpaid entries

DB8-5: Deep links from entries

Phase 9 — AI Turbo + Quotas & Upsell + Settings & CSV

AI9-1: Context builder (client/items/notes)

AI9-2: Buttons: suggest line items, add clause, polish text, add warranty, reminder email (mailto template)

AI9-3: Undo snackbar (4000ms); decrement quota on successful insert

AI9-4: Quota meters (storage/exports/AI) in Settings and Client detail

AI9-5: Upgrade modals at triggers; plan toggle updates plan_tier

ST9-6: Settings (Profile, Security options, Legal links)

ST9-7: CSV export Clients & Documents metadata (ISO 8601 UTC)

ST9-8: Blocks when caps reached (friendly errors)

Phase 10 — QA, A11y & Performance

Q10-1: Unit/integration/e2e tests for main flows and edges

Q10-2: A11y audit (labels, contrast, focus order)

Q10-3: Performance budgets (first paint <2s; 1p PDF <2.5s; lists ≥55fps)

Q10-4: Synthetic long invoice; pagination check

Q10-5: Edge tests: storage cap, AI/export quota, offline share fallbacks

Q10-6: Analytics events coverage


Next small items in F1-3 sweep

Add unit tests for Select and Row (visibility, cycling behavior for Select MVP, A11y roles, and disabled states).

Tests — Select
- Visibility: menu opens/closes on trigger press; closes on outside press and on selection
- Cycling behavior (MVP): repeated trigger press cycles through options in order; wraps at end
- A11y roles/labels: trigger has role=button (or combobox if applicable), list uses role=listbox, options use role=option; ensures accessibilityLabel and accessibilityState reflect disabled/selected
- Disabled states: when disabled, trigger does not open; options respect disabled
- Test IDs: expose stable IDs (e.g., testID="select.trigger", testID per option like "select.option.<value>")
- Tokens: verify no inline colors/radii/spacing/typography; styles reference expo-supabase-mobile-starter/lib/theme/tokens.ts

Tests — Row
- Visibility/layout: renders left/right slots and title/subtitle when provided
- Pressable state: onPress fires; disabled prevents presses; minimum tap target ≥ 44dp
- A11y: role=button when onPress supplied; accessibilityHint respected; focusable true when interactive
- Separators: if enabled, uses border.subtle from tokens; spacing uses spacing tokens (xs/sm/md/etc.)
- Test IDs: e.g., testID="row.item", with subparts like "row.left", "row.right"
- Tokens: verify spacing, colors, typography, radii derive only from tokens.ts

Confirm remaining primitives meet contract
Scope: Badge, Tag, Pill, Toast, Meter, EmptyState, HelpOverlay, Card, Section, IconButton, Skeleton, LoadingSpinner, Modal
- Tokens usage: consume semantic aliases from expo-supabase-mobile-starter/lib/theme/tokens.ts only (no imports from lib/theme/index.ts, no inline hex/rgb, no magic spacing/typography)
- Baseline A11y defaults: roles, labels, states; focus ring uses focus.ring; touch targets ≥ 44dp
- Test IDs: expose stable testIDs where relevant (e.g., toast.container, meter.bar, badge.container, iconButton.button, modal.container)
- Radii/shadows/z-index: radii use sm/md/lg/xl; shadows use card/popover/modal; layering via z-index tokens
- Interactive states: hover/pressed map to interactive.* and accent.* scales; pressed −12–15%, hover +10–12% luminance
- Type scale: titleXL/section/body/meta mapping only via tokens

Deliverables
- Tests: components/__tests__/Select.test.tsx and Row.test.tsx cover the cases above
- Lint/style gates: passes tokens-only audit; no imports from lib/theme/index.ts; no inline colors/spacing/typography outside tokens.ts
- Stories/samples: Design Tokens screen updated to show Select/Row states and remaining primitives in their variants for visual QA

Acceptance additions (F1-3)
- Select and Row have unit tests covering visibility, cycling (Select MVP), A11y, and disabled behavior
- All listed primitives verified to use tokens.ts, include baseline A11y defaults, and expose testIDs where relevant
