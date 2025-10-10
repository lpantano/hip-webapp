-- Create a simplified view for claims with basic aggregated data
-- This reduces the number of separate queries needed

CREATE OR REPLACE VIEW "public"."claims_with_details" AS
SELECT 
    -- Basic claim information
    c.id,
    c.user_id,
    c.title,
    c.description,
    c.category,
    c.vote_count,
    c.status,
    c.created_at,
    c.updated_at,
    
    -- Count of publications
    COUNT(DISTINCT p.id) as publication_count,
    
    -- Aggregated reaction counts as JSON
    COALESCE(reaction_counts.reactions, '{}'::json) AS reaction_counts,
    
    -- Count of comments
    COUNT(DISTINCT cc.id) as comment_count

FROM "public"."claims" c

-- Left join publications for count
LEFT JOIN "public"."publications" p ON c.id = p.claim_id

-- Left join aggregated reaction counts
LEFT JOIN (
    SELECT 
        cr.claim_id,
        json_object_agg(cr.reaction_type, cr.count) as reactions
    FROM (
        SELECT 
            claim_id,
            reaction_type,
            COUNT(*) as count
        FROM "public"."claim_reactions"
        GROUP BY claim_id, reaction_type
    ) cr
    GROUP BY cr.claim_id
) reaction_counts ON c.id = reaction_counts.claim_id

-- Left join comments for count
LEFT JOIN "public"."claim_comments" cc ON c.id = cc.claim_id

GROUP BY 
    c.id, c.user_id, c.title, c.description, c.category, 
    c.vote_count, c.status, c.created_at, c.updated_at,
    reaction_counts.reactions;

-- Add comment explaining the view
COMMENT ON VIEW "public"."claims_with_details" IS 'Comprehensive view that aggregates claims with their publications, scores, reactions, and comments to minimize database queries';