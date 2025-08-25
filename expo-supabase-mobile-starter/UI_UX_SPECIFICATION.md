# UI/UX Specification

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


