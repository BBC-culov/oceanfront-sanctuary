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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      additional_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: []
      }
      apartment_availability_blocks: {
        Row: {
          apartment_id: string
          created_at: string
          created_by: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          apartment_id: string
          created_at?: string
          created_by: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string
          created_at?: string
          created_by?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      apartments: {
        Row: {
          address: string | null
          bathrooms: number
          bedrooms: number
          category: string
          check_in_time: string
          check_out_time: string
          created_at: string
          description: string | null
          guests: number
          id: string
          images: Json | null
          is_active: boolean
          map_query: string | null
          name: string
          owner_id: string | null
          price_per_night: number
          services: Json | null
          slug: string
          sqm: number
          tagline: string | null
          updated_at: string
          videos: Json | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number
          bedrooms?: number
          category?: string
          check_in_time?: string
          check_out_time?: string
          created_at?: string
          description?: string | null
          guests?: number
          id?: string
          images?: Json | null
          is_active?: boolean
          map_query?: string | null
          name: string
          owner_id?: string | null
          price_per_night?: number
          services?: Json | null
          slug: string
          sqm?: number
          tagline?: string | null
          updated_at?: string
          videos?: Json | null
        }
        Update: {
          address?: string | null
          bathrooms?: number
          bedrooms?: number
          category?: string
          check_in_time?: string
          check_out_time?: string
          created_at?: string
          description?: string | null
          guests?: number
          id?: string
          images?: Json | null
          is_active?: boolean
          map_query?: string | null
          name?: string
          owner_id?: string | null
          price_per_night?: number
          services?: Json | null
          slug?: string
          sqm?: number
          tagline?: string | null
          updated_at?: string
          videos?: Json | null
        }
        Relationships: []
      }
      booking_guests: {
        Row: {
          booking_id: string
          created_at: string
          date_of_birth: string
          first_name: string
          id: string
          id_card_expiry: string
          id_card_issued: string
          id_card_number: string
          id_type: string
          last_name: string
          nationality: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          date_of_birth: string
          first_name: string
          id?: string
          id_card_expiry: string
          id_card_issued: string
          id_card_number: string
          id_type?: string
          last_name: string
          nationality: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          date_of_birth?: string
          first_name?: string
          id?: string
          id_card_expiry?: string
          id_card_issued?: string
          id_card_number?: string
          id_type?: string
          last_name?: string
          nationality?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_guests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          airline: string | null
          amount_paid: number
          apartment_id: string
          arrival_time: string | null
          balance_link_expires_at: number | null
          balance_payment_url: string | null
          balance_session_id: string | null
          billing_address: string | null
          billing_city: string | null
          billing_country: string | null
          billing_fiscal_code: string | null
          billing_name: string | null
          billing_zip: string | null
          booking_code: string
          check_in: string
          check_out: string
          created_at: string
          departure_time: string | null
          deposit_amount: number
          flight_outbound: string | null
          flight_return: string | null
          guest_date_of_birth: string | null
          guest_email: string
          guest_id_card_expiry: string | null
          guest_id_card_issued: string | null
          guest_id_card_number: string | null
          guest_id_type: string | null
          guest_last_name: string | null
          guest_name: string
          guest_nationality: string | null
          guest_phone: string | null
          guest_place_of_birth: string | null
          id: string
          no_transfer: boolean
          notes: string | null
          payment_type: string
          recovery_email_sent_at: string | null
          resume_token: string | null
          selected_services: Json | null
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          airline?: string | null
          amount_paid?: number
          apartment_id: string
          arrival_time?: string | null
          balance_link_expires_at?: number | null
          balance_payment_url?: string | null
          balance_session_id?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_fiscal_code?: string | null
          billing_name?: string | null
          billing_zip?: string | null
          booking_code: string
          check_in: string
          check_out: string
          created_at?: string
          departure_time?: string | null
          deposit_amount?: number
          flight_outbound?: string | null
          flight_return?: string | null
          guest_date_of_birth?: string | null
          guest_email: string
          guest_id_card_expiry?: string | null
          guest_id_card_issued?: string | null
          guest_id_card_number?: string | null
          guest_id_type?: string | null
          guest_last_name?: string | null
          guest_name: string
          guest_nationality?: string | null
          guest_phone?: string | null
          guest_place_of_birth?: string | null
          id?: string
          no_transfer?: boolean
          notes?: string | null
          payment_type?: string
          recovery_email_sent_at?: string | null
          resume_token?: string | null
          selected_services?: Json | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          airline?: string | null
          amount_paid?: number
          apartment_id?: string
          arrival_time?: string | null
          balance_link_expires_at?: number | null
          balance_payment_url?: string | null
          balance_session_id?: string | null
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_fiscal_code?: string | null
          billing_name?: string | null
          billing_zip?: string | null
          booking_code?: string
          check_in?: string
          check_out?: string
          created_at?: string
          departure_time?: string | null
          deposit_amount?: number
          flight_outbound?: string | null
          flight_return?: string | null
          guest_date_of_birth?: string | null
          guest_email?: string
          guest_id_card_expiry?: string | null
          guest_id_card_issued?: string | null
          guest_id_card_number?: string | null
          guest_id_type?: string | null
          guest_last_name?: string | null
          guest_name?: string
          guest_nationality?: string | null
          guest_phone?: string | null
          guest_place_of_birth?: string | null
          id?: string
          no_transfer?: boolean
          notes?: string | null
          payment_type?: string
          recovery_email_sent_at?: string | null
          resume_token?: string | null
          selected_services?: Json | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          custom_method: string | null
          id: string
          method: string
          notes: string | null
          recorded_by: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          custom_method?: string | null
          id?: string
          method: string
          notes?: string | null
          recorded_by: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          custom_method?: string | null
          id?: string
          method?: string
          notes?: string | null
          recorded_by?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "amministratore" | "proprietario"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "awaiting_verification"
        | "paid"
        | "incomplete"
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
      app_role: ["admin", "user", "amministratore", "proprietario"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "awaiting_verification",
        "paid",
        "incomplete",
      ],
    },
  },
} as const
