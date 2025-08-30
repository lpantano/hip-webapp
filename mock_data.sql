-- Sample user ids
-- regular user: 11111111-1111-1111-1111-111111111111
-- expert user:  22222222-2222-2222-2222-222222222222
-- admin user:   33333333-3333-3333-3333-333333333333

-- Insert claims
INSERT INTO public.claims (id, user_id, title, description, category, status, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111',
 'Does daily vitamin D reduce PMS symptoms?',
 'A user-reported claim that daily vitamin D supplementation reduces PMS severity. Seeking evidence from trials and cohort studies.',
 'nutrition','pending','2025-08-01T10:00:00Z','2025-08-01T10:00:00Z'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','22222222-2222-2222-2222-222222222222',
 'Does regular high-intensity exercise reduce menopausal hot flashes?',
 'Claim about frequency/intensity of exercise and its effect on hot flashes in menopause.',
 'fitness','pending','2025-08-05T14:30:00Z','2025-08-05T14:30:00Z');

-- Insert publications (sources of evidence)
INSERT INTO public.publications (id, claim_id, title, journal, publication_year, doi, url, abstract, created_at) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Vitamin D supplementation and PMS: a randomized trial',
 'Women''s Health Journal', 2023, '10.1234/vitd.2023.001', 'https://doi.org/10.1234/vitd.2023.001',
 'Randomized double-blind trial of vitamin D supplementation showing modest reduction in PMS symptom scores.', '2025-08-10T09:00:00Z'),
('dddddddd-dddd-dddd-dddd-dddddddddddd','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'High-intensity interval training and menopausal symptoms: a cohort study',
 'Menopause Research', 2021, NULL, 'https://example.org/hiit-menopause',
 'Prospective cohort linking higher-intensity exercise with reduced frequency of hot flashes over 12 months.', '2025-08-11T11:00:00Z');

-- Insert publication_scores (expert evaluations)
INSERT INTO public.publication_scores (id, publication_id, expert_user_id, category, score, notes, created_at, updated_at) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','cccccccc-cccc-cccc-cccc-cccccccccccc','22222222-2222-2222-2222-222222222222',
 'study_size', 4, 'Reasonable sample size for preliminary RCT, but larger trials needed.', '2025-08-12T12:00:00Z','2025-08-12T12:00:00Z'),
('ffffffff-ffff-ffff-ffff-ffffffffffff','cccccccc-cccc-cccc-cccc-cccccccccccc','22222222-2222-2222-2222-222222222222',
 'interpretation', 3, 'Effect present but clinical significance borderline.', '2025-08-12T12:05:00Z','2025-08-12T12:05:00Z'),
('11111111-2222-3333-4444-555555555555','dddddddd-dddd-dddd-dddd-dddddddddddd','22222222-2222-2222-2222-222222222222',
 'population', 4, 'Cohort drawn from community sample; reasonably generalizable.', '2025-08-13T09:30:00Z','2025-08-13T09:30:00Z');

-- Insert sources (external references attached to claims)
INSERT INTO public.sources (id, claim_id, user_id, source_type, source_url, source_title, source_description, author_name, published_date, created_at, updated_at) VALUES
('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222',
 'research_paper','https://doi.org/10.1234/vitd.2023.001','Vitamin D supplementation and PMS: a randomized trial',
 'Randomized controlled trial reported modest benefit for vitamin D vs placebo.', 'Smith et al.','2023-06-15','2025-08-10T09:00:00Z','2025-08-10T09:00:00Z'),
('33333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','11111111-1111-1111-1111-111111111111',
 'webpage','https://example.org/hiit-summary','HIIT and menopause – community summary',
 'Lay summary and links to the cohort study.', 'Community Health','2021-08-01','2025-08-11T11:00:00Z','2025-08-11T11:00:00Z');

-- Insert claim_votes (experts/admins allowed per your RLS; sample votes)
INSERT INTO public.claim_votes (id, claim_id, user_id, created_at) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','2025-08-12T12:10:00Z'),
('bbbb2222-bbbb-2222-bbbb-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','33333333-3333-3333-3333-333333333333','2025-08-12T12:12:00Z');

-- Insert claim_reactions (user reactions to claim scores)
INSERT INTO public.claim_reactions (id, claim_id, user_id, reaction_type, created_at) VALUES
('r0000000-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','helpful','2025-08-12T12:20:00Z'),
('r0000000-0000-0000-0000-000000000002','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','insightful','2025-08-12T12:22:00Z'),
('r0000000-0000-0000-0000-000000000003','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','11111111-1111-1111-1111-111111111111','wantmore','2025-08-13T10:00:00Z');

-- ------------------------------------------------------------------
-- MOCK DATA (development)
-- NOTE: The profiles table has a FK to auth.users. If you want to insert
-- mock profiles directly, create matching rows in auth.users first or
-- replace the user_id values below with real auth.user ids from your
-- Supabase project. Inserts for expert_applications and social_media_links
-- do not require auth.users entries and can be used as-is for UI testing.
-- ------------------------------------------------------------------

-- Example mock expert users (for expert_applications)
INSERT INTO public.expert_applications (id, user_id, full_name, email, credentials, expertise_area, motivation, website, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Dr. Alice Smith', 'alice@example.com', 'MD, MPH', 'health', 'Improve evidence access for patients', 'https://alice.example.com', 'approved', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Prof. Beatrice Lee', 'beatrice@example.com', 'PhD (Epidemiology)', 'nutrition', 'Advance nutrition evidence synthesis', 'https://beatrice.example.com', 'approved', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'Dr. Carla Gomez', 'carla@example.com', 'MD, PhD', 'mental_health', 'Focus on perimenopause mental health research', 'https://carla.example.com', 'approved', now(), now());

-- Social links for those expert applications
INSERT INTO public.social_media_links (id, expert_application_id, platform, url, created_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'linkedin', 'https://linkedin.com/in/alice-smith', now()),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'twitter', 'https://twitter.com/alice_smith', now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'linkedin', 'https://linkedin.com/in/beatrice-lee', now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'twitter', 'https://twitter.com/carla_gomez', now());
