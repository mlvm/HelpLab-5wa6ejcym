// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_history: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          status: string
          updated_by: string | null
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          status: string
          updated_by?: string | null
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          channel: string | null
          created_at: string
          date: string
          id: string
          professional_id: string
          status: string | null
          training_id: string | null
          training_name: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          date: string
          id?: string
          professional_id: string
          status?: string | null
          training_id?: string | null
          training_name?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          date?: string
          id?: string
          professional_id?: string
          status?: string | null
          training_id?: string | null
          training_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string
          details: string | null
          entity: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string
          details?: string | null
          entity?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string
          details?: string | null
          entity?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          channel: string | null
          content: string | null
          id: string
          metadata: Json | null
          recipient_contact: string | null
          recipient_name: string | null
          sent_at: string
          status: string | null
        }
        Insert: {
          channel?: string | null
          content?: string | null
          id?: string
          metadata?: Json | null
          recipient_contact?: string | null
          recipient_name?: string | null
          sent_at?: string
          status?: string | null
        }
        Update: {
          channel?: string | null
          content?: string | null
          id?: string
          metadata?: Json | null
          recipient_contact?: string | null
          recipient_name?: string | null
          sent_at?: string
          status?: string | null
        }
        Relationships: []
      }
      instructors: {
        Row: {
          active: boolean | null
          area: string | null
          cpf: string | null
          created_at: string
          id: string
          name: string
          role: string | null
          unit_id: string | null
        }
        Insert: {
          active?: boolean | null
          area?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          name: string
          role?: string | null
          unit_id?: string | null
        }
        Update: {
          active?: boolean | null
          area?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          avatar_url: string | null
          cpf: string
          created_at: string
          id: string
          name: string
          role: string | null
          status: string | null
          unit_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf: string
          created_at?: string
          id?: string
          name: string
          role?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          status?: string | null
          unit_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string
          created_at: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          unit: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf: string
          created_at?: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          unit?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          hours: string | null
          id: string
          instructor_id: string | null
          material_url: string | null
          name: string
          status: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          instructor_id?: string | null
          material_url?: string | null
          name: string
          status?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          hours?: string | null
          id?: string
          instructor_id?: string | null
          material_url?: string | null
          name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          active: boolean | null
          address_city: string | null
          address_state: string | null
          created_at: string
          id: string
          name: string
          sigla: string | null
          type: string
        }
        Insert: {
          active?: boolean | null
          address_city?: string | null
          address_state?: string | null
          created_at?: string
          id?: string
          name: string
          sigla?: string | null
          type: string
        }
        Update: {
          active?: boolean | null
          address_city?: string | null
          address_state?: string | null
          created_at?: string
          id?: string
          name?: string
          sigla?: string | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      user_role: "admin" | "user"
      user_status: "active" | "inactive"
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
      user_role: ["admin", "user"],
      user_status: ["active", "inactive"],
    },
  },
} as const

