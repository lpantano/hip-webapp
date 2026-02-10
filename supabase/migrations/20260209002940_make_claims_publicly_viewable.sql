-- Make claims publicly viewable while keeping actions auth-gated
-- This allows anonymous users to browse claims but requires authentication for voting, creating, and viewing evidence

-- Drop existing SELECT policy that requires authentication
DROP POLICY IF EXISTS "Claims are viewable by authenticated users" ON claims;

-- Create new public SELECT policy
CREATE POLICY "Claims are viewable by everyone"
ON claims FOR SELECT
TO public
USING (true);
