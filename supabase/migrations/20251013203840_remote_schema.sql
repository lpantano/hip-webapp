drop policy "Expert contributions are viewable by authenticated users" on "public"."expert_contributions";

drop policy "Only experts can create contributions" on "public"."expert_contributions";

alter table "public"."expert_contributions" drop constraint "expert_contributions_contribution_type_check";

alter table "public"."expert_contributions" drop constraint "expert_contributions_expert_id_fkey";

drop view if exists "public"."expert_stats";

alter table "public"."expert_contributions" drop constraint "expert_contributions_pkey";

drop index if exists "public"."expert_contributions_pkey";

drop table "public"."expert_contributions";


  create table "public"."user_contributions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "contribution_type" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_contributions" enable row level security;

CREATE UNIQUE INDEX user_contributions_pkey ON public.user_contributions USING btree (id);

alter table "public"."user_contributions" add constraint "user_contributions_pkey" PRIMARY KEY using index "user_contributions_pkey";

alter table "public"."user_contributions" add constraint "user_contributions_contribution_type_check" CHECK ((contribution_type = ANY (ARRAY['publication_review'::text, 'new_claim'::text, 'paper_added'::text]))) not valid;

alter table "public"."user_contributions" validate constraint "user_contributions_contribution_type_check";

alter table "public"."user_contributions" add constraint "user_contributions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_contributions" validate constraint "user_contributions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.record_claim_submission_contribution()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Record the contribution for any user who submits claims
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.user_id, 'new_claim')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.record_paper_submission_contribution()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Record the contribution for any user who submits papers
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.submitted_by, 'paper_added')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.record_publication_review_contribution()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Record the contribution for any user who reviews publications
    INSERT INTO public.user_contributions (user_id, contribution_type)
    VALUES (NEW.expert_user_id, 'publication_review')
    ON CONFLICT DO NOTHING;
    
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
   FROM (((experts e
     LEFT JOIN profiles p ON ((e.user_id = p.user_id)))
     LEFT JOIN user_contributions uc ON ((e.user_id = uc.user_id)))
     LEFT JOIN social_media_links sml ON ((e.user_id = sml.expert_id)))
  WHERE (e.status = 'accepted'::text)
  GROUP BY e.id, e.user_id, e.expertise_area, e.years_of_experience, e.created_at, e.status, e.website, e.location, e.education, e.motivation, e.member_type, p.display_name, p.avatar_url, p.bio;


CREATE OR REPLACE FUNCTION public.handle_expert_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    
    -- Determine the role based on member_type
    -- expert member_type -> expert role
    -- researcher member_type -> researcher role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
      NEW.user_id, 
      CASE 
        WHEN NEW.member_type = 'expert' THEN 'expert'::public.app_role
        WHEN NEW.member_type = 'researcher' THEN 'researcher'::public.app_role
        ELSE 'user'::public.app_role
      END
    )
    ON CONFLICT (user_id, role) DO NOTHING; -- Don't insert if role already exists
    
  END IF;
  
  -- If status changed from 'accepted' to something else, we could remove the role
  -- But for now, we'll keep roles even if status changes (safer approach)
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION public.record_expert_contribution_after_score()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.expert_contributions (expert_id, contribution_type)
  VALUES (
    (SELECT id FROM public.experts WHERE user_id = NEW.expert_user_id LIMIT 1),
    'publication_review'
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_claim_vote_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.claims 
    SET vote_count = vote_count + 1 
    WHERE id = NEW.claim_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.claims 
    SET vote_count = vote_count - 1 
    WHERE id = OLD.claim_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;


  create policy "Authenticated users can insert their own contributions"
  on "public"."user_contributions"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = user_id));



  create policy "Users can update their own contributions"
  on "public"."user_contributions"
  as permissive
  for update
  to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view all contributions"
  on "public"."user_contributions"
  as permissive
  for select
  to authenticated
using (true);


CREATE TRIGGER claim_submission_contribution_trigger AFTER INSERT ON public.claims FOR EACH ROW EXECUTE FUNCTION record_claim_submission_contribution();

CREATE TRIGGER publication_review_contribution_trigger AFTER INSERT OR UPDATE ON public.publication_scores FOR EACH ROW EXECUTE FUNCTION record_publication_review_contribution();

CREATE TRIGGER paper_submission_contribution_trigger AFTER INSERT ON public.publications FOR EACH ROW EXECUTE FUNCTION record_paper_submission_contribution();


