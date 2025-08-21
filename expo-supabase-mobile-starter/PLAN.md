# eToolkit — Mobile MVP Build Plan

## Project Overview

**Goal**: Transform the existing Expo + Supabase starter into a mobile-first CRM for tradespeople with quotes/invoicing, client management, document storage, and AI assistance.

**Current State**: Basic Expo Router app with Supabase Auth, minimal UI components, and secure session management.

**Target State**: Full-featured mobile CRM with 4 main tabs (Dashboard, Clients, KitAI, Billing), PDF generation, document storage, and on-device AI assistance.

---

## Phase 1: Foundation & Architecture (Week 1)

### 1.1 Project Setup & Dependencies
**Current**: Basic Expo + Supabase setup
**Add**:
- React Query for data fetching
- React Hook Form + Zod for form validation
- NativeWind for styling
- Zustand for lightweight state management
- lucide-react-native for icons
- dayjs for date handling
- expo-print for PDF generation (local only, no system dialog)
- expo-document-picker for file uploads
- expo-notifications for reminders
- expo-linking for deep links
- expo-file-system for file handling (Android content URIs)
- decimal.js-light for precise money calculations

### 1.2 Database Schema Implementation
**Create**: `supabase/sql/schema.sql` with all tables from PRD:
- organizations, profiles (with RLS)
- clients, jobs, documents
- pricebook_items, quotes, quote_items
- invoices, invoice_items, payments
- templates, activities, reminders, settings

**Key Features**:
- Multi-tenant RLS by organization
- UUID primary keys with gen_random_uuid()
- Proper foreign key relationships
- Status enums for quotes/invoices
- Monetary fields as numeric(12,2)

### 1.3 Type Generation & Database Client
**Create**:
- `types/database.ts` (generated from Supabase)
- Enhanced `lib/supabase.ts` with typed helpers
- `lib/db/rules.md` documenting RLS policies

---

## Phase 2: Authentication & Onboarding (Week 1-2)

### 2.1 Enhanced Auth Flow
**Current**: Basic magic link auth
**Enhance**:
- Post-signup business onboarding form
- Organization creation with default settings
- Profile creation with role assignment
- Route guards for authenticated vs onboarding states
- **Deep link scheme**: `etoolkit://auth` for magic link handling
- **Universal links**: Configure iOS/Android app links
- **Redirect handling**: Test magic-link round-trip on both platforms
- **Transaction safety**: Create org + profile + settings in single transaction to avoid RLS blocks

### 2.2 Onboarding Experience
**Create**:
- Business profile collection (name, trade, size)
- Default settings initialization
- Sample pricebook seeding based on trade
- Welcome tour/guide

**Screens**:
- `app/onboarding/index.tsx` - Business setup
- `app/onboarding/trade-selection.tsx` - Trade-specific defaults

---

## Phase 3: Core UI & Navigation (Week 2)

### 3.1 Tab Navigation Structure
**Replace current single home screen with**:
```
app/(tabs)/
  _layout.tsx          # Bottom tab navigator
  index.tsx            # Dashboard
  clients/
    index.tsx          # Client list
    new.tsx            # New client form
    [id].tsx           # Client detail (tabs)
  kitai/
    index.tsx          # AI chat interface
  billing/
    index.tsx          # Quotes & invoices list
    quote-new.tsx      # Quote creation
    invoice-new.tsx    # Invoice creation
```

### 3.2 Shared UI Components
**Create**:
- `components/Button.tsx` - Primary/secondary/ghost variants
- `components/Card.tsx` - Consistent card styling
- `components/Input.tsx` - Form inputs with validation
- `components/ListItem.tsx` - List items with actions
- `components/EmptyState.tsx` - Empty state illustrations
- `components/PricebookPicker.tsx` - Item selection modal
- `components/LineItemsEditor.tsx` - Quote/invoice line items
- `components/PDFPreview.tsx` - PDF preview component

### 3.3 Theme System
**Enhance current theme**:
- Light/dark mode toggle in Settings
- Consistent color palette and spacing
- Typography scale
- Component variants

---

## Phase 4: Client Management (Week 2-3)

### 4.1 Client CRUD Operations
**Create**:
- Client list with search and filtering
- Add/edit client forms with validation
- Client detail view with tabs (Info, Jobs, Documents, Quotes, Invoices)
- CSV import functionality with preview

### 4.2 Document Management
**Implement**:
- File upload to Supabase Storage
- Document organization by client/job
- PDF preview and sharing
- Storage path: `org_{orgId}/clients/{clientId}/{yyyy-mm}/{uuid}-{filename}`
- **Android content URIs**: Read files via FileSystem → create Blob → upload
- **File size limits**: 25MB cap with progress indicators
- **Signed URLs**: Generate on-demand, not at creation (expire handling)

### 4.3 Map Integration
**Add**:
- Address linking to native maps (Google/Apple)
- Location services for job sites

---

## Phase 5: Pricebook & Billing (Week 3-4)

### 5.1 Pricebook Management
**Create**:
- Pricebook CRUD with categories
- Quick Picks system with Free/Pro gating
- Trade-specific seed data (Plumbing, Electrical, HVAC, Roofing, Carpentry)
- Item search and filtering

### 5.2 Quote System
**Implement**:
- Quote creation with line items
- Tax and discount calculations (using decimal.js-light for precision)
- PDF generation with templates
- Quote numbering (Q-0001, Q-0002, etc.)
- Status management (draft, sent, accepted, rejected)
- **Money math safety**: Compute in cents (integers) or use decimal.js-light
- **Postgres handling**: Return monetary fields as strings, convert safely before math

### 5.3 Invoice System
**Create**:
- Invoice creation (new or from quote)
- Payment recording (cash, check, card, ACH, other)
- Balance due calculations
- Invoice numbering (INV-0001, INV-0002, etc.)
- Status tracking (draft, sent, partial, paid, void)

### 5.4 PDF Generation Pipeline
**Implement**:
- HTML template system with Mustache tokens
- Local PDF generation using expo-print (printToFileAsync only, no system dialog)
- Template selection (Clean Minimal, Modern Pro, Ledger Pro)
- PDF upload to Supabase Storage
- PDF preview and sharing
- **Base64 logos**: Embed logos as base64 in HTML for consistent rendering
- **Bundled fonts**: Ship fonts as assets with @font-face base64 references
- **Storage strategy**: Store file paths in DB, generate signed URLs on-demand (not at creation)

---

## Phase 6: Dashboard & Analytics (Week 4)

### 6.1 Dashboard KPIs
**Create**:
- Open quotes count and value
- Unpaid invoices count and total
- Due this week indicators
- Recent activity feed

### 6.2 Activity Tracking
**Implement**:
- Activity logging for all major actions
- Recent activity display
- Activity filtering and search

---

## Phase 7: KitAI Implementation (Week 5)

### 7.1 Local AI Tools (MVP)
**Create**:
- Local search tools using SQLite mirror (ClientSearch, PricebookLookup)
- Draft suggestions for quotes/contracts
- Privacy-first approach (no PII to cloud by default)
- Optional cloud fallback (OpenAI) behind Pro plan toggle

### 7.2 AI Chat Interface
**Implement**:
- Chat UI with message history
- Tool integration for data lookup
- Draft suggestions for quotes/contracts
- Cloud fallback toggle in settings

### 7.3 AI Safety & Guardrails
**Ensure**:
- No free-text math in totals
- All calculations done client-side
- Clear privacy controls
- Offline functionality

### 7.4 MLC-LLM Integration (Phase X - Optional)
**Future enhancement**:
- On-device AI assistant using MLC-LLM
- Requires custom dev client and native modules
- Large model downloads (100-500MB)
- Separate build or optional download

---

## Phase 8: Settings & Business Management (Week 5-6)

### 8.1 Business Profile
**Create**:
- Business information management
- Logo upload and management
- Default settings (tax rate, currency, terms)
- Numbering prefixes configuration

### 8.2 Plan Management
**Decision**: Web-only upgrades for MVP (RevenueCat later)
**Implement**:
- Free vs Pro plan features
- Feature gating (Quick Picks limit, premium templates)
- Server-side RLS checks for plan status (not just client UI)
- Web portal for plan upgrades (app reads plan status only)
- **Future**: RevenueCat integration for in-app purchases (requires EAS prebuild)

### 8.3 Data Management
**Add**:
- CSV export functionality
- Document export (ZIP)
- Account deletion
- Data backup options

---

## Phase 9: Advanced Features (Week 6-7)

### 9.1 Reminders System
**Implement**:
- Local notification scheduling
- Reminder presets (7d, 3d, 1d, day-of)
- Custom date/time reminders
- Reminder management per quote/invoice
- **Android robustness**: Re-schedule notifications on app launch
- **Notification channels**: Configure Android notification channels
- **DB persistence**: Store reminders in database for re-scheduling

### 9.2 Template System
**Create**:
- Template management
- Custom template creation
- Template marketplace (Free vs Pro)
- Template preview and selection

### 9.3 Offline Support
**Implement**:
- Offline data creation and editing
- Last-write-wins conflict resolution
- Sync status indicators
- Offline queue management

---

## Phase 10: Testing & Polish (Week 7-8)

### 10.1 Testing Strategy
**Implement**:
- Unit tests for calculations and business logic
- Snapshot tests for PDF templates
- RLS policy testing
- Basic E2E testing

### 10.2 Performance Optimization
**Optimize**:
- Image loading and caching
- PDF generation performance
- Database query optimization
- App startup time

### 10.3 Final Polish
**Add**:
- Loading states and error handling
- Accessibility improvements
- App store preparation
- Documentation

---

## Technical Implementation Details

### Database Schema Highlights
- **Multi-tenancy**: All data scoped by organization_id
- **RLS Policies**: Comprehensive row-level security
- **Status Tracking**: Enums for quotes and invoices
- **Audit Trail**: Created_by, updated_at timestamps
- **Soft Deletes**: Status-based rather than hard deletes

### File Structure
```
app/
  (tabs)/              # Main tab navigation
  (auth)/              # Authentication screens
  onboarding/          # Business setup
  settings.tsx         # Settings modal
components/            # Reusable UI components
lib/
  supabase.ts         # Database client
  storage.ts          # File upload helpers
  pdf.ts              # PDF generation
  kitai/              # AI assistant
  db/                 # Database utilities
state/                # Global state management
types/                # TypeScript definitions
supabase/
  sql/
    schema.sql        # Database schema
```

### Key Libraries & Dependencies
- **UI**: NativeWind for styling
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand for lightweight state
- **Data**: React Query for server state
- **PDF**: expo-print for local generation
- **AI**: Local tools + cloud fallback (MLC-LLM future enhancement)
- **Icons**: lucide-react-native
- **Dates**: dayjs
- **Math**: decimal.js-light for precise calculations
- **Files**: expo-file-system for Android content URI handling

### Security Considerations
- **RLS**: All database access protected by organization membership
- **Storage**: Signed URLs for document access
- **Auth**: Magic link authentication with secure storage
- **AI**: Privacy-first with optional cloud fallback
- **Data**: No sensitive data in logs or analytics

---

## Success Metrics

### MVP Completion Criteria
- [ ] User can sign up and complete onboarding
- [ ] User can manage clients and documents
- [ ] User can create quotes and invoices with PDF generation
- [ ] User can use KitAI for basic assistance
- [ ] App works offline for core functions
- [ ] All calculations are accurate and deterministic
- [ ] PDFs are professional and branded

### Performance Targets
- App startup: < 3 seconds
- PDF generation: < 5 seconds
- Offline sync: < 30 seconds
- Search results: < 1 second

### Quality Gates
- 90%+ test coverage for business logic
- Zero critical security vulnerabilities
- All RLS policies tested and verified
- PDF templates render consistently across devices

---

## Risk Mitigation

### Technical Risks
- **PDF Generation**: Use expo-print with fallback to web-based generation
- **AI Integration**: Start with local tools, add cloud fallback, MLC-LLM later
- **Offline Sync**: Implement robust conflict resolution
- **Performance**: Monitor and optimize database queries
- **Money Math**: Use decimal.js-light to avoid JS float precision issues
- **Android File Uploads**: Handle content URIs properly with FileSystem
- **Deep Links**: Test magic link flow thoroughly on both platforms

### Business Risks
- **User Adoption**: Focus on core workflows first
- **Data Migration**: Plan for future schema changes
- **Scalability**: Design for multi-tenant architecture from start

---

## Next Steps

1. **Review and approve this plan**
2. **Set up development environment**
3. **Begin Phase 1: Foundation & Architecture**
4. **Establish weekly review cadence**
5. **Create detailed task breakdown for each phase**

## Critical Implementation Notes

### Money Math Safety
- Use decimal.js-light for all monetary calculations
- Store Postgres as numeric(12,2), return as strings to UI
- Convert safely before math operations

### Deep Link Configuration
- Define `etoolkit://auth` scheme in app.json
- Configure universal links for iOS/Android
- Test magic link flow end-to-end

### Android File Handling
- Handle content:// URIs from expo-document-picker
- Use FileSystem.readAsStringAsync → create Blob → upload
- Implement 25MB file size limits

### Plan Management Strategy
- MVP: Web-only upgrades, app reads plan status
- Future: RevenueCat for in-app purchases (requires EAS prebuild)
- Server-side RLS checks for all plan-gated features

### PDF Generation
- Use printToFileAsync only (no system dialog)
- Embed logos as base64 in HTML
- Bundle fonts as assets with base64 @font-face
- Generate signed URLs on-demand, not at creation

This plan transforms the existing Expo + Supabase starter into a comprehensive mobile CRM while maintaining the solid foundation already in place.
