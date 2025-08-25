// Base entity interface
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Client entity
export interface Client extends BaseEntity {
  name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  tax_exempt: boolean;
  default_terms: string;
  deleted_at?: string;
  version: number;
  sync_status: 'pending' | 'synced' | 'failed';
  server_id?: string;
}

// Invoice entity
export interface Invoice extends BaseEntity {
  client_id: number;
  number: string;
  currency: string;
  subtotal: number;
  discount_amount: number;
  discount_type: 'percentage' | 'fixed';
  tax_rate: number;
  tax_amount: number;
  total: number;
  due_date?: string;
  terms: string;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  deleted_at?: string;
  version: number;
  sync_status: 'pending' | 'synced' | 'failed';
  server_id?: string;
}

// Invoice item entity
export interface InvoiceItem extends BaseEntity {
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Draft entity
export interface Draft extends BaseEntity {
  type: 'invoice' | 'quote' | 'client';
  payload_json: string;
}

// Template entity
export interface Template extends BaseEntity {
  type: 'invoice' | 'quote';
  version: number;
  name: string;
  html: string;
  is_default: boolean;
}

// Audit log entity
export interface AuditLog extends BaseEntity {
  entity_type: string;
  entity_id: number;
  action: string;
  meta_json?: string;
}

// Sync outbox entity
export interface SyncOutbox extends BaseEntity {
  operation: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id: number;
  payload_json: string;
  dependency_id?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  last_error?: string;
}

// Message entity (for KitAI)
export interface Message extends BaseEntity {
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Migration entity
export interface Migration extends BaseEntity {
  version: string;
  name: string;
  applied_at: string;
}

// Database query result types
export interface QueryResult<T> {
  data: T[];
  count: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and sort types
export interface ClientFilters {
  status?: 'active' | 'inactive';
  search?: string;
  deleted?: boolean;
}

export interface InvoiceFilters {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  client_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  deleted?: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Database operation types
export interface CreateClientData {
  name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  tax_exempt?: boolean;
  default_terms?: string;
}

export interface UpdateClientData {
  name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  tax_exempt?: boolean;
  default_terms?: string;
}

export interface CreateInvoiceData {
  client_id: number;
  number: string;
  currency?: string;
  subtotal?: number;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  due_date?: string;
  terms?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface UpdateInvoiceData {
  client_id?: number;
  number?: string;
  currency?: string;
  subtotal?: number;
  discount_amount?: number;
  discount_type?: 'percentage' | 'fixed';
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  due_date?: string;
  terms?: string;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface CreateInvoiceItemData {
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface UpdateInvoiceItemData {
  description?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
}

// KitAI types
export interface KitAIMessage {
  id: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface KitAIThread {
  thread_id: string;
  last_message_at: string;
  message_count: number;
}

// Sync types
export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
  syncError: string | null;
  pendingChanges: number;
}

export interface OfflineQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity_type: string;
  entity_id?: number;
  data: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
  dependencies?: string[];
}

// Dashboard types
export interface DashboardStats {
  accountsReceivable: number;
  openQuotes: number;
  activeClients: number;
  mtdRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'invoice' | 'quote' | 'client';
  title: string;
  subtitle: string;
  timestamp: string;
  amount?: number;
}

// Pricebook types
export interface PricebookItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePricebookItemData {
  name: string;
  description?: string;
  category?: string;
  unit_price: number;
  unit?: string;
  is_active?: boolean;
}

export interface UpdatePricebookItemData {
  name?: string;
  description?: string;
  category?: string;
  unit_price?: number;
  unit?: string;
  is_active?: boolean;
}

// Document types
export interface Document {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  client_id: string;
  job_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  title: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  client_id: string;
  job_id?: string;
}

export interface UpdateDocumentData {
  title?: string;
  job_id?: string;
}

// Document filters
export interface DocumentFilters {
  job_id?: string;
  limit?: number;
  offset?: number;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface APIListResponse<T> {
  data: T[];
  count: number;
  error?: string;
  message?: string;
}
