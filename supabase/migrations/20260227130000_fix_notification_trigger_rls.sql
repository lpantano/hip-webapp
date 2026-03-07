-- Fix: allow SECURITY DEFINER trigger functions to read claim_subscriptions
-- Without this policy, auth.uid() is NULL in trigger context, blocking all rows.
CREATE POLICY "Triggers can read all subscriptions"
  ON claim_subscriptions FOR SELECT
  TO postgres
  USING (true);
