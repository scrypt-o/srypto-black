// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      patient__persinfo__profile: {
        Row: {
          user_id: string
          first_name: string | null
          last_name: string | null
          date_of_birth: string | null
          sa_id_number: string | null
          phone_primary: string | null
          email_address: string | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          sa_id_number?: string | null
          phone_primary?: string | null
          email_address?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          sa_id_number?: string | null
          phone_primary?: string | null
          email_address?: string | null
          profile_image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_patient__persinfo__profile: {
        Row: {
          user_id: string
          first_name: string | null
          last_name: string | null
          date_of_birth: string | null
          sa_id_number: string | null
          phone_primary: string | null
          email_address: string | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: never
      }
    }
    Functions: {
      sp_patient__persinfo__profile_upsert: {
        Args: {
          p_user_id: string
          p_first_name: string
          p_last_name: string
          p_date_of_birth: string | null
          p_sa_id_number: string | null
          p_phone_primary: string | null
          p_email_address: string
          p_profile_image_url: string | null
        }
        Returns: {
          user_id: string
          first_name: string | null
          last_name: string | null
          date_of_birth: string | null
          sa_id_number: string | null
          phone_primary: string | null
          email_address: string | null
          profile_image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}