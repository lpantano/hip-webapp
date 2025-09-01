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