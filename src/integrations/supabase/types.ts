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
      insurance_benefits: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_highlighted: boolean | null
          limits: string
          name: string
          plan_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_highlighted?: boolean | null
          limits: string
          name: string
          plan_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_highlighted?: boolean | null
          limits?: string
          name?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_benefits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_plans: {
        Row: {
          badge: string | null
          base_price: number
          cons: string[] | null
          coverage_limit: string
          created_at: string | null
          exclusions: string[] | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          pros: string[] | null
          provider: string
          rating: number
          terms: string
        }
        Insert: {
          badge?: string | null
          base_price: number
          cons?: string[] | null
          coverage_limit: string
          created_at?: string | null
          exclusions?: string[] | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          pros?: string[] | null
          provider: string
          rating: number
          terms: string
        }
        Update: {
          badge?: string | null
          base_price?: number
          cons?: string[] | null
          coverage_limit?: string
          created_at?: string | null
          exclusions?: string[] | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          pros?: string[] | null
          provider?: string
          rating?: number
          terms?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_method: string
          policy_id: string
          reference: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: string
          payment_method: string
          policy_id: string
          reference: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_method?: string
          policy_id?: string
          reference?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "travel_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_policies: {
        Row: {
          cover_type: string
          coverage_type: string
          created_at: string | null
          destination_country: string
          end_date: string
          id: string
          origin_country: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          plan_id: string
          reference_number: string
          start_date: string
          status: string
          total_price: number
          trip_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cover_type: string
          coverage_type: string
          created_at?: string | null
          destination_country: string
          end_date: string
          id?: string
          origin_country: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status: string
          plan_id: string
          reference_number: string
          start_date: string
          status?: string
          total_price: number
          trip_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cover_type?: string
          coverage_type?: string
          created_at?: string | null
          destination_country?: string
          end_date?: string
          id?: string
          origin_country?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          plan_id?: string
          reference_number?: string
          start_date?: string
          status?: string
          total_price?: number
          trip_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_policies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      traveler_info: {
        Row: {
          address: string | null
          beneficiary_contact: string | null
          beneficiary_name: string | null
          beneficiary_relationship: string | null
          created_at: string | null
          date_of_birth: string
          email: string | null
          emergency_contact: string | null
          first_name: string
          id: string
          last_name: string
          passport_document_url: string | null
          passport_expiry_date: string | null
          passport_issue_date: string | null
          passport_nationality: string | null
          passport_number: string | null
          phone: string | null
          policy_id: string
          updated_at: string | null
          visa_document_url: string | null
        }
        Insert: {
          address?: string | null
          beneficiary_contact?: string | null
          beneficiary_name?: string | null
          beneficiary_relationship?: string | null
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          emergency_contact?: string | null
          first_name: string
          id?: string
          last_name: string
          passport_document_url?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_nationality?: string | null
          passport_number?: string | null
          phone?: string | null
          policy_id: string
          updated_at?: string | null
          visa_document_url?: string | null
        }
        Update: {
          address?: string | null
          beneficiary_contact?: string | null
          beneficiary_name?: string | null
          beneficiary_relationship?: string | null
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          emergency_contact?: string | null
          first_name?: string
          id?: string
          last_name?: string
          passport_document_url?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_nationality?: string | null
          passport_number?: string | null
          phone?: string | null
          policy_id?: string
          updated_at?: string | null
          visa_document_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "traveler_info_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "travel_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
