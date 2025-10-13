-- Fix User Contributions Tracking
-- This migration creates functions and triggers to automatically track 
-- ALL user contributions when they:
-- 1. Review publications (publication_scores) - experts/researchers only
-- 2. Submit papers (publications) - any authenticated user
-- 3. Submit claims (claims) - any authenticated user
--
-- Changes made:
-- 1. Rename expert_contributions → user_contributions
-- 2. Simplify table structure (only user_id, no expert_id)
-- 3. Update expert_stats view to use new table structure
-- 4. Create triggers for automatic tracking

-- Drop the expert_stats view that depends on the table
DROP VIEW IF EXISTS public.expert_stats;

-- Drop the entire expert_contributions table (no important data to preserve)
DROP TABLE IF EXISTS public.expert_contributions CASCADE;

-- Create the new user_contributions table from scratch
CREATE TABLE IF NOT EXISTS public.user_contributions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    contribution_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_contributions_contribution_type_check 
    CHECK (contribution_type = ANY (ARRAY['publication_review'::text, 'new_claim'::text, 'paper_added'::text]))
);

-- Set table owner
ALTER TABLE public.user_contributions OWNER TO postgres;

-- Update the expert_stats view to work with the new user_contributions table
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
    "e"."member_type",
    "p"."display_name",
    "p"."avatar_url",
    "p"."bio",
    COALESCE("json_agg"("json_build_object"('platform', "sml"."platform", 'url', "sml"."url")) FILTER (WHERE ("sml"."id" IS NOT NULL)), '[]'::json) AS "social_media_links",
    "count"("uc"."id") AS "total_contributions",
    "count"(
        CASE
            WHEN ("uc"."contribution_type" = 'publication_review'::"text") THEN 1
            ELSE NULL::integer
        END) AS "publication_reviews",
    "count"(
        CASE
            WHEN ("uc"."contribution_type" = 'new_claim'::"text") THEN 1
            ELSE NULL::integer
        END) AS "new_claims",
    "count"(
        CASE
            WHEN ("uc"."contribution_type" = 'paper_added'::"text") THEN 1
            ELSE NULL::integer
        END) AS "papers_added",
        CASE
            WHEN ("count"("uc"."id") > 500) THEN 'Luminary'::"text"
            WHEN ("count"("uc"."id") > 300) THEN 'Architect'::"text"
            WHEN ("count"("uc"."id") > 150) THEN 'Navigator'::"text"
            WHEN ("count"("uc"."id") > 50) THEN 'Explorer'::"text"
            ELSE 'Seedling'::"text"
        END AS "contributor_level"
   FROM ((("public"."experts" "e"
     LEFT JOIN "public"."profiles" "p" ON (("e"."user_id" = "p"."user_id")))
     LEFT JOIN "public"."user_contributions" "uc" ON (("e"."user_id" = "uc"."user_id")))
     LEFT JOIN "public"."social_media_links" "sml" ON (("e"."user_id" = "sml"."expert_id")))
  WHERE ("e"."status" = 'accepted'::"text")
  GROUP BY "e"."id", "e"."user_id", "e"."expertise_area", "e"."years_of_experience", "e"."created_at", "e"."status", "e"."website", "e"."location", "e"."education", "e"."motivation", "e"."member_type", "p"."display_name", "p"."avatar_url", "p"."bio";

-- Function to record publication review contributions
-- This function records when experts/researchers review publications
CREATE OR REPLACE FUNCTION public.record_publication_review_contribution() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Record the contribution for any user who reviews publications
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.expert_user_id, 'publication_review')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Function to record new paper submissions (publications)
-- This function records when ANY authenticated user adds new papers
CREATE OR REPLACE FUNCTION public.record_paper_submission_contribution() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Record the contribution for any user who submits papers
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.submitted_by, 'paper_added')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Function to record new claim submissions
-- This function records when ANY authenticated user submits new claims
CREATE OR REPLACE FUNCTION public.record_claim_submission_contribution() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Record the contribution for any user who submits claims
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.user_id, 'new_claim')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Drop any existing triggers with old names first
DROP TRIGGER IF EXISTS record_expert_contribution_trigger ON public.publication_scores;
DROP TRIGGER IF EXISTS publication_review_contribution_trigger ON public.publication_scores;

-- Create trigger for publication reviews (publication_scores table)
-- Fires after INSERT or UPDATE to track when reviews are created/updated
CREATE TRIGGER publication_review_contribution_trigger
    AFTER INSERT OR UPDATE ON public.publication_scores
    FOR EACH ROW 
    EXECUTE FUNCTION public.record_publication_review_contribution();

-- Create trigger for paper submissions (publications table)
-- Fires after INSERT to track when new papers are added
CREATE TRIGGER paper_submission_contribution_trigger
    AFTER INSERT ON public.publications
    FOR EACH ROW 
    EXECUTE FUNCTION public.record_paper_submission_contribution();

-- Create trigger for claim submissions (claims table)
-- Fires after INSERT to track when new claims are created
CREATE TRIGGER claim_submission_contribution_trigger
    AFTER INSERT ON public.claims
    FOR EACH ROW 
    EXECUTE FUNCTION public.record_claim_submission_contribution();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.record_publication_review_contribution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_paper_submission_contribution() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_claim_submission_contribution() TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION public.record_publication_review_contribution() IS 
'Records user contributions when publication reviews are created or updated';

COMMENT ON FUNCTION public.record_paper_submission_contribution() IS 
'Records user contributions when new papers/publications are submitted';

COMMENT ON FUNCTION public.record_claim_submission_contribution() IS 
'Records user contributions when new claims are created';

COMMENT ON TRIGGER publication_review_contribution_trigger ON public.publication_scores IS 
'Automatically tracks user contributions for publication reviews';

COMMENT ON TRIGGER paper_submission_contribution_trigger ON public.publications IS 
'Automatically tracks user contributions for paper submissions';

COMMENT ON TRIGGER claim_submission_contribution_trigger ON public.claims IS 
'Automatically tracks user contributions for claim submissions';

-- Enable RLS on the renamed table
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for user_contributions table
CREATE POLICY "Users can view all contributions" 
ON public.user_contributions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert their own contributions" 
ON public.user_contributions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions" 
ON public.user_contributions FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);