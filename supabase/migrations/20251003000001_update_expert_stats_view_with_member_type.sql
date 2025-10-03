-- Migration: Update expert_stats view to include member_type column
-- This updates the view to include the new member_type field from the experts table

-- Drop the existing view first to avoid column positioning conflicts
DROP VIEW IF EXISTS "public"."expert_stats";

-- Recreate the view with member_type included
CREATE VIEW "public"."expert_stats" AS
 SELECT "e"."id",
    "e"."user_id",
    "e"."expertise_area",
    "e"."years_of_experience",
    "e"."created_at",
    "e"."status",
    "e"."website",
    "e"."location",
    "e"."education",
    "e"."motivation",
    "e"."member_type",
    "p"."display_name",
    "p"."avatar_url",
    "p"."bio",
    COALESCE("json_agg"("json_build_object"('platform', "sml"."platform", 'url', "sml"."url")) FILTER (WHERE ("sml"."id" IS NOT NULL)), '[]'::json) AS "social_media_links",
    "count"("ec"."id") AS "total_contributions",
    "count"(
        CASE
            WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
            ELSE NULL::integer
        END) AS "publication_reviews",
    "count"(
        CASE
            WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
            ELSE NULL::integer
        END) AS "new_claims",
    "count"(
        CASE
            WHEN ("ec"."contribution_type" = 'link_added'::"text") THEN 1
            ELSE NULL::integer
        END) AS "links_added",
        CASE
            WHEN ("count"("ec"."id") > 500) THEN 'Luminary'::"text"
            WHEN ("count"("ec"."id") > 300) THEN 'Architect'::"text"
            WHEN ("count"("ec"."id") > 150) THEN 'Navigator'::"text"
            WHEN ("count"("ec"."id") > 50) THEN 'Explorer'::"text"
            ELSE 'Seedling'::"text"
        END AS "contributor_level"
   FROM ((("public"."experts" "e"
     LEFT JOIN "public"."profiles" "p" ON (("e"."user_id" = "p"."user_id")))
     LEFT JOIN "public"."expert_contributions" "ec" ON (("e"."id" = "ec"."expert_id")))
     LEFT JOIN "public"."social_media_links" "sml" ON (("e"."user_id" = "sml"."expert_id")))
  WHERE ("e"."status" = 'accepted'::"text")
  GROUP BY "e"."id", "e"."user_id", "e"."expertise_area", "e"."years_of_experience", "e"."created_at", "e"."status", "e"."website", "e"."location", "e"."education", "e"."motivation", "e"."member_type", "p"."display_name", "p"."avatar_url", "p"."bio";

-- Set ownership and permissions
ALTER VIEW "public"."expert_stats" OWNER TO "postgres";

-- Grant permissions
GRANT ALL ON TABLE "public"."expert_stats" TO "anon";
GRANT ALL ON TABLE "public"."expert_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_stats" TO "service_role";

-- Add comment to document the updated view
COMMENT ON VIEW public.expert_stats IS 'Comprehensive view of expert statistics including member type (expert/researcher), contributions, and profile information';