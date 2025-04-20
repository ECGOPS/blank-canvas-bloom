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
      control_outages: {
        Row: {
          cause: string | null
          created_at: string
          customers_affected: number | null
          date_time: string | null
          district_id: string | null
          duration: number | null
          feeder: string
          id: string
          location: string | null
          outage_type: string
          region_id: string | null
          updated_at: string
        }
        Insert: {
          cause?: string | null
          created_at?: string
          customers_affected?: number | null
          date_time?: string | null
          district_id?: string | null
          duration?: number | null
          feeder: string
          id?: string
          location?: string | null
          outage_type: string
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          cause?: string | null
          created_at?: string
          customers_affected?: number | null
          date_time?: string | null
          district_id?: string | null
          duration?: number | null
          feeder?: string
          id?: string
          location?: string | null
          outage_type?: string
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "control_outages_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "control_outages_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          created_at: string
          id: string
          name: string
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      feeder_legs: {
        Row: {
          created_at: string
          district_id: string | null
          id: string
          name: string
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          id?: string
          name: string
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          id?: string
          name?: string
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeder_legs_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeder_legs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_items: {
        Row: {
          created_at: string
          id: string
          inspection_id: string | null
          inspection_type: string
          item_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_id?: string | null
          inspection_type: string
          item_name: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inspection_id?: string | null
          inspection_type?: string
          item_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      load_monitoring: {
        Row: {
          created_at: string
          created_by: string | null
          district_id: string | null
          id: string
          reading_value: number
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          id?: string
          reading_value: number
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          id?: string
          reading_value?: number
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_monitoring_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_monitoring_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      op5_faults: {
        Row: {
          cause: string | null
          created_at: string
          customers_affected: number | null
          date_time: string | null
          district_id: string | null
          duration: number | null
          fault_type: string
          feeder: string
          id: string
          location: string | null
          region_id: string | null
          updated_at: string
        }
        Insert: {
          cause?: string | null
          created_at?: string
          customers_affected?: number | null
          date_time?: string | null
          district_id?: string | null
          duration?: number | null
          fault_type: string
          feeder: string
          id?: string
          location?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          cause?: string | null
          created_at?: string
          customers_affected?: number | null
          date_time?: string | null
          district_id?: string | null
          duration?: number | null
          fault_type?: string
          feeder?: string
          id?: string
          location?: string | null
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "op5_faults_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "op5_faults_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      substation_inspections: {
        Row: {
          created_at: string
          created_by: string | null
          district_id: string | null
          id: string
          region_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          id?: string
          region_id?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          district_id?: string | null
          id?: string
          region_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "substation_inspections_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substation_inspections_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          district_id: string | null
          email: string
          id: string
          name: string
          region_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          email: string
          id: string
          name: string
          region_id?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          email?: string
          id?: string
          name?: string
          region_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      vit_assets: {
        Row: {
          created_at: string
          district_id: string | null
          id: string
          location: string | null
          name: string
          region_id: string | null
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          district_id?: string | null
          id?: string
          location?: string | null
          name: string
          region_id?: string | null
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          district_id?: string | null
          id?: string
          location?: string | null
          name?: string
          region_id?: string | null
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vit_assets_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "districts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vit_assets_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      vit_inspections: {
        Row: {
          asset_id: string | null
          created_at: string
          date: string | null
          findings: string | null
          id: string
          inspector: string
          recommendations: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          date?: string | null
          findings?: string | null
          id?: string
          inspector: string
          recommendations?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          date?: string | null
          findings?: string | null
          id?: string
          inspector?: string
          recommendations?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vit_inspections_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "vit_assets"
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
