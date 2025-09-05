-- Create claim_comments table
CREATE TABLE public.claim_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id uuid NOT NULL,
  expert_user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create claim_links table
CREATE TABLE public.claim_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id uuid NOT NULL,
  expert_user_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  description text,
  link_type text NOT NULL DEFAULT 'webpage',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.claim_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for claim_comments
CREATE POLICY "Comments are viewable by authenticated users"
ON public.claim_comments
FOR SELECT
USING (true);

CREATE POLICY "Only experts can create comments"
ON public.claim_comments
FOR INSERT
WITH CHECK (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Experts can update their own comments"
ON public.claim_comments
FOR UPDATE
USING (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Experts can delete their own comments"
ON public.claim_comments
FOR DELETE
USING (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- RLS policies for claim_links
CREATE POLICY "Links are viewable by authenticated users"
ON public.claim_links
FOR SELECT
USING (true);

CREATE POLICY "Only experts can create links"
ON public.claim_links
FOR INSERT
WITH CHECK (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Experts can update their own links"
ON public.claim_links
FOR UPDATE
USING (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
)
WITH CHECK (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Experts can delete their own links"
ON public.claim_links
FOR DELETE
USING (
  auth.uid() = expert_user_id AND 
  (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_claim_comments_updated_at
  BEFORE UPDATE ON public.claim_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_claim_links_updated_at
  BEFORE UPDATE ON public.claim_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();