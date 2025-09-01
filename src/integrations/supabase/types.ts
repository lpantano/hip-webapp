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
      claim_reactions: {
        Row: {
          claim_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_reactions_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_reactions_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims_full"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_votes: {
        Row: {
          claim_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_votes_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_votes_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims_full"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          category: Database["public"]["Enums"]["claim_category"]
          created_at: string
          description: string
          id: string
          status: Database["public"]["Enums"]["claim_status"]
          title: string
          updated_at: string
          user_id: string
          vote_count: number
        }
        Insert: {
          category: Database["public"]["Enums"]["claim_category"]
          created_at?: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          title: string
          updated_at?: string
          user_id: string
          vote_count?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["claim_category"]
          created_at?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          title?: string
          updated_at?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: []
      }
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
          years_of_experience: number | null
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
          years_of_experience?: number | null
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
          years_of_experience?: number | null
        }
        Relationships: []
      }
      experts: {
        Row: {
          avatar_url: string | null
          created_at: string
          education: string
          expertise_area: Database["public"]["Enums"]["claim_category"]
          id: string
          location: string | null
          motivation: string
          status: string
          updated_at: string
          user_id: string
          website: string | null
          years_of_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          education: string
          expertise_area: Database["public"]["Enums"]["claim_category"]
          id?: string
          location?: string | null
          motivation: string
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
          years_of_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          education?: string
          expertise_area?: Database["public"]["Enums"]["claim_category"]
          id?: string
          location?: string | null
          motivation?: string
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publication_scores: {
        Row: {
          category: Database["public"]["Enums"]["evidence_score_category"]
          created_at: string
          expert_user_id: string
          id: string
          notes: string | null
          publication_id: string
          score: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["evidence_score_category"]
          created_at?: string
          expert_user_id: string
          id?: string
          notes?: string | null
          publication_id: string
          score: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["evidence_score_category"]
          created_at?: string
          expert_user_id?: string
          id?: string
          notes?: string | null
          publication_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_scores_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          abstract: string | null
          claim_id: string
          created_at: string
          doi: string | null
          id: string
          journal: string
          publication_year: number
          title: string
          url: string | null
        }
        Insert: {
          abstract?: string | null
          claim_id: string
          created_at?: string
          doi?: string | null
          id?: string
          journal: string
          publication_year: number
          title: string
          url?: string | null
        }
        Update: {
          abstract?: string | null
          claim_id?: string
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string
          publication_year?: number
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims_full"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_links: {
        Row: {
          created_at: string
          expert_id: string
          id: string
          platform: string
          url: string
        }
        Insert: {
          created_at?: string
          expert_id: string
          id?: string
          platform: string
          url: string
        }
        Update: {
          created_at?: string
          expert_id?: string
          id?: string
          platform?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_media_links_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          author_name: string | null
          claim_id: string
          created_at: string
          id: string
          published_date: string | null
          source_description: string | null
          source_title: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          source_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          claim_id: string
          created_at?: string
          id?: string
          published_date?: string | null
          source_description?: string | null
          source_title?: string | null
          source_type: Database["public"]["Enums"]["source_type"]
          source_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          claim_id?: string
          created_at?: string
          id?: string
          published_date?: string | null
          source_description?: string | null
          source_title?: string | null
          source_type?: Database["public"]["Enums"]["source_type"]
          source_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sources_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims_full"
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
          category: Database["public"]["Enums"]["claim_category"] | null
          claim_reactions: Json | null
          created_at: string | null
          description: string | null
          id: string | null
          publications: Json | null
          status: Database["public"]["Enums"]["claim_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          vote_count: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["claim_category"] | null
          claim_reactions?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          publications?: never
          status?: Database["public"]["Enums"]["claim_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["claim_category"] | null
          claim_reactions?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          publications?: never
          status?: Database["public"]["Enums"]["claim_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_count?: number | null
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
      claim_category:
        | "nutrition"
        | "fitness"
        | "mental_heath"
        | "pregnancy"
        | "menopause"
        | "general_health"
        | "perimenopause"
        | "mental_health"
      claim_status:
        | "proposed"
        | "pending"
        | "verified"
        | "disputed"
        | "needs_more_evidence"
      evidence_score_category:
        | "study_size"
        | "population"
        | "consensus"
        | "interpretation"
      expertise_area: "health" | "fitness" | "nutrition" | "mental_health"
      source_type:
        | "webpage"
        | "instagram"
        | "tiktok"
        | "youtube"
        | "twitter"
        | "facebook"
        | "reddit"
        | "podcast"
        | "book"
        | "research_paper"
        | "other"
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
      app_role: ["user", "expert", "ambassador", "admin"],
      claim_category: [
        "nutrition",
        "fitness",
        "mental_heath",
        "pregnancy",
        "menopause",
        "general_health",
        "perimenopause",
        "mental_health",
      ],
      claim_status: [
        "proposed",
        "pending",
        "verified",
        "disputed",
        "needs_more_evidence",
      ],
      evidence_score_category: [
        "study_size",
        "population",
        "consensus",
        "interpretation",
      ],
      expertise_area: ["health", "fitness", "nutrition", "mental_health"],
      source_type: [
        "webpage",
        "instagram",
        "tiktok",
        "youtube",
        "twitter",
        "facebook",
        "reddit",
        "podcast",
        "book",
        "research_paper",
        "other",
      ],
    },
  },
} as const
