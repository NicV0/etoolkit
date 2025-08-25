/**
 * Unified types for the application
 * This file consolidates all type definitions to ensure consistency across modules
 */

// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Client types
export interface Client extends BaseEntity {
  org_id: string;
  name: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal?: string;
  country?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'prospect';
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal?: string;
  country: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'prospect';
}

export interface UpdateClientData extends Partial<CreateClientData> {}

// Invoice types
export interface Invoice extends BaseEntity {
  org_id: string;
  number: string;
  client_id: string;
  job_id?: string;
  quote_id?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  tax_rate_pct: string;
  discount_amt: string;
  subtotal: string;
  tax_total: string;
  total: string;
  balance_due: string;
  issue_date: string;
  due_date?: string;
  sent_at?: string;
  created_by?: string;
}

export interface InvoiceItem extends BaseEntity {
  invoice_id: string;
  item_id?: string;
  description: string;
  quantity: string;
  unit_price: string;
  taxable: boolean;
  line_total: string;
  sort_order: number;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  client?: Client;
  payments?: Payment[];
}

export interface CreateInvoiceData {
  client_id: string;
  job_id?: string;
  quote_id?: string;
  currency: string;
  tax_rate_pct: number;
  discount_amt: number;
  issue_date: string;
  due_date?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    taxable: boolean;
  }>;
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {}

// Quote types
export interface Quote extends BaseEntity {
  org_id: string;
  number: string;
  client_id: string;
  job_id?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  currency: string;
  tax_rate_pct: string;
  discount_amt: string;
  subtotal: string;
  tax_total: string;
  total: string;
  terms?: string;
  valid_until?: string;
  sent_at?: string;
  created_by?: string;
}

export interface QuoteItem extends BaseEntity {
  quote_id: string;
  item_id?: string;
  description: string;
  quantity: string;
  unit_price: string;
  taxable: boolean;
  line_total: string;
  sort_order: number;
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
  client?: Client;
}

export interface CreateQuoteData {
  client_id: string;
  job_id?: string;
  currency: string;
  tax_rate_pct: number;
  discount_amt: number;
  terms?: string;
  valid_until?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    taxable: boolean;
  }>;
}

export interface UpdateQuoteData extends Partial<CreateQuoteData> {}

// Payment types
export interface Payment extends BaseEntity {
  invoice_id: string;
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  amount: string;
  received_at: string;
  note?: string;
  external_id?: string;
  created_by?: string;
}

export interface CreatePaymentData {
  method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  amount: number;
  note?: string;
}

// Pricebook types
export interface PricebookItem extends BaseEntity {
  org_id: string;
  code?: string;
  name: string;
  category?: string;
  unit: string;
  unit_price: string;
  taxable: boolean;
  active: boolean;
  is_quick_pick: boolean;
}

export interface CreatePricebookItemData {
  code?: string;
  name: string;
  category?: string;
  unit: string;
  unit_price: number;
  taxable: boolean;
  active: boolean;
  is_quick_pick: boolean;
}

export interface UpdatePricebookItemData extends Partial<CreatePricebookItemData> {}

// Filter types
export interface ClientFilters {
  status?: 'active' | 'inactive' | 'prospect';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface InvoiceFilters {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  client_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuoteFilters {
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  client_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PricebookFilters {
  category?: string;
  active?: boolean;
  isQuickPick?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

// Organization types
export interface Organization extends BaseEntity {
  name: string;
  trade: string;
  size?: string;
  plan: string;
  created_by?: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Session types
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
}

// KitAI types
export interface KitAIMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface KitAIThread {
  id: string;
  org_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: KitAIMessage[];
}

// API Response types
export interface APIResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error types
export interface APIError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    surface: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    interactive: {
      hover: string;
      pressed: string;
      disabled: string;
    };
    overlay: {
      backdrop: string;
      card: string;
    };
  };
  typography: {
    fontFamily: {
      primary: string;
    };
    fontWeight: {
      regular: string;
      semibold: string;
      bold: string;
    };
    fontSize: {
      caption: number;
      body: number;
      bodyStrong: number;
      section: number;
      h3: number;
      h2: number;
      h1: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    base: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    screen: number;
    component: {
      padding: number;
      margin: number;
      gap: number;
    };
  };
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  shadows: {
    none: Record<string, unknown>;
    sm: Record<string, unknown>;
    md: Record<string, unknown>;
    lg: Record<string, unknown>;
  };
  animation: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
      shimmer: number;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
    };
  };
  iconSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  hitTargets: {
    minimum: number;
    comfortable: number;
  };
  zIndex: {
    base: number;
    card: number;
    dropdown: number;
    modal: number;
    toast: number;
    tooltip: number;
  };
}
