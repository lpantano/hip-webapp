-- Update expert_stats view to include all necessary fields
DROP VIEW IF EXISTS public.expert_stats;

CREATE VIEW public.expert_stats AS
SELECT 
  e.id,
  e.user_id,
  e.expertise_area,
  e.years_of_experience,
  e.created_at,
  e.status,
  e.website,
  e.location,
  e.education,
  e.motivation,
  p.display_name,
  p.avatar_url,
  p.bio,
  -- Get social media links as JSON array
  COALESCE(
    json_agg(
      json_build_object('platform', sml.platform, 'url', sml.url)
    ) FILTER (WHERE sml.id IS NOT NULL),
    '[]'::json
  ) as social_media_links,
  COUNT(ec.id) as total_contributions,
  COUNT(CASE WHEN ec.contribution_type = 'publication_review' THEN 1 END) as publication_reviews,
  COUNT(CASE WHEN ec.contribution_type = 'new_claim' THEN 1 END) as new_claims,
  COUNT(CASE WHEN ec.contribution_type = 'link_added' THEN 1 END) as links_added,
  CASE 
    WHEN COUNT(ec.id) > 500 THEN 'Luminary'
    WHEN COUNT(ec.id) > 300 THEN 'Architect'
    WHEN COUNT(ec.id) > 150 THEN 'Navigator'
    WHEN COUNT(ec.id) > 50 THEN 'Explorer'
    ELSE 'Seedling'
  END as contributor_level
FROM public.experts e
LEFT JOIN public.profiles p ON e.user_id = p.user_id
LEFT JOIN public.expert_contributions ec ON e.id = ec.expert_id
LEFT JOIN public.social_media_links sml ON e.id = sml.expert_id
WHERE e.status = 'accepted'
GROUP BY e.id, e.user_id, e.expertise_area, e.years_of_experience, e.created_at, e.status, e.website, e.location, e.education, e.motivation, p.display_name, p.avatar_url, p.bio;

-- Grant permissions
GRANT SELECT ON public.expert_stats TO authenticated;