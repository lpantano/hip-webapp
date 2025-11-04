-- Rename classification categories: 'Unreliable' -> 'Inconclusive', 'Fallacy' -> 'Misinformation'
-- This migration handles renaming enum values and updating existing data

-- First, we need to add the new enum values before removing the old ones
-- Since we can't directly rename enum values in PostgreSQL, we need to:
-- 1. Add new values
-- 2. Update data to use new values
-- 3. Remove old values (if no longer used)

-- However, the review_data is stored as JSONB, not as a direct enum type
-- So we need to update the JSONB data in publication_scores table

-- Update 'Unreliable' to 'Inconclusive' in review_data JSONB
UPDATE publication_scores
SET review_data = jsonb_set(
  review_data,
  '{category}',
  '"Inconclusive"'::jsonb
)
WHERE review_data->>'category' = 'Unreliable';

-- Update 'Fallacy' to 'Misinformation' in review_data JSONB
UPDATE publication_scores
SET review_data = jsonb_set(
  review_data,
  '{category}',
  '"Misinformation"'::jsonb
)
WHERE review_data->>'category' = 'Fallacy';

-- Add a comment to document the change
COMMENT ON COLUMN publication_scores.review_data IS 'Review data including category (updated: Unreliable->Inconclusive, Fallacy->Misinformation), quality checks, and tags';
