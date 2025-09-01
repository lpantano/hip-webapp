-- Update experts table structure
-- First drop the existing table and recreate with proper structure
DROP TABLE IF EXISTS public.experts CASCADE;
DROP TABLE IF EXISTS public.social_media_links CASCADE;

-- Create experts table linked to users
CREATE TABLE public.experts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'more_information')),
  expertise_area claim_category NOT NULL,
  education TEXT NOT NULL, -- renamed from credentials
  motivation TEXT NOT NULL,
  website TEXT,
  years_of_experience INTEGER,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One expert application per user
);

-- Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for experts
CREATE POLICY "Accepted experts are viewable by everyone" 
ON public.experts 
FOR SELECT 
USING (status = 'accepted');

CREATE POLICY "Users can view their own expert application" 
ON public.experts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expert application" 
ON public.experts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expert application" 
ON public.experts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all expert applications" 
ON public.experts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all expert applications" 
ON public.experts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Recreate social_media_links table to reference experts
CREATE TABLE public.social_media_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for social_media_links
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for social_media_links
CREATE POLICY "Social media links are viewable with accepted experts" 
ON public.social_media_links 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.experts 
  WHERE experts.id = social_media_links.expert_id 
  AND experts.status = 'accepted'
));

CREATE POLICY "Users can manage their own social media links" 
ON public.social_media_links 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.experts 
  WHERE experts.id = social_media_links.expert_id 
  AND experts.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all social media links" 
ON public.social_media_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_experts_updated_at
BEFORE UPDATE ON public.experts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock data for accepted experts using correct enum values
INSERT INTO public.experts (user_id, status, expertise_area, education, motivation, website, years_of_experience, location, avatar_url) VALUES
(gen_random_uuid(), 'accepted', 'nutrition', 'Ph.D. in Nutritional Sciences, Harvard University; M.S. in Biochemistry, MIT', 'I want to help people understand the science behind nutrition and debunk common myths with evidence-based research.', 'https://drsmith-nutrition.com', 15, 'Boston, MA', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face'),
(gen_random_uuid(), 'accepted', 'fitness', 'Ph.D. in Exercise Physiology, University of Texas; M.S. in Kinesiology, UCLA', 'My passion is translating complex exercise science into practical advice that helps people improve their health and performance.', 'https://movementscience.org', 12, 'Austin, TX', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face'),
(gen_random_uuid(), 'accepted', 'mental_health', 'Ph.D. in Clinical Psychology, Stanford University; M.A. in Psychology, University of California Berkeley', 'I believe in making mental health research accessible to everyone and helping people make informed decisions about their wellbeing.', 'https://mindfulresearch.net', 18, 'San Francisco, CA', 'https://images.unsplash.com/photo-1594824604989-b269589c8675?w=200&h=200&fit=crop&crop=face'),
(gen_random_uuid(), 'accepted', 'general_health', 'M.D., Sleep Medicine Fellowship, Johns Hopkins; Residency in Neurology, Mayo Clinic', 'Sleep is fundamental to health, yet so misunderstood. I want to share evidence-based insights to help people optimize their sleep.', 'https://sleepscience-md.com', 10, 'Baltimore, MD', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face'),
(gen_random_uuid(), 'accepted', 'nutrition', 'Ph.D. in Pharmacology, University of Pennsylvania; Postdoc in Molecular Biology, NIH', 'The supplement industry is full of misinformation. I want to help people understand what the research actually says about supplements.', null, 8, 'Philadelphia, PA', 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&h=200&fit=crop&crop=face');

-- Insert corresponding social media links
INSERT INTO public.social_media_links (expert_id, platform, url)
SELECT 
  e.id,
  unnest(ARRAY['Twitter', 'LinkedIn', 'ResearchGate']),
  unnest(ARRAY[
    'https://twitter.com/' || CASE 
      WHEN e.expertise_area = 'nutrition' THEN 'drsmith_nutrition'
      WHEN e.expertise_area = 'fitness' THEN 'fitness_science'
      WHEN e.expertise_area = 'mental_health' THEN 'mindful_research'
      WHEN e.expertise_area = 'general_health' THEN 'sleep_doctor'
      ELSE 'health_expert'
    END,
    'https://linkedin.com/in/' || CASE 
      WHEN e.expertise_area = 'nutrition' THEN 'dr-sarah-smith'
      WHEN e.expertise_area = 'fitness' THEN 'michael-johnson-phd'
      WHEN e.expertise_area = 'mental_health' THEN 'dr-lisa-chen'
      WHEN e.expertise_area = 'general_health' THEN 'david-williams-md'
      ELSE 'dr-expert'
    END,
    'https://researchgate.net/profile/' || CASE 
      WHEN e.expertise_area = 'nutrition' THEN 'Sarah-Smith-2'
      WHEN e.expertise_area = 'fitness' THEN 'Michael-Johnson-15'
      WHEN e.expertise_area = 'mental_health' THEN 'Lisa-Chen-8'
      WHEN e.expertise_area = 'general_health' THEN 'David-Williams-12'
      ELSE 'Expert-Profile'
    END
  ])
FROM public.experts e
WHERE e.status = 'accepted';