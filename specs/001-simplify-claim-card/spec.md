# Feature Specification: Simplified Claim Card with Expert Evidence Page

**Feature Branch**: `001-simplify-claim-card`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "we want to simplify the claim card, only to show the classificatoin chip, the votes, the share button and the title. Hide the reported to support or disprove papers. instead use a button that says learn what experts say (or something like that) and structuraly show information step by step for each stance, and for each paper with the information. that will happen in a new page that can show everything with enough page, where the user can go back to the previous page as it was."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Simplified Claim Cards (Priority: P1)

Users viewing the claims list need to quickly scan and understand multiple claims without information overload. They should see only the essential information (classification, votes, title) to make quick decisions about which claims interest them.

**Why this priority**: This is the foundation of the feature. The simplified card view is what users see first and must work independently of the detailed view to deliver value (faster scanning, less visual clutter).

**Independent Test**: Can be fully tested by loading the claims list and verifying that only classification chips, vote counts, share buttons, and titles are visible. Users can scan multiple claims quickly without seeing detailed evidence information.

**Acceptance Scenarios**:

1. **Given** a user is viewing the claims list, **When** they see a claim card, **Then** they see the classification chip, vote count, share button, and claim title prominently displayed
2. **Given** a user is viewing a claim card, **When** they look at the card, **Then** the supporting/contradicting papers section is hidden from view
3. **Given** a user is viewing a claim card, **When** they want to learn more about expert evidence, **Then** they see a clear button labeled "Learn What Experts Say" or similar
4. **Given** a user is viewing a simplified claim card, **When** they can vote on the claim, **Then** the vote button remains functional and the count updates immediately

---

### User Story 2 - Navigate to Expert Evidence Detail Page (Priority: P1)

Users who want to understand the evidence behind a claim need to access detailed information organized by stance. Clicking the evidence button should take them to a dedicated page where they can explore supporting and contradicting papers in depth.

**Why this priority**: This is also P1 because it delivers the core value proposition alongside the simplified card. Without this, users have no way to access the hidden evidence information. Both stories together form the MVP.

**Independent Test**: Can be fully tested by clicking the "Learn What Experts Say" button on any claim card and verifying navigation to a new page that displays the claim title and organized evidence sections.

**Acceptance Scenarios**:

1. **Given** a user is viewing a claim card, **When** they click the "Learn What Experts Say" button, **Then** they navigate to a new page dedicated to that claim's evidence
2. **Given** a user navigates to the evidence detail page, **When** the page loads, **Then** they see the claim title clearly displayed at the top
3. **Given** a user is on the evidence detail page, **When** they want to return, **Then** they see a clear back button or navigation option
4. **Given** a user clicks the back button on the evidence detail page, **When** navigation completes, **Then** they return to the claims list exactly as they left it (scroll position, filters, etc.)

---

### User Story 3 - View Evidence Organized by Stance (Priority: P2)

Users on the evidence detail page need to see papers organized clearly by stance (supporting vs. contradicting). Each stance should be presented in its own section with clear visual separation and information hierarchy.

**Why this priority**: This enhances the detail page experience but the page can function with basic organization. The P1 stories establish the navigation; this story improves the presentation quality.

**Independent Test**: Can be fully tested by navigating to any evidence detail page and verifying that papers are grouped into "Supporting Evidence" and "Contradicting Evidence" sections with clear visual separation.

**Acceptance Scenarios**:

1. **Given** a user is viewing the evidence detail page, **When** the page displays papers, **Then** supporting papers are grouped in a clearly labeled "Supporting Evidence" section
2. **Given** a user is viewing the evidence detail page, **When** the page displays papers, **Then** contradicting papers are grouped in a clearly labeled "Contradicting Evidence" section
3. **Given** a user is viewing an evidence section, **When** they look at the section, **Then** they can clearly distinguish it from other sections through visual design (headings, spacing, or dividers)
4. **Given** a user is viewing papers within a stance section, **When** they scan the list, **Then** each paper is visually separated from others in the same section

---

### User Story 4 - View Individual Paper Details (Priority: P2)

Users exploring the evidence need to see detailed information for each paper including title, authors, journal, publication year, expert classifications, and any expert reasoning or notes. This information should be presented in a structured, easy-to-read format.

**Why this priority**: This completes the detail page experience. While important, users can still navigate and understand the basic structure (P2 stories) before all paper details are displayed.

**Independent Test**: Can be fully tested by viewing any paper entry on the evidence detail page and verifying all key fields (title, authors, journal, year, expert classifications, reasoning) are displayed clearly.

**Acceptance Scenarios**:

1. **Given** a user is viewing a paper entry, **When** they read the paper details, **Then** they see the paper title, authors, journal name, and publication year
2. **Given** a user is viewing a paper entry with expert classifications, **When** the classifications exist, **Then** they see labels such as "High Quality", "Observational Study", "Women Not Included", etc.
3. **Given** a user is viewing a paper entry with expert reasoning, **When** reasoning or notes exist, **Then** they see the expert's explanation or notes about why this paper supports/contradicts the claim
4. **Given** a user is viewing a paper entry, **When** they want to access the full paper, **Then** they see links to DOI, PubMed, or other sources where available

---

### Edge Cases

- What happens when a claim has no papers at all (neither supporting nor contradicting)?
- What happens when a claim has papers for only one stance (e.g., only supporting papers, no contradicting papers)?
- What happens when a paper has no expert classifications or reasoning (minimal data)?
- What happens when the user navigates to the evidence detail page directly via URL (not from the claims list)?
- What happens if the claim or paper data fails to load on the evidence detail page?
- What happens if the user's session expires while viewing the evidence detail page?
- What happens on mobile devices with limited screen width?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display simplified claim cards showing only classification chip, vote count, share button, and claim title
- **FR-002**: System MUST hide the "Reported to Support" and "Reported to Disprove" paper sections from the claim card view
- **FR-003**: System MUST display a clear call-to-action button (e.g., "Learn What Experts Say") on each claim card to access detailed evidence
- **FR-004**: Users MUST be able to navigate to a dedicated evidence detail page by clicking the evidence button
- **FR-005**: System MUST maintain the user's previous state (scroll position, filters, etc.) when they return from the evidence detail page to the claims list
- **FR-006**: Evidence detail page MUST display the claim title prominently at the top
- **FR-007**: Evidence detail page MUST organize papers into "Supporting Evidence" and "Contradicting Evidence" sections
- **FR-008**: System MUST display each paper with its title, authors, journal, publication year, expert classifications, and expert reasoning (when available)
- **FR-009**: System MUST provide a clear back navigation option on the evidence detail page to return to the claims list
- **FR-010**: System MUST handle edge cases gracefully (no papers, single stance only, missing data)
- **FR-011**: Evidence detail page MUST be responsive and functional on mobile devices
- **FR-012**: System MUST support direct URL access to evidence detail pages (deep linking)
- **FR-013**: Voting functionality on simplified claim cards MUST remain fully functional
- **FR-014**: Share button functionality on simplified claim cards MUST remain fully functional
- **FR-015**: System MUST maintain all existing authentication and authorization rules for viewing claims and evidence

### Key Entities

- **Claim Card**: Visual representation of a claim showing essential information (classification, votes, title, evidence button). Hides detailed paper information.
- **Evidence Detail Page**: Dedicated page displaying complete evidence information for a single claim, organized by stance.
- **Stance Section**: Grouping container for papers that either support or contradict the claim. Contains paper entries.
- **Paper Entry**: Individual paper information including bibliographic details, expert classifications, and expert reasoning.
- **Evidence Button**: Interactive element on the claim card that navigates to the evidence detail page.
- **Navigation State**: User's position and context in the claims list (scroll position, filters, selected claim) that must be preserved across navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can scan claim cards 40% faster due to reduced visual complexity (measured by time to identify claim classifications across 10 claims)
- **SC-002**: Evidence detail page loads completely within 2 seconds on standard broadband connections
- **SC-003**: 95% of users successfully navigate to the evidence detail page and return to the claims list without losing their place
- **SC-004**: Users can view and interact with the simplified claim card on mobile devices with screens as small as 375px width
- **SC-005**: Evidence detail page successfully displays papers organized by stance for 100% of claims (gracefully handling edge cases like no papers or single stance)
- **SC-006**: 90% of users can identify and click the evidence button on first visit without assistance
- **SC-007**: Zero regressions in existing functionality (voting, sharing, claim editing continue to work as before)
- **SC-008**: Evidence detail page maintains readable text and proper spacing on all viewport sizes (mobile, tablet, desktop)

## Assumptions

- **A-001**: The evidence detail page will use standard React routing (React Router), following existing navigation patterns in the application
- **A-002**: Paper data structure (title, authors, journal, year, classifications, reasoning) already exists in the database and is accessible via existing queries
- **A-003**: The evidence button will replace the expandable "Reported to Support/Disprove" sections entirely (they will be removed, not just hidden)
- **A-004**: Back navigation will use browser history, allowing both the back button and a dedicated UI element to work
- **A-005**: The evidence detail page will maintain the same authentication/authorization model as the claims list (users don't need additional permissions)
- **A-006**: "Step by step" organization means papers are presented sequentially within each stance section, not a wizard or multi-step process
- **A-007**: Existing actions on the claim card (vote, share, edit title, view comments, add paper) remain accessible either on the simplified card or the detail page
- **A-008**: The classification chip, vote count, and share button UI/UX remain unchanged from current implementation
- **A-009**: Mobile devices should display evidence in a single-column layout with stance sections stacked vertically
- **A-010**: Evidence detail page URL structure will follow pattern `/claims/:claimId/evidence` or similar RESTful convention
