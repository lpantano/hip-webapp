-- Temporarily disable foreign key constraints for testing
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert test users into profiles table
INSERT INTO public.profiles (user_id, display_name, avatar_url, bio) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Dr. Sarah Chen',
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=150&h=150&fit=crop&crop=face',
    'Nutritionist specializing in evidence-based dietary recommendations.'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'Prof. Michael Rodriguez',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Fitness expert and exercise physiologist with 15 years of experience.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Dr. Emily Johnson',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', 
    'Mental health researcher focused on women''s psychological wellbeing.'
  );

-- Assign expert role to these test users
INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'expert'),
  ('22222222-2222-2222-2222-222222222222', 'expert'),
  ('33333333-3333-3333-3333-333333333333', 'expert');

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
    '11111111-1111-1111-1111-111111111111',
    'nutrition',
    12,
    'PhD in Nutritional Sciences from Stanford University, RD certification',
    'I want to help people make informed decisions about their nutrition and health.',
    'https://sarahchen-nutrition.com',
    'San Francisco, CA',
    'accepted'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'fitness',
    15,
    'MS in Exercise Physiology, ACSM Certified Exercise Physiologist',
    'Fitness should be accessible and evidence-based for everyone.',
    'https://fitnesswithmichael.org',
    'Boulder, CO',
    'accepted'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'mental_health',
    8,
    'PhD in Clinical Psychology, Licensed Psychologist',
    'Mental health is just as important as physical health and deserves evidence-based care.',
    'https://dremilyj-mentalhealth.com',
    'Atlanta, GA', 
    'accepted'
  );

-- Insert social media links
INSERT INTO public.social_media_links (expert_id, platform, url)
SELECT e.id, 'LinkedIn', CASE 
  WHEN e.user_id = '11111111-1111-1111-1111-111111111111' THEN 'https://linkedin.com/in/sarah-chen-nutrition'
  WHEN e.user_id = '22222222-2222-2222-2222-222222222222' THEN 'https://linkedin.com/in/michael-rodriguez-fitness'  
  WHEN e.user_id = '33333333-3333-3333-3333-333333333333' THEN 'https://linkedin.com/in/emily-johnson-mentalhealth'
END
FROM public.experts e
WHERE e.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')

UNION ALL

SELECT e.id, 'Twitter', CASE
  WHEN e.user_id = '11111111-1111-1111-1111-111111111111' THEN 'https://twitter.com/sarahchen_nutrition'
  WHEN e.user_id = '22222222-2222-2222-2222-222222222222' THEN 'https://twitter.com/fitnessmichael'
  WHEN e.user_id = '33333333-3333-3333-3333-333333333333' THEN 'https://twitter.com/dremilyj_mental'  
END
FROM public.experts e
WHERE e.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');