-- Temporarily disable foreign key constraints for testing
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Insert test users into profiles table
INSERT INTO public.profiles (user_id, display_name, avatar_url, bio) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Dr. Sarah Chen',
    'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=150&h=150&fit=crop&crop=face',
    'Neuroscientist specializing in cognitive behavioral research and neuroplasticity.'
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'Prof. Michael Rodriguez',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'Climate scientist and environmental policy researcher with 15 years of experience.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Dr. Emily Johnson',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', 
    'Medical researcher focused on infectious disease prevention and public health.'
  );

-- Assign expert role to these test users
INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'expert'),
  ('22222222-2222-2222-2222-222222222222', 'expert'),
  ('33333333-3333-3333-3333-333333333333', 'expert');

-- Insert expert records with explicit column names and correct enum casting
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
    'healthcare'::expertise_area,
    12,
    'PhD in Neuroscience from Stanford University, Postdoc at MIT',
    'I want to help bridge the gap between scientific research and public understanding of neuroscience.',
    'https://sarahchen-neuro.com',
    'San Francisco, CA',
    'accepted'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'climate_science'::expertise_area,
    15,
    'PhD in Climate Science from UC Berkeley, MS in Environmental Engineering',
    'Climate change is the defining challenge of our time. I want to contribute to evidence-based policy discussions.',
    'https://climatewithmichael.org',
    'Boulder, CO',
    'accepted'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'public_health'::expertise_area,
    8,
    'MD from Harvard Medical School, MPH from Johns Hopkins Bloomberg School of Public Health',
    'Public health decisions should be based on rigorous scientific evidence and clear communication.',
    'https://dremilyj-health.com',
    'Atlanta, GA', 
    'accepted'
  );

-- Insert social media links
INSERT INTO public.social_media_links (expert_id, platform, url)
SELECT e.id, 'LinkedIn', CASE 
  WHEN e.user_id = '11111111-1111-1111-1111-111111111111' THEN 'https://linkedin.com/in/sarah-chen-neuroscience'
  WHEN e.user_id = '22222222-2222-2222-2222-222222222222' THEN 'https://linkedin.com/in/michael-rodriguez-climate'  
  WHEN e.user_id = '33333333-3333-3333-3333-333333333333' THEN 'https://linkedin.com/in/emily-johnson-publichealth'
END
FROM public.experts e
WHERE e.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')

UNION ALL

SELECT e.id, 'Twitter', CASE
  WHEN e.user_id = '11111111-1111-1111-1111-111111111111' THEN 'https://twitter.com/sarahchen_neuro'
  WHEN e.user_id = '22222222-2222-2222-2222-222222222222' THEN 'https://twitter.com/climatemichael'
  WHEN e.user_id = '33333333-3333-3333-3333-333333333333' THEN 'https://twitter.com/dremilyj_health'  
END
FROM public.experts e
WHERE e.user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');