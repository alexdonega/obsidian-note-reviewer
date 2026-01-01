import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types (auto-generated from schema)
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: 'free' | 'pro' | 'team';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: 'free' | 'pro' | 'team';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: 'free' | 'pro' | 'team';
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          org_id: string;
          email: string;
          name: string | null;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          email: string;
          name?: string | null;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          email?: string;
          name?: string | null;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          org_id: string;
          slug: string;
          title: string;
          content: string;
          markdown: string;
          created_by: string | null;
          updated_by: string | null;
          is_public: boolean;
          share_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          slug: string;
          title: string;
          content: string;
          markdown: string;
          created_by?: string | null;
          updated_by?: string | null;
          is_public?: boolean;
          share_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          slug?: string;
          title?: string;
          content?: string;
          markdown?: string;
          created_by?: string | null;
          updated_by?: string | null;
          is_public?: boolean;
          share_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      annotations: {
        Row: {
          id: string;
          note_id: string;
          user_id: string | null;
          block_id: string;
          start_offset: number;
          end_offset: number;
          type: string;
          text: string | null;
          original_text: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          user_id?: string | null;
          block_id: string;
          start_offset: number;
          end_offset: number;
          type: string;
          text?: string | null;
          original_text?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          user_id?: string | null;
          block_id?: string;
          start_offset?: number;
          end_offset?: number;
          type?: string;
          text?: string | null;
          original_text?: string | null;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type Organization = Database['public']['Tables']['organizations']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Annotation = Database['public']['Tables']['annotations']['Row'];
