# Routing Contract: Simplified Claim Card with Expert Evidence Page

**Feature**: 001-simplify-claim-card
**Date**: 2026-02-04
**Router**: React Router v6.30.1

## Overview

This document defines the routing contract for the simplified claim card feature. It specifies the new routes, route parameters, navigation patterns, and how they integrate with the existing routing structure.

---

## Route Definitions

### Existing Routes (Unchanged)

```typescript
// App.tsx - Existing routes that remain unchanged
<Route path="/" element={<Index />} />                    // Landing page
<Route path="/auth" element={<Auth />} />                 // Authentication
<Route path="/claims" element={<Claims />} />             // Claims list page
<Route path="/claims/:id" element={<ClaimDetail />} />    // Individual claim detail
<Route path="/about" element={<About />} />               // About page
<Route path="/team" element={<Team />} />                 // Team page
// ... other routes
```

---

### New Route

#### `/claims/:id/evidence` - Evidence Detail Page

**Purpose**: Display detailed evidence (papers organized by stance) for a specific claim

**Component**: `ClaimEvidence` (new component at `src/pages/ClaimEvidence.tsx`)

**Route Configuration**:
```typescript
// App.tsx - Add new route
import ClaimEvidence from "./pages/ClaimEvidence";

// Inside <Routes>
<Route path="/claims/:id/evidence" element={<ClaimEvidence />} />
```

**Route Parameters**:
- `:id` (string, required): Claim UUID
  - Format: UUID v4 (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
  - Validation: Must be valid UUID, handled by TanStack Query error state if not found

**Example URLs**:
- `https://app.example.com/claims/a1b2c3d4-e5f6-7890-abcd-ef1234567890/evidence`
- `http://localhost:5173/claims/123e4567-e89b-12d3-a456-426614174000/evidence`

**Access Control**:
- Public route (no authentication required for MVP)
- Same access control as `/claims/:id` route
- Note: If claim is private or access-restricted in future, apply same rules here

**Loading Strategy**:
- Use React.lazy() for code splitting
- Suspense fallback: Loading spinner component

```typescript
// App.tsx - With code splitting
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

---

## Navigation Patterns

### 1. From Claims List to Evidence Page

**User Action**: Click "See What Experts Say" button on claim card

**Source**: `src/pages/Claims/components/ClaimCard.tsx`

**Implementation**:
```typescript
import { useNavigate } from 'react-router-dom';

const ClaimCard = ({ claim, ...props }) => {
  const navigate = useNavigate();

  const handleEvidenceClick = () => {
    navigate(`/claims/${claim.id}/evidence`);
  };

  return (
    <Card>
      {/* ... existing card content ... */}
      <Button onClick={handleEvidenceClick}>
        <Info className="w-4 h-4" />
        See What Experts Say
      </Button>
    </Card>
  );
};
```

**State Preservation**: None explicitly needed - browser history API handles back navigation automatically

---

### 2. From Evidence Page Back to Claims List

**User Action**: Click "Back" button or browser back button

**Source**: `src/pages/ClaimEvidence.tsx`

**Implementation Option 1** (Browser back):
```typescript
import { useNavigate } from 'react-router-dom';

const ClaimEvidence = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate(-1)} aria-label="Go back">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      {/* ... evidence content ... */}
    </div>
  );
};
```

**Implementation Option 2** (Explicit route):
```typescript
import { Link } from 'react-router-dom';

const ClaimEvidence = () => {
  return (
    <div>
      <Link to="/claims">
        <Button aria-label="Return to claims list">
          <ArrowLeft className="w-4 h-4" />
          Back to Claims
        </Button>
      </Link>
      {/* ... evidence content ... */}
    </div>
  );
};
```

**Recommendation**: Use Option 1 (`navigate(-1)`) for better UX - preserves user's previous location (claims list with filters, search, scroll position)

---

### 3. Direct URL Access (Deep Linking)

**Scenario**: User bookmarks or shares evidence page URL directly

**Behavior**:
- Route loads ClaimEvidence component
- Component fetches claim data via TanStack Query
- If claim ID invalid or not found, display error state with link to `/claims`

**No Special Handling Required**: React Router + TanStack Query handle this automatically

**Error State**:
```typescript
const { data: claim, isLoading, error } = useClaimEvidence(id);

if (error || !claim) {
  return (
    <div className="container py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">Claim Not Found</h2>
      <p className="text-muted-foreground mb-6">
        The claim you're looking for doesn't exist or has been removed.
      </p>
      <Link to="/claims">
        <Button>Browse All Claims</Button>
      </Link>
    </div>
  );
}
```

---

## Route Hierarchy

```text
/
├── /                          (Landing page)
├── /claims                    (Claims list) ← User starts here
│   └── /:id                   (Claim detail page)
│       └── /evidence          (Evidence detail page) ← NEW
├── /auth                      (Authentication)
├── /about                     (About page)
└── ... (other routes)
```

**Breadcrumb Pattern** (optional future enhancement):
```text
Home > Claims > [Claim Title] > Evidence
```

For MVP, no breadcrumb component needed - back button suffices.

---

## URL Structure Rationale

### Why `/claims/:id/evidence` instead of alternatives?

**Rejected Alternatives**:

1. **`/evidence/:id`**
   - ❌ Loses semantic relationship to claims
   - ❌ Harder to understand in isolation
   - ❌ Breaks RESTful sub-resource convention

2. **`/claims/:id?view=evidence`**
   - ❌ Query params don't represent different resources
   - ❌ Less bookmarkable
   - ❌ Doesn't follow React Router best practices
   - ❌ Can't easily code-split

3. **`/claims/:id#evidence`**
   - ❌ Hash routing not used in this app
   - ❌ Requires state management within ClaimDetail component
   - ❌ Prevents separate page component

**Chosen: `/claims/:id/evidence`**
- ✅ RESTful sub-resource pattern
- ✅ Clear semantic relationship (evidence belongs to claim)
- ✅ Easily bookmarkable and shareable
- ✅ Enables code splitting via React.lazy()
- ✅ Follows existing pattern (`/claims/:id`)
- ✅ Supports future sub-routes if needed (e.g., `/claims/:id/evidence/:paperId`)

---

## Navigation State Management

### Browser History API (Primary)

React Router v6 uses the browser's History API. No custom state management needed.

**Automatic Features**:
- Back button works out of the box
- Forward button works if user went back
- Scroll position restoration (browser default)
- History length maintained

### TanStack Query Cache (Secondary)

When user navigates back to claims list:
- If data still cached (within 5 min stale time), instant load from cache
- No unnecessary refetch unless cache is stale
- Optimistic updates preserved

**No Additional State Libraries Required**: React Router + TanStack Query sufficient

---

## Mobile Considerations

### Responsive URL Display
- Full URL always functional on mobile
- No special mobile routing needed

### Touch-Friendly Navigation
- Back button sized for touch (min 44x44px tap target)
- Evidence button on card sized for touch
- No hover-dependent navigation

### Deep Linking on Mobile
- Share button copies evidence page URL
- URL works in mobile browsers, PWA, and if app is opened from email/SMS

---

## Analytics & Tracking (Future Consideration)

**Route Change Events** (not implemented in MVP, but prepared for):
```typescript
// Future: Track page views in analytics
useEffect(() => {
  // Google Analytics or similar
  gtag('page_view', {
    page_path: `/claims/${id}/evidence`,
    page_title: claim?.claim
  });
}, [id, claim]);
```

---

## Testing Checklist

### Route Configuration
- [ ] Route renders ClaimEvidence component at `/claims/:id/evidence`
- [ ] Route parameter `:id` is correctly extracted via `useParams()`
- [ ] Invalid ID shows error state (not crash)
- [ ] Code splitting works (ClaimEvidence not in main bundle)

### Navigation
- [ ] Clicking evidence button navigates to evidence page
- [ ] Back button returns to claims list
- [ ] Browser back button works
- [ ] Direct URL access works (deep linking)
- [ ] Shared URL works for other users

### State Preservation
- [ ] Returning to claims list maintains scroll position
- [ ] Returning to claims list maintains filters (if in URL params)
- [ ] TanStack Query cache prevents unnecessary refetch

---

## Implementation Checklist

### Step 1: Create ClaimEvidence Component
- [ ] Create `src/pages/ClaimEvidence.tsx`
- [ ] Implement `useParams()` to get claim ID
- [ ] Implement data fetching with TanStack Query
- [ ] Implement loading and error states
- [ ] Implement back button navigation

### Step 2: Add Route to App.tsx
- [ ] Import ClaimEvidence component
- [ ] Add `<Route path="/claims/:id/evidence" element={<ClaimEvidence />} />`
- [ ] Wrap with React.lazy() and Suspense for code splitting
- [ ] Verify route order (must be before catch-all `*` route)

### Step 3: Modify ClaimCard Component
- [ ] Add evidence button to card UI
- [ ] Implement `useNavigate()` hook
- [ ] Attach `navigate()` call to button onClick
- [ ] Remove or hide expanded publication sections (per spec)

### Step 4: Testing
- [ ] Manual test: navigate from claims list to evidence page
- [ ] Manual test: back button returns to claims list
- [ ] Manual test: direct URL access works
- [ ] Manual test: invalid claim ID shows error
- [ ] Manual test: mobile responsive (375px+)

---

## Conclusion

This routing contract defines a single new route (`/claims/:id/evidence`) that follows RESTful conventions and integrates seamlessly with the existing React Router v6 configuration. No breaking changes to existing routes. Implementation is straightforward using standard React Router patterns already in use throughout the application.
