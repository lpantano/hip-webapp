-- Fix publication_scores DELETE policy: restrict to owner only
DROP POLICY IF EXISTS "Experts, researchers and admins can delete publication scores" ON "public"."publication_scores";

CREATE POLICY "Experts and researchers can delete their own publication scores"
ON "public"."publication_scores"
FOR DELETE
TO authenticated
USING (
  auth.uid() = expert_user_id
  AND (
    public.has_role(auth.uid(), 'expert'::"public"."app_role")
    OR public.has_role(auth.uid(), 'researcher'::"public"."app_role")
    OR public.has_role(auth.uid(), 'admin'::"public"."app_role")
  )
);

-- Add resource_reviews DELETE policy: owner only
CREATE POLICY "Reviewers can delete their own resource reviews"
ON "public"."resource_reviews"
FOR DELETE
TO authenticated
USING (
  auth.uid() = reviewer_user_id
  AND (
    public.has_role(auth.uid(), 'expert'::"public"."app_role")
    OR public.has_role(auth.uid(), 'researcher'::"public"."app_role")
    OR public.has_role(auth.uid(), 'admin'::"public"."app_role")
  )
);
