export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          company_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: string | null;
          metadata: Json;
          updated_at: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          company_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          updated_at?: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          company_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
          metadata?: Json;
          updated_at?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      billing_records: {
        Row: {
          amount_cents: number;
          company_id: string;
          created_at: string;
          currency: string;
          id: string;
          invoice_url: string | null;
          paid_at: string | null;
          period_end: string | null;
          period_start: string | null;
          status: string;
          stripe_invoice_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount_cents: number;
          company_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          invoice_url?: string | null;
          paid_at?: string | null;
          period_end?: string | null;
          period_start?: string | null;
          status: string;
          stripe_invoice_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount_cents?: number;
          company_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          invoice_url?: string | null;
          paid_at?: string | null;
          period_end?: string | null;
          period_start?: string | null;
          status?: string;
          stripe_invoice_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      call_logs: {
        Row: {
          agent_name: string | null;
          call_date: string;
          caller_name: string | null;
          caller_number: string | null;
          company_id: string;
          created_at: string;
          direction: Database["public"]["Enums"]["call_direction"];
          duration_seconds: number;
          external_id: string | null;
          id: string;
          notes: string | null;
          recording_url: string | null;
          status: Database["public"]["Enums"]["call_status"];
          updated_at: string;
        };
        Insert: {
          agent_name?: string | null;
          call_date: string;
          caller_name?: string | null;
          caller_number?: string | null;
          company_id: string;
          created_at?: string;
          direction?: Database["public"]["Enums"]["call_direction"];
          duration_seconds?: number;
          external_id?: string | null;
          id?: string;
          notes?: string | null;
          recording_url?: string | null;
          status?: Database["public"]["Enums"]["call_status"];
          updated_at?: string;
        };
        Update: {
          agent_name?: string | null;
          call_date?: string;
          caller_name?: string | null;
          caller_number?: string | null;
          company_id?: string;
          created_at?: string;
          direction?: Database["public"]["Enums"]["call_direction"];
          duration_seconds?: number;
          external_id?: string | null;
          id?: string;
          notes?: string | null;
          recording_url?: string | null;
          status?: Database["public"]["Enums"]["call_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          address: string | null;
          created_at: string;
          email: string | null;
          hubspot_company_id: string | null;
          id: string;
          is_active: boolean;
          justcall_account_id: string | null;
          name: string;
          phone: string | null;
          stripe_customer_id: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          hubspot_company_id?: string | null;
          id?: string;
          is_active?: boolean;
          justcall_account_id?: string | null;
          name: string;
          phone?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          email?: string | null;
          hubspot_company_id?: string | null;
          id?: string;
          is_active?: boolean;
          justcall_account_id?: string | null;
          name?: string;
          phone?: string | null;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_contacts: {
        Row: {
          company_id: string;
          created_at: string;
          email: string | null;
          id: string;
          is_primary: boolean;
          name: string;
          phone: string | null;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_primary?: boolean;
          name: string;
          phone?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          email?: string | null;
          id?: string;
          is_primary?: boolean;
          name?: string;
          phone?: string | null;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_members: {
        Row: {
          company_id: string;
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      hubspot_sync: {
        Row: {
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          error_message: string | null;
          hubspot_id: string;
          id: string;
          last_synced_at: string | null;
          metadata: Json;
          sync_status: Database["public"]["Enums"]["sync_status"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          error_message?: string | null;
          hubspot_id: string;
          id?: string;
          last_synced_at?: string | null;
          metadata?: Json;
          sync_status?: Database["public"]["Enums"]["sync_status"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          error_message?: string | null;
          hubspot_id?: string;
          id?: string;
          last_synced_at?: string | null;
          metadata?: Json;
          sync_status?: Database["public"]["Enums"]["sync_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      justcall_sync: {
        Row: {
          company_id: string | null;
          completed_at: string | null;
          created_at: string;
          cursor: string | null;
          error_message: string | null;
          id: string;
          metadata: Json;
          records_processed: number;
          started_at: string | null;
          sync_status: Database["public"]["Enums"]["sync_status"];
          sync_type: string;
          updated_at: string;
        };
        Insert: {
          company_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          cursor?: string | null;
          error_message?: string | null;
          id?: string;
          metadata?: Json;
          records_processed?: number;
          started_at?: string | null;
          sync_status?: Database["public"]["Enums"]["sync_status"];
          sync_type: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          cursor?: string | null;
          error_message?: string | null;
          id?: string;
          metadata?: Json;
          records_processed?: number;
          started_at?: string | null;
          sync_status?: Database["public"]["Enums"]["sync_status"];
          sync_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding: {
        Row: {
          company_id: string;
          completed_at: string | null;
          completed_steps: Json;
          created_at: string;
          current_step: string | null;
          hubspot_deal_id: string | null;
          id: string;
          notes: string | null;
          status: Database["public"]["Enums"]["onboarding_status"];
          updated_at: string;
        };
        Insert: {
          company_id: string;
          completed_at?: string | null;
          completed_steps?: Json;
          created_at?: string;
          current_step?: string | null;
          hubspot_deal_id?: string | null;
          id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["onboarding_status"];
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          completed_at?: string | null;
          completed_steps?: Json;
          created_at?: string;
          current_step?: string | null;
          hubspot_deal_id?: string | null;
          id?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["onboarding_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          company_id: string;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          minutes_included: number | null;
          plan_name: string;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          minutes_included?: number | null;
          plan_name: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          minutes_included?: number | null;
          plan_name?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_sync: {
        Row: {
          company_id: string | null;
          completed_at: string | null;
          created_at: string;
          error_message: string | null;
          id: string;
          metadata: Json;
          records_processed: number;
          started_at: string | null;
          stripe_event_id: string | null;
          sync_status: Database["public"]["Enums"]["sync_status"];
          sync_type: string;
          updated_at: string;
        };
        Insert: {
          company_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          metadata?: Json;
          records_processed?: number;
          started_at?: string | null;
          stripe_event_id?: string | null;
          sync_status?: Database["public"]["Enums"]["sync_status"];
          sync_type: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          metadata?: Json;
          records_processed?: number;
          started_at?: string | null;
          stripe_event_id?: string | null;
          sync_status?: Database["public"]["Enums"]["sync_status"];
          sync_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      usage_metrics: {
        Row: {
          average_duration_seconds: number;
          calls_answered: number;
          calls_missed: number;
          company_id: string;
          created_at: string;
          id: string;
          minutes_used: number;
          period_end: string;
          period_start: string;
          updated_at: string;
        };
        Insert: {
          average_duration_seconds?: number;
          calls_answered?: number;
          calls_missed?: number;
          company_id: string;
          created_at?: string;
          id?: string;
          minutes_used?: number;
          period_end: string;
          period_start: string;
          updated_at?: string;
        };
        Update: {
          average_duration_seconds?: number;
          calls_answered?: number;
          calls_missed?: number;
          company_id?: string;
          created_at?: string;
          id?: string;
          minutes_used?: number;
          period_end?: string;
          period_start?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      user_company_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      user_has_company_access: {
        Args: {
          target_company_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      call_direction: "inbound" | "outbound";
      call_status: "answered" | "missed" | "voicemail" | "busy" | "failed" | "cancelled";
      onboarding_status: "not_started" | "in_progress" | "completed" | "blocked";
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused";
      sync_status: "pending" | "running" | "completed" | "failed";
      user_role: "admin" | "client";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

// Regenerate from local Supabase with:
// npm run supabase:types
