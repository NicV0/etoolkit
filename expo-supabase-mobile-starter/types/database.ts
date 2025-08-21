export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          org_id: string
          actor_id: string | null
          entity_type: string
          entity_id: string
          action: Database['public']['Enums']['activity_action']
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          actor_id?: string | null
          entity_type: string
          entity_id: string
          action: Database['public']['Enums']['activity_action']
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: Database['public']['Enums']['activity_action']
          meta?: Json | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          org_id: string
          name: string
          phone: string | null
          email: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postal: string | null
          country: string | null
          notes: string | null
          status: Database['public']['Enums']['client_status']
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal?: string | null
          country?: string | null
          notes?: string | null
          status?: Database['public']['Enums']['client_status']
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal?: string | null
          country?: string | null
          notes?: string | null
          status?: Database['public']['Enums']['client_status']
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          org_id: string
          client_id: string | null
          job_id: string | null
          title: string
          path: string
          mime: string
          size: number
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          client_id?: string | null
          job_id?: string | null
          title: string
          path: string
          mime: string
          size: number
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          client_id?: string | null
          job_id?: string | null
          title?: string
          path?: string
          mime?: string
          size?: number
          uploaded_by?: string | null
          created_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          item_id: string | null
          description: string
          quantity: string
          unit_price: string
          taxable: boolean
          line_total: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          item_id?: string | null
          description: string
          quantity?: string
          unit_price: string
          taxable?: boolean
          line_total: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          item_id?: string | null
          description?: string
          quantity?: string
          unit_price?: string
          taxable?: boolean
          line_total?: string
          sort_order?: number
          created_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          org_id: string
          number: string
          client_id: string | null
          job_id: string | null
          quote_id: string | null
          status: Database['public']['Enums']['invoice_status']
          currency: string
          tax_rate_pct: string
          discount_amt: string
          subtotal: string
          tax_total: string
          total: string
          balance_due: string
          issue_date: string
          due_date: string | null
          sent_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          number: string
          client_id?: string | null
          job_id?: string | null
          quote_id?: string | null
          status?: Database['public']['Enums']['invoice_status']
          currency?: string
          tax_rate_pct?: string
          discount_amt?: string
          subtotal?: string
          tax_total?: string
          total?: string
          balance_due?: string
          issue_date?: string
          due_date?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          number?: string
          client_id?: string | null
          job_id?: string | null
          quote_id?: string | null
          status?: Database['public']['Enums']['invoice_status']
          currency?: string
          tax_rate_pct?: string
          discount_amt?: string
          subtotal?: string
          tax_total?: string
          total?: string
          balance_due?: string
          issue_date?: string
          due_date?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          org_id: string
          client_id: string | null
          title: string
          description: string | null
          status: Database['public']['Enums']['job_status']
          due_date: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          client_id?: string | null
          title: string
          description?: string | null
          status?: Database['public']['Enums']['job_status']
          due_date?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          status?: Database['public']['Enums']['job_status']
          due_date?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          trade: string
          size: string | null
          plan: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          trade: string
          size?: string | null
          plan?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          trade?: string
          size?: string | null
          plan?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          method: Database['public']['Enums']['payment_method']
          amount: string
          received_at: string
          note: string | null
          external_id: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          method: Database['public']['Enums']['payment_method']
          amount: string
          received_at?: string
          note?: string | null
          external_id?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          method?: Database['public']['Enums']['payment_method']
          amount?: string
          received_at?: string
          note?: string | null
          external_id?: string | null
          created_by?: string | null
          created_at?: string
        }
      }
      pricebook_items: {
        Row: {
          id: string
          org_id: string
          code: string | null
          name: string
          category: string | null
          unit: string
          unit_price: string
          taxable: boolean
          active: boolean
          is_quick_pick: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          code?: string | null
          name: string
          category?: string | null
          unit?: string
          unit_price: string
          taxable?: boolean
          active?: boolean
          is_quick_pick?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          code?: string | null
          name?: string
          category?: string | null
          unit?: string
          unit_price?: string
          taxable?: boolean
          active?: boolean
          is_quick_pick?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          user_id: string
          org_id: string | null
          display_name: string | null
          role: Database['public']['Enums']['user_role']
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          org_id?: string | null
          display_name?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          org_id?: string | null
          display_name?: string | null
          role?: Database['public']['Enums']['user_role']
          created_at?: string
          updated_at?: string
        }
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string
          item_id: string | null
          description: string
          quantity: string
          unit_price: string
          taxable: boolean
          line_total: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          item_id?: string | null
          description: string
          quantity?: string
          unit_price: string
          taxable?: boolean
          line_total: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          quote_id?: string
          item_id?: string | null
          description?: string
          quantity?: string
          unit_price?: string
          taxable?: boolean
          line_total?: string
          sort_order?: number
          created_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          org_id: string
          number: string
          client_id: string | null
          job_id: string | null
          status: Database['public']['Enums']['quote_status']
          currency: string
          tax_rate_pct: string
          discount_amt: string
          subtotal: string
          tax_total: string
          total: string
          terms: string | null
          valid_until: string | null
          sent_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          number: string
          client_id?: string | null
          job_id?: string | null
          status?: Database['public']['Enums']['quote_status']
          currency?: string
          tax_rate_pct?: string
          discount_amt?: string
          subtotal?: string
          tax_total?: string
          total?: string
          terms?: string | null
          valid_until?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          number?: string
          client_id?: string | null
          job_id?: string | null
          status?: Database['public']['Enums']['quote_status']
          currency?: string
          tax_rate_pct?: string
          discount_amt?: string
          subtotal?: string
          tax_total?: string
          total?: string
          terms?: string | null
          valid_until?: string | null
          sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          org_id: string
          entity_type: string
          entity_id: string
          title: string
          due_at: string
          done: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          entity_type: string
          entity_id: string
          title: string
          due_at: string
          done?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          entity_type?: string
          entity_id?: string
          title?: string
          due_at?: string
          done?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          org_id: string
          currency: string
          default_tax_pct: string
          numbering_prefix_quote: string
          numbering_prefix_invoice: string
          logo_url: string | null
          legal_name: string | null
          address_json: Json | null
          terms_default: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          org_id: string
          currency?: string
          default_tax_pct?: string
          numbering_prefix_quote?: string
          numbering_prefix_invoice?: string
          logo_url?: string | null
          legal_name?: string | null
          address_json?: Json | null
          terms_default?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          org_id?: string
          currency?: string
          default_tax_pct?: string
          numbering_prefix_quote?: string
          numbering_prefix_invoice?: string
          logo_url?: string | null
          legal_name?: string | null
          address_json?: Json | null
          terms_default?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          org_id: string
          type: Database['public']['Enums']['template_type']
          name: string
          is_paid: boolean
          content_json: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          type: Database['public']['Enums']['template_type']
          name: string
          is_paid?: boolean
          content_json: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          type?: Database['public']['Enums']['template_type']
          name?: string
          is_paid?: boolean
          content_json?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_action: 'created' | 'updated' | 'deleted' | 'sent' | 'viewed' | 'paid'
      client_status: 'active' | 'inactive' | 'prospect'
      invoice_status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
      job_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      payment_method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'
      quote_status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
      template_type: 'quote' | 'invoice' | 'receipt'
      user_role: 'owner' | 'admin' | 'member'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Common types
export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type Client = Tables<'clients'>
export type Job = Tables<'jobs'>
export type Document = Tables<'documents'>
export type PricebookItem = Tables<'pricebook_items'>
export type Quote = Tables<'quotes'>
export type QuoteItem = Tables<'quote_items'>
export type Invoice = Tables<'invoices'>
export type InvoiceItem = Tables<'invoice_items'>
export type Payment = Tables<'payments'>
export type Setting = Tables<'settings'>
export type Template = Tables<'templates'>
export type Activity = Tables<'activities'>
export type Reminder = Tables<'reminders'>

// Insert types
export type InsertOrganization = Database['public']['Tables']['organizations']['Insert']
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertClient = Database['public']['Tables']['clients']['Insert']
export type InsertJob = Database['public']['Tables']['jobs']['Insert']
export type InsertDocument = Database['public']['Tables']['documents']['Insert']
export type InsertPricebookItem = Database['public']['Tables']['pricebook_items']['Insert']
export type InsertQuote = Database['public']['Tables']['quotes']['Insert']
export type InsertQuoteItem = Database['public']['Tables']['quote_items']['Insert']
export type InsertInvoice = Database['public']['Tables']['invoices']['Insert']
export type InsertInvoiceItem = Database['public']['Tables']['invoice_items']['Insert']
export type InsertPayment = Database['public']['Tables']['payments']['Insert']
export type InsertSetting = Database['public']['Tables']['settings']['Insert']
export type InsertTemplate = Database['public']['Tables']['templates']['Insert']
export type InsertActivity = Database['public']['Tables']['activities']['Insert']
export type InsertReminder = Database['public']['Tables']['reminders']['Insert']

// Update types
export type UpdateOrganization = Database['public']['Tables']['organizations']['Update']
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateClient = Database['public']['Tables']['clients']['Update']
export type UpdateJob = Database['public']['Tables']['jobs']['Update']
export type UpdateDocument = Database['public']['Tables']['documents']['Update']
export type UpdatePricebookItem = Database['public']['Tables']['pricebook_items']['Update']
export type UpdateQuote = Database['public']['Tables']['quotes']['Update']
export type UpdateQuoteItem = Database['public']['Tables']['quote_items']['Update']
export type UpdateInvoice = Database['public']['Tables']['invoices']['Update']
export type UpdateInvoiceItem = Database['public']['Tables']['invoice_items']['Update']
export type UpdatePayment = Database['public']['Tables']['payments']['Update']
export type UpdateSetting = Database['public']['Tables']['settings']['Update']
export type UpdateTemplate = Database['public']['Tables']['templates']['Update']
export type UpdateReminder = Database['public']['Tables']['reminders']['Update']
