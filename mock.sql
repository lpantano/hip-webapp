
SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'a9154fb7-33af-475c-89d0-c7a4b8260464', '{"action":"user_signedup","actor_id":"cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59","actor_name":"Lorena Pantano","actor_username":"lorena.pantano@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"google"}}', '2025-08-30 14:04:23.54511+00', ''),
	('00000000-0000-0000-0000-000000000000', '022f15c6-303b-4c18-89a9-b5f22d3c3db4', '{"action":"logout","actor_id":"cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59","actor_name":"Lorena Pantano","actor_username":"lorena.pantano@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-30 14:04:32.849428+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f734d7ce-07e4-47e1-8f9a-40d90ef346b8', '{"action":"login","actor_id":"cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59","actor_name":"Lorena Pantano","actor_username":"lorena.pantano@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}', '2025-08-30 22:35:33.848032+00', ''),
	('00000000-0000-0000-0000-000000000000', '0af45b6f-fbb1-424f-a2ef-df2694d3a961', '{"action":"logout","actor_id":"cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59","actor_name":"Lorena Pantano","actor_username":"lorena.pantano@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-08-30 22:58:38.217187+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c769aecb-788d-4b65-8811-c13da3c55132', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"exper1@gmail.com","user_id":"a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2","user_phone":""}}', '2025-09-01 14:51:09.400657+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb5f92a2-a238-46ff-b87d-a501d36b8898', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"expert2@gmail.com","user_id":"59afe23c-c134-40c4-a9bd-19685ec98425","user_phone":""}}', '2025-09-01 14:51:27.345747+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'authenticated', 'authenticated', 'exper1@gmail.com', '$2a$10$gpcawxdNTaQKinABV72qieC1.sq2iAcTNGDZkqZM6JluZLC9pi0U.', '2025-09-01 14:51:09.413697+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-01 14:51:09.370663+00', '2025-09-01 14:51:09.418872+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '59afe23c-c134-40c4-a9bd-19685ec98425', 'authenticated', 'authenticated', 'expert2@gmail.com', '$2a$10$yv9gvv.EKeHtgeg6lecU2.TleBBa49zHM2SliE7qD2nRGQwcoAZ06', '2025-09-01 14:51:27.351729+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-09-01 14:51:27.337964+00', '2025-09-01 14:51:27.355361+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', 'authenticated', 'authenticated', 'lorena.pantano@gmail.com', NULL, '2025-08-30 14:04:23.551508+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-08-30 22:35:33.852856+00', '{"provider": "google", "providers": ["google"]}', '{"iss": "https://accounts.google.com", "sub": "102126326118998738542", "name": "Lorena Pantano", "email": "lorena.pantano@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocK9RvdEw9HkHOFWYCl4f7IqoXRKRfjcdxaclh3WyC7VjvVxx3sq=s96-c", "full_name": "Lorena Pantano", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocK9RvdEw9HkHOFWYCl4f7IqoXRKRfjcdxaclh3WyC7VjvVxx3sq=s96-c", "provider_id": "102126326118998738542", "email_verified": true, "phone_verified": false}', NULL, '2025-08-30 14:04:23.469487+00', '2025-08-30 22:35:33.871882+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('102126326118998738542', 'cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', '{"iss": "https://accounts.google.com", "sub": "102126326118998738542", "name": "Lorena Pantano", "email": "lorena.pantano@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocK9RvdEw9HkHOFWYCl4f7IqoXRKRfjcdxaclh3WyC7VjvVxx3sq=s96-c", "full_name": "Lorena Pantano", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocK9RvdEw9HkHOFWYCl4f7IqoXRKRfjcdxaclh3WyC7VjvVxx3sq=s96-c", "provider_id": "102126326118998738542", "email_verified": true, "phone_verified": false}', 'google', '2025-08-30 14:04:23.532073+00', '2025-08-30 14:04:23.532129+00', '2025-08-30 22:35:33.831673+00', 'e05edbad-befc-4310-b012-715f5932cf4c'),
	('a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', '{"sub": "a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2", "email": "exper1@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-01 14:51:09.394728+00', '2025-09-01 14:51:09.394786+00', '2025-09-01 14:51:09.394786+00', '0811d110-0a42-4791-ba75-0649b51da5d8'),
	('59afe23c-c134-40c4-a9bd-19685ec98425', '59afe23c-c134-40c4-a9bd-19685ec98425', '{"sub": "59afe23c-c134-40c4-a9bd-19685ec98425", "email": "expert2@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-09-01 14:51:27.343598+00', '2025-09-01 14:51:27.343653+00', '2025-09-01 14:51:27.343653+00', 'cbd7039c-5cd4-4059-b587-7c71b27ce6fd');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."claims" ("id", "user_id", "title", "description", "category", "status", "vote_count", "created_at", "updated_at") VALUES
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Does regular high-intensity exercise reduce menopausal hot flashes?', 'Claim about frequency/intensity of exercise and its effect on hot flashes in menopause.', 'fitness', 'pending', 0, '2025-08-05 14:30:00+00', '2025-08-05 14:30:00+00'),
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Does daily vitamin D reduce PMS symptoms?', 'A user-reported claim that daily vitamin D supplementation reduces PMS severity. Seeking evidence from trials and cohort studies.', 'nutrition', 'pending', 2, '2025-08-01 10:00:00+00', '2025-08-30 16:29:37.869719+00'),
	('139bf796-77ea-44af-947c-0001bc85f66f', 'cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', 'Creatine is good for the brain', 'Creatine is good for the brain', 'nutrition', 'pending', 0, '2025-08-30 22:40:42.154307+00', '2025-08-30 22:40:42.154307+00');


--
-- Data for Name: claim_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: claim_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."claim_votes" ("id", "claim_id", "user_id", "created_at") VALUES
	('aaaa1111-aaaa-1111-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '2025-08-12 12:10:00+00'),
	('bbbb2222-bbbb-2222-bbbb-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '2025-08-12 12:12:00+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "user_id", "display_name", "avatar_url", "bio", "created_at", "updated_at") VALUES
	('d8a4e671-e81a-4709-994e-eebc42e2ac6c', 'cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', 'Lorena Pantano', 'https://lh3.googleusercontent.com/a/ACg8ocK9RvdEw9HkHOFWYCl4f7IqoXRKRfjcdxaclh3WyC7VjvVxx3sq=s96-c', NULL, '2025-08-30 14:04:23.434692+00', '2025-08-30 14:04:23.434692+00'),
	('5ecfd5ab-8776-4dbf-b8a7-c4064ca34058', '59afe23c-c134-40c4-a9bd-19685ec98425', 'Dr. Sarah Chen', 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=150&h=150&fit=crop&crop=face', 'Nutritionist specializing in evidence-based dietary recommendations.', '2025-09-01 14:51:27.335764+00', '2025-09-01 14:58:26.265873+00'),
	('834c5c34-8eb2-4419-b4b8-0f08e62ca709', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'Prof. Michael Rodriguez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Fitness expert and exercise physiologist with 15 years of experience.', '2025-09-01 14:51:09.370275+00', '2025-09-01 14:58:26.265873+00');


--
-- Data for Name: experts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."experts" ("id", "user_id", "status", "expertise_area", "education", "motivation", "website", "years_of_experience", "location", "created_at", "updated_at") VALUES
	('0b367213-0fc5-4e9b-ac78-50eeb9cb302a', '59afe23c-c134-40c4-a9bd-19685ec98425', 'accepted', 'nutrition', 'PhD in Nutritional Sciences from Stanford University, RD certification', 'I want to help people make informed decisions about their nutrition and health.', 'https://sarahchen-nutrition.com', 12, 'San Francisco, CA', '2025-09-01 14:58:39.350965+00', '2025-09-01 14:58:39.350965+00'),
	('620d67d4-faa0-4658-96bc-249aea62f5ee', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'accepted', 'fitness', 'MS in Exercise Physiology, ACSM Certified Exercise Physiologist', 'Fitness should be accessible and evidence-based for everyone.', 'https://fitnesswithmichael.org', 15, 'Boulder, CO', '2025-09-01 14:58:39.350965+00', '2025-09-01 14:58:39.350965+00');


--
-- Data for Name: publications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."publications" ("id", "claim_id", "title", "journal", "publication_year", "doi", "url", "abstract", "created_at") VALUES
	('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Vitamin D supplementation and PMS: a randomized trial', 'Women''s Health Journal', 2023, '10.1234/vitd.2023.001', 'https://doi.org/10.1234/vitd.2023.001', 'Randomized double-blind trial of vitamin D supplementation showing modest reduction in PMS symptom scores.', '2025-08-10 09:00:00+00'),
	('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'High-intensity interval training and menopausal symptoms: a cohort study', 'Menopause Research', 2021, NULL, 'https://example.org/hiit-menopause', 'Prospective cohort linking higher-intensity exercise with reduced frequency of hot flashes over 12 months.', '2025-08-11 11:00:00+00'),
	('ff7e8d6f-5175-4f87-b150-5ffd6b3bfe12', '139bf796-77ea-44af-947c-0001bc85f66f', 'Effects of Creatine Supplementation on Brain Function and Health', 'Nutrients', 2022, '10.3390/nu14050921', 'https://doi.org/10.3390/nu14050921', '<jats:p>While the vast majority of research involving creatine supplementation has focused on skeletal muscle, there is a small body of accumulating research that has focused on creatine and the brain. Preliminary studies indicate that creatine supplementation (and guanidinoacetic acid; GAA) has the ability to increase brain creatine content in humans. Furthermore, creatine has shown some promise for attenuating symptoms of concussion, mild traumatic brain injury and depression but its effect on neurodegenerative diseases appears to be lacking. The purpose of this narrative review is to summarize the current body of research pertaining to creatine supplementation on total creatine and phophorylcreatine (PCr) content, explore GAA as an alternative or adjunct to creatine supplementation on brain creatine uptake, assess the impact of creatine on cognition with a focus on sleep deprivation, discuss the effects of creatine supplementation on a variety of neurological and mental health conditions, and outline recent advances on creatine supplementation as a neuroprotective supplement following traumatic brain injury or concussion.</jats:p>', '2025-08-30 22:40:42.526918+00');


--
-- Data for Name: publication_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."publication_scores" ("id", "publication_id", "expert_user_id", "category", "score", "notes", "created_at", "updated_at") VALUES
	('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'study_size', 4, 'Reasonable sample size for preliminary RCT, but larger trials needed.', '2025-08-12 12:00:00+00', '2025-08-12 12:00:00+00'),
	('ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'interpretation', 3, 'Effect present but clinical significance borderline.', '2025-08-12 12:05:00+00', '2025-08-12 12:05:00+00'),
	('11111111-2222-3333-4444-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'population', 4, 'Cohort drawn from community sample; reasonably generalizable.', '2025-08-13 09:30:00+00', '2025-08-13 09:30:00+00');


--
-- Data for Name: social_media_links; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."social_media_links" ("id", "expert_id", "platform", "url", "created_at") VALUES
	('e6575d34-f786-499d-b078-4279f33a6e39', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'linkedin', 'https://linkedin.com/in/alice-smith', '2025-09-01 15:15:48.948756+00'),
	('eb1da194-2a52-4c88-a460-50870c3efec3', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'twitter', 'https://twitter.com/alice_smith', '2025-09-01 15:15:48.948756+00'),
	('7964f1c7-9478-4be5-8d65-518bca44b1f8', '59afe23c-c134-40c4-a9bd-19685ec98425', 'linkedin', 'https://linkedin.com/in/beatrice-lee', '2025-09-01 15:15:48.948756+00'),
	('56b3902c-379d-4648-b8c5-895dc0c65e7c', '59afe23c-c134-40c4-a9bd-19685ec98425', 'twitter', 'https://twitter.com/carla_gomez', '2025-09-01 15:15:48.948756+00');


--
-- Data for Name: sources; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."sources" ("id", "claim_id", "user_id", "source_type", "source_url", "source_title", "source_description", "author_name", "published_date", "created_at", "updated_at") VALUES
	('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'research_paper', 'https://doi.org/10.1234/vitd.2023.001', 'Vitamin D supplementation and PMS: a randomized trial', 'Randomized controlled trial reported modest benefit for vitamin D vs placebo.', 'Smith et al.', '2023-06-15', '2025-08-10 09:00:00+00', '2025-08-10 09:00:00+00'),
	('33333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'webpage', 'https://example.org/hiit-summary', 'HIIT and menopause – community summary', 'Lay summary and links to the cohort study.', 'Community Health', '2021-08-01', '2025-08-11 11:00:00+00', '2025-08-11 11:00:00+00'),
	('d42c5b05-da2a-4d8b-81bc-45b94568104d', '139bf796-77ea-44af-947c-0001bc85f66f', 'cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', 'webpage', 'https://pubmed.ncbi.nlm.nih.gov/35267907/', NULL, NULL, NULL, NULL, '2025-08-30 22:40:42.664814+00', '2025-08-30 22:40:42.664814+00');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_roles" ("id", "user_id", "role", "assigned_at") VALUES
	('50ee0157-7346-4144-bc99-2edd7f936611', 'cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', 'user', '2025-08-30 14:04:23.434692+00'),
	('eee89316-9739-4135-9eb5-a819fd8badb2', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'user', '2025-09-01 14:51:09.370275+00'),
	('94ada906-8b28-4d6a-a58b-3ac74f354672', '59afe23c-c134-40c4-a9bd-19685ec98425', 'user', '2025-09-01 14:51:27.335764+00'),
	('f4533db0-d41b-4d08-a9c2-e51211f08d2d', '59afe23c-c134-40c4-a9bd-19685ec98425', 'expert', '2025-09-01 14:58:30.962383+00'),
	('eccffba2-64e1-4367-b21b-87132820e32f', 'a84ca6d3-a4b4-432e-a15f-dbd9dc9ce4f2', 'expert', '2025-09-01 14:58:30.962383+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
