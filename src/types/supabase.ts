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
      contract_alerts: {
        Row: {
          alert_date: string
          alert_message: string
          alert_status: string
          alert_type: string
          contract_id: string
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          alert_date: string
          alert_message: string
          alert_status?: string
          alert_type: string
          contract_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          alert_date?: string
          alert_message?: string
          alert_status?: string
          alert_type?: string
          contract_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_alerts_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_attachments: {
        Row: {
          contract_id: string
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_attachments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_comments: {
        Row: {
          comment: string
          contract_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          contract_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          contract_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_comments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_history: {
        Row: {
          action: string
          contract_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          contract_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          contract_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_history_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_integrations: {
        Row: {
          contract_id: string
          created_at: string | null
          external_id: string | null
          id: string
          integration_id: string
          last_synced_at: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          external_id?: string | null
          id?: string
          integration_id: string
          last_synced_at?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          external_id?: string | null
          id?: string
          integration_id?: string
          last_synced_at?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_integrations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "external_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          adjustment_date: string | null
          alert_days_before: number | null
          alert_email: boolean | null
          alert_sms: boolean | null
          alert_system: boolean | null
          branch: string | null
          category: string | null
          created_at: string | null
          description: string | null
          effective_date: string | null
          file_path: string | null
          id: string
          name: string
          renewal_date: string | null
          signature_data: Json | null
          signature_date: string | null
          signature_provider: string | null
          signature_status: string | null
          signature_token: string | null
          signed_file_path: string | null
          signed_file_url: string | null
          status: string | null
          termination_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adjustment_date?: string | null
          alert_days_before?: number | null
          alert_email?: boolean | null
          alert_sms?: boolean | null
          alert_system?: boolean | null
          branch?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          file_path?: string | null
          id?: string
          name: string
          renewal_date?: string | null
          signature_data?: Json | null
          signature_date?: string | null
          signature_provider?: string | null
          signature_status?: string | null
          signature_token?: string | null
          signed_file_path?: string | null
          signed_file_url?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adjustment_date?: string | null
          alert_days_before?: number | null
          alert_email?: boolean | null
          alert_sms?: boolean | null
          alert_system?: boolean | null
          branch?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          file_path?: string | null
          id?: string
          name?: string
          renewal_date?: string | null
          signature_data?: Json | null
          signature_date?: string | null
          signature_provider?: string | null
          signature_status?: string | null
          signature_token?: string | null
          signed_file_path?: string | null
          signed_file_url?: string | null
          status?: string | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_access_logs: {
        Row: {
          action: string
          document_id: string
          id: string
          ip_address: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          document_id: string
          id?: string
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_access_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vault_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      external_integrations: {
        Row: {
          api_key: string | null
          api_secret: string | null
          base_url: string | null
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          status: string | null
          type: string
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          base_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          status?: string | null
          type: string
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          base_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          status?: string | null
          type?: string
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
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
      two_factor_setup: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          secret: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          secret: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          secret?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "two_factor_setup_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
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
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
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
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string | null
          vault_storage_used?: number | null
        }
        Relationships: []
      }
      vault_documents: {
        Row: {
          classification_processed: boolean | null
          created_at: string | null
          description: string | null
          document_type: string | null
          expiration_date: string | null
          extracted_text: string | null
          file_path: string
          file_size: number
          file_type: string | null
          file_url: string
          folder_path: string | null
          id: string
          is_critical: boolean | null
          name: string
          ocr_processed: boolean | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          classification_processed?: boolean | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          expiration_date?: string | null
          extracted_text?: string | null
          file_path: string
          file_size: number
          file_type?: string | null
          file_url: string
          folder_path?: string | null
          id?: string
          is_critical?: boolean | null
          name: string
          ocr_processed?: boolean | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          classification_processed?: boolean | null
          created_at?: string | null
          description?: string | null
          document_type?: string | null
          expiration_date?: string | null
          extracted_text?: string | null
          file_path?: string
          file_size?: number
          file_type?: string | null
          file_url?: string
          folder_path?: string | null
          id?: string
          is_critical?: boolean | null
          name?: string
          ocr_processed?: boolean | null
          tags?: string[] | null
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
