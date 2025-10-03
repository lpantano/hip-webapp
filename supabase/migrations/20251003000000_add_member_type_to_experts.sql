-- Migration: Add member_type column to experts table
-- This will store whether the applicant is applying as an 'expert' or 'researcher'

-- Create enum type for member_type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_type') THEN
        CREATE TYPE public.member_type AS ENUM ('expert', 'researcher');
    END IF;
END $$;

-- Add the member_type column to the experts table
ALTER TABLE public.experts 
  ADD COLUMN IF NOT EXISTS member_type public.member_type DEFAULT 'expert'::public.member_type;

-- Add a comment to document the column
COMMENT ON COLUMN public.experts.member_type IS 'Type of membership the applicant is requesting: expert (provides services) or researcher (evaluates research)';

-- Update existing records to have a default value of 'expert'
-- This is safe since the current form was treating everyone as experts
UPDATE public.experts 
SET member_type = 'expert'::public.member_type 
WHERE member_type IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.experts 
  ALTER COLUMN member_type SET NOT NULL;