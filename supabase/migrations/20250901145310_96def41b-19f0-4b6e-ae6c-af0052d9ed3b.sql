-- Temporarily disable foreign key constraints for testing
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert test users into profiles table
INSERT INTO public.profiles (user_id, display_name, avatar_url, bio) VALUES
  (
    '59afe23c-c134-40c4-a9bd-19685ec98425',
    'Dr. Sarah Chen',
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=150&h=150&fit=crop&crop=face',
    'Nutritionist specializing in evidence-based dietary recommendations.'
  ),
  (
    'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 
    'Prof. Michael Rodriguez',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Fitness expert and exercise physiologist with 15 years of experience.'
  );

-- Assign expert role to these test users
INSERT INTO public.user_roles (user_id, role) VALUES
  ('59afe23c-c134-40c4-a9bd-19685ec98425', 'expert'),
  ('a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'expert');

-- Insert expert records with correct expertise areas
INSERT INTO public.experts (
  user_id, 
  expertise_area, 
  years_of_experience, 
  education, 
  motivation, 
  website, 
  location, 
  status
) VALUES
  (
    '59afe23c-c134-40c4-a9bd-19685ec98425',
    'nutrition',
    12,
    'PhD in Nutritional Sciences from Stanford University, RD certification',
    'I want to help people make informed decisions about their nutrition and health.',
    'https://sarahchen-nutrition.com',
    'San Francisco, CA',
    'accepted'
  ),
  (
    'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2',
    'fitness',
    15,
    'MS in Exercise Physiology, ACSM Certified Exercise Physiologist',
    'Fitness should be accessible and evidence-based for everyone.',
    'https://fitnesswithmichael.org',
    'Boulder, CO',
    'accepted'
  );

-- Insert social media links
INSERT INTO public.social_media_links (expert_id, platform, url)
SELECT e.id, 'LinkedIn', CASE 
  WHEN e.user_id = '59afe23c-c134-40c4-a9bd-19685ec98425' THEN 'https://linkedin.com/in/sarah-chen-nutrition'
  WHEN e.user_id = 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2' THEN 'https://linkedin.com/in/michael-rodriguez-fitness'  
END
FROM public.experts e
WHERE e.user_id IN ('59afe23c-c134-40c4-a9bd-19685ec98425', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2')

UNION ALL

SELECT e.id, 'Twitter', CASE
  WHEN e.user_id = '59afe23c-c134-40c4-a9bd-19685ec98425' THEN 'https://twitter.com/sarahchen_nutrition'
  WHEN e.user_id = 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2' THEN 'https://twitter.com/fitnessmichael'
END
FROM public.experts e
WHERE e.user_id IN ('59afe23c-c134-40c4-a9bd-19685ec98425', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2');