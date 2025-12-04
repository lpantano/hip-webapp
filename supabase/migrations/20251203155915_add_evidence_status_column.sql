-- Create new enum type for evidence status
CREATE TYPE "public"."evidence_status_type" AS ENUM (
  'Awaiting Evidence',
  'Evidence Supports',
  'Evidence Disproves',
  'Inconclusive'
);

-- Add new column to claims table
ALTER TABLE "public"."claims"
  ADD COLUMN "evidence_status" "public"."evidence_status_type" DEFAULT NULL;

-- Add index for filtering/sorting by evidence_status
CREATE INDEX idx_claims_evidence_status ON "public"."claims"(evidence_status);

-- Add comment to document the column
COMMENT ON COLUMN "public"."claims"."evidence_status" IS 'Calculated label based on publication evidence and expert reviews';
