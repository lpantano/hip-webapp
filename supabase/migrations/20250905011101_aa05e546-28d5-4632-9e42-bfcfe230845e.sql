-- Fix the view to not use SECURITY DEFINER
DROP VIEW IF EXISTS public.feature_requests_full;

-- Recreate view without security definer (default is security invoker)
CREATE VIEW public.feature_requests_full AS
SELECT 
  fr.*,
  COALESCE(member_votes.count, 0) as member_votes,
  COALESCE(expert_votes.count, 0) as expert_votes,
  COALESCE(member_votes.count, 0) + COALESCE(expert_votes.count, 0) as total_votes
FROM public.feature_requests fr
LEFT JOIN (
  SELECT 
    feature_request_id,
    COUNT(*) as count
  FROM public.feature_votes 
  WHERE is_expert = false
  GROUP BY feature_request_id
) member_votes ON fr.id = member_votes.feature_request_id
LEFT JOIN (
  SELECT 
    feature_request_id,
    COUNT(*) as count
  FROM public.feature_votes 
  WHERE is_expert = true
  GROUP BY feature_request_id
) expert_votes ON fr.id = expert_votes.feature_request_id;