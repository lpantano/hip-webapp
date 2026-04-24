-- Fix expert_stats_dev view to use correct contributor level thresholds
-- The thresholds were incorrectly set to much lower values (50, 25, 10, 1)
-- They should match the original expert_stats thresholds (500, 300, 150, 50)

CREATE OR REPLACE VIEW "public"."expert_stats_dev" AS
 SELECT "e"."id",
    "e"."user_id",
    "e"."expertise_text",
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
    COALESCE("jsonb_agg"("jsonb_build_object"('platform', "sml"."platform", 'url', "sml"."url")) FILTER (WHERE ("sml"."id" IS NOT NULL)), '[]'::"jsonb") AS "social_media_links",
    (COALESCE("sum"(
        CASE
            WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
            ELSE 0
        END), (0)::bigint))::integer AS "publication_reviews",
    (COALESCE("sum"(
        CASE
            WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
            ELSE 0
        END), (0)::bigint))::integer AS "new_claims",
    (COALESCE("sum"(
        CASE
            WHEN ("ec"."contribution_type" = 'links_added'::"text") THEN 1
            ELSE 0
        END), (0)::bigint))::integer AS "links_added",
    (((COALESCE("sum"(
        CASE
            WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
            ELSE 0
        END), (0)::bigint) + COALESCE("sum"(
        CASE
            WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
            ELSE 0
        END), (0)::bigint)) + COALESCE("sum"(
        CASE
            WHEN ("ec"."contribution_type" = 'links_added'::"text") THEN 1
            ELSE 0
        END), (0)::bigint)))::integer AS "total_contributions",
        CASE
            WHEN (((COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
                ELSE 0
            END), (0)::bigint) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'links_added'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) > 500) THEN 'Luminary'::"text"
            WHEN (((COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
                ELSE 0
            END), (0)::bigint) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'links_added'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) > 300) THEN 'Architect'::"text"
            WHEN (((COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
                ELSE 0
            END), (0)::bigint) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'links_added'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) > 150) THEN 'Navigator'::"text"
            WHEN (((COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'publication_review'::"text") THEN 1
                ELSE 0
            END), (0)::bigint) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'new_claim'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) + COALESCE("sum"(
            CASE
                WHEN ("ec"."contribution_type" = 'links_added'::"text") THEN 1
                ELSE 0
            END), (0)::bigint)) > 50) THEN 'Explorer'::"text"
            ELSE 'Seedling'::"text"
        END AS "contributor_level"
   FROM ((("public"."experts" "e"
     LEFT JOIN "public"."profiles" "p" ON (("e"."user_id" = "p"."user_id")))
     LEFT JOIN "public"."social_media_links" "sml" ON (("sml"."expert_id" = "e"."user_id")))
     LEFT JOIN "public"."user_contributions" "ec" ON (("ec"."user_id" = "e"."user_id")))
  WHERE ("e"."status" = 'accepted'::"text")
  GROUP BY "e"."id", "e"."user_id", "e"."expertise_text", "e"."years_of_experience", "e"."created_at", "e"."status", "e"."website", "e"."location", "e"."education", "e"."motivation", "e"."member_type", "p"."display_name", "p"."avatar_url", "p"."bio";
