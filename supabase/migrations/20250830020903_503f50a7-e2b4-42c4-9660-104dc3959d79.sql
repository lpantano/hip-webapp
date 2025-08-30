-- Create enum for expertise areas
CREATE TYPE public.expertise_area AS ENUM (
  'health',
  'fitness', 
  'nutrition',
  'mental_health'
);

-- Create expert_applications table
CREATE TABLE public.expert_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  credentials TEXT NOT NULL,
  expertise_area public.expertise_area NOT NULL,
  motivation TEXT NOT NULL,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create social_media_links table
CREATE TABLE public.social_media_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_application_id UUID NOT NULL REFERENCES public.expert_applications(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expert_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expert_applications
CREATE POLICY "Users can view their own applications" 
ON public.expert_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.expert_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.expert_applications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" 
ON public.expert_applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all applications" 
ON public.expert_applications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for social_media_links
CREATE POLICY "Users can view links for their own applications" 
ON public.social_media_links 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.expert_applications 
    WHERE id = expert_application_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create links for their own applications" 
ON public.social_media_links 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expert_applications 
    WHERE id = expert_application_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update links for their own applications" 
ON public.social_media_links 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.expert_applications 
    WHERE id = expert_application_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete links for their own applications" 
ON public.social_media_links 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.expert_applications 
    WHERE id = expert_application_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all social media links" 
ON public.social_media_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expert_applications_updated_at
BEFORE UPDATE ON public.expert_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_expert_applications_user_id ON public.expert_applications(user_id);
CREATE INDEX idx_expert_applications_status ON public.expert_applications(status);
CREATE INDEX idx_expert_applications_expertise_area ON public.expert_applications(expertise_area);
CREATE INDEX idx_social_media_links_application_id ON public.social_media_links(expert_application_id);