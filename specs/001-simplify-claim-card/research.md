# Research: Simplified Claim Card with Expert Evidence Page

**Feature**: 001-simplify-claim-card
**Date**: 2026-02-04
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing the simplified claim card with a dedicated evidence detail page. Since the feature uses existing technologies and patterns within the codebase, most decisions involve architectural approaches rather than new technology evaluation.

## Key Research Areas

### 1. React Router Navigation Patterns

**Decision**: Use standard React Router v6 declarative routing with `useParams` and `useNavigate` hooks

**Rationale**:
- Project already uses React Router 6.30.1 throughout
- Existing pattern: `/claims/:id` for individual claim detail (ClaimDetail.tsx)
- New route `/claims/:id/evidence` follows RESTful convention
- `useNavigate()` hook enables programmatic navigation from button clicks
- `useParams()` hook retrieves claim ID from URL
- No additional libraries needed

**Alternatives Considered**:
- **Query parameters** (`/claims?id=123&view=evidence`) - Rejected: Less SEO-friendly, harder to share, doesn't follow existing URL patterns in app
- **Hash routing** (`/claims/:id#evidence`) - Rejected: Doesn't allow separate page components, would require complex state management
- **Modal overlay** - Rejected: Specification explicitly requires "new page" for evidence detail

**Implementation Pattern**:
```typescript
// App.tsx - Add new route
<Route path="/claims/:id/evidence" element={<ClaimEvidence />} />

// ClaimCard.tsx - Navigate to evidence page
const navigate = useNavigate();
<Button onClick={() => navigate(`/claims/${claim.id}/evidence`)}>
  Learn What Experts Say
</Button>

// ClaimEvidence.tsx - Get claim ID from URL
const { id } = useParams<{ id: string }>();
```

### 2. State Preservation Across Navigation

**Decision**: Use React Router's built-in location state to preserve scroll position and filters

**Rationale**:
- React Router v6 supports passing state via `navigate(path, { state: { ... } })`
- Browser's native back button automatically restores previous page state
- No additional state management library needed
- Follows simplicity-first principle

**Alternatives Considered**:
- **localStorage** - Rejected: Adds unnecessary persistence, state shouldn't survive browser refresh for this use case
- **Redux/Zustand** - Rejected: Over-engineering for simple navigation state, violates constitution principle VI (no new state management libraries)
- **URL query parameters** - Rejected: Clutters URL, harder to maintain, unnecessary complexity

**Implementation Pattern**:
```typescript
// When navigating to evidence page, save current state
navigate(`/claims/${claim.id}/evidence`, {
  state: {
    returnScrollPosition: window.scrollY,
    appliedFilters: currentFilters
  }
});

// On evidence page back button, restore state
const location = useLocation();
useEffect(() => {
  if (location.state?.returnScrollPosition) {
    window.scrollTo(0, location.state.returnScrollPosition);
  }
}, []);
```

### 3. Component Reusability Strategy

**Decision**: Reuse existing ClaimLabelsStack and ClaimPublicationsExpanded components on evidence page

**Rationale**:
- These components already handle paper classification display and paper details
- No code duplication needed
- Components are already properly typed and tested
- Follows DRY principle without creating unnecessary abstractions

**Alternatives Considered**:
- **Create new evidence-specific components** - Rejected: Would duplicate existing logic, violates simplicity principle
- **Extract shared component library** - Rejected: Premature abstraction for 2 components with clear single purpose

**Implementation Pattern**:
```typescript
// Import existing components in ClaimEvidence.tsx
import ClaimLabelsStack from './Claims/components/ClaimLabelsStack';
import ClaimPublicationsExpanded from './Claims/components/ClaimPublicationsExpanded';

// Use directly with same props structure
<ClaimLabelsStack
  classificationOrder={classificationOrder}
  labelCounts={supportingLabelCounts}
  stance="supporting"
  {...otherProps}
/>
```

### 4. Data Fetching Strategy

**Decision**: Create a new TanStack Query hook `useClaimEvidence` that fetches claim + publications in a single query

**Rationale**:
- Existing pattern in codebase uses TanStack Query for all data fetching
- Can reuse existing Supabase query structure from Claims page
- TanStack Query provides automatic caching, loading states, and error handling
- Single query reduces network requests

**Alternatives Considered**:
- **Fetch claim and publications separately** - Rejected: Two network requests instead of one, more complex loading state management
- **Pass data via navigation state** - Rejected: Large data transfer, memory overhead, doesn't support direct URL access (deep linking)
- **Use existing Claims page query** - Rejected: Different context, evidence page needs all claim data immediately whereas list page may paginate

**Implementation Pattern**:
```typescript
// hooks/useClaimEvidence.ts
export const useClaimEvidence = (claimId: string) => {
  return useQuery({
    queryKey: ['claim-evidence', claimId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          publications (
            *,
            publication_scores (*)
          )
        `)
        .eq('id', claimId)
        .single();

      if (error) throw error;
      return data;
    }
  });
};
```

### 5. Mobile Responsiveness Approach

**Decision**: Use Tailwind CSS responsive utilities with mobile-first design, stacking stance sections vertically on small screens

**Rationale**:
- Existing codebase uses Tailwind CSS exclusively
- Mobile-first is a constitution requirement
- Vertical stacking pattern already used throughout app
- No additional CSS frameworks needed

**Alternatives Considered**:
- **CSS Grid with complex breakpoints** - Rejected: Over-engineering, Tailwind's flexbox utilities sufficient
- **Third-party mobile UI library** - Rejected: Violates simplicity principle, Tailwind + shadcn/ui already handle this

**Implementation Pattern**:
```typescript
// Mobile: single column, stacked sections
// Desktop: could use two columns if space allows, but single column is cleaner for reading papers
<div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
  {/* Supporting section */}
  <section className="space-y-4">
    <h2 className="text-2xl font-bold">Supporting Evidence</h2>
    {supportingPapers.map(paper => <PaperCard key={paper.id} {...paper} />)}
  </section>

  {/* Contradicting section */}
  <section className="space-y-4">
    <h2 className="text-2xl font-bold">Contradicting Evidence</h2>
    {contradictingPapers.map(paper => <PaperCard key={paper.id} {...paper} />)}
  </section>
</div>
```

### 6. Loading and Error States

**Decision**: Use existing pattern with shadcn/ui Skeleton components for loading, Alert components for errors

**Rationale**:
- Consistent with existing loading patterns throughout application
- shadcn/ui components already available
- Provides good user experience with visual feedback

**Implementation Pattern**:
```typescript
const { data: claim, isLoading, error } = useClaimEvidence(claimId);

if (isLoading) {
  return (
    <div className="container py-8">
      <Skeleton className="h-8 w-3/4 mb-4" /> {/* Title skeleton */}
      <Skeleton className="h-64 w-full" />     {/* Content skeleton */}
    </div>
  );
}

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error loading evidence</AlertTitle>
      <AlertDescription>
        {error.message}
      </AlertDescription>
    </Alert>
  );
}
```

### 7. Accessibility Considerations

**Decision**: Use semantic HTML elements and maintain ARIA labels consistent with existing patterns

**Rationale**:
- Constitution requirement
- Improves screen reader support
- Better SEO

**Implementation Pattern**:
```typescript
// Semantic HTML structure
<main role="main">
  <nav aria-label="Breadcrumb">
    <Button onClick={() => navigate(-1)} aria-label="Go back to claims list">
      <ArrowLeft /> Back
    </Button>
  </nav>

  <article aria-labelledby="claim-title">
    <h1 id="claim-title">{claim.title}</h1>

    <section aria-labelledby="supporting-heading">
      <h2 id="supporting-heading">Supporting Evidence</h2>
      {/* Papers */}
    </section>

    <section aria-labelledby="contradicting-heading">
      <h2 id="contradicting-heading">Contradicting Evidence</h2>
      {/* Papers */}
    </section>
  </article>
</main>
```

## Technology Stack Summary

### Confirmed Technologies (Already in Project)
- **React 18.3.1** - Component framework
- **TypeScript 5.8.3** - Type safety
- **React Router 6.30.1** - Routing and navigation
- **TanStack Query 5.83.0** - Data fetching and caching
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - UI component library
- **Supabase** - Database and authentication
- **Lucide React** - Icon library

### No New Dependencies Required
All functionality can be implemented with existing dependencies. This aligns with the simplicity-first principle and avoids unnecessary bundle size increase.

## Performance Considerations

### Code Splitting
**Decision**: Use React.lazy() to code-split the ClaimEvidence page

**Rationale**:
- Evidence page is not needed on initial app load
- Reduces main bundle size
- Follows existing pattern in codebase

**Implementation**:
```typescript
// App.tsx
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

### Query Caching
- TanStack Query automatically caches claim evidence data
- Subsequent visits to same evidence page load instantly from cache
- 5-minute default stale time is appropriate for this data

## Edge Cases & Error Handling

### Edge Case Research

1. **Claim with no papers**:
   - Display empty state message: "No expert evidence has been added for this claim yet"
   - Show "Add Paper" button if user has permission

2. **Claim with papers for only one stance**:
   - Show only the populated section
   - Display message in empty section: "No evidence found that [supports/contradicts] this claim"

3. **Paper with minimal data**:
   - Gracefully handle missing fields (authors, abstract, etc.)
   - Display only available information

4. **Direct URL access (deep linking)**:
   - Works automatically with React Router
   - Query will fetch necessary data even if user didn't come from claims list

5. **Invalid claim ID**:
   - TanStack Query error state will catch 404/not found
   - Display error message with link back to claims list

## Open Questions & Resolutions

**Q: Should the evidence button replace any existing buttons on the claim card?**
A: No. Based on spec analysis, the evidence button is an addition. Existing buttons (Comments, Add Paper, Add Source) remain but may move to the evidence detail page in future iterations. For MVP, they stay on the claim card.

**Q: Should we animate the transition to the evidence page?**
A: No. Standard browser navigation provides sufficient UX. Adding custom animations would require additional libraries (framer-motion) and violates simplicity principle for this feature.

**Q: Should evidence page have its own header/nav bar?**
A: Yes. It should use the existing app header (maintained by layout in App.tsx). The back button is part of the page content, not a special navigation structure.

## Conclusion

All research is complete. No new technologies or libraries required. Implementation can proceed using existing patterns and tools. All technical decisions align with the project constitution and simplicity-first principles.
