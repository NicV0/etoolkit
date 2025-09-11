# UI/UX Specification (MVP v2)

Cursor Prompt Guardrail
- Do not add or remove tabs. Tabs are exactly Dashboard, Clients, Documents, Billing.
- Use only the defined component set and theme tokens. Follow spacing grid and type scale.
- All actions use OS share sheet; email/SMS via deep links. No SMTP/SMS providers.
- AI is contextual buttons only; outputs editable; undo snackbar required.
- Quotas: Free = 1GB, 5 exports/day, 10 AI/month; Pro = 10GB, unlimited. Enforce and show meters.
- Money: store in integer cents. Totals: Subtotal + Line Taxes – Invoice Discount = Grand Total.
- PDF: Free shows watermark; Pro removes it. Templates include CopperLine/CircuitBoard/ClimateCraft/BuildSheet.
- RLS: every row belongs to auth.uid(). Never bypass.
- Do not auto-send anything; user must confirm share.
- Test IDs: Use the provided ids for all critical elements.

## Design System

### Theme Tokens (Navy)
- Palette
  - Base: #0F2234 (navy)
  - Surface: #122A40
  - Raised/Bubble: #17344D
  - Accent-1 (primary): #3AA1FF
  - Accent-2 (active/hover): #6CA8FF
  - Success: #3CCB8E | Warning: #FFB020 | Danger: #FF5A5A
  - Text: Primary #EAF2FB, Secondary #B6C7DA, Muted #7F95AC, Divider #23425F
- Type Scale: Title 28–32; Section 20; Body 16; Meta 13–14
- Spacing grid: 16dp side gutters; 8/12/16/24/32dp vertical rhythm
- Corners: rounded; soft shadows
- Touch targets: ≥44×44dp; list rows ≥56dp
- Accessibility: Contrast ≥4.5:1; labels/roles on all interactive controls
- Feedback: Taps animate; success uses toast/snackbar; inline errors + toast; shimmer for loading lists

### Primitive Components (reused everywhere)
- Card, Section, Row
- Button.Primary, Button.Secondary, IconButton
- Input, Select
- Tag, Badge, Pill
- Toast/Snackbar, EmptyState
- Meter (storage/AI/exports)
- HelpOverlay

### Icon System
- Library: lucide-react-native
- Tab Icons + Labels: Dashboard, Clients, Documents, Billing (active = Accent-1)
- Common: Plus, Pencil, Trash2, ChevronRight, Search, Share2, FilePlus2, Phone, Mail, MessageSquare

## Navigation & Layout
- Bottom tabs (exact 4, fixed order): Dashboard • Clients • Documents • Billing
- Active tab uses Accent-1; icons + labels; no hidden/extra tabs
- Share: Always OS share sheet. Email/SMS use mailto:/sms: deep links

## Test IDs (stable)
- Screens: screen.dashboard, screen.clients.list, screen.clients.detail, screen.documents.list, screen.documents.create, screen.billing, screen.settings
- Core actions: btn.new-invoice, btn.new-quote, btn.new-contract, btn.upload-doc, btn.preview, btn.share-pdf, btn.mark-paid, btn.record-partial
- AI: ai.suggest-line-items, ai.add-clause, ai.polish-text, ai.add-warranty, ai.reminder-email
- Pricebook: btn.quick-add-pricebook, sheet.pricebook, input.pricebook-search, btn.manage-pricebook, modal.pricebook-manager, row.pricebook-item.<id>
- Totals: input.invoice-discount, field.invoice-discount-type, label.totals-subtotal, label.totals-tax, label.totals-discount, label.totals-grand
- Client defaults: input.client-default-tax, input.client-payment-instructions, select.client-reminders
- Quota meters: meter.storage, meter.ai-assists, meter.exports

## Screens, States, Flows

### Dashboard (screen.dashboard)
- Header: “Dashboard”
- Snapshot cards (tap-through):
  - card.outstanding: $ + count of unpaid invoices
  - card.paid-month: $ paid this month
  - card.active-clients: # clients with activity this month
- Quick actions row: btn.new-invoice · btn.new-quote · btn.new-contract · btn.upload-doc
- Activity feed: Last 20 items (doc created/sent/paid, partial payment, file upload/delete, clause inserted). Unpaid invoice entries expose inline ai.reminder-email.
- Empty: “Let’s create your first document” (CTA → btn.new-invoice)
- Acceptance: Tapping cards deep-links to filtered screens; feed rows open relevant doc/client; reminder draft inserts editable body only; never auto-sends

### Clients
- List (screen.clients.list)
  - Search box; rows: name, last activity snippet, badge for open balance if > 0; optional Pinned at top
  - Empty: “Add your first client”
  - Acceptance: Search filters instantly; row tap → detail
- Detail (screen.clients.detail)
  - Header: Name; actions: icon.call (tel:), icon.sms (sms:), icon.email (mailto:)
  - Global storage meter with CTA near 90% cap
  - Sections: Documents (Vault) with tags (Contracts/Billing/Pictures/Other), search, preview/retag/rename/delete; Notes (rich; ai.polish-text); Client Defaults (default tax rate, payment instructions, preferred reminder cadence)
  - HelpOverlay icon shows 2–3 static slides (no sample data)
  - Acceptance: Contact buttons open native apps; upload respects type/size limits; meter updates; defaults prefill during document creation

### Documents
- List (screen.documents.list): Filters Type/Status/Date/Client; Search by title/number; row fields: Number/Title, Type, Client, Status chip, Date, Amount (if applicable); Empty: CTA to btn.new-invoice
- Create Wizard (screen.documents.create):
  1) Type → 2) Client (inline quick add) → 3) Details → 4) Branding → 5) Preview PDF → 6) Save & Share
  - Details — Invoice/Quote: Line items table; Pricebook Quick Add (sheet.pricebook); Manager (modal.pricebook-manager); Totals panel; AI turbo (ai.suggest-line-items, ai.polish-text, ai.add-warranty)
  - Details — Contract: Sectioned editor; Clause Picker; AI turbo (ai.add-clause, ai.polish-text); Disclaimer visible
  - Branding: Free = standard template + watermark + default blue accent; Pro = upload logo, choose accent, select template (CopperLine, CircuitBoard, ClimateCraft, BuildSheet). Branding snapshot stored on the document
  - Preview: Live HTML→PDF preview matching export; paginate cleanly; headers repeat
  - Save & Share: Save doc and immutable PDF to Vault (auto-tag Billing); btn.share-pdf → OS share; Free increments daily export counter; block after 5/day with CTA
  - Acceptance: Pricebook add never overwrites; taxable maps to line tax; totals recompute instantly; integer cents only; watermark correct for Free; PDF matches preview; Share never auto-sends

### Billing (screen.billing)
- Views: Unpaid, Paid This Month, All. Rows: Client, Amount, Age chip
- Detail actions: btn.mark-paid (date, method, note); btn.record-partial (amount, method, date, note); per-invoice reminder toggle (default from client)
- Acceptance: Dashboard cards update within 1s; partial payments adjust outstanding precisely; rounding safe; Marking Paid cancels scheduled reminders

### Settings (screen.settings)
- Profile (email read-only, trade type), Sign out; Security (biometric/PIN lock); Meters (meter.storage, meter.ai-assists, meter.exports); Data Export (CSV); Legal (ToS/Privacy/Disclaimers); Upgrade screen (feature flags; no payments yet)

## PDF Generation
- Engine: HTML/CSS to PDF; simple tables; repeated headers on page breaks; top/bottom margins fixed; footer reserved for disclaimers/watermarks; font consistency; branding from stored snapshot

## Analytics & Quality
- Events: app_open, doc_created, doc_sent, invoice_paid, ai_assist_used {type}, file_uploaded, export_done, upgrade_click
- Performance: First paint < 2s; 1-page PDF < 2.5s; Scroll ≥55fps; Accessibility verified (contrast, labels, focus order)

## Error Handling & Edge Cases
- Network loss: Show clear “Offline—actions unavailable”; fail gracefully
- Storage full: Block uploads/exports with reason and CTA to delete/upgrade
- Export cap hit: Block after 5/day (Free) reset at local midnight
- AI quota hit: Prompt upgrade; manual editing allowed
- SMS attachments unsupported: Fall back to link or message text; never claim attachment was sent

## Visual Templates
- Pro styles: CopperLine (Plumbing), CircuitBoard (Electrical), ClimateCraft (HVAC), BuildSheet (General)
- Free template: “Trade Standard (Blue)” + watermark “Generated with eToolkit” bottom-right ~15% opacity

## Design System

### Color Palette
- **Primary Accent**: #2563EB (active tabs, CTAs, links, focus rings)
- **Dark Theme**:
  - Background: #0F172A
  - Card: #111827
  - Surface: #0B1220
  - Border: #1F2937
- **Status Colors**:
  - Success: #10B981
  - Warning: #F59E0B
  - Error: #EF4444
  - Info/Muted: #9CA3AF

### Typography
- **Font**: Inter (400, 600, 700)
- **Size Scale**:
  - Caption: 12px
  - Body: 14px
  - Body Strong: 16px
  - Section/Card Titles: 18px
  - H3: 24px
  - Dashboard Title/H2: 28px
  - H1: 32px (reserved)

### Icon System
- **Library**: lucide-react-native
- **Tab Icons**: Home, Users, Sparkles, Receipt
- **Common Actions**: Plus, Pencil, Trash2, ChevronRight, Search, Settings, Download, Share2, Printer, FilePlus2
- **Sizes**: 16px (chips), 20px (lists/buttons), 22-24px (headers/tiles)
- **Style**: Outline only, color follows state

### Animations & Transitions
- **Tab Indicator**: fade+slide 120ms
- **Button/Card Press**: scale 0.98 for 90ms
- **Screen Transitions**: 220ms ease-out
- **Skeleton Shimmer**: 650-750ms loop

## Navigation & Layout

### Bottom Tab Navigation
- **Icons with Labels**: Home, Users, Sparkles, Receipt
- **Active State**: Icon + label in #2563EB with 2px solid line at top
- **Inactive State**: Muted color
- **Micro-interaction**: Fade + slide in 120ms on tab change

### Settings Navigation
- **Action**: Push onto Dashboard stack (shows back chevron)
- **Tabs**: Remain visible on Settings screen
- **Behavior**: Full screen navigation, not modal

## Screen Specifications

### Dashboard
- **Summary Cards**: 2x2 grid (2 per row), min-height 88px
  - Accounts Receivable (sum of open invoices)
  - Open Quotes (count)
  - Active Clients (count)
  - MTD Revenue (sum of paid invoices in current month)
- **Profile Strip**: Horizontal strip under header
  - Logo: 32x32, rounded circle, 1px border (#ffffff22)
  - Name: Inter 600 semibold
  - Accent swatch: 10px circle, outlined with 1px #ffffff22
- **Quick Actions**: 2x2 grid of tappable tiles
  - New Invoice, New Quote, New Client, Ask KitAI
- **Recent Activity**: Last 5 items with chevron indicators

### Clients
- **List Layout**: Cards with name (bold), email (muted), status badge (right)
- **Search**: Real-time as you type (debounce 150ms)
- **Filters**: All / Active / Inactive
- **Per-client Actions**: Tap → Details, Swipe left → Edit/Delete
- **Status Badges**: Active (green), Inactive (yellow), dimmed to 0.6 opacity

### KitAI
- **Chat Interface**: Bubbles with user (right, blue) and AI (left, grey)
- **Input**: Multi-line, grows up to 4 lines, then scrolls
- **Character Limit**: 2,000 chars per message
- **Quick Chips**: Above input, horizontally scrollable
- **Timestamps**: Small, muted (12px) below message clusters
- **Loading**: Animated typing dots when AI responding

### Billing/Invoices
- **Creation Flow**: 3-step wizard with progress bar
  1. Client selection
  2. Line items
  3. Review & send
- **Line Items**: Real-time calculations, add/remove rows
- **Document Customization**: Logo auto-sized, max 40px height
- **Export**: PDF default, share sheet, system print

## Responsive Design

### Tablet Layout
- **Cards per Row**:
  - ≥1024px: 4 per row
  - 768-1023px: 3 per row
  - <768px: Phone rules (2, then 1 under 360px)
- **Navigation**: Keep bottom tabs for MVP

### Mobile
- **Landscape**: Tolerated on phone, supported on tablet
- **Assets**: Provide @1x/@2x/@3x

## Form & Input Design

### Validation
- **When**: On blur and submit, real-time for critical fields
- **Styles**: Red border + inline helper text
- **Server Errors**: Mapped to fields, toast summary

### Loading States
- **Lists/Cards**: Skeletons
- **Blocking Operations**: Spinner overlay
- **Long Fetches**: Progress where possible, skeleton → content

### Error States
- **Validation/Data**: Inline
- **Transient/Network**: Toast + Retry
- **Destructive/Critical**: Modal confirm

### Success States
- **Toast**: Auto-dismiss 1.6s
- **Animation**: Light checkmark, no heavy Lottie

## Accessibility

### Requirements
- **Focus Indicators**: On all interactive elements
- **Screen Reader**: Announcements for navigation, loading, errors
- **Hit Targets**: ≥44pt minimum
- **Dynamic Type**: Respected throughout
- **Contrast**: Sufficient for all text elements

### Testing
- **Automated**: RN Testing Library + a11y lint rules
- **Manual**: VoiceOver/TalkBack scripted checklists
- **Documentation**: Accessibility guide in Help

## Empty States

### Design Pattern
- **Minimal Illustration**: Consistent across screens
- **Helper Text**: One-line description
- **Primary Action**: "Create your first [item]"
- **Consistent Pattern**: Same structure across all screens

## Performance Targets

### Release Targets
- **Cold Start (TTI)**: ≤2.5s on mid-range devices
- **List Scrolling**: ≥55 FPS sustained
- **PDF Generation**: ≤1.5s (1-2 pages), ≤3s (≤5 pages)
- **Sync Operations**: p50 ≤2s, p95 ≤6s

### Implementation
- **Lazy Loading**: All images, cache + prefetch logos
- **Virtualized Lists**: FlashList everywhere
- **Search Debounce**: 150ms
- **Progressive Loading**: Infinite scroll for lists

## Security & Privacy

### Authentication
- **Biometric Unlock**: Optional, entire app after inactivity
- **Sensitive Re-auth**: >15min after last unlock
- **Fallback**: PIN/password allowed

### Data Protection
- **Secure Storage**: Tokens/keys in SecureStore
- **Encryption**: Sensitive SQLite fields encrypted
- **Auto Lock**: 5 minutes inactivity (configurable)

## Notifications

### Push Notifications
- **Types**: Sync failures, payment reminders, invoice sent/paid
- **Preferences**: Per-type toggles in Settings
- **Opt-in**: User controlled

### In-app Notifications
- **Toasts**: Quick events
- **Banners**: Important items (sync conflicts)
- **Auto-dismiss**: 1.6s for toasts

## Search Functionality

### Global Search
- **Omnibox**: Clients, invoices, notes
- **Results**: Grouped by type with headers
- **Filters**: Date range, status, client, amount

### Context Search
- **Per Screen**: Context-specific search
- **Real-time**: As you type with debounce
- **Highlighting**: Bold + accent-tint matching text

## Data Management

### Import/Export
- **Import**: CSV for clients (Excel via CSV)
- **Export**: CSV, JSON, PDF
- **Bulk Operations**: Export and archive (no bulk delete in MVP)
- **Preview**: Validated before commit

### Backup
- **Automatic**: Daily encrypted local backup, keep last 7
- **Manual**: "Backup now" button
- **Scheduling**: Daily/Weekly/Off
- **Storage**: Local encrypted, export to cloud via share sheet

## Offline Behavior

### Indicators
- **Persistent Banner**: When disconnected
- **Force Sync**: Queue operations while offline
- **Visibility**: Filter toggle (All/Synced/Pending/Failed)

### Sync Status
- **UI Indicators**: Tiny badges on list rows
- **States**: Pending ⏳, Synced ✓, Failed ⚠
- **Retry**: Tap failed → retry or view error


