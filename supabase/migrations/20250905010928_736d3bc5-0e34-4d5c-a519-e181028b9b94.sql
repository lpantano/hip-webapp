-- Create feature requests table
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  labels TEXT[] DEFAULT '{}',
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feature votes table
CREATE TABLE public.feature_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_request_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  is_expert BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_request_id)
);

-- Enable Row Level Security
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for feature_requests
CREATE POLICY "Feature requests are viewable by everyone" 
ON public.feature_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create feature requests" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature requests" 
ON public.feature_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all feature requests" 
ON public.feature_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for feature_votes
CREATE POLICY "Feature votes are viewable by everyone" 
ON public.feature_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can vote on features" 
ON public.feature_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" 
ON public.feature_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create view for feature requests with vote counts
CREATE OR REPLACE VIEW public.feature_requests_full AS
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

-- Add trigger for updated_at
CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.feature_requests (user_id, title, description, status, priority, labels, comments_count) VALUES
('11111111-1111-1111-1111-111111111111', 'Advanced Search Filters', 'Add ability to filter claims by date range, expert level, and topic categories to help users find relevant information faster.', 'under_review', 'high', '{"enhancement","search","ux"}', 8),
('11111111-1111-1111-1111-111111111111', 'Mobile App Support', 'Develop native mobile applications for iOS and Android to provide better accessibility and push notifications.', 'planned', 'medium', '{"feature","mobile","accessibility"}', 15),
('11111111-1111-1111-1111-111111111111', 'Expert Verification System', 'Implement a more robust verification process for experts including credential validation and peer review.', 'in_progress', 'critical', '{"security","verification","experts"}', 22),
('11111111-1111-1111-1111-111111111111', 'Dark Mode Theme', 'Add a dark mode option for better user experience during night time usage and reduced eye strain.', 'completed', 'low', '{"ui","theme","accessibility"}', 31),
('11111111-1111-1111-1111-111111111111', 'Bulk Import Claims', 'Allow administrators to import multiple claims from CSV or JSON files for easier data migration.', 'rejected', 'medium', '{"admin","import","data"}', 12);