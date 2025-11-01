-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own claims" ON "public"."claims";

-- Create a new policy that allows:
-- 1. Users to update their own claims
-- 2. Experts to update any claim
-- 3. Researchers to update any claim
CREATE POLICY "Users, experts, and researchers can update claims"
ON "public"."claims"
FOR UPDATE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'expert')
  OR public.has_role(auth.uid(), 'researcher')
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'expert')
  OR public.has_role(auth.uid(), 'researcher')
  OR public.has_role(auth.uid(), 'admin')
);
