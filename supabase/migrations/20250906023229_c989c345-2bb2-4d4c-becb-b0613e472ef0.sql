-- Add status field to publications table for approval workflow
ALTER TABLE public.publications 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add user_id to track who submitted the publication
ALTER TABLE public.publications 
ADD COLUMN submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update existing publications to have 'accepted' status
UPDATE public.publications SET status = 'accepted' WHERE status = 'pending';

-- Drop the old policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.publications;
DROP POLICY IF EXISTS "Experts can update publications" ON public.publications;
DROP POLICY IF EXISTS "Publications are viewable by authenticated users" ON public.publications;

-- Create new policies for the approval workflow
CREATE POLICY "Authenticated users can submit publications" 
ON public.publications 
FOR INSERT 
WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view accepted publications" 
ON public.publications 
FOR SELECT 
USING (status = 'accepted');

CREATE POLICY "Experts and admins can view all publications" 
ON public.publications 
FOR SELECT 
USING (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update their own pending publications" 
ON public.publications 
FOR UPDATE 
USING (auth.uid() = submitted_by AND status = 'pending')
WITH CHECK (auth.uid() = submitted_by AND status = 'pending');

CREATE POLICY "Experts and admins can update all publications" 
ON public.publications 
FOR UPDATE 
USING (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Experts and admins can delete publications" 
ON public.publications 
FOR DELETE 
USING (has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'admin'::app_role));