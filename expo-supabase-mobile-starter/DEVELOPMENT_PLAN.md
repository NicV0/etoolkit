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


