-- Add years_of_experience column to expert_applications table
ALTER TABLE public.expert_applications 
ADD COLUMN years_of_experience INTEGER;