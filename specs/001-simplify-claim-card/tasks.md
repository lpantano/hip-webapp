# Tasks: Simplified Claim Card with Expert Evidence Page

**Input**: Design documents from `/specs/001-simplify-claim-card/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/routes.md, quickstart.md

**Tests**: Not requested in feature specification - no test tasks included.

**Organization**: Tasks grouped by user story (P1, P2) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Project**: React SPA with `src/` at repository root
- **Pages**: `src/pages/`
- **Components**: `src/components/` and `src/pages/Claims/components/`
- **Routing**: `src/App.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new evidence page component shell and route configuration

- [x] T001 [P] Create ClaimEvidence page component shell in src/pages/ClaimEvidence.tsx
- [x] T002 [P] Add route /claims/:id/evidence with React.lazy() code splitting in src/App.tsx

**Checkpoint**: Route exists and renders placeholder component

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data fetching hook that ALL user stories depend on

**⚠️ CRITICAL**: Evidence page content cannot be implemented until this phase is complete

- [x] T003 Create useClaimEvidence hook for fetching claim with publications and scores in src/pages/ClaimEvidence.tsx (inline or separate hook file)

**Checkpoint**: Foundation ready - evidence page can fetch and display claim data

---

## Phase 3: User Story 1 - View Simplified Claim Cards (Priority: P1) 🎯 MVP

**Goal**: Users can quickly scan claim cards showing only classification chip, votes, share button, and title

**Independent Test**: Load claims list at /claims, verify only essential info visible (classification, votes, share, title), no paper details shown, "See What Experts Say" button present

### Implementation for User Story 1

- [x] T004 [US1] Add "See What Experts Say" button with navigate() to ClaimCard in src/pages/Claims/components/ClaimCard.tsx
- [x] T005 [US1] Remove/hide ClaimLabelsStack rendering from ClaimCard in src/pages/Claims/components/ClaimCard.tsx
- [x] T006 [US1] Remove/hide ClaimPublicationsExpanded rendering from ClaimCard in src/pages/Claims/components/ClaimCard.tsx
- [x] T007 [US1] Remove expandedStance state and related handlers from ClaimCard in src/pages/Claims/components/ClaimCard.tsx
- [x] T008 [US1] Remove unused expandedStance state from Claims page in src/pages/Claims/index.tsx (if present)

**Checkpoint**: Claim cards show only essential info; evidence button navigates to /claims/:id/evidence

---

## Phase 4: User Story 2 - Navigate to Expert Evidence Detail Page (Priority: P1) 🎯 MVP

**Goal**: Users can click evidence button and navigate to dedicated evidence page with claim title and back navigation

**Independent Test**: Click "See What Experts Say" on any claim card, verify navigation to /claims/:id/evidence, verify claim title displayed, verify back button returns to claims list

### Implementation for User Story 2

- [x] T009 [US2] Implement loading state with Skeleton components in src/pages/ClaimEvidence.tsx
- [x] T010 [US2] Implement error state with "Claim Not Found" message and link to /claims in src/pages/ClaimEvidence.tsx
- [x] T011 [US2] Display claim title at top of evidence page in src/pages/ClaimEvidence.tsx
- [x] T012 [US2] Add back button with navigate(-1) in src/pages/ClaimEvidence.tsx
- [x] T013 [US2] Add responsive container layout with mobile-first Tailwind classes in src/pages/ClaimEvidence.tsx

**Checkpoint**: Navigation works end-to-end; evidence page shows claim title with back navigation

---

## Phase 5: User Story 3 - View Evidence Organized by Stance (Priority: P2)

**Goal**: Users see papers grouped into "Supporting Evidence" and "Contradicting Evidence" sections with clear visual separation

**Independent Test**: Navigate to evidence page for claim with papers, verify Supporting section exists with correct papers, verify Contradicting section exists with correct papers, verify visual separation between sections

### Implementation for User Story 3

- [x] T014 [P] [US3] Create filter logic to separate publications by stance (supporting/contradicting) in src/pages/ClaimEvidence.tsx
- [x] T015 [US3] Add "Supporting Evidence" section heading and container in src/pages/ClaimEvidence.tsx
- [x] T016 [US3] Add "Contradicting Evidence" section heading and container in src/pages/ClaimEvidence.tsx
- [x] T017 [US3] Handle empty state when claim has no papers in src/pages/ClaimEvidence.tsx
- [x] T018 [US3] Handle single-stance state (only supporting OR only contradicting papers) in src/pages/ClaimEvidence.tsx

**Checkpoint**: Papers are grouped by stance with clear visual separation

---

## Phase 6: User Story 4 - View Individual Paper Details (Priority: P2)

**Goal**: Users see full paper details (title, authors, journal, year, classifications, reasoning, DOI/links) for each paper

**Independent Test**: View any paper on evidence page, verify title/authors/journal/year displayed, verify expert classifications visible (if exist), verify links to DOI/PubMed visible (if exist)

### Implementation for User Story 4

- [x] T019 [US4] Reuse ClaimPublicationsExpanded component to display papers in each stance section in src/pages/ClaimEvidence.tsx
- [x] T020 [US4] Pass correct props (publications, links, isExpert, user, expertProfiles) to ClaimPublicationsExpanded in src/pages/ClaimEvidence.tsx
- [x] T021 [US4] Fetch expert profiles for display names in paper classifications in src/pages/ClaimEvidence.tsx
- [x] T022 [US4] Handle papers with missing optional fields (authors, abstract, doi, url) gracefully in src/pages/ClaimEvidence.tsx

**Checkpoint**: All paper details display correctly with expert classifications

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive design verification, edge cases

- [x] T023 [P] Add semantic HTML structure (main, article, section) with ARIA labels in src/pages/ClaimEvidence.tsx
- [x] T024 [P] Add aria-label to back button ("Return to claims list") in src/pages/ClaimEvidence.tsx
- [ ] T025 Verify mobile responsiveness at 375px, 768px, 1024px widths for evidence page
- [x] T026 Remove any unused imports from ClaimCard after simplification in src/pages/Claims/components/ClaimCard.tsx
- [x] T027 Run npm run lint and fix any linting errors
- [ ] T028 Manual testing: Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001 completion - BLOCKS all content implementation
- **User Story 1 (Phase 3)**: Depends on Setup (T002 for route) - Can start immediately for ClaimCard changes
- **User Story 2 (Phase 4)**: Depends on Foundational (T003 for data hook) - Evidence page content
- **User Story 3 (Phase 5)**: Depends on User Story 2 completion - Requires evidence page structure
- **User Story 4 (Phase 6)**: Depends on User Story 3 completion - Requires stance sections
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent of other stories - modifies ClaimCard only
- **User Story 2 (P1)**: Independent of US1 - creates evidence page structure
- **User Story 3 (P2)**: Depends on US2 (evidence page structure must exist)
- **User Story 4 (P2)**: Depends on US3 (stance sections must exist)

### Parallel Opportunities

Within Setup (Phase 1):
- T001 and T002 can run in parallel (different files)

Within User Story 1:
- T004, T005, T006, T007 are all in ClaimCard.tsx - run sequentially
- T008 can run in parallel with ClaimCard changes (different file)

Within User Story 3:
- T014 can start in parallel with other setup work

Within Polish (Phase 7):
- T023 and T024 can run in parallel
- T025 depends on all implementation complete

---

## Parallel Example: Setup Phase

```bash
# Launch Setup tasks in parallel:
Task: "Create ClaimEvidence page component shell in src/pages/ClaimEvidence.tsx"
Task: "Add route /claims/:id/evidence with React.lazy() code splitting in src/App.tsx"
```

---

## Parallel Example: User Story 1 + User Story 2 (After Foundational)

```bash
# User Story 1 and 2 can be worked in parallel since they modify different files:
# Developer A: ClaimCard simplification (T004-T008)
# Developer B: Evidence page content (T009-T013)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 - Simplified cards (T004-T008)
4. Complete Phase 4: User Story 2 - Navigation works (T009-T013)
5. **STOP and VALIDATE**: Both P1 stories complete, users can navigate between simplified cards and evidence page
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Route and data hook ready
2. Add User Story 1 → Claim cards simplified → Can demo/test
3. Add User Story 2 → Navigation works end-to-end → MVP complete!
4. Add User Story 3 → Papers organized by stance → Deploy/Demo
5. Add User Story 4 → Full paper details → Feature complete
6. Polish → Accessibility and cleanup → Production ready

### Single Developer Strategy

1. T001 → T002 → T003 (Setup + Foundation)
2. T004 → T005 → T006 → T007 → T008 (User Story 1 - ClaimCard)
3. T009 → T010 → T011 → T012 → T013 (User Story 2 - Evidence page structure)
4. T014 → T015 → T016 → T017 → T018 (User Story 3 - Stance sections)
5. T019 → T020 → T021 → T022 (User Story 4 - Paper details)
6. T023 → T024 → T025 → T026 → T027 → T028 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are both P1 (MVP) - complete both before considering feature shippable
- US3 and US4 are P2 (enhancement) - add value but not required for initial release
- No test tasks included (not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
