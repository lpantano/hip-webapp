-- Allow any authenticated user to create claim links (not just experts).
-- The restrictive policy caused regular users to get an error after their claim
-- was already committed, leading to duplicate claim submissions on retry.
DROP POLICY IF EXISTS "Only experts can create links" ON public.claim_links;

CREATE POLICY "Authenticated users can create links" ON public.claim_links
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = expert_user_id);
