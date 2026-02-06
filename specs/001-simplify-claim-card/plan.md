# Implementation Plan: Simplified Claim Card with Expert Evidence Page

**Branch**: `001-simplify-claim-card` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-simplify-claim-card/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Simplify the ClaimCard component to show only essential information (classification chip, votes, share button, title) and move detailed evidence (supporting/contradicting papers) to a new dedicated Evidence Detail page. This reduces visual complexity on the main claims list while providing a focused, structured view for users who want to explore evidence in depth. The feature uses React Router for navigation and maintains all existing authentication/authorization patterns.

## Technical Context

**Language/Version**: TypeScript 5.8 (React 18.3, Vite 7.2)
**Primary Dependencies**: React Router v6.30, Supabase 2.55, TanStack Query 5.83, shadcn/ui (Radix UI), Tailwind CSS
**Storage**: Supabase (PostgreSQL database), existing tables: claims, publications, publication_scores, claim_votes
**Testing**: npm run lint (ESLint), manual testing via npm run dev
**Target Platform**: Modern web browsers (desktop + mobile), PWA-enabled
**Project Type**: Web application (single-page React app with backend via Supabase)
**Performance Goals**: Page loads <2 seconds on standard broadband, smooth navigation transitions, responsive on 375px+ screens
**Constraints**: Must maintain existing authentication/authorization, no breaking changes to database schema, mobile-first responsive design
**Scale/Scope**: ~30 existing claims with publications, claims list pagination (10 per page), evidence page shows all papers for one claim

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Code Quality & Type Safety ✅ PASS
- **Requirement**: All code MUST use TypeScript, no `any` type permitted
- **Status**: PASS - Feature will use existing TypeScript patterns from ClaimCard.tsx, all new components will be fully typed
- **Evidence**: Existing ClaimCard.tsx uses proper TypeScript interfaces (ClaimCardProps, ClaimUI), no `any` types present

### Principle II: Simplicity First ✅ PASS
- **Requirement**: Keep solutions simple, avoid over-engineering, components must be small and focused
- **Status**: PASS - Feature removes complexity from ClaimCard (hiding expanded sections), adds single-purpose Evidence page
- **Evidence**: Simplification is the core goal; new page displays data without complex interactions beyond navigation

### Principle III: Security as Priority ✅ PASS
- **Requirement**: Follow OWASP top 10, validate inputs, prevent XSS/SQL injection, maintain auth/authz
- **Status**: PASS - No new user input fields on evidence page (read-only), maintains existing Supabase auth patterns
- **Evidence**: Evidence page only reads existing claim/publication data via existing Supabase queries, no new write operations

### Principle IV: Component Architecture ✅ PASS
- **Requirement**: Functional components with hooks, named exports for pages, correct directory structure
- **Status**: PASS - Will create new page component in src/pages/, reuse existing UI components from src/components/ui/
- **Evidence**: Following pattern from existing pages/Claims/index.tsx and pages/ClaimDetail.tsx

### Principle V: Modern Styling Standards ✅ PASS
- **Requirement**: Tailwind CSS, shadcn/ui patterns, mobile-friendly, responsive design
- **Status**: PASS - Will use existing Card, Badge, Button components with Tailwind utilities, mobile-first design
- **Evidence**: Spec explicitly requires mobile responsiveness (375px+), will follow ClaimCard styling patterns

### Principle VI: State Management Discipline ✅ PASS
- **Requirement**: TanStack Query for server state, React hooks for local state, Context only when needed
- **Status**: PASS - Will use TanStack Query to fetch claim/publication data, React hooks for UI state (navigation, loading)
- **Evidence**: Existing Claims page uses TanStack Query patterns that will be replicated

### Principle VII: Form Validation Pattern ⚠️ N/A
- **Requirement**: React Hook Form + Zod for forms
- **Status**: N/A - No forms in this feature (read-only evidence display page)

### Supabase Integration Requirements ✅ PASS
- **Requirement**: Use Supabase client from src/integrations/supabase/client.ts, auto-generated types, migrations for schema changes
- **Status**: PASS - No database schema changes needed, will reuse existing queries from Claims page for claim/publication data
- **Evidence**: All data structures already exist (claims, publications, publication_scores tables)

### Development Workflow Standards ✅ PASS
- **Requirement**: Read existing code first, maintain consistency, test locally, follow git workflow (feature branch from devel)
- **Status**: PASS - Already on feature branch 001-simplify-claim-card, will test with npm run dev, npm run lint
- **Evidence**: Branch created per workflow, spec created, following documented process

### Accessibility Requirements 🔍 NEEDS VERIFICATION
- **Requirement**: ARIA labels, keyboard navigation, semantic HTML, color contrast
- **Status**: NEEDS VERIFICATION - Must ensure new Evidence page includes proper ARIA labels and keyboard navigation for back button
- **Action**: Will verify in Phase 1 design that navigation elements have proper accessibility markup

### Performance Standards ✅ PASS
- **Requirement**: React.lazy() for routes, optimize images, minimize bundle size, TanStack Query caching
- **Status**: PASS - Will use React.lazy() for new Evidence page, leverage existing TanStack Query cache
- **Evidence**: New page reuses existing components and patterns, no new large dependencies

### Forbidden Practices ✅ PASS
- **Requirement**: No unnecessary comments, type annotations, error handling, abstractions, .env modifications, emoji
- **Status**: PASS - Will only modify components directly involved in feature, no refactoring beyond scope
- **Evidence**: Spec is focused: simplify ClaimCard, add Evidence page, maintain existing behavior

### Summary
**GATE STATUS**: ✅ **PASS** with one action item for Phase 1 (accessibility verification)

All core constitution principles are satisfied. The feature aligns with simplicity (removes complexity), maintains security (no new write operations), follows established patterns (React Router, TanStack Query, shadcn/ui), and requires no database migrations.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts (research.md, data-model.md, contracts, quickstart.md)*

### Accessibility Requirements ✅ VERIFIED
- **Status**: VERIFIED - Design includes proper ARIA labels, semantic HTML, keyboard navigation
- **Evidence**:
  - quickstart.md specifies semantic HTML structure (`<main>`, `<section>`, `<article>`)
  - contracts/routes.md includes ARIA label examples (`aria-label="Return to claims list"`)
  - Back button uses proper Button component (keyboard accessible by default)
  - research.md Section 7 explicitly addresses accessibility with implementation patterns

### All Other Principles ✅ RE-CONFIRMED
- **Code Quality & Type Safety**: ClaimEvidence component will use TypeScript interfaces (ClaimUI, PublicationRow)
- **Simplicity First**: Zero new abstractions created, reuses existing components (ClaimLabelsStack, ClaimPublicationsExpanded)
- **Security as Priority**: Read-only feature, no new write operations or user inputs to validate
- **Component Architecture**: ClaimEvidence.tsx in src/pages/ (correct location), functional component with hooks
- **Modern Styling Standards**: Tailwind CSS utilities throughout, mobile-first responsive design confirmed in quickstart.md
- **State Management Discipline**: TanStack Query for server state, React hooks for UI state (no new state libraries)
- **Supabase Integration**: Reuses existing Supabase client, no schema changes, existing types
- **Performance Standards**: React.lazy() for code splitting specified in contracts/routes.md

### Final Gate Status
**✅ PASS** - All constitution requirements satisfied post-design. Feature ready for implementation (Phase 2: Tasks generation via `/speckit.tasks` command).

## Project Structure

### Documentation (this feature)

```text
specs/001-simplify-claim-card/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── routes.md        # React Router routes definition
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── pages/
│   ├── Claims/
│   │   ├── index.tsx                      # [MODIFY] Main claims list page - simplify ClaimCard usage
│   │   ├── components/
│   │   │   ├── ClaimCard.tsx              # [MODIFY] Remove expanded sections, hide papers UI
│   │   │   ├── ClaimLabelsStack.tsx       # [KEEP] Reuse on evidence page
│   │   │   └── ClaimPublicationsExpanded.tsx  # [KEEP] Reuse on evidence page
│   │   └── types.ts                       # [KEEP] Existing ClaimUI type
│   ├── ClaimEvidence.tsx                  # [NEW] Evidence detail page showing papers by stance
│   └── ClaimDetail.tsx                    # [KEEP] Existing individual claim page (unchanged)
├── components/
│   ├── ui/                                 # [KEEP] Reuse Card, Badge, Button, etc.
│   └── layout/
│       └── Header.tsx                      # [KEEP] Navigation unchanged
├── integrations/
│   └── supabase/
│       ├── client.ts                       # [KEEP] Use existing Supabase client
│       └── types.ts                        # [KEEP] Use existing types
└── App.tsx                                 # [MODIFY] Add new route /claims/:id/evidence
```

**Structure Decision**: Web application (React SPA). This is a frontend-only change modifying existing React components and adding a new route. No backend/API changes needed since all data structures already exist in Supabase. The evidence page will be created as `src/pages/ClaimEvidence.tsx` following the pattern of other page components. Route will be added to `src/App.tsx` following the existing React Router v6 pattern.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No complexity violations detected. All constitution principles are satisfied.
