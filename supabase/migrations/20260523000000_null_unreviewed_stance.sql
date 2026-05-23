-- Transition migration: align webapp with new stance-as-reviewer-output workflow.
-- Stance is no longer assigned at intake; it becomes NULL until an expert reviews
-- the publication and writes a stance on submit (see hip-review-iai spec 003).

-- 1. Allow stance to be NULL and drop the intake-time default.
ALTER TABLE public.publications
  ALTER COLUMN stance DROP NOT NULL,
  ALTER COLUMN stance DROP DEFAULT;

COMMENT ON COLUMN public.publications.stance IS
  'Reviewer-assigned stance after evidence evaluation. NULL = not yet reviewed.';

-- 2. Null stance for every publication with no expert review.
UPDATE public.publications p
SET stance = NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.publication_scores ps
  WHERE ps.publication_id = p.id
);

-- 3. Reset evidence_status to 'Awaiting Evidence' for claims whose publications
-- are now all unreviewed. Other claims keep their stored status; the client-side
-- recompute on next form submit will refresh them.
UPDATE public.claims c
SET evidence_status = 'Awaiting Evidence'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.publications p
  JOIN public.publication_scores ps ON ps.publication_id = p.id
  WHERE p.claim_id = c.id
);
