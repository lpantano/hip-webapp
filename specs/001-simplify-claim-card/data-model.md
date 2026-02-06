# Data Model: Simplified Claim Card with Expert Evidence Page

**Feature**: 001-simplify-claim-card
**Date**: 2026-02-04
**Status**: Complete

## Overview

This feature does not introduce new database schemas or modify existing tables. It reuses existing data structures from the Claims domain. This document describes the entities and their relationships as they exist and will be used by this feature.

## Entity Descriptions

### Claim (Existing - No Changes)

**Purpose**: Represents a health-related claim that users can vote on and experts can evaluate

**Key Attributes**:
- `id` (string/UUID): Unique identifier
- `claim` (string): The claim text/title
- `broad_category` (string): Classification category (e.g., "Nutrition", "Exercise")
- `labels` (string[]): Topic labels for categorization
- `evidence_status` (string): Overall evidence classification (e.g., "Strong Evidence", "Limited Evidence")
- `votes` (number): Vote count from users
- `created_at` (timestamp): Creation date
- `user_id` (string): ID of user who created the claim
- `rawStatus` (string): Status for permission checks (e.g., "proposed", "approved")

**Relationships**:
- Has many Publications (papers supporting or contradicting)
- Has many Links (external sources)
- Belongs to User (creator)

**Validation Rules** (existing - enforced at database level):
- `claim` must not be empty
- `id` must be unique
- `broad_category` must be valid category value

**Usage in This Feature**:
- Displayed on claim card (simplified view: only title, category, votes)
- Displayed on evidence detail page (full context at top)
- No modifications to claim entity required

---

### Publication (Existing - No Changes)

**Purpose**: Represents a scientific paper linked to a claim with a stance (supporting/contradicting)

**Key Attributes**:
- `id` (string/UUID): Unique identifier
- `claim_id` (string): Foreign key to Claim
- `title` (string): Paper title
- `authors` (string): Paper authors
- `journal` (string): Journal name
- `publication_year` (number): Year published
- `abstract` (string): Paper abstract
- `doi` (string): Digital Object Identifier
- `url` (string): Link to full paper
- `stance` (enum: 'supporting' | 'contradicting'): How this paper relates to the claim

**Relationships**:
- Belongs to Claim
- Has many PublicationScores (expert classifications)

**Validation Rules** (existing):
- `claim_id` must reference valid claim
- `stance` must be either 'supporting' or 'contradicting'
- `title` must not be empty

**Usage in This Feature**:
- Hidden from claim card view (major change in UI)
- Displayed on evidence detail page, grouped by stance
- Existing data structure supports all display requirements

---

### PublicationScore (Existing - No Changes)

**Purpose**: Represents an expert's classification/review of a publication

**Key Attributes**:
- `id` (string/UUID): Unique identifier
- `publication_id` (string): Foreign key to Publication
- `user_id` (string): Foreign key to User (expert who reviewed)
- `classification` (string): Quality/type classification (e.g., "High Quality", "Observational Study", "Clinical Trial")
- `reasoning` (string): Expert's notes/explanation for their classification
- `women_included` (boolean): Whether study included women participants
- `created_at` (timestamp): When review was created

**Relationships**:
- Belongs to Publication
- Belongs to User (expert reviewer)

**Validation Rules** (existing):
- `publication_id` must reference valid publication
- `user_id` must reference valid user
- Expert classification labels must be from predefined set

**Usage in This Feature**:
- Displayed on evidence detail page within each paper entry
- Used to show expert classifications and reasoning
- Existing aggregation logic (from ClaimLabelsStack) reused

---

### Link (Existing - No Changes)

**Purpose**: External sources/references associated with a claim

**Key Attributes**:
- `id` (string/UUID): Unique identifier
- `claim_id` (string): Foreign key to Claim
- `url` (string): Link URL
- `title` (string): Link title/description
- `created_at` (timestamp): When link was added

**Relationships**:
- Belongs to Claim

**Usage in This Feature**:
- May be displayed on evidence detail page (if relevant to paper display)
- Not prominently featured but available in data structure

---

## Data Relationships Diagram

```text
┌─────────────────────────────────────────────┐
│                   Claim                      │
│  - id                                        │
│  - claim (title)                             │
│  - broad_category                            │
│  - labels[]                                  │
│  - evidence_status                           │
│  - votes                                     │
│  - user_id                                   │
│  - created_at                                │
└────────────┬────────────────────────────────┘
             │
             │ 1:N
             │
    ┌────────┴───────────┬──────────────────┐
    │                    │                  │
    ▼                    ▼                  ▼
┌────────────┐      ┌────────────┐    ┌─────────┐
│Publication │      │Publication │    │  Link   │
│ (supporting)│      │(contradicting)   │  (source)│
│            │      │            │    │         │
│ - title    │      │ - title    │    │ - url   │
│ - authors  │      │ - authors  │    │ - title │
│ - journal  │      │ - journal  │    └─────────┘
│ - year     │      │ - year     │
│ - stance   │      │ - stance   │
└────┬───────┘      └────┬───────┘
     │                   │
     │ 1:N               │ 1:N
     │                   │
     ▼                   ▼
┌──────────────────┐ ┌──────────────────┐
│PublicationScore  │ │PublicationScore  │
│ (expert reviews) │ │ (expert reviews) │
│                  │ │                  │
│ - classification │ │ - classification │
│ - reasoning      │ │ - reasoning      │
│ - women_included │ │ - women_included │
└──────────────────┘ └──────────────────┘
```

## Data Flow for This Feature

### 1. Claim Card Display (Simplified View)

**Data Needed**:
- Claim: id, claim (title), broad_category, labels, evidence_status, votes
- Publications: count only (for "X papers" indicator)

**Query Pattern** (existing):
```typescript
// Already implemented in Claims page
const { data: claims } = useQuery({
  queryKey: ['claims'],
  queryFn: async () => {
    const { data } = await supabase
      .from('claims')
      .select(`
        *,
        publications (id)
      `);
    return data;
  }
});
```

**UI Rendering**:
- Show: classification chip (evidence_status, broad_category)
- Show: vote count and button
- Show: claim title
- Show: share button
- Show: "Learn What Experts Say" button
- Hide: Publications detail (removed from claim card entirely)

---

### 2. Evidence Detail Page Display

**Data Needed**:
- Claim: all fields (for context)
- Publications: all fields grouped by stance
- PublicationScores: all fields (for expert classifications and reasoning)
- User profiles: for expert names (via expertProfiles lookup - existing pattern)

**Query Pattern** (new hook to be created):
```typescript
const { data: claimEvidence } = useClaimEvidence(claimId);

// Query structure:
{
  id: string,
  claim: string,
  broad_category: string,
  evidence_status: string,
  publications: [
    {
      id: string,
      title: string,
      authors: string,
      journal: string,
      publication_year: number,
      abstract: string,
      doi: string,
      url: string,
      stance: 'supporting' | 'contradicting',
      publication_scores: [
        {
          id: string,
          classification: string,
          reasoning: string,
          women_included: boolean,
          user_id: string
        }
      ]
    }
  ]
}
```

**UI Rendering**:
- Section 1 (Supporting): Filter `publications` where `stance === 'supporting'`
- Section 2 (Contradicting): Filter `publications` where `stance === 'contradicting'`
- For each publication: Display all fields + aggregated expert classifications
- Use existing ClaimLabelsStack component for classification visualization
- Use existing ClaimPublicationsExpanded component for paper cards

---

## State Transitions

### No New State Transitions Required

This feature does not introduce new entity states or workflows. It only changes how existing data is displayed.

**Existing State Transitions** (unchanged):
- Claims: proposed → reviewed → approved (managed by experts)
- Publications: created → has reviews (as experts add PublicationScores)
- PublicationScores: created (no state changes after creation)

---

## Data Validation Requirements

### Client-Side Validation (UI Layer)

No new forms or user input in this feature, therefore no new validation needed. Existing validations maintained:

1. **Navigation Validation**:
   - Claim ID from URL must be valid UUID format
   - If claim ID is invalid or claim not found, show error state

2. **Display Validation**:
   - Handle null/undefined gracefully for optional fields (authors, abstract, doi, url)
   - Handle empty arrays for publications (show empty state)

### Server-Side Validation (Database Layer)

No changes to database validation. Existing constraints remain:
- Foreign key constraints on claim_id, publication_id, user_id
- NOT NULL constraints on required fields
- Enum constraints on stance values

---

## Performance Considerations

### Query Optimization

**Single Query for Evidence Page**:
- Fetch claim with all related publications and publication_scores in one query
- Uses Supabase's JOIN capabilities: `.select('*, publications(*, publication_scores(*))')`
- Reduces network round trips from N+1 to 1

**Caching Strategy**:
- TanStack Query caches evidence page data for 5 minutes
- Subsequent visits to same claim's evidence page load from cache
- Invalidate cache when user adds/modifies papers (existing pattern)

### Data Volume Estimates

**Typical Claim**:
- 1 claim record
- 5-20 publications (2-3 KB each)
- 10-50 publication scores (1 KB each)
- **Total**: ~20-100 KB per evidence page load

**Max Claim** (edge case):
- 1 claim record
- 100 publications (unlikely but possible)
- 500 publication scores
- **Total**: ~500 KB

**Optimization**: If a claim has >50 papers, consider pagination or virtual scrolling in future iteration. For MVP, simple list rendering is sufficient.

---

## Migration Requirements

**None**. This feature requires zero database migrations. All necessary tables and relationships already exist.

---

## Data Access Patterns Summary

### Existing Patterns (Reused)
- ✅ Fetch claims list with publication counts
- ✅ Fetch single claim with publications
- ✅ Fetch publications with scores
- ✅ Expert profile lookup for display names

### New Patterns (This Feature)
- ✅ Fetch claim evidence (claim + publications + scores in single query)
- ✅ Group publications by stance in UI layer (no database changes)

---

## Conclusion

This feature is entirely read-only and display-focused. No new entities, no schema changes, no new validation rules. It leverages existing well-structured data with no modifications required to the database layer. All complexity is in the UI layer (component organization and navigation).
