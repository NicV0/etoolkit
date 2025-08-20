import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          business_name: string;
          trade: string;
          business_size: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_name: string;
          trade: string;
          business_size: string;
        };
        Update: {
          business_name?: string;
          trade?: string;
          business_size?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          project_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          email?: string;
          phone?: string;
          address?: string;
          project_name?: string;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          project_name?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          status: 'draft' | 'sent' | 'paid' | 'overdue';
          total_amount: number;
          tax_rate: number;
          due_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          client_id: string;
          invoice_number: string;
          status?: 'draft' | 'sent' | 'paid' | 'overdue';
          total_amount: number;
          tax_rate?: number;
          due_date: string;
        };
        Update: {
          status?: 'draft' | 'sent' | 'paid' | 'overdue';
          total_amount?: number;
          tax_rate?: number;
          due_date?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          title: string;
          description: string;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          estimated_cost: number;
          deadline: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          client_id: string;
          title: string;
          description?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          estimated_cost?: number;
          deadline?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          estimated_cost?: number;
          deadline?: string;
        };
      };
    };
  };
};