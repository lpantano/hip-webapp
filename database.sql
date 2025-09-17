

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'user',
    'expert',
    'ambassador',
    'admin'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."claim_category" AS ENUM (
    'nutrition',
    'fitness',
    'mental_heath',
    'pregnancy',
    'menopause',
    'general_health',
    'perimenopause',
    'mental_health'
);


ALTER TYPE "public"."claim_category" OWNER TO "postgres";


CREATE TYPE "public"."claim_status" AS ENUM (
    'proposed',
    'pending',
    'verified',
    'disputed',
    'needs_more_evidence'
);


ALTER TYPE "public"."claim_status" OWNER TO "postgres";


CREATE TYPE "public"."evidence_score_category" AS ENUM (
    'study_size',
    'population',
    'consensus',
    'interpretation'
);


ALTER TYPE "public"."evidence_score_category" OWNER TO "postgres";


CREATE TYPE "public"."expertise_area" AS ENUM (
    'health',
    'fitness',
    'nutrition',
    'mental_health'
);


ALTER TYPE "public"."expertise_area" OWNER TO "postgres";


CREATE TYPE "public"."source_type" AS ENUM (
    'webpage',
    'instagram',
    'tiktok',
    'youtube',
    'twitter',
    'facebook',
    'reddit',
    'podcast',
    'book',
    'research_paper',
    'other'
);


ALTER TYPE "public"."source_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_claim_vote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.claims 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.claim_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.claims 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.claim_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_claim_vote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."claim_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid" NOT NULL,
    "expert_user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."claim_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."claim_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid" NOT NULL,
    "expert_user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "description" "text",
    "link_type" "text" DEFAULT 'webpage'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."claim_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."claim_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reaction_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "claim_reactions_reaction_type_check" CHECK (("reaction_type" = ANY (ARRAY['helpful'::"text", 'insightful'::"text", 'wantmore'::"text", 'moneysaver'::"text"])))
);


ALTER TABLE "public"."claim_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."claim_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."claim_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "public"."claim_category" NOT NULL,
    "status" "public"."claim_status" DEFAULT 'pending'::"public"."claim_status" NOT NULL,
    "vote_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."publication_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "publication_id" "uuid" NOT NULL,
    "expert_user_id" "uuid" NOT NULL,
    "category" "public"."evidence_score_category" NOT NULL,
    "score" integer NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "publication_scores_score_check" CHECK ((("score" >= 1) AND ("score" <= 5)))
);


ALTER TABLE "public"."publication_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."publications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "journal" "text" NOT NULL,
    "publication_year" integer NOT NULL,
    "doi" "text",
    "url" "text",
    "abstract" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "submitted_by" "uuid"
);


ALTER TABLE "public"."publications" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."claims_full" AS
 SELECT "c"."id",
    "c"."description",
    "c"."title",
    "c"."user_id",
    "c"."category",
    "c"."status",
    "c"."vote_count",
    "c"."created_at",
    "c"."updated_at",
    COALESCE("json_agg"(DISTINCT "jsonb_build_object"('id', "p"."id", 'title', "p"."title", 'journal', "p"."journal", 'publication_year', "p"."publication_year", 'doi', "p"."doi", 'url', "p"."url", 'abstract', "p"."abstract", 'status', "p"."status", 'submitted_by', "p"."submitted_by", 'created_at', "p"."created_at", 'scores', COALESCE("p_scores"."scores", '[]'::json))) FILTER (WHERE ("p"."id" IS NOT NULL)), '[]'::json) AS "publications",
    COALESCE("json_agg"(DISTINCT "jsonb_build_object"('id', "cr"."id", 'reaction_type', "cr"."reaction_type", 'user_id', "cr"."user_id", 'created_at', "cr"."created_at")) FILTER (WHERE ("cr"."id" IS NOT NULL)), '[]'::json) AS "claim_reactions"
   FROM ((("public"."claims" "c"
     LEFT JOIN "public"."publications" "p" ON (("c"."id" = "p"."claim_id")))
     LEFT JOIN "public"."claim_reactions" "cr" ON (("c"."id" = "cr"."claim_id")))
     LEFT JOIN ( SELECT "ps"."publication_id",
            "json_agg"("jsonb_build_object"('id', "ps"."id", 'category', "ps"."category", 'score', "ps"."score", 'notes', "ps"."notes", 'expert_user_id', "ps"."expert_user_id", 'created_at', "ps"."created_at", 'updated_at', "ps"."updated_at")) AS "scores"
           FROM "public"."publication_scores" "ps"
          GROUP BY "ps"."publication_id") "p_scores" ON (("p"."id" = "p_scores"."publication_id")))
  WHERE ("auth"."role"() = 'authenticated'::"text")
  GROUP BY "c"."id", "c"."description", "c"."title", "c"."user_id", "c"."category", "c"."status", "c"."vote_count", "c"."created_at", "c"."updated_at";


ALTER VIEW "public"."claims_full" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expert_contributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expert_id" "uuid" NOT NULL,
    "contribution_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "expert_contributions_contribution_type_check" CHECK (("contribution_type" = ANY (ARRAY['publication_review'::"text", 'new_claim'::"text", 'link_added'::"text"])))
);


ALTER TABLE "public"."expert_contributions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."experts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "expertise_area" "public"."claim_category" NOT NULL,
    "education" "text" NOT NULL,
    "motivation" "text" NOT NULL,
    "website" "text",
    "years_of_experience" integer,
    "location" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "experts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'more_information'::"text"])))
);


ALTER TABLE "public"."experts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_media_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expert_id" "uuid" NOT NULL,
    "platform" "text" NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."social_media_links" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."expert_stats" AS
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
  GROUP BY "e"."id", "e"."user_id", "e"."expertise_area", "e"."years_of_experience", "e"."created_at", "e"."status", "e"."website", "e"."location", "e"."education", "e"."motivation", "p"."display_name", "p"."avatar_url", "p"."bio";


ALTER VIEW "public"."expert_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."experts_full" AS
 SELECT "e"."id",
    "e"."user_id",
    "e"."expertise_area",
    "e"."education",
    "e"."motivation",
    "e"."website",
    "e"."years_of_experience",
    "e"."location",
    "e"."created_at",
    "p"."display_name",
    "p"."avatar_url" AS "profile_avatar_url",
    COALESCE(( SELECT "json_agg"("sml_row".*) AS "json_agg"
           FROM ( SELECT "sml"."platform",
                    "sml"."url"
                   FROM "public"."social_media_links" "sml"
                  WHERE ("sml"."expert_id" = "e"."user_id")) "sml_row"), '[]'::json) AS "social_media_links"
   FROM ("public"."experts" "e"
     LEFT JOIN "public"."profiles" "p" ON (("p"."user_id" = "e"."user_id")))
  WHERE ("e"."status" = 'accepted'::"text");


ALTER VIEW "public"."experts_full" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "labels" "text"[] DEFAULT '{}'::"text"[],
    "comments_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feature_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "feature_request_id" "uuid" NOT NULL,
    "is_expert" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feature_votes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."feature_requests_full" AS
 SELECT "fr"."id",
    "fr"."user_id",
    "fr"."title",
    "fr"."description",
    "fr"."status",
    "fr"."priority",
    "fr"."labels",
    "fr"."comments_count",
    "fr"."created_at",
    "fr"."updated_at",
    COALESCE("member_votes"."count", (0)::bigint) AS "member_votes",
    COALESCE("expert_votes"."count", (0)::bigint) AS "expert_votes",
    (COALESCE("member_votes"."count", (0)::bigint) + COALESCE("expert_votes"."count", (0)::bigint)) AS "total_votes"
   FROM (("public"."feature_requests" "fr"
     LEFT JOIN ( SELECT "feature_votes"."feature_request_id",
            "count"(*) AS "count"
           FROM "public"."feature_votes"
          WHERE ("feature_votes"."is_expert" = false)
          GROUP BY "feature_votes"."feature_request_id") "member_votes" ON (("fr"."id" = "member_votes"."feature_request_id")))
     LEFT JOIN ( SELECT "feature_votes"."feature_request_id",
            "count"(*) AS "count"
           FROM "public"."feature_votes"
          WHERE ("feature_votes"."is_expert" = true)
          GROUP BY "feature_votes"."feature_request_id") "expert_votes" ON (("fr"."id" = "expert_votes"."feature_request_id")));


ALTER VIEW "public"."feature_requests_full" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "claim_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source_type" "public"."source_type" NOT NULL,
    "source_url" "text",
    "source_title" "text",
    "source_description" "text",
    "author_name" "text",
    "published_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" DEFAULT 'user'::"public"."app_role" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."claim_comments"
    ADD CONSTRAINT "claim_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."claim_links"
    ADD CONSTRAINT "claim_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."claim_reactions"
    ADD CONSTRAINT "claim_reactions_claim_id_user_id_reaction_type_key" UNIQUE ("claim_id", "user_id", "reaction_type");



ALTER TABLE ONLY "public"."claim_reactions"
    ADD CONSTRAINT "claim_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."claim_votes"
    ADD CONSTRAINT "claim_votes_claim_id_user_id_key" UNIQUE ("claim_id", "user_id");



ALTER TABLE ONLY "public"."claim_votes"
    ADD CONSTRAINT "claim_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."claims"
    ADD CONSTRAINT "claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expert_contributions"
    ADD CONSTRAINT "expert_contributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experts"
    ADD CONSTRAINT "experts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experts"
    ADD CONSTRAINT "experts_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."feature_requests"
    ADD CONSTRAINT "feature_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_votes"
    ADD CONSTRAINT "feature_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_votes"
    ADD CONSTRAINT "feature_votes_user_id_feature_request_id_key" UNIQUE ("user_id", "feature_request_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."publication_scores"
    ADD CONSTRAINT "publication_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."publication_scores"
    ADD CONSTRAINT "publication_scores_publication_id_expert_user_id_category_key" UNIQUE ("publication_id", "expert_user_id", "category");



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "publications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_media_links"
    ADD CONSTRAINT "social_media_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sources"
    ADD CONSTRAINT "sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



CREATE INDEX "idx_claim_reactions_claim_id" ON "public"."claim_reactions" USING "btree" ("claim_id");



CREATE INDEX "idx_claim_votes_claim_id" ON "public"."claim_votes" USING "btree" ("claim_id");



CREATE INDEX "idx_claims_category" ON "public"."claims" USING "btree" ("category");



CREATE INDEX "idx_claims_status" ON "public"."claims" USING "btree" ("status");



CREATE INDEX "idx_claims_user_id" ON "public"."claims" USING "btree" ("user_id");



CREATE INDEX "idx_publication_scores_expert" ON "public"."publication_scores" USING "btree" ("expert_user_id");



CREATE INDEX "idx_publication_scores_publication_id" ON "public"."publication_scores" USING "btree" ("publication_id");



CREATE INDEX "idx_publications_claim_id" ON "public"."publications" USING "btree" ("claim_id");



CREATE INDEX "idx_sources_claim_id" ON "public"."sources" USING "btree" ("claim_id");



CREATE INDEX "idx_sources_type" ON "public"."sources" USING "btree" ("source_type");



CREATE OR REPLACE TRIGGER "claim_vote_count_trigger_delete" AFTER DELETE ON "public"."claim_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_claim_vote_count"();



CREATE OR REPLACE TRIGGER "claim_vote_count_trigger_insert" AFTER INSERT ON "public"."claim_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_claim_vote_count"();



CREATE OR REPLACE TRIGGER "update_claim_comments_updated_at" BEFORE UPDATE ON "public"."claim_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_claim_links_updated_at" BEFORE UPDATE ON "public"."claim_links" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_claims_updated_at" BEFORE UPDATE ON "public"."claims" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_experts_updated_at" BEFORE UPDATE ON "public"."experts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_feature_requests_updated_at" BEFORE UPDATE ON "public"."feature_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_publication_scores_updated_at" BEFORE UPDATE ON "public"."publication_scores" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_sources_updated_at" BEFORE UPDATE ON "public"."sources" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."claim_reactions"
    ADD CONSTRAINT "claim_reactions_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."claim_votes"
    ADD CONSTRAINT "claim_votes_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expert_contributions"
    ADD CONSTRAINT "expert_contributions_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "public"."experts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."experts"
    ADD CONSTRAINT "experts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."experts"
    ADD CONSTRAINT "experts_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."feature_votes"
    ADD CONSTRAINT "feature_votes_feature_request_id_fkey" FOREIGN KEY ("feature_request_id") REFERENCES "public"."feature_requests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."publication_scores"
    ADD CONSTRAINT "publication_scores_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "publications_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."publications"
    ADD CONSTRAINT "publications_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."social_media_links"
    ADD CONSTRAINT "social_media_links_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "public"."experts"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sources"
    ADD CONSTRAINT "sources_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Accepted experts are viewable by everyone" ON "public"."experts" FOR SELECT USING (("status" = 'accepted'::"text"));



CREATE POLICY "Admins can manage all roles" ON "public"."user_roles" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all social media links" ON "public"."social_media_links" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update all expert applications" ON "public"."experts" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update all feature requests" ON "public"."feature_requests" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all expert applications" ON "public"."experts" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Authenticated users can create feature requests" ON "public"."feature_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert sources" ON "public"."sources" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Authenticated users can read sources" ON "public"."sources" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can submit publications" ON "public"."publications" FOR INSERT WITH CHECK (("auth"."uid"() = "submitted_by"));



CREATE POLICY "Authenticated users can vote on features" ON "public"."feature_votes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Claims are viewable by authenticated users" ON "public"."claims" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Comments are viewable by authenticated users" ON "public"."claim_comments" FOR SELECT USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Expert contributions are viewable by authenticated users" ON "public"."expert_contributions" FOR SELECT USING (true);



CREATE POLICY "Experts and admins can delete publications" ON "public"."publications" FOR DELETE USING (("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Experts and admins can update all publications" ON "public"."publications" FOR UPDATE USING (("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))) WITH CHECK (("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Experts and admins can view all publications" ON "public"."publications" FOR SELECT USING (("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Experts can create scores" ON "public"."publication_scores" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Experts can delete their own comments" ON "public"."claim_comments" FOR DELETE USING ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Experts can delete their own links" ON "public"."claim_links" FOR DELETE USING ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Experts can update their own comments" ON "public"."claim_comments" FOR UPDATE USING ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")))) WITH CHECK ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Experts can update their own links" ON "public"."claim_links" FOR UPDATE USING ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")))) WITH CHECK ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Experts can update their own scores" ON "public"."publication_scores" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")))) WITH CHECK ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Feature requests are viewable by everyone" ON "public"."feature_requests" FOR SELECT USING (true);



CREATE POLICY "Feature votes are viewable by everyone" ON "public"."feature_votes" FOR SELECT USING (true);



CREATE POLICY "Links are viewable by authenticated users" ON "public"."claim_links" FOR SELECT USING (true);



CREATE POLICY "Only admins can delete claims" ON "public"."claims" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Only experts can create comments" ON "public"."claim_comments" FOR INSERT WITH CHECK ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Only experts can create contributions" ON "public"."expert_contributions" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."experts"
  WHERE (("experts"."id" = "expert_contributions"."expert_id") AND ("experts"."user_id" = "auth"."uid"())))));



CREATE POLICY "Only experts can create links" ON "public"."claim_links" FOR INSERT WITH CHECK ((("auth"."uid"() = "expert_user_id") AND ("public"."has_role"("auth"."uid"(), 'expert'::"public"."app_role") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))));



CREATE POLICY "Publication scores are viewable by authenticated users" ON "public"."publication_scores" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Reactions are viewable by authenticated users" ON "public"."claim_reactions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Social media links are viewable with accepted experts" ON "public"."social_media_links" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."experts"
  WHERE (("experts"."id" = "social_media_links"."expert_id") AND ("experts"."status" = 'accepted'::"text")))));



CREATE POLICY "Users can create claims" ON "public"."claims" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own expert application" ON "public"."experts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own reactions" ON "public"."claim_reactions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own sources" ON "public"."sources" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own votes" ON "public"."claim_votes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own votes" ON "public"."feature_votes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own social media links" ON "public"."social_media_links" USING ((EXISTS ( SELECT 1
   FROM "public"."experts"
  WHERE (("experts"."user_id" = "social_media_links"."expert_id") AND ("experts"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can react to claims" ON "public"."claim_reactions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own claims" ON "public"."claims" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own expert application" ON "public"."experts" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own feature requests" ON "public"."feature_requests" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own pending publications" ON "public"."publications" FOR UPDATE USING ((("auth"."uid"() = "submitted_by") AND ("status" = 'pending'::"text"))) WITH CHECK ((("auth"."uid"() = "submitted_by") AND ("status" = 'pending'::"text")));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own sources" ON "public"."sources" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view accepted publications" ON "public"."publications" FOR SELECT USING (("status" = 'accepted'::"text"));



CREATE POLICY "Users can view their own expert application" ON "public"."experts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can vote on claims" ON "public"."claim_votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Votes are viewable by authenticated users" ON "public"."claim_votes" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."claim_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."claim_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."claim_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."claim_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."claims" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expert_contributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."experts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."publication_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."publications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_media_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_claim_vote_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_claim_vote_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_claim_vote_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."claim_comments" TO "anon";
GRANT ALL ON TABLE "public"."claim_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."claim_comments" TO "service_role";



GRANT ALL ON TABLE "public"."claim_links" TO "anon";
GRANT ALL ON TABLE "public"."claim_links" TO "authenticated";
GRANT ALL ON TABLE "public"."claim_links" TO "service_role";



GRANT ALL ON TABLE "public"."claim_reactions" TO "anon";
GRANT ALL ON TABLE "public"."claim_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."claim_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."claim_votes" TO "anon";
GRANT ALL ON TABLE "public"."claim_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."claim_votes" TO "service_role";



GRANT ALL ON TABLE "public"."claims" TO "anon";
GRANT ALL ON TABLE "public"."claims" TO "authenticated";
GRANT ALL ON TABLE "public"."claims" TO "service_role";



GRANT ALL ON TABLE "public"."publication_scores" TO "anon";
GRANT ALL ON TABLE "public"."publication_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."publication_scores" TO "service_role";



GRANT ALL ON TABLE "public"."publications" TO "anon";
GRANT ALL ON TABLE "public"."publications" TO "authenticated";
GRANT ALL ON TABLE "public"."publications" TO "service_role";



GRANT ALL ON TABLE "public"."claims_full" TO "anon";
GRANT ALL ON TABLE "public"."claims_full" TO "authenticated";
GRANT ALL ON TABLE "public"."claims_full" TO "service_role";



GRANT ALL ON TABLE "public"."expert_contributions" TO "anon";
GRANT ALL ON TABLE "public"."expert_contributions" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_contributions" TO "service_role";



GRANT ALL ON TABLE "public"."experts" TO "anon";
GRANT ALL ON TABLE "public"."experts" TO "authenticated";
GRANT ALL ON TABLE "public"."experts" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."social_media_links" TO "anon";
GRANT ALL ON TABLE "public"."social_media_links" TO "authenticated";
GRANT ALL ON TABLE "public"."social_media_links" TO "service_role";



GRANT ALL ON TABLE "public"."expert_stats" TO "anon";
GRANT ALL ON TABLE "public"."expert_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_stats" TO "service_role";



GRANT ALL ON TABLE "public"."experts_full" TO "anon";
GRANT ALL ON TABLE "public"."experts_full" TO "authenticated";
GRANT ALL ON TABLE "public"."experts_full" TO "service_role";



GRANT ALL ON TABLE "public"."feature_requests" TO "anon";
GRANT ALL ON TABLE "public"."feature_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_requests" TO "service_role";



GRANT ALL ON TABLE "public"."feature_votes" TO "anon";
GRANT ALL ON TABLE "public"."feature_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_votes" TO "service_role";



GRANT ALL ON TABLE "public"."feature_requests_full" TO "anon";
GRANT ALL ON TABLE "public"."feature_requests_full" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_requests_full" TO "service_role";



GRANT ALL ON TABLE "public"."sources" TO "anon";
GRANT ALL ON TABLE "public"."sources" TO "authenticated";
GRANT ALL ON TABLE "public"."sources" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
