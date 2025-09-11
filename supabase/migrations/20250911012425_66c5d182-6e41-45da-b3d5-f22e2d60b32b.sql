-- Enable Row Level Security on claims_full view
ALTER VIEW public.claims_full ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only authenticated users to view claims
CREATE POLICY "Claims are viewable by authenticated users only" 
ON public.claims_full 
FOR SELECT 
USING (auth.role() = 'authenticated');