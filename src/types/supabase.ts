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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      client_login_history: {
        Row: {
          client_id: string | null
          id: string
          ip_address: string
          login_at: string | null
          user_agent: string | null
        }
        Insert: {
          client_id?: string | null
          id?: string
          ip_address: string
          login_at?: string | null
          user_agent?: string | null
        }
        Update: {
          client_id?: string | null
          id?: string
          ip_address?: string
          login_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_login_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          invoice_url: string | null
          payment_date: string | null
          payment_method: string | null
          plan_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          document: string | null
          email: string
          id: string
          is_blocked: boolean | null
          last_ip: string | null
          last_login: string | null
          name: string
          notes: string | null
          payment_status: string
          phone: string | null
          plan_id: string | null
          postal_code: string | null
          state: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          document?: string | null
          email: string
          id?: string
          is_blocked?: boolean | null
          last_ip?: string | null
          last_login?: string | null
          name: string
          notes?: string | null
          payment_status?: string
          phone?: string | null
          plan_id?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          document?: string | null
          email?: string
          id?: string
          is_blocked?: boolean | null
          last_ip?: string | null
          last_login?: string | null
          name?: string
          notes?: string | null
          payment_status?: string
          phone?: string | null
          plan_id?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          branch: string | null
          category: string | null
          created_at: string | null
          description: string | null
          file_path: string | null
          id: string
          name: string
          signature_data: Json | null
          signature_provider: string | null
          signature_status: string | null
          signature_token: string | null
          signed_file_path: string | null
          signed_file_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          branch?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          name: string
          signature_data?: Json | null
          signature_provider?: string | null
          signature_status?: string | null
          signature_token?: string | null
          signed_file_path?: string | null
          signed_file_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          branch?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string | null
          id?: string
          name?: string
          signature_data?: Json | null
          signature_provider?: string | null
          signature_status?: string | null
          signature_token?: string | null
          signed_file_path?: string | null
          signed_file_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      form_links: {
        Row: {
          client_email: string | null
          created_at: string | null
          expires_at: string | null
          form_id: string
          id: string
          status: string | null
          updated_at: string | null
          url_token: string
        }
        Insert: {
          client_email?: string | null
          created_at?: string | null
          expires_at?: string | null
          form_id: string
          id?: string
          status?: string | null
          updated_at?: string | null
          url_token: string
        }
        Update: {
          client_email?: string | null
          created_at?: string | null
          expires_at?: string | null
          form_id?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          url_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_links_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          contract_id: string
          created_at: string | null
          fields: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          fields: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          fields?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forms_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          billing_cycle: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          trial_days: number | null
          updated_at: string | null
          vault_storage_limit: number | null
        }
        Insert: {
          billing_cycle: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          trial_days?: number | null
          updated_at?: string | null
          vault_storage_limit?: number | null
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          trial_days?: number | null
          updated_at?: string | null
          vault_storage_limit?: number | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          permissions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          permissions?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      signatures: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          signature_hash: string | null
          signature_id: string | null
          signature_platform: string | null
          signed_at: string | null
          signed_document_url: string | null
          status: string | null
          submission_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          signature_hash?: string | null
          signature_id?: string | null
          signature_platform?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: string | null
          submission_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          signature_hash?: string | null
          signature_id?: string | null
          signature_platform?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: string | null
          submission_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          client_data: Json
          created_at: string | null
          form_link_id: string
          id: string
          ip_address: string | null
        }
        Insert: {
          client_data: Json
          created_at?: string | null
          form_link_id: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          client_data?: Json
          created_at?: string | null
          form_link_id?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_form_link_id_fkey"
            columns: ["form_link_id"]
            isOneToOne: false
            referencedRelation: "form_links"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          subscription_status: string | null
          token_identifier: string
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
          vault_storage_used: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          subscription_status?: string | null
          token_identifier: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          vault_storage_used?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          subscription_status?: string | null
          token_identifier?: string
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          vault_storage_used?: number | null
        }
        Relationships: []
      }
      vault_documents: {
        Row: {
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number
          file_type: string | null
          file_url: string
          id: string
          is_critical: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size: number
          file_type?: string | null
          file_url: string
          id?: string
          is_critical?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number
          file_type?: string | null
          file_url?: string
          id?: string
          is_critical?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
