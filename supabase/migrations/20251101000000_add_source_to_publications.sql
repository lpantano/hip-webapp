-- Add source column to publications table
alter table "public"."publications" add column "source" text;

-- Add comment to explain the column
comment on column "public"."publications"."source" is 'URL or reference to the source where the paper was found';
