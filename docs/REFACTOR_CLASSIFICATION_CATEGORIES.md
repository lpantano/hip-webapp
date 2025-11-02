## Refactor Classification Categories

### Overview
This commit refactors classification category names to better reflect their meaning:
- **Unreliable** → **Inconclusive** (research with methodological issues that make results unclear)
- **Fallacy** → **Misinformation** (claims that overstate what the evidence shows)

### Changes

#### Database Migration
- **New Migration**: `20251101000002_rename_classification_categories.sql`
  - Updates existing `review_data` JSONB in `publication_scores` table
  - Changes 'Unreliable' to 'Inconclusive'
  - Changes 'Fallacy' to 'Misinformation'
  - Adds column comment documenting the change

#### Type Definitions
- **`src/types/review.ts`**
  - Updated `ReviewCategory` type to use new names
  - Updated comments and function names to reflect new terminology
  - `getClassificationReasons()` function comments updated

#### UI Components
- **`src/lib/classification-colors.ts`**
  - Updated color mappings for both background and border styles
  - Changed 'unreliable' → 'inconclusive'
  - Changed 'fallacy' → 'misinformation'

- **`src/components/forms/PublicationReviewForm.tsx`**
  - Updated `REVIEW_CATEGORIES` array
  - Updated `computeCategory()` logic and comments
  - Updated validation messages
  - Changed user-facing text in quality assessment section

- **`src/pages/Claims/index.tsx`**
  - Updated condition checks in ExpertReviewsReel display logic

- **`src/pages/Claims/components/ClaimLabelsStack.tsx`**
  - Updated level definitions to use new category names

- **`src/lib/label-aggregation.ts`**
  - Updated `classificationOrder` array
  - Updated condition checks for reason aggregation

- **`src/components/landing/EducationSection.tsx`**
  - Updated step definitions
  - Updated `PHASE_INFO` dictionary with new terminology

### Rationale

**Unreliable → Inconclusive**
- "Unreliable" has negative connotations suggesting the research is untrustworthy
- "Inconclusive" better describes research where methodological issues prevent drawing firm conclusions
- More accurate and less dismissive of the research effort

**Fallacy → Misinformation**
- "Fallacy" is a logical term that may be confusing in this context
- "Misinformation" clearly indicates the claim misrepresents what the evidence shows
- More accessible to general users while maintaining accuracy

### Testing
- All TypeScript type errors resolved
- Database migration updates existing data in JSONB format
- UI displays updated terminology consistently across all views
