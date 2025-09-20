-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  expertise_area expertise_area NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting_decision',
  submitted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT resources_status_check CHECK (status IN ('waiting_decision', 'under_review', 'trusted', 'rejected'))
);

-- Create resource reviews table
CREATE TABLE public.resource_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  reviewer_user_id UUID NOT NULL,
  supports BOOLEAN NOT NULL,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(resource_id, reviewer_user_id)
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_reviews ENABLE ROW LEVEL SECURITY;

-- Resources policies
CREATE POLICY "All authenticated users can view resources" 
ON public.resources 
FOR SELECT 
USING (true);

CREATE POLICY "Experts, researchers, and ambassadors can submit resources" 
ON public.resources 
FOR INSERT 
WITH CHECK (
  (auth.uid() = submitted_by) AND 
  (has_role(auth.uid(), 'expert'::app_role) OR 
   has_role(auth.uid(), 'researcher'::app_role) OR 
   has_role(auth.uid(), 'ambassador'::app_role) OR
   has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Users can update their own pending resources" 
ON public.resources 
FOR UPDATE 
USING ((auth.uid() = submitted_by) AND (status = 'waiting_decision'))
WITH CHECK ((auth.uid() = submitted_by) AND (status = 'waiting_decision'));

CREATE POLICY "Admins can update all resources" 
ON public.resources 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Resource reviews policies
CREATE POLICY "All authenticated users can view resource reviews" 
ON public.resource_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Experts and researchers can create reviews" 
ON public.resource_reviews 
FOR INSERT 
WITH CHECK (
  (auth.uid() = reviewer_user_id) AND 
  (has_role(auth.uid(), 'expert'::app_role) OR 
   has_role(auth.uid(), 'researcher'::app_role) OR 
   has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Reviewers can update their own reviews" 
ON public.resource_reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_user_id)
WITH CHECK (auth.uid() = reviewer_user_id);

-- Add updated_at triggers
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_reviews_updated_at
BEFORE UPDATE ON public.resource_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add researcher role to app_role enum if it doesn't exist
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'researcher';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'ambassador';