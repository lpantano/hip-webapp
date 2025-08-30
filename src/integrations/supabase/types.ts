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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      expert_applications: {
        Row: {
          created_at: string
          credentials: string
          email: string
          expertise_area: Database["public"]["Enums"]["expertise_area"]
          full_name: string
          id: string
          motivation: string
          status: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          credentials: string
          email: string
          expertise_area: Database["public"]["Enums"]["expertise_area"]
          full_name: string
          id?: string
          motivation: string
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          credentials?: string
          email?: string
          expertise_area?: Database["public"]["Enums"]["expertise_area"]
          full_name?: string
          id?: string
          motivation?: string
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      claims: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          product: string | null
          category: Database["public"]["Enums"]["claim_category"]
          status: Database["public"]["Enums"]["claim_status"]
          vote_count: number
          condition: string | null
          stage: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          product?: string | null
          category: Database["public"]["Enums"]["claim_category"]
          status?: Database["public"]["Enums"]["claim_status"]
          vote_count?: number
          condition?: string | null
          stage?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          product?: string | null
          category?: Database["public"]["Enums"]["claim_category"]
          status?: Database["public"]["Enums"]["claim_status"]
          vote_count?: number
          condition?: string | null
          stage?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          id: string
          claim_id: string
          title: string
          journal: string | null
          publication_year: number | null
          doi: string | null
          url: string | null
          authors: string | null
          abstract: string | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          title: string
          journal?: string | null
          publication_year?: number | null
          doi?: string | null
          url?: string | null
          authors?: string | null
          abstract?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          title?: string
          journal?: string | null
          publication_year?: number | null
          doi?: string | null
          url?: string | null
          authors?: string | null
          abstract?: string | null
          created_at?: string
        }
        Relationships: []
      }
      publication_scores: {
        Row: {
          id: string
          publication_id: string
          expert_user_id: string
          category: Database["public"]["Enums"]["evidence_score_category"]
          score: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          publication_id: string
          expert_user_id: string
          category: Database["public"]["Enums"]["evidence_score_category"]
          score: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          publication_id?: string
          expert_user_id?: string
          category?: Database["public"]["Enums"]["evidence_score_category"]
          score?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      claim_votes: {
        Row: {
          id: string
          claim_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      claim_reactions: {
        Row: {
          id: string
          claim_id: string
          user_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          user_id: string
          reaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          user_id?: string
          reaction_type?: string
          created_at?: string
        }
        Relationships: []
      }
      sources: {
        Row: {
          id: string
          claim_id: string
          user_id: string
          source_type: Database["public"]["Enums"]["source_type"]
          source_url: string | null
          source_title: string | null
          source_description: string | null
          author_name: string | null
          published_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          user_id: string
          source_type: Database["public"]["Enums"]["source_type"]
          source_url?: string | null
          source_title?: string | null
          source_description?: string | null
          author_name?: string | null
          published_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          user_id?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          source_url?: string | null
          source_title?: string | null
          source_description?: string | null
          author_name?: string | null
          published_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          created_at: string
          expert_application_id: string
          id: string
          platform: string
          url: string
        }
        Insert: {
          created_at?: string
          expert_application_id: string
          id?: string
          platform: string
          url: string
        }
        Update: {
          created_at?: string
          expert_application_id?: string
          id?: string
          platform?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_links_expert_application_id_fkey"
            columns: ["expert_application_id"]
            isOneToOne: false
            referencedRelation: "expert_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      claims_full: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          product: string | null
          category: Database["public"]["Enums"]["claim_category"]
          status: Database["public"]["Enums"]["claim_status"]
          vote_count: number
          condition: string | null
          stage: string | null
          created_at: string
          updated_at: string
          publications: Json
          claim_reactions: Json
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "expert" | "ambassador" | "admin"
      expertise_area: "health" | "fitness" | "nutrition" | "mental_health"
      claim_status: "proposed" | "pending" | "verified" | "disputed" | "needs_more_evidence"
      claim_category: "nutrition" | "fitness" | "mental_health" | "pregnancy" | "menopause" | "general_health" | "perimenopause"
      evidence_score_category: "study_size" | "population" | "consensus" | "interpretation"
      source_type: "webpage" | "instagram" | "tiktok" | "youtube" | "twitter" | "facebook" | "reddit" | "podcast" | "book" | "research_paper" | "other"
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
    : never,
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
      app_role: ["user", "expert", "ambassador", "admin"],
      expertise_area: ["health", "fitness", "nutrition", "mental_health"],
    },
  },
} as const
