-- Remove authors column from publications table
ALTER TABLE public.publications 
DROP COLUMN IF EXISTS authors;