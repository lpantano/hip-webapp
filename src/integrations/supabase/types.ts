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
      claim_comments: {
        Row: {
          claim_id: string
          content: string
          created_at: string
          expert_user_id: string
          id: string
          updated_at: string
        }
        Insert: {
          claim_id: string
          content: string
          created_at?: string
          expert_user_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          claim_id?: string
          content?: string
          created_at?: string
          expert_user_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      claim_links: {
        Row: {
          claim_id: string
          created_at: string
          description: string | null
          expert_user_id: string
          id: string
          link_type: string | null
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          description?: string | null
          expert_user_id: string
          id?: string
          link_type?: string | null
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          description?: string | null
          expert_user_id?: string
          id?: string
          link_type?: string | null
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
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
        ]
      }
      claims: {
        Row: {
          category: Database["public"]["Enums"]["claim_category"]
          created_at: string
          description: string
          evidence_status:
            | Database["public"]["Enums"]["evidence_status_type"]
            | null
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
          evidence_status?:
            | Database["public"]["Enums"]["evidence_status_type"]
            | null
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
          evidence_status?:
            | Database["public"]["Enums"]["evidence_status_type"]
            | null
          id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          title?: string
          updated_at?: string
          user_id?: string
          vote_count?: number
        }
        Relationships: []
      }
      experts: {
        Row: {
          created_at: string
          education: string
          expertise_area: Database["public"]["Enums"]["claim_category"]
          expertise_text: string
          id: string
          location: string | null
          member_type: Database["public"]["Enums"]["member_type"]
          motivation: string
          status: string
          updated_at: string
          user_id: string
          website: string | null
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          education: string
          expertise_area?: Database["public"]["Enums"]["claim_category"]
          expertise_text: string
          id?: string
          location?: string | null
          member_type?: Database["public"]["Enums"]["member_type"]
          motivation: string
          status?: string
          updated_at?: string
          user_id: string
          website?: string | null
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          education?: string
          expertise_area?: Database["public"]["Enums"]["claim_category"]
          expertise_text?: string
          id?: string
          location?: string | null
          member_type?: Database["public"]["Enums"]["member_type"]
          motivation?: string
          status?: string
          updated_at?: string
          user_id?: string
          website?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feature_requests: {
        Row: {
          comments_count: number
          created_at: string
          description: string
          id: string
          labels: string[] | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          description: string
          id?: string
          labels?: string[] | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          description?: string
          id?: string
          labels?: string[] | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_votes: {
        Row: {
          created_at: string
          feature_request_id: string
          id: string
          is_expert: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_request_id: string
          id?: string
          is_expert?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          feature_request_id?: string
          id?: string
          is_expert?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_votes_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "feature_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_votes_feature_request_id_fkey"
            columns: ["feature_request_id"]
            isOneToOne: false
            referencedRelation: "feature_requests_full"
            referencedColumns: ["id"]
          },
        ]
      }
      mailing_list_signups: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cached_avatar_updated_at: string | null
          cached_avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cached_avatar_updated_at?: string | null
          cached_avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cached_avatar_updated_at?: string | null
          cached_avatar_url?: string | null
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
          comments: string | null
          created_at: string
          expert_user_id: string
          id: string
          publication_id: string
          review_data: Json | null
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          expert_user_id: string
          id?: string
          publication_id: string
          review_data?: Json | null
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          expert_user_id?: string
          id?: string
          publication_id?: string
          review_data?: Json | null
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
          source: string | null
          stance: Database["public"]["Enums"]["publication_stance"] | null
          status: string
          submitted_by: string | null
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
          source?: string | null
          stance?: Database["public"]["Enums"]["publication_stance"] | null
          status?: string
          submitted_by?: string | null
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
          source?: string | null
          stance?: Database["public"]["Enums"]["publication_stance"] | null
          status?: string
          submitted_by?: string | null
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
        ]
      }
      resource_reviews: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          resource_id: string
          reviewer_user_id: string
          supports: boolean
          updated_at: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          resource_id: string
          reviewer_user_id: string
          supports: boolean
          updated_at?: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          resource_id?: string
          reviewer_user_id?: string
          supports?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string
          description: string
          expertise_area: Database["public"]["Enums"]["expertise_area"]
          id: string
          name: string
          status: string
          submitted_by: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description: string
          expertise_area: Database["public"]["Enums"]["expertise_area"]
          id?: string
          name: string
          status?: string
          submitted_by: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string
          expertise_area?: Database["public"]["Enums"]["expertise_area"]
          id?: string
          name?: string
          status?: string
          submitted_by?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
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
            referencedRelation: "expert_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_media_links_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "expert_stats_dev"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "social_media_links_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["user_id"]
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
        ]
      }
      user_contributions: {
        Row: {
          contribution_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          contribution_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          contribution_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
      whitelist: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
    }
    Views: {
      expert_stats: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contributor_level: string | null
          created_at: string | null
          display_name: string | null
          education: string | null
          expertise_area: Database["public"]["Enums"]["claim_category"] | null
          id: string | null
          location: string | null
          member_type: Database["public"]["Enums"]["member_type"] | null
          motivation: string | null
          new_claims: number | null
          papers_added: number | null
          publication_reviews: number | null
          social_media_links: Json | null
          status: string | null
          total_contributions: number | null
          user_id: string | null
          website: string | null
          years_of_experience: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      expert_stats_dev: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contributor_level: string | null
          created_at: string | null
          display_name: string | null
          education: string | null
          expertise_text: string | null
          id: string | null
          links_added: number | null
          location: string | null
          member_type: Database["public"]["Enums"]["member_type"] | null
          motivation: string | null
          new_claims: number | null
          publication_reviews: number | null
          social_media_links: Json | null
          status: string | null
          total_contributions: number | null
          user_id: string | null
          website: string | null
          years_of_experience: number | null
        }
        Relationships: [
          {
            foreignKeyName: "experts_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feature_requests_full: {
        Row: {
          comments_count: number | null
          created_at: string | null
          description: string | null
          expert_votes: number | null
          id: string | null
          labels: string[] | null
          member_votes: number | null
          priority: string | null
          status: string | null
          title: string | null
          total_votes: number | null
          updated_at: string | null
          user_id: string | null
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
      app_role:
        | "user"
        | "expert"
        | "ambassador"
        | "admin"
        | "founding_expert"
        | "founding_user"
        | "researcher"
      claim_category:
        | "nutrition"
        | "fitness"
        | "mental_health"
        | "pregnancy"
        | "postmenopause"
        | "general_health"
        | "perimenopause"
        | "period"
        | "menopause"
      claim_status:
        | "proposed"
        | "Awaiting Evidence"
        | "Evidence Supports"
        | "Evidence Disproves"
        | "Inconclusive"
        | "under review"
      evidence_classification:
        | "early"
        | "preliminary"
        | "strong"
        | "established"
      evidence_score_category:
        | "study_size"
        | "population"
        | "consensus"
        | "interpretation"
      evidence_status_type:
        | "Awaiting Evidence"
        | "Evidence Supports"
        | "Evidence Disproves"
        | "Inconclusive"
      expertise_area:
        | "Health"
        | "Fitness"
        | "Nutrition"
        | "Mental Health"
        | "Data Science"
        | "Immunology"
        | "Molecular biology"
        | "Pharmacology"
        | "Epidemiology"
        | "Neuroscience"
        | "Endocrinology"
        | "Oncology"
      member_type: "expert" | "researcher"
      publication_stance: "supporting" | "contradicting" | "neutral" | "mixed"
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
      app_role: [
        "user",
        "expert",
        "ambassador",
        "admin",
        "founding_expert",
        "founding_user",
        "researcher",
      ],
      claim_category: [
        "nutrition",
        "fitness",
        "mental_health",
        "pregnancy",
        "postmenopause",
        "general_health",
        "perimenopause",
        "period",
        "menopause",
      ],
      claim_status: [
        "proposed",
        "Awaiting Evidence",
        "Evidence Supports",
        "Evidence Disproves",
        "Inconclusive",
        "under review",
      ],
      evidence_classification: [
        "early",
        "preliminary",
        "strong",
        "established",
      ],
      evidence_score_category: [
        "study_size",
        "population",
        "consensus",
        "interpretation",
      ],
      evidence_status_type: [
        "Awaiting Evidence",
        "Evidence Supports",
        "Evidence Disproves",
        "Inconclusive",
      ],
      expertise_area: [
        "Health",
        "Fitness",
        "Nutrition",
        "Mental Health",
        "Data Science",
        "Immunology",
        "Molecular biology",
        "Pharmacology",
        "Epidemiology",
        "Neuroscience",
        "Endocrinology",
        "Oncology",
      ],
      member_type: ["expert", "researcher"],
      publication_stance: ["supporting", "contradicting", "neutral", "mixed"],
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
