drop policy "Experts can delete their own links" on "public"."claim_links";

drop policy "Experts can update their own links" on "public"."claim_links";

drop policy "Only experts can create links" on "public"."claim_links";

drop view if exists "public"."expert_stats";

alter table "public"."claims" alter column "status" drop default;

alter type "public"."claim_category" rename to "claim_category__old_version_to_be_dropped";

create type "public"."claim_category" as enum ('nutrition', 'fitness', 'mental_health', 'pregnancy', 'postmenopause', 'general_health', 'perimenopause', 'period');

alter type "public"."claim_status" rename to "claim_status__old_version_to_be_dropped";

create type "public"."claim_status" as enum ('proposed', 'pending', 'verified', 'disputed', 'needs more evidence', 'under review');


  create table "public"."mailing_list_signups" (
    "id" uuid not null default gen_random_uuid(),
    "email" character varying(254) not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."mailing_list_signups" enable row level security;


  create table "public"."whitelist" (
    "email" text not null
      );


alter table "public"."whitelist" enable row level security;

alter table "public"."claims" alter column category type "public"."claim_category" using category::text::"public"."claim_category";

alter table "public"."claims" alter column status type "public"."claim_status" using status::text::"public"."claim_status";

alter table "public"."experts" alter column expertise_area type "public"."claim_category" using expertise_area::text::"public"."claim_category";

alter table "public"."claims" alter column "status" set default 'pending'::public.claim_status;

drop type "public"."claim_category__old_version_to_be_dropped";

drop type "public"."claim_status__old_version_to_be_dropped";

alter table "public"."claim_links" alter column "link_type" drop not null;

alter table "public"."claim_links" alter column "title" drop not null;

alter table "public"."claims" alter column "status" set default 'proposed'::public.claim_status;

alter table "public"."profiles" add column "cached_avatar_updated_at" timestamp with time zone;

alter table "public"."profiles" add column "cached_avatar_url" text;

CREATE INDEX idx_profiles_cached_avatar_updated_at ON public.profiles USING btree (cached_avatar_updated_at) WHERE (cached_avatar_url IS NOT NULL);

CREATE UNIQUE INDEX mailing_list_signups_pkey ON public.mailing_list_signups USING btree (id);

CREATE UNIQUE INDEX whitelist_pkey ON public.whitelist USING btree (email);

alter table "public"."mailing_list_signups" add constraint "mailing_list_signups_pkey" PRIMARY KEY using index "mailing_list_signups_pkey";

alter table "public"."whitelist" add constraint "whitelist_pkey" PRIMARY KEY using index "whitelist_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.restrict_signup_by_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_whitelisted BOOLEAN;
BEGIN
    -- Check if the new user's email exists in the whitelist table
    SELECT EXISTS (
        SELECT 1 
        FROM public.whitelist 
        WHERE email = NEW.email
    ) INTO is_whitelisted;

    -- If the email is NOT whitelisted, raise an exception
    IF NOT is_whitelisted THEN
        -- IMPORTANT: The message in RAISE EXCEPTION is what the Supabase client returns as the error message.
        RAISE EXCEPTION 'Signup not allowed. Your email is not on the access list.';
    END IF;

    -- If the email is whitelisted, allow the insertion to proceed
    RETURN NEW;
END;
$function$
;

create or replace view "public"."expert_stats" as  SELECT e.id,
    e.user_id,
    e.expertise_area,
    e.years_of_experience,
    e.created_at,
    e.status,
    e.website,
    e.location,
    e.education,
    e.motivation,
    e.member_type,
    p.display_name,
    p.avatar_url,
    p.bio,
    COALESCE(json_agg(json_build_object('platform', sml.platform, 'url', sml.url)) FILTER (WHERE (sml.id IS NOT NULL)), '[]'::json) AS social_media_links,
    count(uc.id) AS total_contributions,
    count(
        CASE
            WHEN (uc.contribution_type = 'publication_review'::text) THEN 1
            ELSE NULL::integer
        END) AS publication_reviews,
    count(
        CASE
            WHEN (uc.contribution_type = 'new_claim'::text) THEN 1
            ELSE NULL::integer
        END) AS new_claims,
    count(
        CASE
            WHEN (uc.contribution_type = 'paper_added'::text) THEN 1
            ELSE NULL::integer
        END) AS papers_added,
        CASE
            WHEN (count(uc.id) > 500) THEN 'Luminary'::text
            WHEN (count(uc.id) > 300) THEN 'Architect'::text
            WHEN (count(uc.id) > 150) THEN 'Navigator'::text
            WHEN (count(uc.id) > 50) THEN 'Explorer'::text
            ELSE 'Seedling'::text
        END AS contributor_level
   FROM (((public.experts e
     LEFT JOIN public.profiles p ON ((e.user_id = p.user_id)))
     LEFT JOIN public.user_contributions uc ON ((e.user_id = uc.user_id)))
     LEFT JOIN public.social_media_links sml ON ((e.user_id = sml.expert_id)))
  WHERE (e.status = 'accepted'::text)
  GROUP BY e.id, e.user_id, e.expertise_area, e.years_of_experience, e.created_at, e.status, e.website, e.location, e.education, e.motivation, e.member_type, p.display_name, p.avatar_url, p.bio;


grant delete on table "public"."claim_comments" to "anon";

grant insert on table "public"."claim_comments" to "anon";

grant references on table "public"."claim_comments" to "anon";

grant select on table "public"."claim_comments" to "anon";

grant trigger on table "public"."claim_comments" to "anon";

grant truncate on table "public"."claim_comments" to "anon";

grant update on table "public"."claim_comments" to "anon";

grant delete on table "public"."claim_comments" to "authenticated";

grant insert on table "public"."claim_comments" to "authenticated";

grant references on table "public"."claim_comments" to "authenticated";

grant select on table "public"."claim_comments" to "authenticated";

grant trigger on table "public"."claim_comments" to "authenticated";

grant truncate on table "public"."claim_comments" to "authenticated";

grant update on table "public"."claim_comments" to "authenticated";

grant delete on table "public"."claim_comments" to "service_role";

grant insert on table "public"."claim_comments" to "service_role";

grant references on table "public"."claim_comments" to "service_role";

grant select on table "public"."claim_comments" to "service_role";

grant trigger on table "public"."claim_comments" to "service_role";

grant truncate on table "public"."claim_comments" to "service_role";

grant update on table "public"."claim_comments" to "service_role";

grant delete on table "public"."claim_links" to "anon";

grant insert on table "public"."claim_links" to "anon";

grant references on table "public"."claim_links" to "anon";

grant select on table "public"."claim_links" to "anon";

grant trigger on table "public"."claim_links" to "anon";

grant truncate on table "public"."claim_links" to "anon";

grant update on table "public"."claim_links" to "anon";

grant delete on table "public"."claim_links" to "authenticated";

grant insert on table "public"."claim_links" to "authenticated";

grant references on table "public"."claim_links" to "authenticated";

grant select on table "public"."claim_links" to "authenticated";

grant trigger on table "public"."claim_links" to "authenticated";

grant truncate on table "public"."claim_links" to "authenticated";

grant update on table "public"."claim_links" to "authenticated";

grant delete on table "public"."claim_links" to "service_role";

grant insert on table "public"."claim_links" to "service_role";

grant references on table "public"."claim_links" to "service_role";

grant select on table "public"."claim_links" to "service_role";

grant trigger on table "public"."claim_links" to "service_role";

grant truncate on table "public"."claim_links" to "service_role";

grant update on table "public"."claim_links" to "service_role";

grant delete on table "public"."claim_reactions" to "anon";

grant insert on table "public"."claim_reactions" to "anon";

grant references on table "public"."claim_reactions" to "anon";

grant select on table "public"."claim_reactions" to "anon";

grant trigger on table "public"."claim_reactions" to "anon";

grant truncate on table "public"."claim_reactions" to "anon";

grant update on table "public"."claim_reactions" to "anon";

grant delete on table "public"."claim_reactions" to "authenticated";

grant insert on table "public"."claim_reactions" to "authenticated";

grant references on table "public"."claim_reactions" to "authenticated";

grant select on table "public"."claim_reactions" to "authenticated";

grant trigger on table "public"."claim_reactions" to "authenticated";

grant truncate on table "public"."claim_reactions" to "authenticated";

grant update on table "public"."claim_reactions" to "authenticated";

grant delete on table "public"."claim_reactions" to "service_role";

grant insert on table "public"."claim_reactions" to "service_role";

grant references on table "public"."claim_reactions" to "service_role";

grant select on table "public"."claim_reactions" to "service_role";

grant trigger on table "public"."claim_reactions" to "service_role";

grant truncate on table "public"."claim_reactions" to "service_role";

grant update on table "public"."claim_reactions" to "service_role";

grant delete on table "public"."claim_votes" to "anon";

grant insert on table "public"."claim_votes" to "anon";

grant references on table "public"."claim_votes" to "anon";

grant select on table "public"."claim_votes" to "anon";

grant trigger on table "public"."claim_votes" to "anon";

grant truncate on table "public"."claim_votes" to "anon";

grant update on table "public"."claim_votes" to "anon";

grant delete on table "public"."claim_votes" to "authenticated";

grant insert on table "public"."claim_votes" to "authenticated";

grant references on table "public"."claim_votes" to "authenticated";

grant select on table "public"."claim_votes" to "authenticated";

grant trigger on table "public"."claim_votes" to "authenticated";

grant truncate on table "public"."claim_votes" to "authenticated";

grant update on table "public"."claim_votes" to "authenticated";

grant delete on table "public"."claim_votes" to "service_role";

grant insert on table "public"."claim_votes" to "service_role";

grant references on table "public"."claim_votes" to "service_role";

grant select on table "public"."claim_votes" to "service_role";

grant trigger on table "public"."claim_votes" to "service_role";

grant truncate on table "public"."claim_votes" to "service_role";

grant update on table "public"."claim_votes" to "service_role";

grant delete on table "public"."claims" to "anon";

grant insert on table "public"."claims" to "anon";

grant references on table "public"."claims" to "anon";

grant select on table "public"."claims" to "anon";

grant trigger on table "public"."claims" to "anon";

grant truncate on table "public"."claims" to "anon";

grant update on table "public"."claims" to "anon";

grant delete on table "public"."claims" to "authenticated";

grant insert on table "public"."claims" to "authenticated";

grant references on table "public"."claims" to "authenticated";

grant select on table "public"."claims" to "authenticated";

grant trigger on table "public"."claims" to "authenticated";

grant truncate on table "public"."claims" to "authenticated";

grant update on table "public"."claims" to "authenticated";

grant delete on table "public"."claims" to "service_role";

grant insert on table "public"."claims" to "service_role";

grant references on table "public"."claims" to "service_role";

grant select on table "public"."claims" to "service_role";

grant trigger on table "public"."claims" to "service_role";

grant truncate on table "public"."claims" to "service_role";

grant update on table "public"."claims" to "service_role";

grant delete on table "public"."experts" to "anon";

grant insert on table "public"."experts" to "anon";

grant references on table "public"."experts" to "anon";

grant select on table "public"."experts" to "anon";

grant trigger on table "public"."experts" to "anon";

grant truncate on table "public"."experts" to "anon";

grant update on table "public"."experts" to "anon";

grant delete on table "public"."experts" to "authenticated";

grant insert on table "public"."experts" to "authenticated";

grant references on table "public"."experts" to "authenticated";

grant select on table "public"."experts" to "authenticated";

grant trigger on table "public"."experts" to "authenticated";

grant truncate on table "public"."experts" to "authenticated";

grant update on table "public"."experts" to "authenticated";

grant delete on table "public"."experts" to "service_role";

grant insert on table "public"."experts" to "service_role";

grant references on table "public"."experts" to "service_role";

grant select on table "public"."experts" to "service_role";

grant trigger on table "public"."experts" to "service_role";

grant truncate on table "public"."experts" to "service_role";

grant update on table "public"."experts" to "service_role";

grant delete on table "public"."feature_requests" to "anon";

grant insert on table "public"."feature_requests" to "anon";

grant references on table "public"."feature_requests" to "anon";

grant select on table "public"."feature_requests" to "anon";

grant trigger on table "public"."feature_requests" to "anon";

grant truncate on table "public"."feature_requests" to "anon";

grant update on table "public"."feature_requests" to "anon";

grant delete on table "public"."feature_requests" to "authenticated";

grant insert on table "public"."feature_requests" to "authenticated";

grant references on table "public"."feature_requests" to "authenticated";

grant select on table "public"."feature_requests" to "authenticated";

grant trigger on table "public"."feature_requests" to "authenticated";

grant truncate on table "public"."feature_requests" to "authenticated";

grant update on table "public"."feature_requests" to "authenticated";

grant delete on table "public"."feature_requests" to "service_role";

grant insert on table "public"."feature_requests" to "service_role";

grant references on table "public"."feature_requests" to "service_role";

grant select on table "public"."feature_requests" to "service_role";

grant trigger on table "public"."feature_requests" to "service_role";

grant truncate on table "public"."feature_requests" to "service_role";

grant update on table "public"."feature_requests" to "service_role";

grant delete on table "public"."feature_votes" to "anon";

grant insert on table "public"."feature_votes" to "anon";

grant references on table "public"."feature_votes" to "anon";

grant select on table "public"."feature_votes" to "anon";

grant trigger on table "public"."feature_votes" to "anon";

grant truncate on table "public"."feature_votes" to "anon";

grant update on table "public"."feature_votes" to "anon";

grant delete on table "public"."feature_votes" to "authenticated";

grant insert on table "public"."feature_votes" to "authenticated";

grant references on table "public"."feature_votes" to "authenticated";

grant select on table "public"."feature_votes" to "authenticated";

grant trigger on table "public"."feature_votes" to "authenticated";

grant truncate on table "public"."feature_votes" to "authenticated";

grant update on table "public"."feature_votes" to "authenticated";

grant delete on table "public"."feature_votes" to "service_role";

grant insert on table "public"."feature_votes" to "service_role";

grant references on table "public"."feature_votes" to "service_role";

grant select on table "public"."feature_votes" to "service_role";

grant trigger on table "public"."feature_votes" to "service_role";

grant truncate on table "public"."feature_votes" to "service_role";

grant update on table "public"."feature_votes" to "service_role";

grant delete on table "public"."mailing_list_signups" to "anon";

grant insert on table "public"."mailing_list_signups" to "anon";

grant references on table "public"."mailing_list_signups" to "anon";

grant select on table "public"."mailing_list_signups" to "anon";

grant trigger on table "public"."mailing_list_signups" to "anon";

grant truncate on table "public"."mailing_list_signups" to "anon";

grant update on table "public"."mailing_list_signups" to "anon";

grant delete on table "public"."mailing_list_signups" to "authenticated";

grant insert on table "public"."mailing_list_signups" to "authenticated";

grant references on table "public"."mailing_list_signups" to "authenticated";

grant select on table "public"."mailing_list_signups" to "authenticated";

grant trigger on table "public"."mailing_list_signups" to "authenticated";

grant truncate on table "public"."mailing_list_signups" to "authenticated";

grant update on table "public"."mailing_list_signups" to "authenticated";

grant delete on table "public"."mailing_list_signups" to "service_role";

grant insert on table "public"."mailing_list_signups" to "service_role";

grant references on table "public"."mailing_list_signups" to "service_role";

grant select on table "public"."mailing_list_signups" to "service_role";

grant trigger on table "public"."mailing_list_signups" to "service_role";

grant truncate on table "public"."mailing_list_signups" to "service_role";

grant update on table "public"."mailing_list_signups" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."publication_scores" to "anon";

grant insert on table "public"."publication_scores" to "anon";

grant references on table "public"."publication_scores" to "anon";

grant select on table "public"."publication_scores" to "anon";

grant trigger on table "public"."publication_scores" to "anon";

grant truncate on table "public"."publication_scores" to "anon";

grant update on table "public"."publication_scores" to "anon";

grant delete on table "public"."publication_scores" to "authenticated";

grant insert on table "public"."publication_scores" to "authenticated";

grant references on table "public"."publication_scores" to "authenticated";

grant select on table "public"."publication_scores" to "authenticated";

grant trigger on table "public"."publication_scores" to "authenticated";

grant truncate on table "public"."publication_scores" to "authenticated";

grant update on table "public"."publication_scores" to "authenticated";

grant delete on table "public"."publication_scores" to "service_role";

grant insert on table "public"."publication_scores" to "service_role";

grant references on table "public"."publication_scores" to "service_role";

grant select on table "public"."publication_scores" to "service_role";

grant trigger on table "public"."publication_scores" to "service_role";

grant truncate on table "public"."publication_scores" to "service_role";

grant update on table "public"."publication_scores" to "service_role";

grant delete on table "public"."publications" to "anon";

grant insert on table "public"."publications" to "anon";

grant references on table "public"."publications" to "anon";

grant select on table "public"."publications" to "anon";

grant trigger on table "public"."publications" to "anon";

grant truncate on table "public"."publications" to "anon";

grant update on table "public"."publications" to "anon";

grant delete on table "public"."publications" to "authenticated";

grant insert on table "public"."publications" to "authenticated";

grant references on table "public"."publications" to "authenticated";

grant select on table "public"."publications" to "authenticated";

grant trigger on table "public"."publications" to "authenticated";

grant truncate on table "public"."publications" to "authenticated";

grant update on table "public"."publications" to "authenticated";

grant delete on table "public"."publications" to "service_role";

grant insert on table "public"."publications" to "service_role";

grant references on table "public"."publications" to "service_role";

grant select on table "public"."publications" to "service_role";

grant trigger on table "public"."publications" to "service_role";

grant truncate on table "public"."publications" to "service_role";

grant update on table "public"."publications" to "service_role";

grant delete on table "public"."resource_reviews" to "anon";

grant insert on table "public"."resource_reviews" to "anon";

grant references on table "public"."resource_reviews" to "anon";

grant select on table "public"."resource_reviews" to "anon";

grant trigger on table "public"."resource_reviews" to "anon";

grant truncate on table "public"."resource_reviews" to "anon";

grant update on table "public"."resource_reviews" to "anon";

grant delete on table "public"."resource_reviews" to "authenticated";

grant insert on table "public"."resource_reviews" to "authenticated";

grant references on table "public"."resource_reviews" to "authenticated";

grant select on table "public"."resource_reviews" to "authenticated";

grant trigger on table "public"."resource_reviews" to "authenticated";

grant truncate on table "public"."resource_reviews" to "authenticated";

grant update on table "public"."resource_reviews" to "authenticated";

grant delete on table "public"."resource_reviews" to "service_role";

grant insert on table "public"."resource_reviews" to "service_role";

grant references on table "public"."resource_reviews" to "service_role";

grant select on table "public"."resource_reviews" to "service_role";

grant trigger on table "public"."resource_reviews" to "service_role";

grant truncate on table "public"."resource_reviews" to "service_role";

grant update on table "public"."resource_reviews" to "service_role";

grant delete on table "public"."resources" to "anon";

grant insert on table "public"."resources" to "anon";

grant references on table "public"."resources" to "anon";

grant select on table "public"."resources" to "anon";

grant trigger on table "public"."resources" to "anon";

grant truncate on table "public"."resources" to "anon";

grant update on table "public"."resources" to "anon";

grant delete on table "public"."resources" to "authenticated";

grant insert on table "public"."resources" to "authenticated";

grant references on table "public"."resources" to "authenticated";

grant select on table "public"."resources" to "authenticated";

grant trigger on table "public"."resources" to "authenticated";

grant truncate on table "public"."resources" to "authenticated";

grant update on table "public"."resources" to "authenticated";

grant delete on table "public"."resources" to "service_role";

grant insert on table "public"."resources" to "service_role";

grant references on table "public"."resources" to "service_role";

grant select on table "public"."resources" to "service_role";

grant trigger on table "public"."resources" to "service_role";

grant truncate on table "public"."resources" to "service_role";

grant update on table "public"."resources" to "service_role";

grant delete on table "public"."social_media_links" to "anon";

grant insert on table "public"."social_media_links" to "anon";

grant references on table "public"."social_media_links" to "anon";

grant select on table "public"."social_media_links" to "anon";

grant trigger on table "public"."social_media_links" to "anon";

grant truncate on table "public"."social_media_links" to "anon";

grant update on table "public"."social_media_links" to "anon";

grant delete on table "public"."social_media_links" to "authenticated";

grant insert on table "public"."social_media_links" to "authenticated";

grant references on table "public"."social_media_links" to "authenticated";

grant select on table "public"."social_media_links" to "authenticated";

grant trigger on table "public"."social_media_links" to "authenticated";

grant truncate on table "public"."social_media_links" to "authenticated";

grant update on table "public"."social_media_links" to "authenticated";

grant delete on table "public"."social_media_links" to "service_role";

grant insert on table "public"."social_media_links" to "service_role";

grant references on table "public"."social_media_links" to "service_role";

grant select on table "public"."social_media_links" to "service_role";

grant trigger on table "public"."social_media_links" to "service_role";

grant truncate on table "public"."social_media_links" to "service_role";

grant update on table "public"."social_media_links" to "service_role";

grant delete on table "public"."sources" to "anon";

grant insert on table "public"."sources" to "anon";

grant references on table "public"."sources" to "anon";

grant select on table "public"."sources" to "anon";

grant trigger on table "public"."sources" to "anon";

grant truncate on table "public"."sources" to "anon";

grant update on table "public"."sources" to "anon";

grant delete on table "public"."sources" to "authenticated";

grant insert on table "public"."sources" to "authenticated";

grant references on table "public"."sources" to "authenticated";

grant select on table "public"."sources" to "authenticated";

grant trigger on table "public"."sources" to "authenticated";

grant truncate on table "public"."sources" to "authenticated";

grant update on table "public"."sources" to "authenticated";

grant delete on table "public"."sources" to "service_role";

grant insert on table "public"."sources" to "service_role";

grant references on table "public"."sources" to "service_role";

grant select on table "public"."sources" to "service_role";

grant trigger on table "public"."sources" to "service_role";

grant truncate on table "public"."sources" to "service_role";

grant update on table "public"."sources" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."whitelist" to "anon";

grant insert on table "public"."whitelist" to "anon";

grant references on table "public"."whitelist" to "anon";

grant select on table "public"."whitelist" to "anon";

grant trigger on table "public"."whitelist" to "anon";

grant truncate on table "public"."whitelist" to "anon";

grant update on table "public"."whitelist" to "anon";

grant delete on table "public"."whitelist" to "authenticated";

grant insert on table "public"."whitelist" to "authenticated";

grant references on table "public"."whitelist" to "authenticated";

grant select on table "public"."whitelist" to "authenticated";

grant trigger on table "public"."whitelist" to "authenticated";

grant truncate on table "public"."whitelist" to "authenticated";

grant update on table "public"."whitelist" to "authenticated";

grant delete on table "public"."whitelist" to "service_role";

grant insert on table "public"."whitelist" to "service_role";

grant references on table "public"."whitelist" to "service_role";

grant select on table "public"."whitelist" to "service_role";

grant trigger on table "public"."whitelist" to "service_role";

grant truncate on table "public"."whitelist" to "service_role";

grant update on table "public"."whitelist" to "service_role";


  create policy "Allow public insert for mailing list signup"
  on "public"."mailing_list_signups"
  as permissive
  for insert
  to public
with check (true);



  create policy "Experts can delete their own links"
  on "public"."claim_links"
  as permissive
  for delete
  to public
using (((auth.uid() = expert_user_id) AND (public.has_role(auth.uid(), 'expert'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'researcher'::public.app_role))));



  create policy "Experts can update their own links"
  on "public"."claim_links"
  as permissive
  for update
  to public
using (((auth.uid() = expert_user_id) AND (public.has_role(auth.uid(), 'expert'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))))
with check (((auth.uid() = expert_user_id) AND (public.has_role(auth.uid(), 'expert'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'researcher'::public.app_role))));



  create policy "Only experts can create links"
  on "public"."claim_links"
  as permissive
  for insert
  to public
with check (((auth.uid() = expert_user_id) AND (public.has_role(auth.uid(), 'expert'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'researcher'::public.app_role))));


CREATE TRIGGER on_auth_user_signup BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.restrict_signup_by_email();


