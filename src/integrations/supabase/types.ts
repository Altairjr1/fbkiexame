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
      exams: {
        Row: {
          access_code: string | null
          created_at: string
          date: string
          dojo: string | null
          id: string
          location: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          date: string
          dojo?: string | null
          id?: string
          location: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          date?: string
          dojo?: string | null
          id?: string
          location?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dojo: string | null
          email: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          dojo?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          dojo?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      scores: {
        Row: {
          created_at: string
          id: string
          kata: number | null
          kata_examiner: string | null
          kihon: number | null
          kihon_examiner: string | null
          knowledge: number | null
          knowledge_examiner: string | null
          kumite: number | null
          kumite_examiner: string | null
          notes: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kata?: number | null
          kata_examiner?: string | null
          kihon?: number | null
          kihon_examiner?: string | null
          knowledge?: number | null
          knowledge_examiner?: string | null
          kumite?: number | null
          kumite_examiner?: string | null
          notes?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kata?: number | null
          kata_examiner?: string | null
          kihon?: number | null
          kihon_examiner?: string | null
          knowledge?: number | null
          knowledge_examiner?: string | null
          kumite?: number | null
          kumite_examiner?: string | null
          notes?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: string
          club: string
          created_at: string
          current_belt: string
          dan_stage: string | null
          exam_id: string
          id: string
          name: string
          special_condition: string | null
          target_belt: string
        }
        Insert: {
          age: string
          club: string
          created_at?: string
          current_belt: string
          dan_stage?: string | null
          exam_id: string
          id?: string
          name: string
          special_condition?: string | null
          target_belt: string
        }
        Update: {
          age?: string
          club?: string
          created_at?: string
          current_belt?: string
          dan_stage?: string | null
          exam_id?: string
          id?: string
          name?: string
          special_condition?: string | null
          target_belt?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
