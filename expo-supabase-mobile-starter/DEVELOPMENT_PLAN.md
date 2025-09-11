# Development Plan (MVP v2)

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

Milestones (delivery order)
1) Foundations (theme, primitives, auth, tabs)
2) Schema & RLS; storage accounting
3) Documents core (create → brand → preview → export; watermark)
4) Pricebook (picker + manager) and line-item math (incl. invoice-level discount)
5) Clients (list, detail, vault, client defaults, help overlay)
6) Billing (ledger, partial payments, reminders)
7) Dashboard (cards, quick actions, feed)
8) AI Turbo (assist buttons, quotas, undo, logging)
9) Settings & CSV export; legal pages; meters & upsell
10) QA/A11y/Perf hardening

EPIC 0 — Foundations & Theme
Stories
- App shell with 4 tabs (Dashboard, Clients, Documents, Billing)
- Theme tokens (colors, type scale, radii, spacing, elevation)
- Primitive components library
- Launch/splash screen with provided tool logo
Tasks
- Implement tokens (palette, typography scale, spacing, shadows, radii)
- Build primitives: Card, Section, Row, Button.Primary, Button.Secondary, IconButton, Input, Select, Tag, Badge, Pill, Toast/Snackbar, EmptyState, Meter, HelpOverlay
- Bottom tab bar: lucide icons + labels, fixed order
- Loading states: list shimmers, button spinners
- Accessibility defaults (labels, roles, focus order)
Acceptance
- All screens use the same tokens; no inline hardcoded styling
- Buttons ≥44dp, rows ≥56dp; contrast ≥4.5:1
- Tabs fixed in order and count

EPIC 1 — Auth & Security
Stories
- Sign up (email, password, trade type), sign in/out
- Persisted session; optional biometric/PIN lock
- First-run privacy & disclaimers summary
Tasks
- Auth flows; secure token storage
- Lock screen; background relock after timeout
- Onboarding step captures trade_type
Acceptance
- Reopen app → user stays signed in unless explicitly logged out
- Lock screen works; respects OS biometric

EPIC 2 — Database & RLS
Stories
- Create core tables, enums, and views (see Backend Plan)
- Enforce RLS across all tables
- Storage accounting for uploads (bytes used per user)
Tasks
- Tables: users, clients, documents, document_items, payments, vault_files, clauses, pricebook_items, document_shares (future)
- Views: v_outstanding_invoices, v_paid_this_month
- Triggers for storage_used_bytes increment/decrement
Acceptance
- Cross-user access attempts fail (401/permission denied)
- Storage meter updates within 1s after upload/delete

EPIC 3 — Clients
Stories
- Clients list with search; badge if open balance > 0
- Client detail: contact actions (call/SMS/email), Vault, Notes, Client Defaults
- Help overlay (“?”) with 2–3 static slides (no sample data)
Tasks
- Deep links: tel:, sms:, mailto: with prefilled subject/body
- Vault: upload, tag filter (Contracts, Billing, Pictures, Other), search, delete/retag
- Client Defaults: default tax rate, payment instructions, preferred reminder cadence
Acceptance
- Contact buttons always open native apps
- Vault obeys per-file size/type constraints; global storage meter in header
- Client defaults prefill in document creation

EPIC 4 — Documents (Core)
Stories
- Documents list with filters (Type/Status/Date/Client) + search
- Create wizard (Type → Client → Details → Branding → Preview → Save & Share)
- Watermark (Free) vs. branding (Pro)
Tasks
- Line-item table for Invoice/Quote (desc, qty, unit_price, taxable, discount)
- Contract editor sections + clause insertion
- Branding: Free (standard + watermark), Pro (logo/colors/templates)
- Snapshot branding onto document
- Live preview and PDF export; save exported PDF to Vault (auto-tag Billing)
Acceptance
- Preview matches exported PDF
- Free shows watermark; Pro suppresses watermark
- Export uses OS share sheet; increments Free daily export counter

EPIC 4b — Pricebook (MVP)
Stories
- Bottom-sheet Quick Add from Pricebook in Details step
- Pricebook Manager (modal): add/edit/pin/deactivate items
- Pinned, Recent, Categories, search
Tasks
- Picker: multi-add; tiles show title, price, taxable
- Manager form: Title, Description, Unit, Default Qty, Unit Price (cents), Taxable, Category, Pinned, Active
- Persist and respect Active status; update Recents on use
Acceptance
- Adding items from Pricebook pre-fills row fields; never overwrites existing rows
- Deactivated items hidden unless “show inactive”
- Search hits title/desc/category

EPIC 5 — Totals & Discounts
Stories
- Line-level tax/discount + invoice-level discount (amount or %)
- Grand Total calculation with integer cents
Tasks
- Totals panel: Subtotal, Line Taxes, Invoice Discount, Grand Total
- Switching discount type recalculates safely (no double count)
Acceptance
- Integer-cents math verified; no float drift
- Long invoices paginate in PDF with headers repeated

EPIC 6 — Clause Library & Disclaimers
Stories
- Seed common clauses (scope, payment terms, warranty, liability, change, termination)
- Insert at caret, editable after insert
- Mandatory footers: legal disclaimer (contracts), “payments handled outside app” (invoice/quote)
Tasks
- Clause Picker with preview; insertion logic
- Footer areas in PDF templates
Acceptance
- Clause insertion never overwrites other sections; Undo returns prior text
- Disclaimers always present in relevant PDFs

EPIC 7 — AI Turbo Buttons
Stories
- Suggest line items, Add clause with AI, Polish text, Add warranty, Draft reminder email
- Free quota: 10 assists/month; Pro unlimited
- Undo snackbar on insertion; events logged
Tasks
- Build context for prompts from current doc (client name, items, notes)
- Quota meter; only decrement on successful insert
- Gentle upgrade CTA when quota hits 0
Acceptance
- AI never auto-sends anything
- User can edit output; Undo restores previous content

EPIC 8 — Billing (Manual Ledger)
Stories
- Mark Unpaid/Partial/Paid with method, date, note
- Views: Unpaid, Paid This Month, All
- Overdue reminders (7/14/30); toggle per invoice
Tasks
- Partial-payment math in integer cents
- Dashboard cards update on changes
- Local notification scheduling/canceling
Acceptance
- Outstanding sums match (sum line totals − sum payments)
- Marking Paid cancels future reminders

EPIC 9 — Dashboard
Stories
- Snapshot cards (Outstanding, Paid This Month, Active Clients)
- Quick actions row
- Activity feed (20 items) with icons and deep links
Tasks
- Compute cards from views
- Feed entries: doc created/sent/paid, file uploaded, clause added, partial payment
- Inline ai.reminder-email for unpaid invoice entries
Acceptance
- Tapping cards navigates with filters applied
- Empty feed shows EmptyState.dashboard

EPIC 10 — Quotas & Upsell (no payments yet)
Stories
- Free: 1 GB storage, 5 exports/day, 10 AI/month
- Pro: 10 GB, unlimited exports & AI; branding (logo/colors/templates); no watermark
- Upgrade CTAs at triggers (branding, watermark removal, near storage cap, AI/export quotas)
Tasks
- Server-side enforcement; UI meters in Settings and Client detail
- Blocking modals with Upgrade screen (feature-flag plan selection)
Acceptance
- All caps enforced; UI shows accurate meters
- Free blocked when limits reached; Pro is unlimited

EPIC 11 — Settings & CSV
Stories
- Profile & Security; Meters; Legal pages
- CSV export: Clients, Document metadata
Tasks
- CSV generation; OS share
- Legal content linked
Acceptance
- CSV opens in Sheets/Excel; headers correct

EPIC 12 — QA, A11y & Performance
Stories
- Baseline metrics: first paint <2s; 1-page PDF <2.5s; ≥55fps scrolling
- A11y audit: labels, contrast, focus order
- Integration test scenarios cover main flows and edge cases
Tasks
- Synthetic “long invoice” document; pagination test
- Edge case tests: storage cap, AI/export quota, offline share fallbacks
Acceptance
- All acceptance criteria above pass across iOS & Android mid-range devices

Note: This MVP v2 plan supersedes legacy content below. See BACKEND_PLAN.md and FRONTEND_PLAN.md for companion specs.

---

Addendum — Clarifications (MVP v2)
- Documents tab is a single unified list with filters (Type/Status/Date/Client). Do not create sub-sections.
- Pricebook is per-user and available across all clients. MVP includes Manager and Quick Add. No import in MVP.
- Reminders are local-only (no push). Cadence: 'off' or '7/14/30'. Surfaced on Billing and defaults from Client profile.
- Templates: Free has exactly one template named "Trade Standard (Blue)" with watermark. Pro has at least three styles (CopperLine, CircuitBoard, ClimateCraft, BuildSheet).
- Watermark: "Generated with eToolkit", bottom-right, ~15% opacity.
- CSV exports exclude line items in MVP. Use only specified columns.
- Storage caps (UI + server): Free per-file max 10 MB; Pro per-file max 50 MB; global caps Free 1 GB, Pro 10 GB.
- Quota resets: Exports reset at local midnight; AI assists reset on the 1st (UTC). UI meters must reflect these windows.
- Invoice-level discount switching recalculates once and must not double-apply.
- Exports/day reset at device-local midnight; AI/month reset at 00:00 UTC (no timezone settings in MVP).

# Development Plan

## Technical Architecture

### State Management Stack
- **Global App State**: Zustand
  - Auth session, settings (in-memory)
  - Wizard step state, ephemeral UI bits
  - Toasts, prefill, banners
- **Persistence**: MMKV for small values
  - lastSelectedClientId, theme, flags
- **Server/Cache State**: TanStack Query
  - Separate query keys and patterns
  - Invalidate on mutations with narrow scope
- **Durable Data + Offline Queue**: SQLite (expo-sqlite)
  - Queue in SQLite for durability, ordering, relations
  - MMKV for tiny preferences only

### Database Schema
```sql
-- Separate tables (normalized, with soft-delete)
clients(id, name, contact_name, email, phone, address, status, updated_at, deleted_at)
invoices(id, client_id, number, currency, discount, tax_rate, subtotal, total, due_date, status, updated_at, deleted_at)
invoice_items(id, invoice_id, desc, qty, price)
drafts(id, type, payload_json, updated_at) -- for wizard autosave
templates(id, type, version, html, created_at)
audit_logs(id, entity_type, entity_id, action, meta_json, created_at)
sync_outbox(id, op, entity_type, entity_id, payload_json, dependency_id, status, attempts, last_error, created_at)
messages(id, thread_id, role, content, created_at) -- KitAI chat
```

### KitAI Implementation
- **Context & Memory**: Store messages as rows in messages table
- **Rotating Window**: 50 messages per thread (per client + global)
- **Data Access**: Real-time via Query cache, offline from cached models
- **Intent Parsing**: Deterministic rules + fuzzy lookup (Fuse.js)
- **Action Confirmation**: Prefill → preview → user confirms → write (with audit log)

### Invoice & Document System
- **PDF Generation**: Local (Expo Print / HTML → PDF)
- **Templates**: Configurable HTML stored in templates with version
- **Drafts**: Structured data + JSON extras
- **Auto-cleanup**: Drafts older than 30 days

### Sync & Conflict Resolution
- **Background Sync**: Foreground and background
- **Conflict Policy**: Last Write Wins + safe merges
- **Offline Queue**: Auto-retry with exponential backoff
- **Dependencies**: Chain operations with dependency_id
- **Max Queue**: 1,000 ops or 10 MB payload

## Implementation Phases

### Phase 1: Foundation & Core UI (Week 1-2)
1. **Project Setup**
   - Configure Expo with TypeScript
   - Set up design system (colors, typography, icons)
   - Install and configure dependencies
   - Set up testing framework

2. **Design System Implementation**
   - Create theme tokens and utilities
   - Implement color palette and typography
   - Set up icon system with Lucide
   - Create base components (Button, Card, Input, etc.)

3. **Navigation Structure**
   - Implement bottom tab navigation
   - Set up screen navigation with Expo Router
   - Create layout components
   - Implement settings navigation

### Phase 2: Core Screens & State Management (Week 3-4)
1. **State Management Setup**
   - Configure Zustand for global state
   - Set up TanStack Query for server state
   - Implement MMKV for persistence
   - Create state slices and hooks

2. **Dashboard Implementation**
   - Create summary cards with real data
   - Implement profile strip
   - Add quick actions grid
   - Create recent activity list

3. **Clients Screen**
   - Implement client list with cards
   - Add search functionality
   - Create client detail view
   - Implement add/edit client forms

### Phase 3: Database & Offline Support (Week 5-6)
1. **SQLite Setup**
   - Configure expo-sqlite
   - Create database schema
   - Implement migrations
   - Set up encryption for sensitive data

2. **Offline-First Architecture**
   - Implement offline queue system
   - Create sync engine
   - Add conflict resolution
   - Implement background sync

3. **Data Models & API**
   - Create data models and types
   - Implement CRUD operations
   - Add validation schemas
   - Set up API integration

### Phase 4: KitAI & Advanced Features (Week 7-8)
1. **KitAI Implementation**
   - Create chat interface
   - Implement message storage
   - Add intent parsing system
   - Create action confirmation flows

2. **Invoice System**
   - Implement 3-step wizard
   - Create line item management
   - Add calculation engine
   - Implement document generation

3. **Document Templates**
   - Create template system
   - Implement versioning
   - Add customization options
   - Create PDF generation

### Phase 5: Polish & Advanced Features (Week 9-10)
1. **Search & Filtering**
   - Implement global search
   - Add context-specific search
   - Create filter systems
   - Add sorting options

2. **Import/Export**
   - Implement CSV import/export
   - Add PDF export
   - Create backup system
   - Add data validation

3. **Notifications**
   - Set up push notifications
   - Implement in-app notifications
   - Add notification preferences
   - Create notification center

### Phase 6: Testing & Optimization (Week 11-12)
1. **Testing Implementation**
   - Write unit tests for business logic
   - Create integration tests
   - Implement E2E tests with Detox
   - Add accessibility tests

2. **Performance Optimization**
   - Implement lazy loading
   - Add virtualized lists
   - Optimize bundle size
   - Add performance monitoring

3. **Security & Privacy**
   - Implement biometric authentication
   - Add data encryption
   - Set up secure storage
   - Create audit logging

## Development Approach

### Code Organization
```
src/
├── components/
│   ├── ui/           # Base UI components
│   ├── layout/       # Layout components
│   ├── forms/        # Form components
│   └── screens/      # Screen-specific components
├── hooks/            # Custom React hooks
├── lib/
│   ├── api/          # API integration
│   ├── db/           # Database operations
│   ├── sync/         # Sync engine
│   ├── kitai/        # KitAI implementation
│   └── utils/        # Utility functions
├── stores/           # Zustand stores
├── types/            # TypeScript types
└── constants/        # App constants
```

### Testing Strategy
- **Unit Tests**: Business logic, utilities, calculations
- **Integration Tests**: Sync engine, API integration
- **E2E Tests**: Critical user flows
- **Accessibility Tests**: Screen reader, keyboard navigation

### Performance Targets
- **Cold Start**: ≤2.5s on mid-range devices
- **List Scrolling**: ≥55 FPS sustained
- **PDF Generation**: ≤1.5s (1-2 pages)
- **Sync Operations**: p50 ≤2s, p95 ≤6s

### Security Measures
- **Data Encryption**: Sensitive fields encrypted in SQLite
- **Secure Storage**: Tokens and keys in SecureStore
- **Biometric Auth**: Optional app unlock
- **Audit Logging**: All write actions logged

### Accessibility Requirements
- **Screen Reader**: Full VoiceOver/TalkBack support
- **Keyboard Navigation**: Complete keyboard support
- **Dynamic Type**: Respect system font sizes
- **Contrast**: Sufficient contrast ratios

## Dependencies

### Core Dependencies
```json
{
  "expo": "^50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "expo-router": "^3.0.0",
  "zustand": "^4.4.0",
  "@tanstack/react-query": "^5.0.0",
  "expo-sqlite": "^13.0.0",
  "react-native-mmkv": "^2.10.0",
  "lucide-react-native": "^0.300.0",
  "react-native-flash-list": "^1.6.0",
  "expo-print": "^13.0.0",
  "expo-sharing": "^11.0.0",
  "expo-secure-store": "^12.0.0",
  "expo-local-authentication": "^13.0.0"
}
```

### Development Dependencies
```json
{
  "@testing-library/react-native": "^12.0.0",
  "detox": "^20.0.0",
  "jest": "^29.0.0",
  "typescript": "^5.0.0",
  "@types/react": "^18.0.0",
  "@types/react-native": "^0.73.0"
}
```

## Deployment Strategy

### Environment Management
- **Development**: Local development with mock data
- **Staging**: Test environment with real API
- **Production**: Live environment with monitoring

### Feature Flags
- **Remote Config**: Feature toggles for gradual rollout
- **Local Override**: Development builds can override flags
- **A/B Testing**: Framework for future A/B tests

### Updates
- **OTA Updates**: Expo Updates for non-breaking changes
- **App Store**: Regular releases for breaking changes
- **Database Migrations**: Versioned migrations with rollback

## Success Metrics

### User Experience
- **App Store Rating**: Target 4.5+ stars
- **Crash Rate**: <1% of sessions
- **User Retention**: 70% day 7, 50% day 30

### Performance
- **Load Times**: Dashboard <2s, Lists <1s
- **Sync Success**: >95% success rate
- **Offline Usage**: >80% of features work offline

### Business Metrics
- **User Adoption**: Target 1000+ active users
- **Feature Usage**: KitAI usage >60% of users
- **Document Generation**: >5000 documents/month


