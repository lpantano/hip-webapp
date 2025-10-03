-- Migration: Change publication_scores to use JSON for flexible review data
-- Drop the old specific review columns and add a JSON column

-- Remove CHECK constraints
ALTER TABLE public.publication_scores 
  DROP CONSTRAINT IF EXISTS publication_scores_alignment_check,
  DROP CONSTRAINT IF EXISTS publication_scores_consensus_check,
  DROP CONSTRAINT IF EXISTS publication_scores_population_check,
  DROP CONSTRAINT IF EXISTS publication_scores_study_size_check;

-- Add new JSONB column for flexible review data
ALTER TABLE public.publication_scores 
  ADD COLUMN IF NOT EXISTS review_data jsonb DEFAULT '{}'::jsonb;

-- Optional: Migrate existing data to JSON format before dropping columns
-- Uncomment this block if you want to preserve existing data
/*
UPDATE public.publication_scores
SET review_data = jsonb_build_object(
  'evidence_classification', evidence_classification,
  'alignment', alignment,
  'study_size', study_size,
  'population', population,
  'consensus', consensus
)
WHERE review_data = '{}'::jsonb;
*/

-- Drop the old specific columns
ALTER TABLE public.publication_scores
  DROP COLUMN IF EXISTS evidence_classification,
  DROP COLUMN IF EXISTS alignment,
  DROP COLUMN IF EXISTS study_size,
  DROP COLUMN IF EXISTS population,
  DROP COLUMN IF EXISTS consensus;

-- Add a comment to document the new structure
COMMENT ON COLUMN public.publication_scores.review_data IS 'Flexible JSON storage for review data. Can contain any review-specific fields as needed.';
