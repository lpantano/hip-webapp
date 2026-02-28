# Research: Claim Subscription Notifications

**Branch**: `002-claim-notifications` | **Date**: 2026-02-27
**Phase**: 0 — Research & Unknowns Resolution

---

## Decision 1: Notification Delivery Mechanism

**Decision**: Use PostgreSQL database triggers to insert notification rows when qualifying events occur, plus Supabase Realtime to push live updates to the client.

**Rationale**:
- The project already uses 6+ PostgreSQL triggers for related concerns (contribution tracking, vote counts, expert status changes). Adding notification triggers is consistent with this established pattern.
- Triggers are server-side and fire atomically within the same transaction as the event — no risk of missed notifications if the client is offline.
- Supabase Realtime (supabase.channel) can subscribe to inserts on the `notifications` table filtered by `recipient_user_id = auth.uid()`, delivering live badge count updates without polling. This is not currently used in the codebase but is straightforward to add.
- Alternative considered: client-side polling with TanStack Query `refetchInterval`. Rejected because it is inefficient at scale and adds unnecessary load; Realtime is the cleaner approach.
- Alternative considered: Supabase Edge Functions / webhooks. Rejected as over-engineering for a purely in-app notification system — triggers are simpler and sufficient.

---

## Decision 2: Notification Inbox UI Pattern

**Decision**: Implement a notification bell icon in the Header's right-side container (between social icons and the user menu), opening a dropdown panel (popover) with the notification list. No separate page required.

**Rationale**:
- The Header right section already contains social icons, a hamburger menu, and a UserMenu component. The notification bell fits naturally between the social icons and the user/auth controls (after line 80 in Header.tsx).
- A popover/dropdown panel is the industry-standard "gold standard" pattern (GitHub, Slack, Notion) — accessible, dismissable, and doesn't disrupt the user's current context.
- Alternative considered: A dedicated `/notifications` page. Rejected as unnecessary complexity for a feature where the primary action is to click through to the relevant claim. A dropdown inbox achieves the same outcome without an extra route.
- Alternative considered: A slide-out drawer. Valid pattern but heavier than needed for the expected notification volume. A popover is simpler and aligns with the existing shadcn/ui component set.

---

## Decision 3: Subscribe Button Placement

**Decision**: Place the Subscribe/Unsubscribe button in the ClaimDetail page header area, near the claim title and vote/share controls.

**Rationale**:
- ClaimDetail is the natural context where a user decides to follow a claim. The button should be in the primary action zone, visible without scrolling.
- The claim detail page already has an action cluster (vote button, share button). Subscribe joins this cluster.
- For non-authenticated users, clicking Subscribe triggers the existing sign-in prompt pattern (same as voting).

---

## Decision 4: Self-Notification Exclusion

**Decision**: Implement self-exclusion at the database trigger level by checking `NEW.submitted_by != subscriber.user_id` (for papers) and `NEW.expert_user_id != subscriber.user_id` (for reviews) before inserting a notification row.

**Rationale**:
- Self-exclusion at the trigger level is atomic and cannot be bypassed — it is more reliable than client-side filtering.
- Consistent with how the existing `claim_vote_count_trigger` already uses row-level logic to ensure correctness.

---

## Decision 5: Status Change Detection

**Decision**: Track evidence_status changes specifically (not the `status` field) as the notification trigger for status-change notifications.

**Rationale**:
- The `evidence_status` field represents the scientific assessment of a claim (Evidence Supports, Evidence Disproves, Inconclusive, Awaiting Evidence) — the field users care about.
- The `status` field tracks workflow state (proposed, under review) which is an internal concern less relevant to subscribers.
- The trigger uses `OLD.evidence_status IS DISTINCT FROM NEW.evidence_status` to fire only on actual changes.

---

## Decision 6: New Table Design

**Decision**: Add two new tables: `claim_subscriptions` and `notifications`.

**Rationale**:
- `claim_subscriptions`: Clean separation of subscription state from other user data. Simple two-column join (user_id, claim_id) with created_at.
- `notifications`: Persisted notification records per user. Stores: recipient_user_id, claim_id, type (enum), message, read (boolean), created_at.
- All existing tables remain untouched — additive change only.
- RLS policies mirror the pattern already established for user-owned data (users can only read/update their own rows).

---

## Decision 7: Notification Type Enum

**Decision**: Use a PostgreSQL enum `notification_type` with values: `new_paper`, `new_review`, `status_changed`.

**Rationale**:
- Enum enforces valid values at the database level, consistent with existing enums (`claim_status`, `evidence_status_type`, `publication_stance`).
- Three values map directly to the three triggering events defined in the spec (FR-004, FR-005, FR-006).

---

## Decision 8: Realtime vs Polling for Badge Count

**Decision**: Use Supabase Realtime channel subscription on the `notifications` table (INSERT events, filtered by recipient_user_id) to update the unread count badge in real time, with a fallback to TanStack Query polling at a 30-second interval.

**Rationale**:
- Realtime gives the user instant badge updates without page refresh.
- A polling fallback ensures correctness even if the Realtime websocket drops.
- 30 seconds is consistent with the SC-002 success criterion (notifications visible within 30 seconds).
- The initial unread count is fetched once on mount via TanStack Query and updated in local state by Realtime events.

---

## Resolved: No Third-Party Services Needed

All functionality is achievable within the existing Supabase + React stack:
- PostgreSQL triggers for event detection
- New tables for persistence
- Supabase Realtime for live updates
- TanStack Query for data fetching
- shadcn/ui Popover + Badge for UI
- No new npm dependencies required beyond what is already installed
