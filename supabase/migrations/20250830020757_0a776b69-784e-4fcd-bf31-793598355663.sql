-- Remove linkedin_profile column from expert_applications table
ALTER TABLE public.expert_applications 
DROP COLUMN linkedin_profile;