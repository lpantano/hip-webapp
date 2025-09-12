-- Fix expert_stats view to properly join social media links
DROP VIEW IF EXISTS expert_stats;

CREATE VIEW expert_stats AS 
SELECT 
    e.id,
    e.user_id,
    e.expertise_area,
    e.years_of_experience,
    e.created_at,
    e.status,
    e.website,
    e.location,
    e.education,
    e.motivation,
    p.display_name,
    p.avatar_url,
    p.bio,
    COALESCE(json_agg(json_build_object('platform', sml.platform, 'url', sml.url)) FILTER (WHERE (sml.id IS NOT NULL)), '[]'::json) AS social_media_links,
    count(ec.id) AS total_contributions,
    count(
        CASE
            WHEN (ec.contribution_type = 'publication_review'::text) THEN 1
            ELSE NULL::integer
        END) AS publication_reviews,
    count(
        CASE
            WHEN (ec.contribution_type = 'new_claim'::text) THEN 1
            ELSE NULL::integer
        END) AS new_claims,
    count(
        CASE
            WHEN (ec.contribution_type = 'link_added'::text) THEN 1
            ELSE NULL::integer
        END) AS links_added,
        CASE
            WHEN (count(ec.id) > 500) THEN 'Luminary'::text
            WHEN (count(ec.id) > 300) THEN 'Architect'::text
            WHEN (count(ec.id) > 150) THEN 'Navigator'::text
            WHEN (count(ec.id) > 50) THEN 'Explorer'::text
            ELSE 'Seedling'::text
        END AS contributor_level
   FROM experts e
     LEFT JOIN profiles p ON (e.user_id = p.user_id)
     LEFT JOIN expert_contributions ec ON (e.id = ec.expert_id)
     LEFT JOIN social_media_links sml ON (e.user_id = sml.expert_id)  -- Fixed: join on user_id instead of expert.id
  WHERE e.status = 'accepted'
  GROUP BY e.id, e.user_id, e.expertise_area, e.years_of_experience, e.created_at, e.status, e.website, e.location, e.education, e.motivation, p.display_name, p.avatar_url, p.bio;