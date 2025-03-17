
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      insurance_plans: {
        Row: {
          id: string
          name: string
          provider: string
          base_price: number
          coverage_limit: string
          rating: number
          terms: string
          exclusions: string[]
          badge: string | null
          pros: string[]
          cons: string[]
          logo_url: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          provider: string
          base_price: number
          coverage_limit: string
          rating: number
          terms: string
          exclusions: string[]
          badge?: string | null
          pros: string[]
          cons: string[]
          logo_url?: string | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          provider?: string
          base_price?: number
          coverage_limit?: string
          rating?: number
          terms?: string
          exclusions?: string[]
          badge?: string | null
          pros?: string[]
          cons?: string[]
          logo_url?: string | null
          created_at?: string
          is_active?: boolean
        }
      }
      insurance_benefits: {
        Row: {
          id: string
          plan_id: string
          name: string
          description: string
          limit: string
          is_highlighted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          name: string
          description: string
          limit: string
          is_highlighted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          name?: string
          description?: string
          limit?: string
          is_highlighted?: boolean
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      travel_policies: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          reference_number: string
          coverage_type: string
          origin_country: string
          destination_country: string
          trip_type: string
          start_date: string
          end_date: string
          cover_type: string
          total_price: number
          status: string
          payment_status: string
          payment_method: string | null
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          reference_number: string
          coverage_type: string
          origin_country: string
          destination_country: string
          trip_type: string
          start_date: string
          end_date: string
          cover_type: string
          total_price: number
          status: string
          payment_status: string
          payment_method?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          reference_number?: string
          coverage_type?: string
          origin_country?: string
          destination_country?: string
          trip_type?: string
          start_date?: string
          end_date?: string
          cover_type?: string
          total_price?: number
          status?: string
          payment_status?: string
          payment_method?: string | null
          payment_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      traveler_info: {
        Row: {
          id: string
          policy_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          email: string | null
          phone: string | null
          emergency_contact: string | null
          address: string | null
          passport_number: string | null
          passport_issue_date: string | null
          passport_expiry_date: string | null
          passport_nationality: string | null
          beneficiary_name: string | null
          beneficiary_relationship: string | null
          beneficiary_contact: string | null
          passport_document_url: string | null
          visa_document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          email?: string | null
          phone?: string | null
          emergency_contact?: string | null
          address?: string | null
          passport_number?: string | null
          passport_issue_date?: string | null
          passport_expiry_date?: string | null
          passport_nationality?: string | null
          beneficiary_name?: string | null
          beneficiary_relationship?: string | null
          beneficiary_contact?: string | null
          passport_document_url?: string | null
          visa_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          email?: string | null
          phone?: string | null
          emergency_contact?: string | null
          address?: string | null
          passport_number?: string | null
          passport_issue_date?: string | null
          passport_expiry_date?: string | null
          passport_nationality?: string | null
          beneficiary_name?: string | null
          beneficiary_relationship?: string | null
          beneficiary_contact?: string | null
          passport_document_url?: string | null
          visa_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          policy_id: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          status: string
          reference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          policy_id: string
          user_id: string
          amount: number
          currency: string
          payment_method: string
          status: string
          reference: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          policy_id?: string
          user_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          status?: string
          reference?: string
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
      [_ in never]: never
    }
  }
}
