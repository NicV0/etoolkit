# EToolkit Mobile App

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
