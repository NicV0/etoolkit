export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_id: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          meta: Json | null
          org_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_action"]
          actor_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          meta?: Json | null
          org_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_action"]
          actor_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          meta?: Json | null
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          postal: string | null
          state: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          postal?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          postal?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          mime: string
          org_id: string
          path: string
          size: number
          title: string
          uploaded_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          mime: string
          org_id: string
          path: string
          size: number
          title: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          mime?: string
          org_id?: string
          path?: string
          size?: number
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_id: string | null
          line_total: number
          quantity: number
          sort_order: number | null
          taxable: boolean | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_id?: string | null
          line_total: number
          quantity?: number
          sort_order?: number | null
          taxable?: boolean | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_id?: string | null
          line_total?: number
          quantity?: number
          sort_order?: number | null
          taxable?: boolean | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "pricebook_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount_amt: number | null
          due_date: string | null
          id: string
          issue_date: string | null
          job_id: string | null
          number: string
          org_id: string
          quote_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_rate_pct: number | null
          tax_total: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          balance_due?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amt?: number | null
          due_date?: string | null
          id?: string
          issue_date?: string | null
          job_id?: string | null
          number: string
          org_id: string
          quote_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_rate_pct?: number | null
          tax_total?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          balance_due?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amt?: number | null
          due_date?: string | null
          id?: string
          issue_date?: string | null
          job_id?: string | null
          number?: string
          org_id?: string
          quote_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_rate_pct?: number | null
          tax_total?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          location: string | null
          org_id: string
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          org_id: string
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          location?: string | null
          org_id?: string
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          plan: string
          size: string | null
          trade: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          plan?: string
          size?: string | null
          trade: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          plan?: string
          size?: string | null
          trade?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          external_id: string | null
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          received_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          external_id?: string | null
          id?: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          received_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          external_id?: string | null
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pricebook_items: {
        Row: {
          active: boolean | null
          category: string | null
          code: string | null
          created_at: string | null
          id: string
          is_quick_pick: boolean | null
          name: string
          org_id: string
          taxable: boolean | null
          unit: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          is_quick_pick?: boolean | null
          name: string
          org_id: string
          taxable?: boolean | null
          unit?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          is_quick_pick?: boolean | null
          name?: string
          org_id?: string
          taxable?: boolean | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricebook_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          org_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          org_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          item_id: string | null
          line_total: number
          quantity: number
          quote_id: string
          sort_order: number | null
          taxable: boolean | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          item_id?: string | null
          line_total: number
          quantity?: number
          quote_id: string
          sort_order?: number | null
          taxable?: boolean | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          item_id?: string | null
          line_total?: number
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          taxable?: boolean | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "pricebook_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          discount_amt: number | null
          id: string
          job_id: string | null
          number: string
          org_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["quote_status"] | null
          subtotal: number | null
          tax_rate_pct: number | null
          tax_total: number | null
          terms: string | null
          total: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amt?: number | null
          id?: string
          job_id?: string | null
          number: string
          org_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          subtotal?: number | null
          tax_rate_pct?: number | null
          tax_total?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          discount_amt?: number | null
          id?: string
          job_id?: string | null
          number?: string
          org_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          subtotal?: number | null
          tax_rate_pct?: number | null
          tax_total?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          created_by: string | null
          done: boolean | null
          due_at: string
          entity_id: string
          entity_type: string
          id: string
          org_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          done?: boolean | null
          due_at: string
          entity_id: string
          entity_type: string
          id?: string
          org_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          done?: boolean | null
          due_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          org_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          address_json: Json | null
          created_at: string | null
          currency: string | null
          default_tax_pct: number | null
          legal_name: string | null
          logo_url: string | null
          numbering_prefix_invoice: string | null
          numbering_prefix_quote: string | null
          org_id: string
          terms_default: string | null
          updated_at: string | null
        }
        Insert: {
          address_json?: Json | null
          created_at?: string | null
          currency?: string | null
          default_tax_pct?: number | null
          legal_name?: string | null
          logo_url?: string | null
          numbering_prefix_invoice?: string | null
          numbering_prefix_quote?: string | null
          org_id: string
          terms_default?: string | null
          updated_at?: string | null
        }
        Update: {
          address_json?: Json | null
          created_at?: string | null
          currency?: string | null
          default_tax_pct?: number | null
          legal_name?: string | null
          logo_url?: string | null
          numbering_prefix_invoice?: string | null
          numbering_prefix_quote?: string | null
          org_id?: string
          terms_default?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          content_json: Json
          created_at: string | null
          id: string
          is_paid: boolean | null
          name: string
          org_id: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at: string | null
        }
        Insert: {
          content_json: Json
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          name: string
          org_id: string
          type: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
        }
        Update: {
          content_json?: Json
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          name?: string
          org_id?: string
          type?: Database["public"]["Enums"]["template_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kitai_threads: {
        Row: {
          id: string
          org_id: string
          title: string
          created_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          org_id: string
          title: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          org_id?: string
          title?: string
          created_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitai_threads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kitai_messages: {
        Row: {
          id: string
          thread_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          thread_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          thread_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kitai_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "kitai_threads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_org_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { org_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_action:
        | "created"
        | "updated"
        | "deleted"
        | "sent"
        | "viewed"
        | "paid"
      client_status: "active" | "inactive" | "prospect"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      job_status: "pending" | "in_progress" | "completed" | "cancelled"
      payment_method:
        | "cash"
        | "check"
        | "credit_card"
        | "bank_transfer"
        | "other"
      quote_status: "draft" | "sent" | "accepted" | "rejected" | "expired"
      template_type: "quote" | "invoice" | "receipt"
      user_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_action: [
        "created",
        "updated",
        "deleted",
        "sent",
        "viewed",
        "paid",
      ],
      client_status: ["active", "inactive", "prospect"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      job_status: ["pending", "in_progress", "completed", "cancelled"],
      payment_method: [
        "cash",
        "check",
        "credit_card",
        "bank_transfer",
        "other",
      ],
      quote_status: ["draft", "sent", "accepted", "rejected", "expired"],
      template_type: ["quote", "invoice", "receipt"],
      user_role: ["owner", "admin", "member"],
    },
  },
} as const

// Export type aliases for convenience
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Quote = Database['public']['Tables']['quotes']['Row']
export type QuoteInsert = Database['public']['Tables']['quotes']['Insert']
export type QuoteUpdate = Database['public']['Tables']['quotes']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type PricebookItem = Database['public']['Tables']['pricebook_items']['Row']
export type PricebookItemInsert = Database['public']['Tables']['pricebook_items']['Insert']
export type PricebookItemUpdate = Database['public']['Tables']['pricebook_items']['Update']

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityInsert = Database['public']['Tables']['activities']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activities']['Update']

export type Reminder = Database['public']['Tables']['reminders']['Row']
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert']
export type ReminderUpdate = Database['public']['Tables']['reminders']['Update']

export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Settings = Database['public']['Tables']['settings']['Row']
export type SettingsInsert = Database['public']['Tables']['settings']['Insert']
export type SettingsUpdate = Database['public']['Tables']['settings']['Update']

export type Template = Database['public']['Tables']['templates']['Row']
export type TemplateInsert = Database['public']['Tables']['templates']['Insert']
export type TemplateUpdate = Database['public']['Tables']['templates']['Update']

export type QuoteItem = Database['public']['Tables']['quote_items']['Row']
export type QuoteItemInsert = Database['public']['Tables']['quote_items']['Insert']
export type QuoteItemUpdate = Database['public']['Tables']['quote_items']['Update']

export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert']
export type InvoiceItemUpdate = Database['public']['Tables']['invoice_items']['Update']

export type KitAIThread = Database['public']['Tables']['kitai_threads']['Row']
export type KitAIThreadInsert = Database['public']['Tables']['kitai_threads']['Insert']
export type KitAIThreadUpdate = Database['public']['Tables']['kitai_threads']['Update']

export type KitAIMessage = Database['public']['Tables']['kitai_messages']['Row']
export type KitAIMessageInsert = Database['public']['Tables']['kitai_messages']['Insert']
export type KitAIMessageUpdate = Database['public']['Tables']['kitai_messages']['Update']
