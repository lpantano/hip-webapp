# Quickstart Guide: Simplified Claim Card with Expert Evidence Page

**Feature**: 001-simplify-claim-card
**Branch**: `001-simplify-claim-card`
**Date**: 2026-02-04

## Overview

This guide helps developers quickly understand and implement the simplified claim card feature. It provides a high-level overview, key file changes, and step-by-step implementation guidance.

---

## What's Changing?

### Before (Current State)
- Claim cards show full paper details inline with expandable sections
- Users see "Reported to Support" and "Reported to Disprove" sections directly on cards
- Long cards with lots of content make scanning difficult

### After (This Feature)
- Claim cards show only essential info: classification, votes, share button, title
- Paper details hidden from card view
- New "See What Experts Say" button navigates to dedicated evidence page
- Evidence page shows papers organized by stance with full details

---

## Quick Architecture Overview

```text
┌─────────────────────────────────────────────┐
│         Claims List Page (existing)         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │       ClaimCard (simplified)        │   │
│  │  • Classification chip              │   │
│  │  • Vote count                       │   │
│  │  • Title                            │   │
│  │  • Share button                     │   │
│  │  • [See What Experts Say] button ───┼───┼──┐
│  └─────────────────────────────────────┘   │  │
│                                             │  │
└─────────────────────────────────────────────┘  │
                                                 │
                                                 ▼
                    ┌────────────────────────────────────────┐
                    │   NEW: Evidence Detail Page            │
                    │                                        │
                    │  [Back] button                         │
                    │                                        │
                    │  Claim Title                           │
                    │                                        │
                    │  ┌──────────────────────────────────┐ │
                    │  │   Supporting Evidence Section    │ │
                    │  │  • Paper 1 (full details)        │ │
                    │  │  • Paper 2 (full details)        │ │
                    │  └──────────────────────────────────┘ │
                    │                                        │
                    │  ┌──────────────────────────────────┐ │
                    │  │  Contradicting Evidence Section  │ │
                    │  │  • Paper 3 (full details)        │ │
                    │  │  • Paper 4 (full details)        │ │
                    │  └──────────────────────────────────┘ │
                    └────────────────────────────────────────┘
```

---

## Files to Create

### 1. New Evidence Page Component

**File**: `src/pages/ClaimEvidence.tsx`

**Purpose**: Display full evidence details for a single claim

**Key Responsibilities**:
- Extract claim ID from URL using `useParams()`
- Fetch claim + publications data using TanStack Query
- Display claim title at top
- Group publications by stance (supporting vs contradicting)
- Render papers with full details using existing components
- Provide back navigation

**Dependencies**:
- React Router: `useParams`, `useNavigate`
- TanStack Query: `useQuery`
- Existing components: ClaimLabelsStack, ClaimPublicationsExpanded (reuse)
- shadcn/ui: Card, Button, Badge, Separator

---

## Files to Modify

### 1. Routing Configuration

**File**: `src/App.tsx`

**Change**: Add new route for evidence page

```typescript
// Add import
import ClaimEvidence from "./pages/ClaimEvidence";

// Inside <Routes> component, add:
<Route path="/claims/:id/evidence" element={<ClaimEvidence />} />

// Optional: Use code splitting with React.lazy()
const ClaimEvidence = lazy(() => import('./pages/ClaimEvidence'));

<Route
  path="/claims/:id/evidence"
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <ClaimEvidence />
    </Suspense>
  }
/>
```

**Location**: Add before the catch-all `*` route

---

### 2. Simplified Claim Card

**File**: `src/pages/Claims/components/ClaimCard.tsx`

**Changes**:
1. Add "See What Experts Say" button
2. Hide/remove expanded paper sections UI (lines ~282-356)
3. Remove or modify expandedStance click handler (keep it simple)

**Add Evidence Button**:
```typescript
import { useNavigate } from 'react-router-dom';

const ClaimCard = ({ claim, ...props }) => {
  const navigate = useNavigate();

  return (
    <Card>
      {/* Existing header section with badges and votes */}

      {/* Existing title section */}

      {/* NEW: Evidence button (replace or hide expanded sections) */}
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/claims/${claim.id}/evidence`)}
          className="w-full sm:w-auto"
        >
          <Info className="w-4 h-4 mr-2" />
          See What Experts Say
        </Button>
      </div>

      {/* REMOVE/HIDE: Lines ~282-356 (ClaimLabelsStack and expanded sections) */}

      {/* Keep existing footer with action buttons */}
    </Card>
  );
};
```

**What to Remove**:
- The `expandedStance` conditional rendering
- The "Reported to Support" / "Reported to Disprove" sections
- The ClaimLabelsStack usage on the card (will be used on evidence page instead)

---

### 3. Claims Page State Management (Optional)

**File**: `src/pages/Claims/index.tsx`

**Change**: Simplify or remove `expandedStance` state since it's no longer used on claim cards

```typescript
// BEFORE: State for expanded sections
const [expandedStance, setExpandedStance] = useState<{ claimId: string; stance: 'supporting' | 'contradicting' } | null>(null);

// AFTER: Can remove if no longer needed, or keep if transitioning gradually
// (Decision depends on whether we're removing expanded view entirely or just moving it)
```

**Note**: If removing immediately, also remove related handler functions and props passed to ClaimCard.

---

## Implementation Steps

### Phase 1: Create Evidence Page (Independent Work)

1. Create `src/pages/ClaimEvidence.tsx`
2. Implement basic structure:
   - Use `useParams<{ id: string }>()` to get claim ID
   - Use TanStack Query to fetch claim data
   - Display loading state
   - Display error state (claim not found)
3. Add claim title section at top
4. Add back button (using `navigate(-1)`)
5. Split publications by stance:
   ```typescript
   const supportingPapers = publications.filter(p => p.stance === 'supporting');
   const contradictingPapers = publications.filter(p => p.stance === 'contradicting');
   ```
6. Render two sections (Supporting / Contradicting)
7. Reuse existing ClaimPublicationsExpanded component to display papers

**Test Independently**: Navigate directly to `/claims/[valid-id]/evidence` URL to verify it works

---

### Phase 2: Add Route

1. Open `src/App.tsx`
2. Import ClaimEvidence component
3. Add route: `<Route path="/claims/:id/evidence" element={<ClaimEvidence />} />`
4. Test: Manually navigate to evidence URL, confirm it renders

---

### Phase 3: Simplify Claim Card

1. Open `src/pages/Claims/components/ClaimCard.tsx`
2. Add evidence button with navigation
3. Remove/comment out expanded publication sections
4. Test: Click evidence button, confirm navigation works
5. Test: Verify back button returns to claims list

---

### Phase 4: Clean Up (Optional)

1. Remove unused `expandedStance` state from Claims page
2. Remove unused handler functions if no longer needed
3. Update types if necessary
4. Remove unused imports

---

## Data Flow

### Fetching Claim Evidence

Create a custom hook or inline query:

```typescript
// In ClaimEvidence.tsx
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ClaimEvidence = () => {
  const { id } = useParams<{ id: string }>();

  const { data: claim, isLoading, error } = useQuery({
    queryKey: ['claim-evidence', id],
    queryFn: async () => {
      // Fetch claim with publications in single query
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          publications (
            *,
            publication_scores (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id // Only run if ID exists
  });

  // Handle loading, error, success states
};
```

---

## Component Reuse

### Existing Components to Reuse

#### ClaimLabelsStack
- **Location**: `src/pages/Claims/components/ClaimLabelsStack.tsx`
- **Use Case**: Display aggregated expert classifications for papers in each stance section
- **Props Required**: classificationOrder, labelCounts, stance, etc.

#### ClaimPublicationsExpanded
- **Location**: `src/pages/Claims/components/ClaimPublicationsExpanded.tsx`
- **Use Case**: Display individual paper cards with full details
- **Props Required**: publications, links, isExpert, user, expertProfiles, etc.

**Benefit**: No code duplication, consistent UI, already tested components

---

## Styling Guidelines

### Mobile-First Responsive Design

```typescript
// Container: Centered, responsive padding
<div className="container mx-auto px-4 sm:px-6 py-8">
  {/* Content */}
</div>

// Sections: Stacked vertically on mobile
<div className="flex flex-col gap-6">
  <section className="space-y-4">
    <h2 className="text-xl sm:text-2xl font-bold">Supporting Evidence</h2>
    {/* Papers */}
  </section>

  <section className="space-y-4">
    <h2 className="text-xl sm:text-2xl font-bold">Contradicting Evidence</h2>
    {/* Papers */}
  </section>
</div>

// Back button: Full width on mobile, auto on desktop
<Button className="w-full sm:w-auto">
  <ArrowLeft className="w-4 h-4 mr-2" />
  Back
</Button>
```

### Accessibility

```typescript
// Semantic HTML
<main role="main" aria-labelledby="claim-title">
  <h1 id="claim-title" className="text-3xl font-bold">
    {claim.claim}
  </h1>

  <section aria-labelledby="supporting-heading">
    <h2 id="supporting-heading">Supporting Evidence</h2>
    {/* Papers */}
  </section>
</main>

// ARIA labels on buttons
<Button
  onClick={() => navigate(-1)}
  aria-label="Return to claims list"
>
  Back
</Button>
```

---

## Testing Checklist

### Manual Testing

- [ ] Navigate from claims list to evidence page by clicking button
- [ ] Back button returns to claims list
- [ ] Browser back button works
- [ ] Direct URL access works (bookmark or share URL)
- [ ] Invalid claim ID shows error message
- [ ] Claim with no papers shows empty state
- [ ] Claim with only supporting papers displays correctly
- [ ] Claim with only contradicting papers displays correctly
- [ ] Mobile responsive (test at 375px, 768px, 1024px widths)
- [ ] Keyboard navigation works (tab through buttons, press Enter)
- [ ] Screen reader announces page title and sections correctly

### Edge Cases

- [ ] Very long claim title (wraps correctly)
- [ ] Claim with 50+ papers (renders without performance issues)
- [ ] Paper with missing fields (authors, abstract, etc.) displays gracefully
- [ ] Loading state shows skeleton/spinner
- [ ] Error state shows helpful message with recovery action

---

## Common Pitfalls to Avoid

### 1. Don't Duplicate Components
❌ **Wrong**: Create new `EvidencePaperCard` component
✅ **Right**: Reuse existing `ClaimPublicationsExpanded` component

### 2. Don't Fetch Data Twice
❌ **Wrong**: Fetch claim in one query, publications in another
✅ **Right**: Use Supabase nested select to fetch in single query

### 3. Don't Break Existing Functionality
❌ **Wrong**: Delete ClaimCard expanded sections entirely (breaks existing users mid-rollout)
✅ **Right**: Hide or conditionally render, then remove after confirming evidence page works

### 4. Don't Over-Engineer Navigation
❌ **Wrong**: Add complex state management for scroll position, filters, etc.
✅ **Right**: Trust browser history API and TanStack Query cache

### 5. Don't Forget Accessibility
❌ **Wrong**: Use `<div onClick>` for navigation
✅ **Right**: Use `<Button>` with proper ARIA labels

---

## Performance Optimization

### Code Splitting

```typescript
// App.tsx
const ClaimEvidence = lazy(() => import('./pages/ClaimEvidence'));

// Reduces main bundle size by ~10-20 KB (depending on component size)
```

### Query Caching

TanStack Query automatically caches for 5 minutes. No additional config needed.

---

## Rollout Strategy (Recommended)

### Option 1: Feature Flag (Safest)
1. Add feature flag: `ENABLE_EVIDENCE_PAGE`
2. Show evidence button only if flag enabled
3. Test thoroughly in production with flag off
4. Enable flag for beta users
5. Enable for all users
6. Remove flag and old code after 1 week

### Option 2: Direct Rollout (Faster)
1. Deploy evidence page route (doesn't affect existing UI)
2. Deploy simplified claim card with evidence button
3. Monitor for errors/issues for 24 hours
4. If stable, remove old expanded section code

**Recommendation**: Option 1 for production, Option 2 for development/staging

---

## Debugging Tips

### Evidence Page Not Loading?
- Check browser console for errors
- Verify route is registered in App.tsx before `*` catch-all
- Check claim ID in URL is valid UUID
- Check Supabase query in Network tab (should see single query for claim + publications)

### Navigation Not Working?
- Verify `useNavigate()` is called inside component (not outside)
- Check if button onClick handler is correctly attached
- Verify claim ID is passed correctly to navigate function

### Back Button Not Preserving State?
- Confirm using `navigate(-1)` not `navigate('/claims')`
- Check TanStack Query cache isn't being invalidated unnecessarily

---

## Summary

This feature is a **refactoring of UI layout**, not a complex new feature. Key points:

- **No database changes**: Uses existing data structures
- **No new libraries**: Uses existing React Router, TanStack Query, shadcn/ui
- **Component reuse**: Leverages existing ClaimLabelsStack and ClaimPublicationsExpanded
- **Simple navigation**: Standard React Router patterns
- **Mobile-first**: Follows existing responsive design patterns

**Estimated Implementation Time**: 4-6 hours for experienced React developer

**Risk Level**: Low (read-only feature, no data mutations, clear rollback path)

---

## Next Steps

After reading this guide:
1. Review the [research.md](./research.md) for technical decisions
2. Review the [data-model.md](./data-model.md) for data structures
3. Review the [contracts/routes.md](./contracts/routes.md) for routing details
4. Start with Phase 1 (Create Evidence Page) as outlined in Implementation Steps above
5. Test each phase independently before moving to next
6. Refer back to this guide if you get stuck

**Questions?** Check existing ClaimDetail.tsx page for similar patterns (single claim view with routing).
