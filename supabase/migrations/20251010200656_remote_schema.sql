create type "public"."publication_stance" as enum ('supporting', 'contradicting', 'neutral', 'mixed');

drop policy "Admins can update all resources" on "public"."resources";

revoke delete on table "public"."claim_comments" from "anon";

revoke insert on table "public"."claim_comments" from "anon";

revoke references on table "public"."claim_comments" from "anon";

revoke select on table "public"."claim_comments" from "anon";

revoke trigger on table "public"."claim_comments" from "anon";

revoke truncate on table "public"."claim_comments" from "anon";

revoke update on table "public"."claim_comments" from "anon";

revoke delete on table "public"."claim_comments" from "authenticated";

revoke insert on table "public"."claim_comments" from "authenticated";

revoke references on table "public"."claim_comments" from "authenticated";

revoke select on table "public"."claim_comments" from "authenticated";

revoke trigger on table "public"."claim_comments" from "authenticated";

revoke truncate on table "public"."claim_comments" from "authenticated";

revoke update on table "public"."claim_comments" from "authenticated";

revoke delete on table "public"."claim_comments" from "service_role";

revoke insert on table "public"."claim_comments" from "service_role";

revoke references on table "public"."claim_comments" from "service_role";

revoke select on table "public"."claim_comments" from "service_role";

revoke trigger on table "public"."claim_comments" from "service_role";

revoke truncate on table "public"."claim_comments" from "service_role";

revoke update on table "public"."claim_comments" from "service_role";

revoke delete on table "public"."claim_links" from "anon";

revoke insert on table "public"."claim_links" from "anon";

revoke references on table "public"."claim_links" from "anon";

revoke select on table "public"."claim_links" from "anon";

revoke trigger on table "public"."claim_links" from "anon";

revoke truncate on table "public"."claim_links" from "anon";

revoke update on table "public"."claim_links" from "anon";

revoke delete on table "public"."claim_links" from "authenticated";

revoke insert on table "public"."claim_links" from "authenticated";

revoke references on table "public"."claim_links" from "authenticated";

revoke select on table "public"."claim_links" from "authenticated";

revoke trigger on table "public"."claim_links" from "authenticated";

revoke truncate on table "public"."claim_links" from "authenticated";

revoke update on table "public"."claim_links" from "authenticated";

revoke delete on table "public"."claim_links" from "service_role";

revoke insert on table "public"."claim_links" from "service_role";

revoke references on table "public"."claim_links" from "service_role";

revoke select on table "public"."claim_links" from "service_role";

revoke trigger on table "public"."claim_links" from "service_role";

revoke truncate on table "public"."claim_links" from "service_role";

revoke update on table "public"."claim_links" from "service_role";

revoke delete on table "public"."claim_reactions" from "anon";

revoke insert on table "public"."claim_reactions" from "anon";

revoke references on table "public"."claim_reactions" from "anon";

revoke select on table "public"."claim_reactions" from "anon";

revoke trigger on table "public"."claim_reactions" from "anon";

revoke truncate on table "public"."claim_reactions" from "anon";

revoke update on table "public"."claim_reactions" from "anon";

revoke delete on table "public"."claim_reactions" from "authenticated";

revoke insert on table "public"."claim_reactions" from "authenticated";

revoke references on table "public"."claim_reactions" from "authenticated";

revoke select on table "public"."claim_reactions" from "authenticated";

revoke trigger on table "public"."claim_reactions" from "authenticated";

revoke truncate on table "public"."claim_reactions" from "authenticated";

revoke update on table "public"."claim_reactions" from "authenticated";

revoke delete on table "public"."claim_reactions" from "service_role";

revoke insert on table "public"."claim_reactions" from "service_role";

revoke references on table "public"."claim_reactions" from "service_role";

revoke select on table "public"."claim_reactions" from "service_role";

revoke trigger on table "public"."claim_reactions" from "service_role";

revoke truncate on table "public"."claim_reactions" from "service_role";

revoke update on table "public"."claim_reactions" from "service_role";

revoke delete on table "public"."claim_votes" from "anon";

revoke insert on table "public"."claim_votes" from "anon";

revoke references on table "public"."claim_votes" from "anon";

revoke select on table "public"."claim_votes" from "anon";

revoke trigger on table "public"."claim_votes" from "anon";

revoke truncate on table "public"."claim_votes" from "anon";

revoke update on table "public"."claim_votes" from "anon";

revoke delete on table "public"."claim_votes" from "authenticated";

revoke insert on table "public"."claim_votes" from "authenticated";

revoke references on table "public"."claim_votes" from "authenticated";

revoke select on table "public"."claim_votes" from "authenticated";

revoke trigger on table "public"."claim_votes" from "authenticated";

revoke truncate on table "public"."claim_votes" from "authenticated";

revoke update on table "public"."claim_votes" from "authenticated";

revoke delete on table "public"."claim_votes" from "service_role";

revoke insert on table "public"."claim_votes" from "service_role";

revoke references on table "public"."claim_votes" from "service_role";

revoke select on table "public"."claim_votes" from "service_role";

revoke trigger on table "public"."claim_votes" from "service_role";

revoke truncate on table "public"."claim_votes" from "service_role";

revoke update on table "public"."claim_votes" from "service_role";

revoke delete on table "public"."claims" from "anon";

revoke insert on table "public"."claims" from "anon";

revoke references on table "public"."claims" from "anon";

revoke select on table "public"."claims" from "anon";

revoke trigger on table "public"."claims" from "anon";

revoke truncate on table "public"."claims" from "anon";

revoke update on table "public"."claims" from "anon";

revoke delete on table "public"."claims" from "authenticated";

revoke insert on table "public"."claims" from "authenticated";

revoke references on table "public"."claims" from "authenticated";

revoke select on table "public"."claims" from "authenticated";

revoke trigger on table "public"."claims" from "authenticated";

revoke truncate on table "public"."claims" from "authenticated";

revoke update on table "public"."claims" from "authenticated";

revoke delete on table "public"."claims" from "service_role";

revoke insert on table "public"."claims" from "service_role";

revoke references on table "public"."claims" from "service_role";

revoke select on table "public"."claims" from "service_role";

revoke trigger on table "public"."claims" from "service_role";

revoke truncate on table "public"."claims" from "service_role";

revoke update on table "public"."claims" from "service_role";

revoke delete on table "public"."expert_contributions" from "anon";

revoke insert on table "public"."expert_contributions" from "anon";

revoke references on table "public"."expert_contributions" from "anon";

revoke select on table "public"."expert_contributions" from "anon";

revoke trigger on table "public"."expert_contributions" from "anon";

revoke truncate on table "public"."expert_contributions" from "anon";

revoke update on table "public"."expert_contributions" from "anon";

revoke delete on table "public"."expert_contributions" from "authenticated";

revoke insert on table "public"."expert_contributions" from "authenticated";

revoke references on table "public"."expert_contributions" from "authenticated";

revoke select on table "public"."expert_contributions" from "authenticated";

revoke trigger on table "public"."expert_contributions" from "authenticated";

revoke truncate on table "public"."expert_contributions" from "authenticated";

revoke update on table "public"."expert_contributions" from "authenticated";

revoke delete on table "public"."expert_contributions" from "service_role";

revoke insert on table "public"."expert_contributions" from "service_role";

revoke references on table "public"."expert_contributions" from "service_role";

revoke select on table "public"."expert_contributions" from "service_role";

revoke trigger on table "public"."expert_contributions" from "service_role";

revoke truncate on table "public"."expert_contributions" from "service_role";

revoke update on table "public"."expert_contributions" from "service_role";

revoke delete on table "public"."experts" from "anon";

revoke insert on table "public"."experts" from "anon";

revoke references on table "public"."experts" from "anon";

revoke select on table "public"."experts" from "anon";

revoke trigger on table "public"."experts" from "anon";

revoke truncate on table "public"."experts" from "anon";

revoke update on table "public"."experts" from "anon";

revoke delete on table "public"."experts" from "authenticated";

revoke insert on table "public"."experts" from "authenticated";

revoke references on table "public"."experts" from "authenticated";

revoke select on table "public"."experts" from "authenticated";

revoke trigger on table "public"."experts" from "authenticated";

revoke truncate on table "public"."experts" from "authenticated";

revoke update on table "public"."experts" from "authenticated";

revoke delete on table "public"."experts" from "service_role";

revoke insert on table "public"."experts" from "service_role";

revoke references on table "public"."experts" from "service_role";

revoke select on table "public"."experts" from "service_role";

revoke trigger on table "public"."experts" from "service_role";

revoke truncate on table "public"."experts" from "service_role";

revoke update on table "public"."experts" from "service_role";

revoke delete on table "public"."feature_requests" from "anon";

revoke insert on table "public"."feature_requests" from "anon";

revoke references on table "public"."feature_requests" from "anon";

revoke select on table "public"."feature_requests" from "anon";

revoke trigger on table "public"."feature_requests" from "anon";

revoke truncate on table "public"."feature_requests" from "anon";

revoke update on table "public"."feature_requests" from "anon";

revoke delete on table "public"."feature_requests" from "authenticated";

revoke insert on table "public"."feature_requests" from "authenticated";

revoke references on table "public"."feature_requests" from "authenticated";

revoke select on table "public"."feature_requests" from "authenticated";

revoke trigger on table "public"."feature_requests" from "authenticated";

revoke truncate on table "public"."feature_requests" from "authenticated";

revoke update on table "public"."feature_requests" from "authenticated";

revoke delete on table "public"."feature_requests" from "service_role";

revoke insert on table "public"."feature_requests" from "service_role";

revoke references on table "public"."feature_requests" from "service_role";

revoke select on table "public"."feature_requests" from "service_role";

revoke trigger on table "public"."feature_requests" from "service_role";

revoke truncate on table "public"."feature_requests" from "service_role";

revoke update on table "public"."feature_requests" from "service_role";

revoke delete on table "public"."feature_votes" from "anon";

revoke insert on table "public"."feature_votes" from "anon";

revoke references on table "public"."feature_votes" from "anon";

revoke select on table "public"."feature_votes" from "anon";

revoke trigger on table "public"."feature_votes" from "anon";

revoke truncate on table "public"."feature_votes" from "anon";

revoke update on table "public"."feature_votes" from "anon";

revoke delete on table "public"."feature_votes" from "authenticated";

revoke insert on table "public"."feature_votes" from "authenticated";

revoke references on table "public"."feature_votes" from "authenticated";

revoke select on table "public"."feature_votes" from "authenticated";

revoke trigger on table "public"."feature_votes" from "authenticated";

revoke truncate on table "public"."feature_votes" from "authenticated";

revoke update on table "public"."feature_votes" from "authenticated";

revoke delete on table "public"."feature_votes" from "service_role";

revoke insert on table "public"."feature_votes" from "service_role";

revoke references on table "public"."feature_votes" from "service_role";

revoke select on table "public"."feature_votes" from "service_role";

revoke trigger on table "public"."feature_votes" from "service_role";

revoke truncate on table "public"."feature_votes" from "service_role";

revoke update on table "public"."feature_votes" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."publication_scores" from "anon";

revoke insert on table "public"."publication_scores" from "anon";

revoke references on table "public"."publication_scores" from "anon";

revoke select on table "public"."publication_scores" from "anon";

revoke trigger on table "public"."publication_scores" from "anon";

revoke truncate on table "public"."publication_scores" from "anon";

revoke update on table "public"."publication_scores" from "anon";

revoke delete on table "public"."publication_scores" from "authenticated";

revoke insert on table "public"."publication_scores" from "authenticated";

revoke references on table "public"."publication_scores" from "authenticated";

revoke select on table "public"."publication_scores" from "authenticated";

revoke trigger on table "public"."publication_scores" from "authenticated";

revoke truncate on table "public"."publication_scores" from "authenticated";

revoke update on table "public"."publication_scores" from "authenticated";

revoke delete on table "public"."publication_scores" from "service_role";

revoke insert on table "public"."publication_scores" from "service_role";

revoke references on table "public"."publication_scores" from "service_role";

revoke select on table "public"."publication_scores" from "service_role";

revoke trigger on table "public"."publication_scores" from "service_role";

revoke truncate on table "public"."publication_scores" from "service_role";

revoke update on table "public"."publication_scores" from "service_role";

revoke delete on table "public"."publications" from "anon";

revoke insert on table "public"."publications" from "anon";

revoke references on table "public"."publications" from "anon";

revoke select on table "public"."publications" from "anon";

revoke trigger on table "public"."publications" from "anon";

revoke truncate on table "public"."publications" from "anon";

revoke update on table "public"."publications" from "anon";

revoke delete on table "public"."publications" from "authenticated";

revoke insert on table "public"."publications" from "authenticated";

revoke references on table "public"."publications" from "authenticated";

revoke select on table "public"."publications" from "authenticated";

revoke trigger on table "public"."publications" from "authenticated";

revoke truncate on table "public"."publications" from "authenticated";

revoke update on table "public"."publications" from "authenticated";

revoke delete on table "public"."publications" from "service_role";

revoke insert on table "public"."publications" from "service_role";

revoke references on table "public"."publications" from "service_role";

revoke select on table "public"."publications" from "service_role";

revoke trigger on table "public"."publications" from "service_role";

revoke truncate on table "public"."publications" from "service_role";

revoke update on table "public"."publications" from "service_role";

revoke delete on table "public"."resource_reviews" from "anon";

revoke insert on table "public"."resource_reviews" from "anon";

revoke references on table "public"."resource_reviews" from "anon";

revoke select on table "public"."resource_reviews" from "anon";

revoke trigger on table "public"."resource_reviews" from "anon";

revoke truncate on table "public"."resource_reviews" from "anon";

revoke update on table "public"."resource_reviews" from "anon";

revoke delete on table "public"."resource_reviews" from "authenticated";

revoke insert on table "public"."resource_reviews" from "authenticated";

revoke references on table "public"."resource_reviews" from "authenticated";

revoke select on table "public"."resource_reviews" from "authenticated";

revoke trigger on table "public"."resource_reviews" from "authenticated";

revoke truncate on table "public"."resource_reviews" from "authenticated";

revoke update on table "public"."resource_reviews" from "authenticated";

revoke delete on table "public"."resource_reviews" from "service_role";

revoke insert on table "public"."resource_reviews" from "service_role";

revoke references on table "public"."resource_reviews" from "service_role";

revoke select on table "public"."resource_reviews" from "service_role";

revoke trigger on table "public"."resource_reviews" from "service_role";

revoke truncate on table "public"."resource_reviews" from "service_role";

revoke update on table "public"."resource_reviews" from "service_role";

revoke delete on table "public"."resources" from "anon";

revoke insert on table "public"."resources" from "anon";

revoke references on table "public"."resources" from "anon";

revoke select on table "public"."resources" from "anon";

revoke trigger on table "public"."resources" from "anon";

revoke truncate on table "public"."resources" from "anon";

revoke update on table "public"."resources" from "anon";

revoke delete on table "public"."resources" from "authenticated";

revoke insert on table "public"."resources" from "authenticated";

revoke references on table "public"."resources" from "authenticated";

revoke select on table "public"."resources" from "authenticated";

revoke trigger on table "public"."resources" from "authenticated";

revoke truncate on table "public"."resources" from "authenticated";

revoke update on table "public"."resources" from "authenticated";

revoke delete on table "public"."resources" from "service_role";

revoke insert on table "public"."resources" from "service_role";

revoke references on table "public"."resources" from "service_role";

revoke select on table "public"."resources" from "service_role";

revoke trigger on table "public"."resources" from "service_role";

revoke truncate on table "public"."resources" from "service_role";

revoke update on table "public"."resources" from "service_role";

revoke delete on table "public"."social_media_links" from "anon";

revoke insert on table "public"."social_media_links" from "anon";

revoke references on table "public"."social_media_links" from "anon";

revoke select on table "public"."social_media_links" from "anon";

revoke trigger on table "public"."social_media_links" from "anon";

revoke truncate on table "public"."social_media_links" from "anon";

revoke update on table "public"."social_media_links" from "anon";

revoke delete on table "public"."social_media_links" from "authenticated";

revoke insert on table "public"."social_media_links" from "authenticated";

revoke references on table "public"."social_media_links" from "authenticated";

revoke select on table "public"."social_media_links" from "authenticated";

revoke trigger on table "public"."social_media_links" from "authenticated";

revoke truncate on table "public"."social_media_links" from "authenticated";

revoke update on table "public"."social_media_links" from "authenticated";

revoke delete on table "public"."social_media_links" from "service_role";

revoke insert on table "public"."social_media_links" from "service_role";

revoke references on table "public"."social_media_links" from "service_role";

revoke select on table "public"."social_media_links" from "service_role";

revoke trigger on table "public"."social_media_links" from "service_role";

revoke truncate on table "public"."social_media_links" from "service_role";

revoke update on table "public"."social_media_links" from "service_role";

revoke delete on table "public"."sources" from "anon";

revoke insert on table "public"."sources" from "anon";

revoke references on table "public"."sources" from "anon";

revoke select on table "public"."sources" from "anon";

revoke trigger on table "public"."sources" from "anon";

revoke truncate on table "public"."sources" from "anon";

revoke update on table "public"."sources" from "anon";

revoke delete on table "public"."sources" from "authenticated";

revoke insert on table "public"."sources" from "authenticated";

revoke references on table "public"."sources" from "authenticated";

revoke select on table "public"."sources" from "authenticated";

revoke trigger on table "public"."sources" from "authenticated";

revoke truncate on table "public"."sources" from "authenticated";

revoke update on table "public"."sources" from "authenticated";

revoke delete on table "public"."sources" from "service_role";

revoke insert on table "public"."sources" from "service_role";

revoke references on table "public"."sources" from "service_role";

revoke select on table "public"."sources" from "service_role";

revoke trigger on table "public"."sources" from "service_role";

revoke truncate on table "public"."sources" from "service_role";

revoke update on table "public"."sources" from "service_role";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_roles" from "authenticated";

revoke insert on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_roles" from "authenticated";

revoke select on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke update on table "public"."user_roles" from "authenticated";

revoke delete on table "public"."user_roles" from "service_role";

revoke insert on table "public"."user_roles" from "service_role";

revoke references on table "public"."user_roles" from "service_role";

revoke select on table "public"."user_roles" from "service_role";

revoke trigger on table "public"."user_roles" from "service_role";

revoke truncate on table "public"."user_roles" from "service_role";

revoke update on table "public"."user_roles" from "service_role";

alter table "public"."publication_scores" enable row level security;

alter table "public"."publications" add column "stance" publication_stance default 'supporting'::publication_stance;

CREATE INDEX idx_publications_claim_stance ON public.publications USING btree (claim_id, stance);

CREATE INDEX idx_publications_stance ON public.publications USING btree (stance);

set check_function_bodies = off;

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


  create policy "Admins can update all resources"
  on "public"."resources"
  as permissive
  for update
  to public
using ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'expert'::app_role) OR has_role(auth.uid(), 'researcher'::app_role)));


CREATE TRIGGER expert_status_change_trigger AFTER UPDATE OF status ON public.experts FOR EACH ROW EXECUTE FUNCTION handle_expert_status_change();


