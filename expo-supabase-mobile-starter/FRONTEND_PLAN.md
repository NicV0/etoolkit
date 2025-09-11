# Frontend Plan (MVP v2)

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

## Theme & Components

Theme (navy): Base #0F2234; Surface #122A40; Raised #17344D; Accent-1 #3AA1FF; Accent-2 #6CA8FF; Success #3CCB8E; Warning #FFB020; Danger #FF5A5A; Text Primary #EAF2FB, Secondary #B6C7DA, Muted #7F95AC, Divider #23425F. Type scale Title 28–32; Section 20; Body 16; Meta 13–14. Spacing: 16dp gutters; 8/12/16/24/32dp rhythm.

Primitive components
- Card, Section, Row
- Button.Primary, Button.Secondary, IconButton
- Input, Select
- Tag, Badge, Pill
- Toast/Snackbar, EmptyState
- Meter (storage/AI/exports)
- HelpOverlay

## Test IDs
- Screens: screen.dashboard, screen.clients.list, screen.clients.detail, screen.documents.list, screen.documents.create, screen.billing, screen.settings
- Core actions: btn.new-invoice, btn.new-quote, btn.new-contract, btn.upload-doc, btn.preview, btn.share-pdf, btn.mark-paid, btn.record-partial
- AI: ai.suggest-line-items, ai.add-clause, ai.polish-text, ai.add-warranty, ai.reminder-email
- Pricebook: btn.quick-add-pricebook, sheet.pricebook, input.pricebook-search, btn.manage-pricebook, modal.pricebook-manager, row.pricebook-item.<id>
- Totals: input.invoice-discount, field.invoice-discount-type, label.totals-subtotal, label.totals-tax, label.totals-discount, label.totals-grand
- Client defaults: input.client-default-tax, input.client-payment-instructions, select.client-reminders
- Quota meters: meter.storage, meter.ai-assists, meter.exports

## Screens

Dashboard (screen.dashboard)
- Header: "Dashboard"
- Snapshot cards: card.outstanding, card.paid-month, card.active-clients (tap navigates to filtered screens)
- Quick actions row: btn.new-invoice, btn.new-quote, btn.new-contract, btn.upload-doc
- Activity feed (last 20): doc created/sent/paid, partial payment, file upload/delete, clause inserted; inline ai.reminder-email for unpaid
- Empty: CTA to btn.new-invoice

Clients List (screen.clients.list)
- Search input; rows with name, last activity, open balance badge if >0; optional Pinned segment
- Empty: CTA to add first client

Clients Detail (screen.clients.detail)
- Header: name + IconButtons for tel:/sms:/mailto:
- Global meter.storage, CTA near 90%
- Section: Documents (Vault) with Tag filters (Contracts/Billing/Pictures/Other), search, item actions (preview/retag/rename/delete), btn.upload-doc; per-file caps: Free 10MB, Pro 50MB
- Section: Notes (rich; ai.polish-text)
- Section: Client Defaults (input.client-default-tax, input.client-payment-instructions, select.client-reminders)
- HelpOverlay with 2–3 static slides

Documents List (screen.documents.list)
- Filters: Type (Invoice/Quote/Contract), Status (Draft/Sent/Paid), Date range, Client; Search Title/Number
- Rows: Number/Title, Type, Client, Status, Date, Amount (if applicable)
- Empty: CTA to btn.new-invoice

Documents Create (screen.documents.create)
- Steps: 1) Type → 2) Client (quick add inline) → 3) Details → 4) Branding → 5) Preview → 6) Save & Share
- Invoice/Quote Details: Line items table (desc, qty, unit_price, taxable, discount); Pricebook Quick Add (sheet.pricebook); Manager (modal.pricebook-manager); Totals: label.totals-subtotal, label.totals-tax, field.invoice-discount-type, input.invoice-discount, label.totals-grand; AI: ai.suggest-line-items, ai.polish-text, ai.add-warranty
- Contract Details: Sectioned editor (Scope/Payment/Warranty/Liability/Change/Termination); Clause Picker; AI: ai.add-clause, ai.polish-text; Disclaimer visible inline
- Branding: Free standard + watermark; Pro templates (CopperLine/CircuitBoard/ClimateCraft/BuildSheet), logo upload, color picker; snapshot branding stored
- Preview: Live HTML→PDF; tables paginate; headers repeat; watermark/footers accurate
- Save & Share: Saves doc + immutable PDF to Vault (auto-tag Billing); btn.share-pdf triggers OS share; Free increments export counter and blocks after 5/day

Billing (screen.billing)
- Views: Unpaid | Paid This Month | All; Rows show Client, Amount, Age chip
- Detail: btn.mark-paid (date, method, note), btn.record-partial (amount, method, date, note), overdue reminder toggle (default from client)

Settings (screen.settings)
- Profile (email readonly, trade type), Security (biometric/PIN), meters (meter.storage, meter.ai-assists, meter.exports), CSV exports (Clients & Docs metadata), Legal pages (ToS/Privacy/Disclaimers), Upgrade screen (feature flags; no payments yet)

## AI Turbo Buttons (behavior)
- Contextual only (no AI tab)
- Undo snackbar after insertion restores previous content
- Quota: Free 10/month, Pro unlimited; decrement on successful insert only
- Telemetry: ai_assist_used {type} with estimated tokens
- Pricebook in AI: May suggest existing Pricebook items and recent docs; user must approve insert

## Totals & Money
- Integer cents everywhere
- Line Subtotal: qty * unit_price_cents per row
- Line Taxes: sum of per-row taxes if taxable
- Invoice-level Discount: amount or percent; applied once
- Grand Total: (sum line totals + sum line taxes) – invoice_level_discount
- Switching discount type recalculates once; never double-applies

## Quotas & Upsell
- Free: 1 GB storage, 5 exports/day (reset local midnight), 10 AI/month (reset 1st UTC), one template with watermark
- Pro: 10 GB storage, unlimited exports & AI, templates + logo/colors, no watermark
- Upgrade CTAs: Branding step (Upload Logo), Removing Watermark, Near storage cap (≥90%), AI quota exhausted, Export >5/day

## CSV Exports
- Clients CSV: id, name, email, phone, created_at, default_tax_rate, preferred_reminders
- Documents CSV (metadata): id, number, type, status, client_name, total_cents, created_at, sent_at, paid_at

## Analytics & Quality
- Events: app_open, doc_created, doc_sent, invoice_paid, ai_assist_used {type}, file_uploaded, export_done, upgrade_click
- Targets: first paint < 2s; 1-page PDF < 2.5s; lists ≥55fps; a11y verification (contrast, labels, focus order)

## Error Handling & Edge Cases
- Offline: Show “Offline—actions unavailable” banner; no background sync in MVP
- Storage full: Block uploads/exports with reason and CTA
- Export cap: Block after 5/day (Free); reset local midnight
- AI cap: Block after 10/month (Free); reset 1st UTC
- SMS attachments: Fall back to deep link text

## Acceptance (frontend)
- 4 fixed tabs only
- PDF preview matches exported PDF exactly
- Watermark behavior correct per plan
- Quotas accurately surfaced in meters and enforced via server responses
- Test IDs present on all critical elements

---

## Addendum — Clarifications (MVP v2)

Documents
- Single Documents list with filters across Type (Invoice/Quote/Contract), Status (Draft/Sent/Paid), Date, and Client. No sub-sections.

Pricebook
- Per-user scope; available for any client. MVP includes Manager (add/edit/pin/deactivate) and Quick Add; no CSV/JSON import in MVP.

Reminders
- Local-only. Cadence options 'off' or '7/14/30'. Surfaced on Billing per-invoice toggle and prefills from Client Defaults.

Templates & Watermark
- Free: exactly one template named "Trade Standard (Blue)" with a watermark. Watermark string: "Generated with eToolkit" at ~15% opacity, bottom-right.
- Pro: at least three themed styles: CopperLine, CircuitBoard, ClimateCraft, BuildSheet; supports logo and color.

Quotas & Resets
- Free: 1 GB storage, 5 exports/day (reset at local midnight), 10 AI/month (reset on the 1st UTC). Pro: 10 GB, unlimited exports & AI.
- UI shows meters in Settings and in Client Detail header (storage). Friendly blocking modals when caps hit with Upgrade CTA.

CSV Exports
- MVP excludes line items. Clients and Documents metadata only, with the specified headers.

Activity Feed Scope
- Include: doc created/sent/paid, partial payments, vault uploads/deletes, clause inserted; optional "reminder scheduled" entries.
- Exclude: edits to Client Defaults.

Invariants
- Integer cents for all money; invoice-level discount switching recalculates once, never double applies.
- All deep links use OS handlers; no auto-send. AI is optional and never auto-sends.

Round 2 Clarifications
- Numbering: <TYPE>-<YYYY>-<NNNN>; per-type/year sequences; unique per user. Defaults INV/QTE/CTR in MVP.
- Taxes: Show doc-level Tax Rate (prefilled from Client), per-line taxable toggles.
- Line discounts: Support amount/percent per line; reflect in totals and PDF.
- Sent: Mark as Sent automatically on Share PDF; provide “Mark as Sent” overflow action.
- Branding: Show note “This document will snapshot your current branding.” Rebrand requires new PDF/version.
- Reminders: Toggle per invoice; schedule on Sent/Unpaid; cancel on Paid/off.
- Vault types: Allow PDFs/images/HEIC/WebP/TXT/DOCX; block executables/archives.
- Activity feed: Include reminder scheduled/canceled; exclude Client Defaults edits.
- Snackbar/Toast: Undo 4000ms; success 2500ms; error 3500ms.
- Biometric relock: Default 60s; Settings options Off/30s/60s/5m.
- Currency: USD only; en-US formatting.
- PDF fonts: App uses system UI fonts; PDF embeds Inter.
- CSV dates: ISO 8601 UTC.
- Documents sort: created_at DESC by default.
- Pricebook categories: Free text; suggest non-binding chips.
- Max lengths: Notes 10k, Clause 5k, Title 120, Line desc 300, Payment note 500, Instructions 2k, Pricebook title 80, desc 200, category 40, unit 20.
