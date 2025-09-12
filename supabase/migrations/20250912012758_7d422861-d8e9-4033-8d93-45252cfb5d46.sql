-- Create expert_contributions table to track expert activity
CREATE TABLE public.expert_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('publication_review', 'new_claim', 'link_added')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_contributions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Expert contributions are viewable by authenticated users" 
ON public.expert_contributions 
FOR SELECT 
USING (true);

CREATE POLICY "Only experts can create contributions" 
ON public.expert_contributions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experts 
    WHERE experts.id = expert_contributions.expert_id 
    AND experts.user_id = auth.uid()
  )
);

-- Create expert_stats view for calculating contribution levels
CREATE OR REPLACE VIEW public.expert_stats AS
SELECT 
  e.id,
  e.user_id,
  e.expertise_area,
  e.years_of_experience,
  e.created_at,
  e.status,
  p.display_name,
  p.avatar_url,
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
WHERE e.status = 'accepted'
GROUP BY e.id, e.user_id, e.expertise_area, e.years_of_experience, e.created_at, e.status, p.display_name, p.avatar_url;

-- Grant permissions
GRANT SELECT ON public.expert_contributions TO authenticated;
GRANT SELECT ON public.expert_stats TO authenticated;