# eToolkit Mobile App------- SEARCH# EToolkit Mobile App

A document-first mobile toolkit for tradespeople to create polished quotes, invoices, and contracts, store them per client, share via native phone apps, and track payment status—fast, professional, reliable.

## Features (MVP)

- Documents: Create Quotes, Invoices, and Contracts via a single, uniform wizard (Type → Client → Details → Branding → Preview → Save & Share)
- Clients: Per-client vault with tags (Contracts, Billing, Pictures, Other) and Client Defaults (tax, payment instructions, reminders)
- Billing: Simple, trustworthy manual ledger (Paid / Unpaid / Partial) with local reminders (7/14/30)
- Pricebook: Quick add picker in invoice/quote details and a manager to add/edit/pin/deactivate items
- AI Turbo: Contextual assist buttons only (no chat tab) to suggest line items, insert clauses, and polish text; undo snackbar; quotas
- PDFs: HTML→PDF generation with consistent templates; Free shows watermark; Pro branding (logo/colors/templates) with watermark removed
- Quotas & Meters: Free = 1GB storage, 5 exports/day, 10 AI assists/month; Pro = 10GB, unlimited. Transparent meters and upgrade CTAs
- Auth & Security: Supabase auth (email/password), optional biometric/PIN lock; strict RLS and integer-cents totals logic
- CSV Exports: Clients & Document metadata (no line items in MVP)
- Share: Always via OS share sheet; Email/SMS via mailto:/sms: deep links. Never auto-send

## Navigation

Exactly four bottom tabs in fixed order: Dashboard • Clients • Documents • Billing

## Tech Stack

- Frontend: React Native with Expo
- Backend: Supabase (PostgreSQL + Auth + Storage)
- State Management: Zustand
- Data Fetching: TanStack Query
- Styling: NativeWind (Tailwind CSS) or theme tokens
- Database: Supabase (server truth) + minimal local cache where needed
- AI: Contextual “turbo” buttons only (no chat tab)

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd expo-supabase-mobile-starter
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_VERSION=0.1.0
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the database migrations in `supabase/sql/schema.sql`
3. Update your environment variables with the project URL and anon key

### 4. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Project Structure

```
expo-supabase-mobile-starter/
├── app/                      # Expo Router app directory
│   ├── (tabs)/              # Bottom tabs
│   │   ├── dashboard/       # Dashboard screens
│   │   ├── clients/         # Clients list & details
│   │   ├── documents/       # Documents list & create wizard
│   │   └── billing/         # Billing ledger screens
│   └── _layout.tsx          # Root layout
├── components/              # Reusable UI components
├── lib/                     # Core functionality
│   ├── api/                # API layer
│   ├── pdf/                # PDF generation
│   ├── state/              # State management
│   ├── pricebook/          # Pricebook manager
│   └── utils/              # Utilities
├── types/                  # TypeScript type definitions
└── supabase/               # Supabase configuration & SQL
```

## Development

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run fix

# Type checking
npm run typecheck

# Run tests
npm test
```

### Database Migrations

- Update schema in `supabase/sql/schema.sql`
- Update generated types in `types/database.ts`
- Verify RLS and quotas in staging

### Offline & Sync

- MVP: Offline sync and push notifications are out of scope.
- Share always uses OS share sheet; Email/SMS via deep links only.

## Deployment

### Expo Build

```bash
# Configure EAS
npm run eas:init

# Build for production
eas build --platform ios
eas build --platform android
```

### Supabase Edge Functions

Deploy edge functions or server routines as needed for quotas and PDF processing:

```bash
supabase functions deploy
```

## Security & Privacy

- RLS: Every row belongs to auth.uid(); policies enforced on all tables
- Money: Store integer cents; totals math validated
- Legal: Contract footer “Template; not legal advice.” Invoice/Quote footer “Payments handled outside the app.”

## License

MIT License

## Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team
=======
# eToolkit Mobile App

A document-first mobile toolkit for tradespeople to create polished quotes, invoices, and contracts, store them per client, share via native phone apps, and track payment status—fast, professional, reliable. AI is embedded as contextual turbo buttons (not a chat tab).

## Features (MVP)
- Four tabs only: Dashboard • Clients • Documents • Billing (fixed order)
- Documents: Create → Brand → Preview (HTML→PDF) → Save & Share
- Clients: Per-client vault with tags (Contracts, Billing, Pictures, Other); notes; defaults
- Billing: Manual ledger for Paid / Unpaid / Partial with local reminders
- Pricebook: Quick Add picker + Manager; line-item math with invoice-level discount
- AI Turbo: Contextual assist buttons (suggest items, add clauses, polish tone, reminder email)
- Branded PDFs: Free watermark vs Pro templates/logo/colors (branding snapshot per doc)
- Quotas: Free = 1 GB storage, 5 exports/day, 10 AI/month; Pro = 10 GB, unlimited
- Security: Supabase Auth + strict RLS; integer cents for all money
- CSV Exports: Clients and Documents metadata only (no line items in MVP)

## What’s Explicitly Out of Scope (MVP)
- Payments processing (Stripe/QB), scheduling/dispatch/GPS, offline sync, client portal UI, SMTP/SMS providers
- No AI chat tab; AI is contextual only

## Tech Stack
- Frontend: React Native with Expo
- Backend: Supabase (PostgreSQL + Auth + Storage)
- State Management: Zustand
- Data Fetching: TanStack Query
- Styling: NativeWind (Tailwind CSS) and app theme tokens
- PDFs: HTML/CSS → PDF
- Reminders: Local notifications only (no push in MVP)

## Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository-url>
cd expo-supabase-mobile-starter
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your variables:
```bash
cp env.example .env
```
Edit `.env` with your actual values:
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional app configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_VERSION=0.1.0
```

### 3. Supabase Setup
1. Create a new Supabase project
2. Run the database migrations in `supabase/sql/schema.sql`
3. Update your environment variables with the project URL and anon key

### 4. Run the App
```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Project Structure
```
expo-supabase-mobile-starter/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── dashboard/     # Dashboard screens
│   │   ├── clients/       # Client management
│   │   ├── documents/     # Documents list & create flows (MVP to be added)
│   │   └── billing/       # Billing (manual ledger)
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/                   # Core functionality
│   ├── api/              # API layer
│   ├── pdf/              # PDF generation
│   ├── pricebook/        # Pricebook manager/picker
│   ├── state/            # State management
│   └── storage/          # Supabase storage helpers
├── types/                # TypeScript type definitions
└── supabase/             # Supabase configuration
```

## Development

### Code Quality
```bash
# Run linting
npm run lint
# Fi
x linting issues
npm run fix
# Type checking
npm run typecheck
# Run tests
npm test
```

### Database & RLS
- All user-owned tables use RLS (row belongs to auth.uid()).
- All money in integer cents; totals validated server-side.

### Offline Behavior (MVP)
- Offline sync is out of scope for MVP.
- If offline: show clear “Offline—actions unavailable” and fail gracefully.

## Deployment

### Expo Build
```bash
# Configure EAS (if needed)
npm run eas:init
# Build for production
eas build --platform ios
eas build --platform android
```

### Supabase Edge Functions
Deploy edge functions for server-side enforcement and PDF helpers (optional):
```bash
supabase functions deploy
```

## License
MIT

## Support
For support and questions:
- Check the documentation (Dev Plan, Backend Plan, Frontend Plan)
- Open an issue on GitHub
- Contact the development team
 (MVP v2)

Cursor Prompt Guardrail
- Tabs are exactly Dashboard, Clients, Documents, Billing.
- Use only the defined component set and theme tokens.
- All actions use OS share sheet; email/SMS via deep links only.
- AI is contextual buttons only; outputs editable; undo snackbar required.
- Quotas: Free = 1GB storage, 5 exports/day, 10 AI assists/month; Pro = 10GB, unlimited. Enforce server-side and show meters.
- Money: integer cents; Subtotal + Line Taxes – Invoice Discount = Grand Total.
- PDF: Free shows watermark; Pro removes it. Templates include CopperLine/CircuitBoard/ClimateCraft/BuildSheet.
- RLS: each row belongs to auth.uid(); never bypass.
- Never auto-send; user confirms in native app.

A document-first mobile toolkit for tradespeople to create polished quotes, invoices, and contracts; store per client; share via native phone apps; and track payment status—fast, professional, reliable.

## Features (MVP)
- Clients: Per-client vault with tags; defaults (tax rate, payment instructions, reminders cadence)
- Documents: Quotes, Invoices, Contracts with a single create → brand → preview → share flow
- Pricebook: Quick Add bottom sheet + Manager modal; taxable mapping; recent/pinned
- Billing: Manual ledger (Paid/Unpaid/Partial), local reminders (7/14/30)
- AI Turbo: Contextual assists (suggest line items, add clause, polish text, warranty, reminder email); quota and undo
- PDFs: HTML→PDF, snapshot branding; Free watermark vs. Pro branding
- Quotas: Free caps (1GB storage, 5 exports/day, 10 AI/month); Pro removes limits and watermark
- Security: Supabase Auth, RLS per-row; optional biometric/PIN lock
- CSV Exports: Clients & Document metadata (no line items in MVP)

Out of scope (MVP): Payments integration (Stripe/QB), scheduling/dispatch/GPS, offline sync, client portal UI, SMTP/SMS providers.

## Navigation
- Bottom tabs (fixed order): Dashboard • Clients • Documents • Billing
- No additional tabs (AI is not a tab; it appears as contextual buttons)

## Theme
- Navy base with raised “bubble” surfaces; bright blue accents; soft shadows; rounded corners
- Type scale: Title 28–32; Section 20; Body 16; Meta 13–14
- Accessibility: ≥44dp targets, contrast ≥4.5:1, labels/roles on controls

## Tech Stack
- Frontend: React Native (Expo)
- Backend: Supabase (Postgres + Auth + Storage)
- State: Zustand + TanStack Query
- Styling: NativeWind or styled components (theme tokens)
- Database: Supabase + local cache (offline sync is out-of-scope for MVP)
- AI: Contextual “turbo” buttons only

## Setup

1) Clone and Install
```bash
npm install
```

2) Environment
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

3) Supabase
- Apply schema (see supabase/sql and BACKEND_PLAN.md)
- Configure RLS policies for all user-owned tables

4) Run
```bash
npm start
```

## CSV Exports
- Clients: id, name, email, phone, created_at, default_tax_rate, preferred_reminders
- Documents (metadata only): id, number, type, status, client_name, total_cents, created_at, sent_at, paid_at

## Quotas & Upsell
- Free: 1 GB storage, 5 exports/day (resets local midnight), 10 AI/month (resets on 1st UTC), one template with watermark
- Pro: 10 GB storage, unlimited exports & AI, templates + logo/colors, no watermark
- Meters shown in Settings and Client detail; friendly blocking with upgrade CTA

## Legal & Safety
- PDF footers: Contract “Template; not legal advice.”; Invoice/Quote “Payments handled outside the app.”
- Integer cents for all money; never auto-send anything; RLS enforced on server

## Project Structure
- See DEVELOPMENT_PLAN.md (MVP v2), FRONTEND_PLAN.md, BACKEND_PLAN.md

A comprehensive mobile app for trades businesses to manage clients, quotes, invoices, and payments with offline support and AI assistance.

## Features

- **Client Management**: Store and manage client information
- **Quote & Invoice Generation**: Create professional quotes and invoices
- **Payment Processing**: Integrated with Stripe for secure payments
- **Offline Support**: Work without internet connection
- **KitAI Assistant**: AI-powered business assistant
- **PDF Generation**: Professional document templates
- **Real-time Sync**: Automatic data synchronization

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: NativeWind (Tailwind CSS)
- **Database**: SQLite (offline) + Supabase (online)
- **Payments**: Stripe PaymentSheet
- **AI**: KitAI (local AI assistant)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- Supabase account
- Stripe account (optional)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd expo-supabase-mobile-starter
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Optional: App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_VERSION=0.1.0
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Run the database migrations in `supabase/sql/schema.sql`
3. Update your environment variables with the project URL and anon key

### 4. Database Setup

The app uses SQLite for offline storage and Supabase for online sync. The database will be automatically initialized on first run.

### 5. Run the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Project Structure

```
expo-supabase-mobile-starter/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── dashboard/     # Dashboard screens
│   │   ├── clients/       # Client management
│   │   ├── billing/       # Quotes & invoices
│   │   └── kitai/         # AI assistant
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── lib/                   # Core functionality
│   ├── api/              # API layer
│   ├── database/         # Database configuration
│   ├── kitai/            # AI assistant
│   ├── pdf/              # PDF generation
│   ├── state/            # State management
│   └── sync/             # Offline sync
├── types/                # TypeScript type definitions
└── supabase/             # Supabase configuration
```

## Development

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run fix

# Type checking
npm run typecheck

# Run tests
npm test
```

### Database Migrations

The app includes automatic database migrations. When you need to add new tables or modify existing ones:

1. Update the schema in `supabase/sql/schema.sql`
2. Update TypeScript types in `types/database.ts`
3. Test the changes locally

### Offline Support

The app includes comprehensive offline support:

- Local SQLite database for offline data storage
- Queue system for pending operations
- Automatic sync when connection is restored
- Conflict resolution for data conflicts

## Deployment

### Expo Build

```bash
# Configure EAS
npm run eas:init

# Build for production
eas build --platform ios
eas build --platform android
```

### Supabase Edge Functions

Deploy edge functions for additional server-side functionality:

```bash
supabase functions deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team
