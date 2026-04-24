-- Add slug support to claims for SEO-friendly URLs

-- Slugify function: lowercase, strip non-alphanumeric, collapse spaces to hyphens
CREATE OR REPLACE FUNCTION generate_claim_slug(input_title text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  result text;
BEGIN
  result := lower(input_title);
  result := regexp_replace(result, '[^a-z0-9\s]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  result := substring(result from 1 for 100);
  RETURN result;
END;
$$;

-- Add nullable slug column for backfill
ALTER TABLE claims ADD COLUMN IF NOT EXISTS slug text;

-- Backfill slugs from titles (first pass)
UPDATE claims SET slug = generate_claim_slug(title);

-- Fix any duplicates by appending a short UUID fragment
UPDATE claims c
SET slug = generate_claim_slug(c.title) || '-' || substring(c.id::text, 1, 8)
WHERE EXISTS (
  SELECT 1 FROM claims c2
  WHERE c2.slug = generate_claim_slug(c.title)
  AND c2.id <> c.id
);

-- Enforce non-null and uniqueness
ALTER TABLE claims ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS claims_slug_unique ON claims (slug);

-- Trigger: auto-generate slug on INSERT when not provided
CREATE OR REPLACE FUNCTION set_claim_slug() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_claim_slug(NEW.title);
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM claims WHERE slug = final_slug) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER claims_set_slug
BEFORE INSERT ON claims
FOR EACH ROW
EXECUTE FUNCTION set_claim_slug();

-- Update recent_claims_public view to expose slug
DROP VIEW IF EXISTS "public"."recent_claims_public";
CREATE VIEW "public"."recent_claims_public" AS
 SELECT "c"."id",
    "c"."title",
    "c"."description",
    "c"."category",
    "c"."broad_category",
    "c"."labels",
    "c"."status",
    "c"."evidence_status",
    "c"."vote_count",
    "c"."created_at",
    "c"."user_id",
    "c"."slug",
    COALESCE(( SELECT "jsonb_agg"("jsonb_build_object"('id', "p"."id", 'title', "p"."title", 'journal', "p"."journal", 'publication_year', "p"."publication_year", 'year', "p"."publication_year", 'url', COALESCE("p"."url", "p"."doi"), 'doi', "p"."doi", 'source', "p"."source", 'stance', "p"."stance", 'created_at', "p"."created_at")) AS "jsonb_agg"
           FROM "public"."publications" "p"
          WHERE ("p"."claim_id" = "c"."id")), '[]'::"jsonb") AS "publications",
    COALESCE(( SELECT "jsonb_agg"("jsonb_build_object"('id', "cl"."id", 'title', "cl"."title", 'url', "cl"."url", 'description', "cl"."description", 'link_type', "cl"."link_type", 'expert_user_id', "cl"."expert_user_id")) AS "jsonb_agg"
           FROM "public"."claim_links" "cl"
          WHERE ("cl"."claim_id" = "c"."id")), '[]'::"jsonb") AS "links",
    COALESCE(( SELECT "jsonb_agg"("jsonb_build_object"('id', "cc"."id", 'expert_user_id', "cc"."expert_user_id", 'content', "cc"."content", 'created_at', "cc"."created_at", 'updated_at', "cc"."updated_at") ORDER BY "cc"."created_at") AS "jsonb_agg"
           FROM "public"."claim_comments" "cc"
          WHERE ("cc"."claim_id" = "c"."id")), '[]'::"jsonb") AS "comments",
    ( SELECT "count"(*) AS "count"
           FROM "public"."publications" "p"
          WHERE ("p"."claim_id" = "c"."id")) AS "publication_count",
    ( SELECT "count"(*) AS "count"
           FROM "public"."claim_comments" "cc"
          WHERE ("cc"."claim_id" = "c"."id")) AS "comment_count"
   FROM "public"."claims" "c"
  ORDER BY "c"."created_at" DESC
 LIMIT 3;

COMMENT ON VIEW "public"."recent_claims_public" IS 'Public read-only view showing the 5 most recent claims with aggregated publications, links, and comments data. Accessible to anonymous users for homepage preview.';
