# eToolkit — Developer Implementation Plan

## Overview

**Goal**: Transform existing Expo + Supabase starter into eToolkit mobile CRM
**Current Assets**: Basic auth, minimal UI, secure session management
**Approach**: Parallel frontend/backend development tracks

---

## Phase 1: MVP Foundation (Weeks 1-4)

### Backend Track (Database + API)

#### Week 1: Database Schema & RLS
**Files to Create/Modify**:
- `supabase/sql/schema.sql` - Complete database schema with triggers and indexes
- `supabase/sql/seed_data.sql` - Trade-specific pricebook seeds
- `lib/db/rules.md` - RLS policy documentation
- `supabase/functions/cleanup-storage.ts` - Storage cleanup function

**Critical Schema Requirements**:
- **Unique indexes**: `quotes.number` and `invoices.number` per org
- **Performance indexes**: `(org_id, status)`, `(org_id, due_date)`, `(org_id, client_id)`, `(org_id, created_at)`
- **Updated_at triggers**: Automatic timestamp updates on all mutable tables
- **Payment triggers**: After-insert on payments to recompute balance_due
- **Complete RLS**: Every table with `USING` and `WITH CHECK` policies
- **Storage cleanup**: Serverless function for orphaned file cleanup

**Key Tables**:
```sql
-- Core multi-tenant structure
organizations (id, name, trade, size, plan, created_by, created_at)
profiles (user_id, org_id, display_name, role, created_at)

-- Business data
clients (id, org_id, name, phone, email, address_line1, city, state, postal, notes, status)
jobs (id, org_id, client_id, title, description, status, due_date, location)
documents (id, org_id, client_id, job_id, title, path, mime, size, uploaded_by)

-- Billing system
pricebook_items (id, org_id, code, name, category, unit, unit_price, taxable, active, is_quick_pick)
quotes (id, org_id, number, client_id, job_id, status, currency, tax_rate_pct, discount_amt, subtotal, tax_total, total, terms, valid_until)
quote_items (id, quote_id, item_id, description, quantity, unit_price, taxable, line_total)
invoices (id, org_id, number, client_id, job_id, quote_id, status, currency, tax_rate_pct, discount_amt, subtotal, tax_total, total, balance_due, issue_date, due_date)
invoice_items (id, invoice_id, item_id, description, quantity, unit_price, taxable, line_total)
payments (id, invoice_id, method, amount, received_at, note, external_id)

-- Configuration
settings (org_id, currency, default_tax_pct, numbering_prefix_quote, numbering_prefix_invoice, logo_url, legal_name, address_json, terms_default)
templates (id, org_id, type, name, is_paid, content_json)
activities (id, org_id, actor_id, entity_type, entity_id, action, meta, created_at)
reminders (id, org_id, entity_type, entity_id, title, due_at, done, created_at)
```

**RLS Policies**:
- All tables scoped by `org_id` via `is_org_member()` function
- Profiles: users can only access their own profile
- Cascade deletes for org removal

#### Week 2: Enhanced Supabase Client & Types
**Files to Create/Modify**:
- `types/database.ts` - Generated Supabase types
- `lib/supabase.ts` - Enhanced client with typed helpers and AsyncStorage
- `lib/db/queries.ts` - Common query functions
- `lib/db/mutations.ts` - Common mutation functions
- `lib/sqlite.ts` - Local SQLite mirror for offline data

**Key Functions**:
```typescript
// lib/db/queries.ts
export const getOrgClients = (orgId: string) => 
export const getOrgQuotes = (orgId: string, status?: string) =>
export const getOrgInvoices = (orgId: string, status?: string) =>
export const getPricebookItems = (orgId: string, category?: string) =>
export const getClientDetails = (clientId: string) =>
export const getQuoteWithItems = (quoteId: string) =>
export const getInvoiceWithItems = (invoiceId: string) =>

// lib/db/mutations.ts
export const createOrganization = (data: CreateOrgData) =>
export const createClient = (orgId: string, data: CreateClientData) =>
export const createQuote = (orgId: string, data: CreateQuoteData) =>
export const createInvoice = (orgId: string, data: CreateInvoiceData) =>
export const updateQuoteStatus = (quoteId: string, status: QuoteStatus) =>
export const recordPayment = (invoiceId: string, data: PaymentData) =>
```

#### Week 3: Storage & File Management
**Files to Create**:
- `lib/storage.ts` - Supabase Storage helpers
- `lib/storage/paths.ts` - File path utilities
- `lib/storage/upload.ts` - File upload functions (React Native compatible)
- `lib/storage/cleanup.ts` - Storage cleanup utilities

**React Native File Handling**:
- **No DOM File**: Accept URIs instead of File objects
- **FileSystem conversion**: Use expo-file-system to read URIs → create Blob
- **Android content URIs**: Handle content:// URIs properly
- **Storage lifecycle**: Cleanup orphaned files when DB rows are deleted

**Key Functions**:
```typescript
// lib/storage.ts
export const uploadDocument = (uri: string, orgId: string, clientId: string, jobId?: string) =>
export const getSignedUrl = (path: string) =>
export const deleteDocument = (path: string) =>
export const uploadLogo = (uri: string, orgId: string) =>
export const cleanupOrphanedFiles = () =>

// lib/storage/paths.ts
export const getDocumentPath = (orgId: string, clientId: string, filename: string) =>
export const getLogoPath = (orgId: string) =>
export const getPDFPath = (orgId: string, type: 'quote' | 'invoice', id: string) =>
```

#### Week 4: Business Logic & Calculations
**Files to Create**:
- `lib/calculations.ts` - Money math utilities (decimal.js-light)
- `lib/numbering.ts` - Quote/invoice numbering with collision handling
- `lib/validation.ts` - Business rule validation
- `__tests__/lib/calculations.test.ts` - Comprehensive math tests

**Money Math Requirements**:
- **No JS floats**: Use decimal.js-light for all calculations
- **String handling**: Parse DB numerics as strings → Decimal → back to strings
- **Test coverage**: subtotal, tax, percentage discounts, dollar discounts, balance due
- **Collision handling**: Insert-and-retry for offline number generation

**Key Functions**:
```typescript
// lib/calculations.ts
export const calculateLineTotal = (quantity: number, unitPrice: number) =>
export const calculateSubtotal = (items: LineItem[]) =>
export const calculateTax = (subtotal: number, taxRate: number, taxableItems: LineItem[]) =>
export const calculateTotal = (subtotal: number, taxTotal: number, discount: number) =>
export const calculateBalanceDue = (total: number, payments: Payment[]) =>

// lib/numbering.ts
export const generateQuoteNumber = (orgId: string) =>
export const generateInvoiceNumber = (orgId: string) =>
```

---

### Frontend Track (UI + State)

#### Week 1: Dependencies & Theme Setup
**Files to Modify**:
- `package.json` - Add new dependencies
- `app.json` - Configure deep links and permissions
- `tailwind.config.js` - NativeWind configuration
- `theme/ThemeProvider.tsx` - Enhanced theme with dark mode

**Deep Link Configuration**:
```json
// app.json
{
  "expo": {
    "scheme": "etoolkit"
  }
}
```

**New Dependencies**:
```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.48.0",
  "@hookform/resolvers": "^3.3.0",
  "zod": "^3.22.0",
  "nativewind": "^2.0.0",
  "zustand": "^4.4.0",
  "lucide-react-native": "^0.294.0",
  "dayjs": "^1.11.0",
  "expo-print": "^12.6.0",
  "expo-document-picker": "^11.10.0",
  "expo-notifications": "^0.20.0",
  "expo-linking": "^6.2.0",
  "expo-file-system": "^15.4.0",
  "decimal.js-light": "^2.5.0",
  "expo-router": "^3.4.0",
  "@react-native-async-storage/async-storage": "^2.1.2",
  "expo-sqlite": "^13.2.0",
  "papaparse": "^5.4.1",
  "uuid": "^9.0.1",
  "mime-types": "^2.1.35",
  "react-native-url-polyfill": "^2.0.0",
  "expo-sharing": "^11.10.0"
}
```

**Theme Structure**:
```typescript
// theme/ThemeProvider.tsx
export const theme = {
  colors: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    gray: { 50: '#f9fafb', 500: '#6b7280', 900: '#111827' },
    success: { 500: '#10b981' },
    warning: { 500: '#f59e0b' },
    error: { 500: '#ef4444' }
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 12, xl: 16 }
}
```

#### Week 2: Core UI Components
**Files to Create**:
- `components/ui/Button.tsx` - Primary/secondary/ghost variants
- `components/ui/Card.tsx` - Consistent card styling
- `components/ui/Input.tsx` - Form inputs with validation
- `components/ui/ListItem.tsx` - List items with actions
- `components/ui/EmptyState.tsx` - Empty state illustrations
- `components/ui/Badge.tsx` - Status badges
- `components/ui/Modal.tsx` - Modal component
- `components/ui/LoadingSpinner.tsx` - Loading states

**Component Examples**:
```typescript
// components/ui/Button.tsx
export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) => {
  const styles = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    ghost: 'bg-transparent text-primary-500'
  }
  return <Pressable className={`${styles[variant]} rounded-lg px-4 py-2`} {...props}>
    {children}
  </Pressable>
}

// components/ui/Card.tsx
export const Card = ({ children, className = '' }: CardProps) => (
  <View className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
    {children}
  </View>
)
```

#### Week 3: Navigation & Tab Structure
**Files to Create/Modify**:
- `app/(tabs)/_layout.tsx` - Bottom tab navigator
- `app/(tabs)/index.tsx` - Dashboard screen
- `app/(tabs)/clients/index.tsx` - Client list
- `app/(tabs)/clients/new.tsx` - New client form
- `app/(tabs)/clients/[id].tsx` - Client detail
- `app/(tabs)/kitai/index.tsx` - AI chat interface
- `app/(tabs)/billing/index.tsx` - Billing overview
- `app/settings.tsx` - Settings modal

**Navigation Structure**:
```typescript
// app/(tabs)/_layout.tsx
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ 
        title: 'Dashboard', 
        tabBarIcon: ({ color }) => <HomeIcon color={color} /> 
      }} />
      <Tabs.Screen name="clients" options={{ 
        title: 'Clients', 
        tabBarIcon: ({ color }) => <UsersIcon color={color} /> 
      }} />
      <Tabs.Screen name="kitai" options={{ 
        title: 'KitAI', 
        tabBarIcon: ({ color }) => <SparklesIcon color={color} /> 
      }} />
      <Tabs.Screen name="billing" options={{ 
        title: 'Billing', 
        tabBarIcon: ({ color }) => <ReceiptIcon color={color} /> 
      }} />
    </Tabs>
  )
}
```

#### Week 4: State Management & Data Fetching
**Files to Create**:
- `state/useSession.ts` - Enhanced auth state with deep link handling
- `state/useOrganization.ts` - Organization context
- `state/useClients.ts` - Client data management
- `state/useBilling.ts` - Quote/invoice management
- `lib/queryClient.ts` - React Query configuration
- `lib/deepLinks.ts` - Deep link handling and routing

**Deep Link Handling**:
- **Magic link routing**: Handle `etoolkit://auth` scheme
- **Onboarding flow**: Redirect new users to onboarding
- **Auth validation**: Validate type=magiclink and guard against unknown params
- **Auth state**: Proper session management with AsyncStorage persistence

**State Structure**:
```typescript
// state/useSession.ts
export const useSession = () => {
  const { session, user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  
  const createOrganization = async (data: CreateOrgData) => {
    // Create org + profile + settings in transaction
  }
  
  return { session, user, organization, createOrganization }
}

// state/useClients.ts
export const useClients = (orgId: string) => {
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients', orgId],
    queryFn: () => getOrgClients(orgId)
  })
  
  const createClient = useMutation({
    mutationFn: (data: CreateClientData) => createClient(orgId, data),
    onSuccess: () => queryClient.invalidateQueries(['clients', orgId])
  })
  
  return { clients, isLoading, error, createClient }
}
```

---

## Phase 2: Core Features (Weeks 5-8)

### Backend Track

#### Week 5: Client Management API
**Files to Create**:
- `lib/api/clients.ts` - Client CRUD operations
- `lib/api/documents.ts` - Document upload/management
- `lib/validation/clientSchemas.ts` - Client validation schemas
- `lib/csv/import.ts` - CSV import with papaparse

**API Functions**:
```typescript
// lib/api/clients.ts
export const clientAPI = {
  list: (orgId: string, filters?: ClientFilters) =>
  create: (orgId: string, data: CreateClientData) =>
  update: (clientId: string, data: UpdateClientData) =>
  delete: (clientId: string) =>
  search: (orgId: string, query: string) =>
  importCSV: (orgId: string, csvData: string) =>
}

// lib/api/documents.ts
export const documentAPI = {
  upload: (uri: string, orgId: string, clientId: string, jobId?: string) =>
  list: (clientId: string) =>
  delete: (documentId: string) =>
  getSignedUrl: (documentId: string) =>
}
```

#### Week 6: Billing System API
**Files to Create**:
- `lib/api/quotes.ts` - Quote management
- `lib/api/invoices.ts` - Invoice management
- `lib/api/pricebook.ts` - Pricebook operations
- `lib/pdf/templates.ts` - PDF template system

**API Functions**:
```typescript
// lib/api/quotes.ts
export const quoteAPI = {
  create: (orgId: string, data: CreateQuoteData) =>
  update: (quoteId: string, data: UpdateQuoteData) =>
  send: (quoteId: string) =>
  convertToInvoice: (quoteId: string) =>
  generatePDF: (quoteId: string) =>
}

// lib/api/invoices.ts
export const invoiceAPI = {
  create: (orgId: string, data: CreateInvoiceData) =>
  recordPayment: (invoiceId: string, data: PaymentData) =>
  send: (invoiceId: string) =>
  generatePDF: (invoiceId: string) =>
}
```

#### Week 7: PDF Generation System
**Files to Create**:
- `lib/pdf/generators.ts` - PDF generation logic
- `lib/pdf/templates/clean-minimal.ts` - Template definitions
- `lib/pdf/templates/modern-pro.ts` - Premium templates
- `lib/pdf/templates/ledger-pro.ts` - Premium templates
- `lib/pdf/assets/` - Base64 encoded fonts and default logos

**PDF Reliability Requirements**:
- **Base64 assets**: Embed logos and fonts as base64 in HTML
- **Inline styles**: No external CSS dependencies
- **Page margins**: Explicit margin settings
- **Fixed footer**: Signature block and terms section
- **No remote assets**: All resources embedded in HTML
- **Security**: Escape/encode user fields to prevent HTML injection

**PDF System**:
```typescript
// lib/pdf/generators.ts
export const generateQuotePDF = async (quote: Quote, template: Template) => {
  const html = await buildQuoteHTML(quote, template)
  const pdf = await printToFileAsync({ html })
  const path = await uploadPDF(pdf.uri, quote.orgId, 'quote', quote.id)
  return path
}

// lib/pdf/templates/clean-minimal.ts
export const cleanMinimalTemplate = {
  name: 'Clean Minimal',
  isPaid: false,
  content: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          .header { /* styles */ }
          .items-table { /* styles */ }
          .totals { /* styles */ }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="{{logo}}" alt="Logo" />
          <h1>{{org.name}}</h1>
        </div>
        <!-- Template content -->
      </body>
    </html>
  `
}
```

#### Week 8: KitAI Local Tools
**Files to Create**:
- `lib/kitai/tools.ts` - Local search tools
- `lib/kitai/clientSearch.ts` - Client search implementation
- `lib/kitai/pricebookLookup.ts` - Pricebook search
- `lib/kitai/draftHelpers.ts` - Draft suggestion helpers
- `lib/kitai/privacy.ts` - Privacy controls and cloud fallback
- `lib/kitai/sqlite.ts` - SQLite mirror for offline search

**KitAI MVP Approach**:
- **Local tools**: SQLite search for clients and pricebook
- **Privacy toggle**: Optional OpenAI fallback behind user consent
- **No MLC-LLM**: Park on-device LLM for later phase
- **Offline-first**: All core functionality works without cloud

**AI Tools**:
```typescript
// lib/kitai/tools.ts
export const kitaiTools = {
  clientSearch: async (query: string, orgId: string) => {
    // Local SQLite search or Supabase query
    return searchClients(query, orgId)
  },
  
  pricebookLookup: async (query: string, orgId: string) => {
    return searchPricebook(query, orgId)
  },
  
  suggestLineItems: async (description: string, orgId: string) => {
    // Suggest items based on description
    return suggestItems(description, orgId)
  },
  
  draftQuote: async (clientId: string, items: SuggestedItem[]) => {
    // Create draft quote structure
    return createDraftQuote(clientId, items)
  }
}
```

---

### Frontend Track

#### Week 5: Client Management UI
**Files to Create**:
- `components/clients/ClientList.tsx` - Client list with search
- `components/clients/ClientForm.tsx` - Add/edit client form
- `components/clients/ClientDetail.tsx` - Client detail view
- `components/clients/ClientTabs.tsx` - Client detail tabs
- `components/documents/DocumentUpload.tsx` - File upload component
- `components/documents/DocumentList.tsx` - Document list

**Component Examples**:
```typescript
// components/clients/ClientList.tsx
export const ClientList = () => {
  const { clients, isLoading, searchClients } = useClients(orgId)
  const [searchQuery, setSearchQuery] = useState('')
  
  return (
    <View className="flex-1">
      <SearchInput 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search clients..."
      />
      <FlatList
        data={clients}
        renderItem={({ item }) => <ClientListItem client={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

// components/clients/ClientForm.tsx
export const ClientForm = ({ client, onSubmit }: ClientFormProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client
  })
  
  return (
    <View className="p-4">
      <Input
        control={control}
        name="name"
        label="Client Name"
        error={errors.name?.message}
      />
      <Input
        control={control}
        name="phone"
        label="Phone"
        keyboardType="phone-pad"
        error={errors.phone?.message}
      />
      <Input
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        error={errors.email?.message}
      />
      <Button onPress={handleSubmit(onSubmit)}>Save Client</Button>
    </View>
  )
}
```

#### Week 6: Billing UI Components
**Files to Create**:
- `components/billing/QuoteForm.tsx` - Quote creation form
- `components/billing/InvoiceForm.tsx` - Invoice creation form
- `components/billing/LineItemsEditor.tsx` - Line items management
- `components/billing/PricebookPicker.tsx` - Item selection modal
- `components/billing/PDFPreview.tsx` - PDF preview component
- `components/billing/PaymentModal.tsx` - Payment recording

**Component Examples**:
```typescript
// components/billing/LineItemsEditor.tsx
export const LineItemsEditor = ({ items, onChange }: LineItemsEditorProps) => {
  const addItem = () => {
    const newItem = { id: uuid(), description: '', quantity: 1, unitPrice: 0, taxable: true }
    onChange([...items, newItem])
  }
  
  const updateItem = (id: string, updates: Partial<LineItem>) => {
    onChange(items.map(item => item.id === id ? { ...item, ...updates } : item))
  }
  
  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }
  
  return (
    <View>
      {items.map((item, index) => (
        <LineItemRow
          key={item.id}
          item={item}
          onChange={(updates) => updateItem(item.id, updates)}
          onRemove={() => removeItem(item.id)}
        />
      ))}
      <Button onPress={addItem} variant="ghost">+ Add Item</Button>
    </View>
  )
}

// components/billing/PricebookPicker.tsx
export const PricebookPicker = ({ onSelect, orgId }: PricebookPickerProps) => {
  const { data: items } = useQuery({
    queryKey: ['pricebook', orgId],
    queryFn: () => getPricebookItems(orgId)
  })
  
  return (
    <Modal>
      <View className="p-4">
        <Text className="text-lg font-semibold mb-4">Select Item</Text>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item)}>
              <Text>{item.name}</Text>
              <Text>${item.unitPrice}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  )
}
```

#### Week 7: Dashboard & Analytics
**Files to Create**:
- `components/dashboard/KPICard.tsx` - KPI display cards
- `components/dashboard/RecentActivity.tsx` - Activity feed
- `components/dashboard/QuickActions.tsx` - Quick action buttons
- `components/dashboard/Charts.tsx` - Simple charts/graphs

**Dashboard Components**:
```typescript
// components/dashboard/KPICard.tsx
export const KPICard = ({ title, value, subtitle, trend }: KPICardProps) => (
  <Card className="p-4">
    <Text className="text-sm text-gray-600">{title}</Text>
    <Text className="text-2xl font-bold">{value}</Text>
    {subtitle && <Text className="text-sm text-gray-500">{subtitle}</Text>}
    {trend && (
      <View className="flex-row items-center mt-2">
        <TrendIcon direction={trend.direction} />
        <Text className={`text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value}
        </Text>
      </View>
    )}
  </Card>
)

// components/dashboard/RecentActivity.tsx
export const RecentActivity = ({ orgId }: { orgId: string }) => {
  const { data: activities } = useQuery({
    queryKey: ['activities', orgId],
    queryFn: () => getRecentActivities(orgId, 10)
  })
  
  return (
    <View>
      <Text className="text-lg font-semibold mb-4">Recent Activity</Text>
      {activities?.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </View>
  )
}
```

#### Week 8: KitAI Chat Interface
**Files to Create**:
- `components/kitai/ChatInterface.tsx` - Main chat UI
- `components/kitai/MessageBubble.tsx` - Chat message component
- `components/kitai/ToolSuggestions.tsx` - Tool suggestion buttons
- `components/kitai/DraftActions.tsx` - Draft quote/invoice actions

**KitAI Components**:
```typescript
// components/kitai/ChatInterface.tsx
export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  
  const sendMessage = async (text: string) => {
    const userMessage = { id: uuid(), text, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    
    // Process with local tools
    const response = await processKitAIQuery(text)
    const aiMessage = { id: uuid(), text: response.text, sender: 'ai', timestamp: new Date() }
    setMessages(prev => [...prev, aiMessage])
  }
  
  return (
    <View className="flex-1">
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble message={item} />}
        keyExtractor={(item) => item.id}
      />
      <View className="p-4 border-t border-gray-200">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask KitAI for help..."
          onSubmitEditing={() => sendMessage(input)}
        />
      </View>
    </View>
  )
}
```

---

## Integration & Testing (Week 9)

### End-to-End Integration
**Files to Create/Modify**:
- `app/_layout.tsx` - Root layout with providers
- `lib/providers.tsx` - Provider wrapper
- `lib/errorBoundary.tsx` - Error handling
- `lib/offline.ts` - Offline support

**Integration Points**:
```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <OrganizationProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </OrganizationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

// lib/providers.tsx
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 2, staleTime: 5 * 60 * 1000 },
      mutations: { retry: 1 }
    }
  })
  
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### Testing Strategy
**Files to Create**:
- `__tests__/components/` - Component tests
- `__tests__/lib/calculations.test.ts` - Math tests (comprehensive decimal.js coverage)
- `__tests__/lib/db/queries.test.ts` - Database tests
- `__tests__/integration/` - Integration tests
- `__tests__/lib/storage.test.ts` - File upload tests
- `__tests__/lib/pdf.test.ts` - PDF generation tests

**Critical Test Coverage**:
- **Money math**: All calculation functions with edge cases
- **File uploads**: URI handling and Blob conversion
- **Deep links**: Magic link flow end-to-end
- **RLS policies**: All table access patterns
- **PDF generation**: Template rendering and asset embedding
- **CSV import**: papaparse integration and validation
- **SQLite mirror**: Offline data synchronization
- **Plan gating**: Server-side Quick Picks enforcement
- **HTML security**: PDF template injection protection

---

## Phase 3: Additional Features (Weeks 10-12)

### Backend Enhancements
- Advanced search and filtering
- Bulk operations (import/export)
- Advanced reporting
- Webhook integrations
- Advanced RLS policies

### Frontend Enhancements
- Advanced UI animations
- Offline-first improvements
- Performance optimizations
- Accessibility enhancements
- Advanced KitAI features

---

## Development Workflow

### Daily Tasks
1. **Backend**: Database schema updates, API development
2. **Frontend**: UI component development, state management
3. **Integration**: Connect frontend to backend APIs
4. **Testing**: Unit tests, integration tests

## 🚨 CRITICAL ISSUES - IMMEDIATE ATTENTION REQUIRED

### TypeScript Compilation Failures (206 errors)
**Status**: ❌ **CRITICAL - APP CANNOT COMPILE**

**Issues Found**:
1. **KitAI Module Import Errors**:
   - `lib/kitai/index.ts`: Missing imports for `kitAISQLite`, `privacyControls`, `kitAITools`
   - Undefined variable references throughout KitAI system
   - Import path errors in KitAI modules

2. **Test Suite Failures**:
   - `__tests__/lib/calculations.test.ts`: LineItem type mismatches
   - `__tests__/lib/pdf.test.ts`: Method access and type errors
   - `__tests__/integration/quote-to-invoice.test.ts`: API response type mismatches

3. **API Response Type Mismatches**:
   - Quote-to-invoice conversion returns incorrect types
   - Expected: Full invoice object with all properties
   - Actual: Object with only `invoiceId` property

4. **SQLite API Compatibility**:
   - `expo-sqlite` API changes not reflected in code
   - Method signature mismatches
   - Missing method implementations

5. **Decimal.js Type Errors**:
   - Missing `isFinite` method usage
   - Type compatibility issues

**Impact**: 
- App cannot compile or run
- All development blocked
- Tests cannot execute
- KitAI functionality completely broken

**Required Action**: 
1. **STOP ALL DEVELOPMENT** until these errors are fixed
2. Fix all TypeScript compilation errors
3. Ensure app can compile and run
4. Fix test suite
5. Validate KitAI functionality

**Priority**: **CRITICAL** - Must be resolved before any further development

### Deviations from Original Plan

**Positive Deviations**:
- ✅ Orange color scheme successfully implemented
- ✅ KitAI architecture designed and implemented
- ✅ Privacy controls framework created
- ✅ SQLite search index system built

**Negative Deviations**:
- ❌ KitAI system has critical import/export errors
- ❌ TypeScript compilation failures prevent app from running
- ❌ Test suite broken due to type mismatches
- ❌ API response types inconsistent

**Plan Adjustments Required**:
1. **Phase 2 Implementation**: KitAI system needs complete repair
2. **Testing Strategy**: Test suite needs type fixes
3. **API Design**: Response types need standardization
4. **Development Workflow**: Must include TypeScript validation

### Critical Implementation Checklist
- [ ] Deep link scheme configured in app.json
- [ ] Supabase auth redirect URL set to `etoolkit://auth`
- [ ] All tables have RLS policies with `USING` and `WITH CHECK`
- [ ] Unique indexes on quote/invoice numbers per org
- [ ] Performance indexes on (org_id, status), (org_id, due_date), etc.
- [ ] Updated_at triggers on all mutable tables
- [ ] Payment triggers to recompute balance_due
- [ ] Money calculations use decimal.js-light
- [ ] File uploads handle URIs, not File objects
- [ ] PDF templates embed assets as base64
- [ ] HTML injection protection in PDF templates
- [ ] Server-side plan gating for Quick Picks limit
- [ ] Android notification channels configured
- [ ] Storage cleanup function deployed
- [ ] AsyncStorage configured for session persistence
- [ ] URL polyfill for Android compatibility

### NativeWind v4 Configuration Notes

**IMPORTANT**: When upgrading to NativeWind v4, ensure all dependencies are properly installed:

#### Required Dependencies
- `nativewind@latest` - Latest v4 version
- `tailwindcss@^3.4.17` - Required for NativeWind v4
- `react-native-svg` - Required for lucide-react-native icons
- `prettier-plugin-tailwindcss@^0.5.11` - Optional but recommended

#### Configuration Files (v4 Syntax)
```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};

// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

#### Required Files
- `global.css` - CSS entry point with Tailwind directives
- `nativewind-env.d.ts` - TypeScript types
- Import CSS in app root: `import '../global.css'` in `app/_layout.tsx`

#### Common Issues & Solutions
1. **"Cannot find module 'nativewind/preset'"** - Ensure NativeWind v4 is installed, not v2
2. **"Unable to resolve 'react-native-svg'"** - Install `react-native-svg` for lucide-react-native
3. **Metro bundling errors** - Clear caches: `rmdir /s /q node_modules .expo .parcel-cache .turbo`
4. **Peer dependency conflicts** - Use `--legacy-peer-deps` flag for installation

#### Verification Commands
```bash
# Check versions
npm ls nativewind tailwindcss

# Verify preset resolves
node -e "console.log(require.resolve('nativewind/preset'))"

# Clean start
npx expo start -c
```

### Weekly Reviews
1. **Monday**: Plan week's tasks, review previous week
2. **Wednesday**: Mid-week progress check
3. **Friday**: Demo completed features, plan next week

### Git Workflow
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/` - Individual feature branches
- `hotfix/` - Critical bug fixes

This plan provides a clear roadmap for parallel development while leveraging the existing Expo + Supabase foundation.
