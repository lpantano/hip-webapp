-- Drop the existing claims_full view
DROP VIEW IF EXISTS public.claims_full;

-- Recreate claims_full view with authentication check
CREATE VIEW public.claims_full AS
SELECT 
  c.id,
  c.description,
  c.title,
  c.user_id,
  c.category,
  c.status,
  c.vote_count,
  c.created_at,
  c.updated_at,
  COALESCE(
    JSON_AGG(
      DISTINCT JSONB_BUILD_OBJECT(
        'id', p.id,
        'title', p.title,
        'journal', p.journal,
        'publication_year', p.publication_year,
        'doi', p.doi,
        'url', p.url,
        'abstract', p.abstract,
        'status', p.status,
        'submitted_by', p.submitted_by,
        'created_at', p.created_at,
        'scores', COALESCE(p_scores.scores, '[]'::json)
      )
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'::json
  ) AS publications,
  COALESCE(
    JSON_AGG(
      DISTINCT JSONB_BUILD_OBJECT(
        'id', cr.id,
        'reaction_type', cr.reaction_type,
        'user_id', cr.user_id,
        'created_at', cr.created_at
      )
    ) FILTER (WHERE cr.id IS NOT NULL),
    '[]'::json
  ) AS claim_reactions
FROM public.claims c
LEFT JOIN public.publications p ON c.id = p.claim_id
LEFT JOIN public.claim_reactions cr ON c.id = cr.claim_id
LEFT JOIN (
  SELECT 
    ps.publication_id,
    JSON_AGG(
      JSONB_BUILD_OBJECT(
        'id', ps.id,
        'category', ps.category,
        'score', ps.score,
        'notes', ps.notes,
        'expert_user_id', ps.expert_user_id,
        'created_at', ps.created_at,
        'updated_at', ps.updated_at
      )
    ) AS scores
  FROM public.publication_scores ps
  GROUP BY ps.publication_id
) p_scores ON p.id = p_scores.publication_id
WHERE auth.role() = 'authenticated'  -- Only show to authenticated users
GROUP BY c.id, c.description, c.title, c.user_id, c.category, c.status, c.vote_count, c.created_at, c.updated_at;