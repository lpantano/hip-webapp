-- Backfill script for all user contributions
-- This script populates the user_contributions table with historical data from ALL users
-- Run this after the main migration to catch up on existing contributions

-- Backfill function to populate historical contributions
CREATE OR REPLACE FUNCTION public.backfill_user_contributions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clear existing contributions to avoid duplicates during backfill
    -- DELETE FROM public.user_contributions;
    
    -- Backfill publication reviews (all users who made reviews)
    INSERT INTO public.user_contributions (user_id, contribution_type, created_at)
    SELECT DISTINCT
        ps.expert_user_id as user_id,
        'publication_review' as contribution_type,
        ps.created_at
    FROM public.publication_scores ps
    ON CONFLICT DO NOTHING;
    
    -- Backfill paper submissions (all users who submitted papers)
    INSERT INTO public.user_contributions (user_id, contribution_type, created_at)
    SELECT DISTINCT
        p.submitted_by as user_id,
        'paper_added' as contribution_type,
        p.created_at
    FROM public.publications p
    ON CONFLICT DO NOTHING;
    
    -- Backfill claim submissions (all users who submitted claims)
    INSERT INTO public.user_contributions (user_id, contribution_type, created_at)
    SELECT DISTINCT
        c.user_id as user_id,
        'new_claim' as contribution_type,
        c.created_at
    FROM public.claims c
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'All user contributions backfill completed successfully';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.backfill_user_contributions() TO service_role;

-- Comment for documentation
COMMENT ON FUNCTION public.backfill_user_contributions() IS 
'Backfills user_contributions table with historical data from ALL users for publication_scores, publications, and claims';

-- Uncomment the line below to run the backfill immediately after the migration
-- SELECT public.backfill_user_contributions();