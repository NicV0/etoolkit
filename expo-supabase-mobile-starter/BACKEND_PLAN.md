# Backend Plan — Schema# Development Plan V2 (Sharpeners)

# GPT Model Assignment Guide (for token budgeting)

> **Routine/standard app, UI, and CRUD code:** Use gpt-4.
> **Complex flows, advanced RLS/a11y, anything AI/logic-heavy:** Use gpt-5.
> **Each sub-task below is tagged for recommended model. Before starting a phase, check for gpt-5 warnings!**

## Phase 1 — Foundations & Theme

F1-1: Expo app setup (TS, Router), env, lint/format         — gpt-4
F1-2: Theme tokens (colors, type, spacing, radii, shadows) — gpt-4
F1-3: Primitives (Card, Section, Row, etc) use tokens      — gpt-4
F1-4: 4 Tabs (Dashboard/Clients/Documents/Billing)         — gpt-4
F1-5: Loading states (list shimmers, spinners)             — gpt-4
F1-6: A11y defaults (labels, roles, focus, contrast)       — gpt-5  ⚠️  (accessibility edge cases)
F1-7: Splash/launch screen with logo                       — gpt-4
F1-8: Test IDs, style audit scripts                        — gpt-4

## Phase 2 — Auth & Security

A2-1: Supabase auth/email/pass                             — gpt-4
A2-2: Secure token storage (SecureStore)                   — gpt-4
A2-3: Onboarding, privacy/disclaimers                      — gpt-4
A2-4: Lock screen (biometric/PIN), relock timeout          — gpt-5  ⚠️
A2-5: Settings: lock timeout                               — gpt-4
A2-6: Sign-out flow, session clear                         — gpt-4
A2-7: Analytics: app_open event                            — gpt-4

## Phase 3 — Database & RLS

D3-1: Create schema (tables/fields)                        — gpt-4
D3-2: document_items discount fields                       — gpt-4
D3-3: document_counters table                              — gpt-4
D3-4: SQL views                                            — gpt-4
D3-5: RLS policies for all tables                          — gpt-5  ⚠️  (critical for multi-tenant data safety)
D3-6: DB indexes                                           — gpt-4
D3-7: Quota tables                                         — gpt-4
D3-8: Storage triggers                                     — gpt-4
D3-9: Seed default clauses                                 — gpt-4
D3-10: Allowed MIME/type guard (server)                    — gpt-4

## Phase 4 — Documents (Core)

DOC4-1: Documents list (filters/search)                    — gpt-4
DOC4-2: Create wizard (multi-step)                         — gpt-5  ⚠️
DOC4-3: Line items table, math                             — gpt-4
DOC4-4: Totals/discount/taxes                              — gpt-4
DOC4-5: Numbering from counters                            — gpt-4
DOC4-6: Branding/templates/watermark rules                 — gpt-5  ⚠️
DOC4-7: PDF preview/export, immutable Vault                — gpt-5  ⚠️
DOC4-8: Set sent status on Share                           — gpt-4
DOC4-9: Increment Free daily export counter                — gpt-4
DOC4-10: Long document pagination test                     — gpt-4

## Phase 5 — Pricebook (MVP)

PB5-1: Picker bottom sheet                                 — gpt-4
PB5-2: Manager modal (CRUD, pin, active)                   — gpt-4
PB5-3: Persist recents; respect Active                     — gpt-4
PB5-4: Suggested category chips                            — gpt-4
PB5-5: Add never overwrites existing rows                  — gpt-4

## Phase 6 — Clients

CL6-1: Clients list (search, open badge)                   — gpt-4
CL6-2: Client detail header (deep links)                   — gpt-4
CL6-3: Storage meter/CTA ≥90%                              — gpt-4
CL6-4: Vault upload/retag/search/preview (caps/tags)       — gpt-5  ⚠️
CL6-5: Notes (rich, ai.polish-text)                        — gpt-5  ⚠️
CL6-6: Client Defaults (tax, payment, reminders)           — gpt-4
CL6-7: HelpOverlay (“?”) slides                            — gpt-4

## Phase 7 — Billing (Manual Ledger)

B7-1: Billing views (Unpaid/Paid/All)                      — gpt-4
B7-2: Payments, mark paid/partial                          — gpt-4
B7-3: Partial payments math, verifications                 — gpt-4
B7-4: Overdue reminders, schedule/cancel                   — gpt-5  ⚠️
B7-5: Local notification scheduling/cancel                 — gpt-5  ⚠️
B7-6: Dashboard cards update on changes                    — gpt-4

## Phase 8 — Dashboard

DB8-1: Snapshot cards                                      — gpt-4
DB8-2: Quick actions row                                   — gpt-4
DB8-3: Activity feed (20, doc/payment/vault events)        — gpt-4
DB8-4: Inline ai.reminder-email                            — gpt-5  ⚠️
DB8-5: Deep links from entries                             — gpt-4

## Phase 9 — AI, Quotas, Settings, CSV

AI9-1: Context builder (client/items/notes)                — gpt-5  ⚠️
AI9-2: AI assist buttons (suggest lines, etc)              — gpt-5  ⚠️
AI9-3: Undo snackbar; quota decrement                      — gpt-4
AI9-4: Quota meters (storage/exports/AI)                   — gpt-4
AI9-5: Upgrade modals/plan toggle                          — gpt-4
ST9-6: Settings                                            — gpt-4
ST9-7: CSV export Clients & Docs                           — gpt-4
ST9-8: Cap block errors                                    — gpt-4

## Phase 10 — QA, A11y & Performance

Q10-1: Unit/integration/e2e tests                         — gpt-4
Q10-2: A11y audit (labels, contrast, focus order)          — gpt-5  ⚠️
Q10-3: Performance budgets tracking                        — gpt-4
Q10-4: Synthetic long-invoice/pagination                   — gpt-4
Q10-5: Edge tests: caps/quota/offline                     — gpt-4
Q10-6: Analytics events                                   — gpt-4

---
**⚠️ Warning**: Tasks marked with gpt-5 require advanced reasoning/edge-case handling. Use gpt-5 judiciously for these to save API tokens. All others may safely use gpt-4 for implementation.

// ... rest of original content ...
# Development Plan V2 (Sharpeners)

# GPT Model Assignment Guide (for token budgeting)

> **Routine/standard app, UI, and CRUD code:** Use gpt-4.
> **Complex flows, advanced RLS/a11y, anything AI/logic-heavy:** Use gpt-5.
> **Each sub-task below is tagged for recommended model. Before starting a phase, check for gpt-5 warnings!**

## Phase 1 — Foundations & Theme

F1-1: Expo app setup (TS, Router), env, lint/format         — gpt-4
F1-2: Theme tokens (colors, type, spacing, radii, shadows) — gpt-4
F1-3: Primitives (Card, Section, Row, etc) use tokens      — gpt-4
F1-4: 4 Tabs (Dashboard/Clients/Documents/Billing)         — gpt-4
F1-5: Loading states (list shimmers, spinners)             — gpt-4
F1-6: A11y defaults (labels, roles, focus, contrast)       — gpt-5  ⚠️  (accessibility edge cases)
F1-7: Splash/launch screen with logo                       — gpt-4
F1-8: Test IDs, style audit scripts                        — gpt-4

## Phase 2 — Auth & Security

A2-1: Supabase auth/email/pass                             — gpt-4
A2-2: Secure token storage (SecureStore)                   — gpt-4
A2-3: Onboarding, privacy/disclaimers                      — gpt-4
A2-4: Lock screen (biometric/PIN), relock timeout          — gpt-5  ⚠️
A2-5: Settings: lock timeout                               — gpt-4
A2-6: Sign-out flow, session clear                         — gpt-4
A2-7: Analytics: app_open event                            — gpt-4

## Phase 3 — Database & RLS

D3-1: Create schema (tables/fields)                        — gpt-4
D3-2: document_items discount fields                       — gpt-4
D3-3: document_counters table                              — gpt-4
D3-4: SQL views                                            — gpt-4
D3-5: RLS policies for all tables                          — gpt-5  ⚠️  (critical for multi-tenant data safety)
D3-6: DB indexes                                           — gpt-4
D3-7: Quota tables                                         — gpt-4
D3-8: Storage triggers                                     — gpt-4
D3-9: Seed default clauses                                 — gpt-4
D3-10: Allowed MIME/type guard (server)                    — gpt-4

## Phase 4 — Documents (Core)

DOC4-1: Documents list (filters/search)                    — gpt-4
DOC4-2: Create wizard (multi-step)                         — gpt-5  ⚠️
DOC4-3: Line items table, math                             — gpt-4
DOC4-4: Totals/discount/taxes                              — gpt-4
DOC4-5: Numbering from counters                            — gpt-4
DOC4-6: Branding/templates/watermark rules                 — gpt-5  ⚠️
DOC4-7: PDF preview/export, immutable Vault                — gpt-5  ⚠️
DOC4-8: Set sent status on Share                           — gpt-4
DOC4-9: Increment Free daily export counter                — gpt-4
DOC4-10: Long document pagination test                     — gpt-4

## Phase 5 — Pricebook (MVP)

PB5-1: Picker bottom sheet                                 — gpt-4
PB5-2: Manager modal (CRUD, pin, active)                   — gpt-4
PB5-3: Persist recents; respect Active                     — gpt-4
PB5-4: Suggested category chips                            — gpt-4
PB5-5: Add never overwrites existing rows                  — gpt-4

## Phase 6 — Clients

CL6-1: Clients list (search, open badge)                   — gpt-4
CL6-2: Client detail header (deep links)                   — gpt-4
CL6-3: Storage meter/CTA ≥90%                              — gpt-4
CL6-4: Vault upload/retag/search/preview (caps/tags)       — gpt-5  ⚠️
CL6-5: Notes (rich, ai.polish-text)                        — gpt-5  ⚠️
CL6-6: Client Defaults (tax, payment, reminders)           — gpt-4
CL6-7: HelpOverlay (“?”) slides                            — gpt-4

## Phase 7 — Billing (Manual Ledger)

B7-1: Billing views (Unpaid/Paid/All)                      — gpt-4
B7-2: Payments, mark paid/partial                          — gpt-4
B7-3: Partial payments math, verifications                 — gpt-4
B7-4: Overdue reminders, schedule/cancel                   — gpt-5  ⚠️
B7-5: Local notification scheduling/cancel                 — gpt-5  ⚠️
B7-6: Dashboard cards update on changes                    — gpt-4

## Phase 8 — Dashboard

DB8-1: Snapshot cards                                      — gpt-4
DB8-2: Quick actions row                                   — gpt-4
DB8-3: Activity feed (20, doc/payment/vault events)        — gpt-4
DB8-4: Inline ai.reminder-email                            — gpt-5  ⚠️
DB8-5: Deep links from entries                             — gpt-4

## Phase 9 — AI, Quotas, Settings, CSV

AI9-1: Context builder (client/items/notes)                — gpt-5  ⚠️
AI9-2: AI assist buttons (suggest lines, etc)              — gpt-5  ⚠️
AI9-3: Undo snackbar; quota decrement                      — gpt-4
AI9-4: Quota meters (storage/exports/AI)                   — gpt-4
AI9-5: Upgrade modals/plan toggle                          — gpt-4
ST9-6: Settings                                            — gpt-4
ST9-7: CSV export Clients & Docs                           — gpt-4
ST9-8: Cap block errors                                    — gpt-4

## Phase 10 — QA, A11y & Performance

Q10-1: Unit/integration/e2e tests                         — gpt-4
Q10-2: A11y audit (labels, contrast, focus order)          — gpt-5  ⚠️
Q10-3: Performance budgets tracking                        — gpt-4
Q10-4: Synthetic long-invoice/pagination                   — gpt-4
Q10-5: Edge tests: caps/quota/offline                     — gpt-4
Q10-6: Analytics events                                   — gpt-4

---
**⚠️ Warning**: Tasks marked with gpt-5 require advanced reasoning/edge-case handling. Use gpt-5 judiciously for these to save API tokens. All others may safely use gpt-4 for implementation.

// ... rest of original content ...
, RLS, Quotas, Flows

Cursor Prompt Guardrail
- Do not add or remove tabs. Tabs are exactly Dashboard, Clients, Documents, Billing.
- Use only the defined component set and theme tokens. Follow spacing grid and type scale.
- All actions use OS share sheet; email/SMS via deep links. No SMTP/SMS providers.
- AI is contextual buttons only; outputs editable; undo snackbar required.
- Quotas: Free = 1GB, 5 exports/day (reset local midnight), 10 AI/month (reset 1st UTC); Pro = 10GB, unlimited. Enforce and show meters.
- Money: store in integer cents. Totals: Subtotal + Line Taxes – Invoice Discount = Grand Total.
- PDF: Free shows watermark; Pro removes it. Templates include CopperLine/CircuitBoard/ClimateCraft/BuildSheet.
- RLS: every row belongs to auth.uid(). Never bypass.
- Do not auto-send anything; user must confirm share.
- Test IDs: Use the provided ids for all critical elements.

## Architecture Overview
- Auth: Supabase email/password
- DB: Postgres (Supabase) with RLS on all user-owned tables
- Storage: Supabase Storage; per-user byte accounting
- Documents: HTML/CSS → PDF; store immutable PDFs in Storage; URL in documents.pdf_url
- Quotas: Enforced server-side with DB tables/triggers/policies
- Resets: Exports reset at local midnight; AI assists reset on the 1st (UTC)

## Data Model (tables, columns, semantics)

users
- auth_id (uuid pk) — Supabase auth uid
- email text
- trade_type text
- plan_tier text check in ('free','pro') default 'free'
- storage_used_bytes bigint default 0
- created_at timestamptz default now()

clients
- id uuid pk, user_id uuid fk → users
- name text, email text, phone text, notes text
- default_tax_rate numeric(5,3) default 0
- payment_instructions text
- preferred_reminders text check in ('off','7_14_30') default '7_14_30'
- created_at timestamptz default now()

documents
- id uuid pk, user_id, client_id
- type enum('invoice','quote','contract')
- number text, title text
- status enum('draft','sent','paid') default 'draft'
- totals jsonb { subtotal_cents, line_tax_cents, invoice_discount_cents, grand_total_cents }
- invoice_level_discount_type enum('amount','percent') default 'amount'
- invoice_level_discount_cents int default 0
- branding_snapshot jsonb { template_name, color, logo_url, watermark: bool }
- pdf_url text
- created_at timestamptz, updated_at timestamptz
- sent_at timestamptz null, paid_at timestamptz null

document_items
- id uuid pk, document_id uuid fk → documents
- description text
- qty numeric(12,3) default 1
- unit_price_cents int not null
- taxable boolean default true
- line_total_cents int not null

payments
- id uuid pk, document_id uuid fk
- amount_cents int not null
- method enum('cash','check','zelle','venmo','other')
- date date not null
- note text null

vault_files
- id uuid pk, user_id, client_id
- file_url text, file_name text
- size_bytes bigint not null
- tag enum('contract','billing','pictures','other')
- uploaded_at timestamptz default now()

clauses
- id uuid pk, user_id uuid null (null = defaults/seed)
- category enum('scope','payment','warranty','liability','change','termination')
- text text not null, is_default boolean default false
- created_at timestamptz

pricebook_items
- id uuid pk, user_id uuid fk
- title text, description text, unit text
- default_qty numeric(12,3) default 1
- unit_price_cents int not null
- taxable boolean default true
- category text, is_pinned boolean default false
- active boolean default true
- created_at timestamptz, updated_at timestamptz

// Future-proof (no UI in MVP)
document_shares
- id uuid pk, user_id, client_id, document_id
- token_hash text, audience enum('client','public')
- allowed_actions jsonb (e.g., ["view","download"])
- expires_at timestamptz null, status enum('active','revoked')
- created_at timestamptz

### Views
- v_outstanding_invoices: sum outstanding per user based on (doc totals − payments) for status ≠ 'paid'
- v_paid_this_month: sum paid where paid_at within current month

### Indexes (representative)
- documents (user_id, type, status, created_at)
- vault_files (user_id, client_id, tag, uploaded_at)
- pricebook_items (user_id, active, is_pinned, category, updated_at)
- payments (document_id, date)

## RLS Policies (snippets)

All tables either include user_id directly or can be validated through a parent row owned by the user.

Example: direct ownership (clients)
```sql
alter table clients enable row level security;
create policy clients_is_owner_select on clients
  for select using (user_id = auth.uid());
create policy clients_is_owner_cud on clients
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

Example: parent ownership (document_items)
```sql
alter table document_items enable row level security;
create policy document_items_owner on document_items
  for all using (
    exists (
      select 1 from documents d
      where d.id = document_items.document_id
        and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from documents d
      where d.id = document_items.document_id
        and d.user_id = auth.uid()
    )
  );
```

Example: clauses default + user rows
```sql
alter table clauses enable row level security;
-- Read defaults (user_id is null) or own rows
create policy clauses_read on clauses
  for select using (user_id is null or user_id = auth.uid());
create policy clauses_cud on clauses
  for all using (coalesce(user_id, auth.uid()) = auth.uid())
  with check (user_id = auth.uid());
```

Disable or owner-only policies for document_shares during MVP.

## Quotas & Enforcement

Plan limits
- Free: storage 1GB; file max 10MB; 5 PDF exports/day; 10 AI assists/month
- Pro: storage 10GB; file max 50MB; unlimited exports and AI

Counters/tables (suggested)
- usage_exports: id, user_id, day (date), count int
- usage_ai: id, user_id, month (date trunc to month), assists int

Storage accounting
- On upload success: users.storage_used_bytes += size_bytes
- On delete: decrement accordingly
- Before upload: check users.storage_used_bytes + size_bytes <= plan_limit

Resets
- Exports: reset daily at local midnight (client sends local day; server validates window)
- AI: reset on the 1st of each month (UTC)
- Note: For consistency with product spec, enforce per-file caps (Free: 10 MB, Pro: 50 MB)

Server checks (pseudo)
- Upload guard: reject when exceeding per-file limit or storage cap
- Export guard: reject when Free and count >= 5 for the user/day
- AI guard: reject when Free and assists >= 10 for the user/month

## Core Flows

Create Invoice/Quote
1) Insert documents (draft) with branding_snapshot and invoice-level discount defaults
2) Insert document_items (qty, unit_price_cents, taxable); compute line_total_cents
3) Compute totals (integer cents): subtotal, line taxes sum, invoice discount, grand total
4) Generate PDF, upload to Storage, update documents.pdf_url
5) Share via OS share sheet
6) If Free: increment usage_exports

Record Payment
1) Insert payments (amount_cents, method, date, note)
2) Recompute outstanding; if fully paid, set documents.status = 'paid', paid_at
3) Cancel future reminders for that invoice (client-side schedule)

Upload to Vault
1) Check per-file cap + storage cap
2) Upload file, create vault_files row, bump storage_used_bytes

Pricebook
- CRUD on pricebook_items (active/pinned)
- Mark recent usage timestamp (for ordering in picker)

CSV Exports
- Clients: id, name, email, phone, created_at, default_tax_rate, preferred_reminders
- Documents (metadata only): id, number, type, status, client_name, total_cents, created_at, sent_at, paid_at

## Monitoring & Auditing
- Events: app_open, doc_created, doc_sent, invoice_paid, ai_assist_used {type}, file_uploaded, export_done, upgrade_click
- Log quota violations and RLS denials for diagnostics (no data leakage)

## PDF Guidelines (cross-ref)
- HTML/CSS engine; simple tables; repeated headers on page break; reserved footer area; embedded/standard fonts (1–2 weights); render from stored branding snapshot

## Acceptance (backend)
- RLS prevents cross-user access reliably
- Storage meter reflects upload/delete changes within 1s
- Quotas enforced server-side with accurate error codes
- Totals use integer cents; guard against float drift
- PDFs immutable; snapshot branding used for render

---

## Addendum — Clarifications (MVP v2)

Templates & Watermark
- Free: exactly one standard template named "Trade Standard (Blue)" with watermark.
- Pro: minimum three styles: CopperLine, CircuitBoard, ClimateCraft, BuildSheet.
- Watermark text: "Generated with eToolkit", positioned bottom-right at ~15% opacity.

Pricebook Scope
- Pricebook is per-user (not per-client, not shared). All pricebook_items are owned by user_id and available across all clients.

Reminders (Billing)
- Local reminders only (no push providers). Cadence options: 'off' or '7_14_30'. Scheduling/canceling handled on device; server stores the preference on documents/clients where applicable.

Quotas Resets (precision)
- Exports/day (Free): reset at local midnight (client provides local day; server validates window).
- AI assists/month (Free): reset on the 1st of the month (UTC).

CSV Exports
- Line items are excluded in MVP. Only the specified Clients and Documents metadata fields are exported.

Invariants
- Integer-cents math, no float drift; invoice-level discount switching recalculates once and never double-applies.
- RLS never bypassed; server-side enforcement for storage and quotas remains the source of truth.

### Addendum — Clarifications (Round 2)

Numbering & Counters
- Format: <TYPE>-<YYYY>-<NNNN>; unique per user, per type, per year; sequences reset yearly.
- Helper table: document_counters(user_id uuid, type text, year int, next_seq int).

Taxes
- documents.tax_rate numeric(5,3); defaulted from Client; applied to taxable lines.

Line-item Discounts
- document_items: discount_type enum('amount','percent') default 'amount'; discount_value_cents int default 0; discount_percent numeric(5,2) default 0.
- Order: apply line discount, then tax (if taxable), then invoice-level discount.

Sent Status
- Set status='sent', sent_at=now() on Share PDF invocation. Allow manual fallback “Mark as Sent”.

Branding Snapshot & Versions
- documents.version int default 1. Branding snapshot locked per version; rebranding requires new PDF and version++.

Reminders
- Create schedules when invoice is Sent/Unpaid and toggle ON; cancel when Paid or toggle OFF. Client Default changes affect new invoices only.

Vault File Types
- Allow: application/pdf; image/jpeg/png/heic/webp; text/plain; application/vnd.openxmlformats-officedocument.wordprocessingml.document.
- Block: executables/archives (.exe, .bat, .sh, .zip, .rar, etc.).

Activity Feed Events
- Include reminder_scheduled and reminder_canceled event types.

CSV Datetimes
- Use ISO 8601 UTC (e.g., 2025-08-25T00:00:00Z).

Currency & Fonts
- Currency: USD only (MVP). PDFs embed Inter for consistent rendering.
