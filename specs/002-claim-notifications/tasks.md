# Tasks: Claim Subscription Notifications

**Input**: Design documents from `/specs/002-claim-notifications/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and Supabase type updates — the foundation all user stories depend on.

- [x] T001 Create Supabase migration file `supabase/migrations/20260227120000_add_claim_notifications.sql` — add `notification_type` enum, `claim_subscriptions` table with indexes and RLS, `notifications` table with indexes and RLS (see data-model.md for full schema)
- [x] T002 Add three PostgreSQL trigger functions and triggers in `supabase/migrations/20260227120000_add_claim_notifications.sql`: `notify_subscribers_new_paper` (AFTER INSERT on publications), `notify_subscribers_new_review` (AFTER INSERT OR UPDATE on publication_scores), `notify_subscribers_status_change` (AFTER UPDATE on claims where evidence_status changes)
- [x] T003 Update `src/integrations/supabase/types.ts` with TypeScript types for `claim_subscriptions` and `notifications` tables and `notification_type` enum

**Checkpoint**: Database schema applied, types updated — all user story phases can now begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared TypeScript types used by all hooks and components.

**⚠️ CRITICAL**: Complete before any user story implementation.

- [x] T004 Define shared TypeScript interfaces `Notification`, `ClaimSubscription`, and `NotificationType` in `src/types/notifications.ts` (see contracts/supabase-queries.md for exact shape)

**Checkpoint**: Shared types available — hooks and components can now be built.

---

## Phase 3: User Story 1 — Subscribe to a Claim (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can subscribe and unsubscribe from a claim on the ClaimDetail page, with state persisted and reflected immediately in the UI.

**Independent Test**: Navigate to a claim detail page while logged in → click Subscribe → verify button changes to Subscribed state → refresh page → verify state persists → click Unsubscribe → verify button returns to default. Log out → verify clicking Subscribe shows sign-in prompt.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create hook `src/hooks/useClaimSubscription.ts` — exports `useClaimSubscription(claimId)` returning `{ isSubscribed, isLoading, subscribe, unsubscribe }` using TanStack Query with query key `['claim-subscription', claimId, userId]`, optimistic updates on subscribe/unsubscribe mutations (see contracts/supabase-queries.md for exact Supabase queries)
- [x] T006 [P] [US1] Create component `src/components/claims/SubscribeButton.tsx` — renders Bell icon (lucide-react) toggle button showing "Subscribe" / "Subscribed" states, calls `useClaimSubscription`, redirects unauthenticated users to sign-in using existing auth pattern
- [x] T007 [US1] Integrate `<SubscribeButton claimId={claim.id} />` into `src/pages/ClaimDetail.tsx` — place in the claim action cluster near vote and share buttons, render only when user is authenticated and claim is loaded

**Checkpoint**: US1 complete — subscribe/unsubscribe fully functional and independently testable.

---

## Phase 4: User Story 2 — Receive In-App Notifications (Priority: P2)

**Goal**: Subscribed users receive persistent in-app notifications in a notification inbox (popover) accessible from the Header when qualifying events occur on followed claims.

**Independent Test**: Subscribe to a claim → trigger an event (add a paper, submit a review, or change evidence status via admin) → open notification bell in header → verify notification appears with correct message and type → verify it links to the correct claim.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create hook `src/hooks/useNotifications.ts` — exports `useNotifications(page?)` returning paginated notifications list (20 per page, ordered by `created_at DESC`) joined with `claims(title)`, using TanStack Query key `['notifications', userId, page]`; also exports `useUnreadNotificationCount()` returning count with query key `['notifications-unread-count', userId]` (see contracts/supabase-queries.md)
- [x] T009 [P] [US2] Create component `src/components/notifications/NotificationItem.tsx` — renders a single notification row with: type icon (lucide-react FileText for new_paper, FlaskConical for new_review, BarChart2 for status_changed), message text, relative timestamp, bold text for unread state, click handler that navigates to the linked claim
- [x] T010 [US2] Create component `src/components/notifications/NotificationInbox.tsx` — renders scrollable list of `NotificationItem` components, "Mark all as read" button at top, empty state message when no notifications, "Load more" button for pagination; uses `useNotifications` hook
- [x] T011 [US2] Create component `src/components/notifications/NotificationBell.tsx` — renders lucide-react `Bell` icon with inline badge showing unread count (hidden when count is 0), wraps `NotificationInbox` in a shadcn/ui `Popover`; uses `useUnreadNotificationCount` hook; only renders when user is authenticated
- [x] T012 [US2] Integrate `<NotificationBell />` into `src/components/layout/Header.tsx` — placed after social media icons and before the mobile hamburger menu, render only when user is authenticated

**Checkpoint**: US2 complete — notification inbox fully functional; new events on subscribed claims generate visible notifications.

---

## Phase 5: User Story 3 — Manage Notifications (Priority: P3)

**Goal**: Users can mark notifications as read individually or all at once, with the unread badge accurately reflecting the true count at all times.

**Independent Test**: With unread notifications present → verify badge shows correct count → click a notification → verify it navigates to claim and notification becomes read → verify badge decrements → click "Mark all as read" → verify all notifications show as read and badge disappears.

### Implementation for User Story 3

- [x] T013 [P] [US3] Add `useMarkNotificationRead(notificationId)` and `useMarkAllNotificationsRead()` mutations to `src/hooks/useNotifications.ts` — each calls the appropriate Supabase update query and invalidates `['notifications', userId]` and `['notifications-unread-count', userId]` query keys
- [x] T014 [P] [US3] Create hook `src/hooks/useNotificationsRealtime.ts` — sets up a `supabase.channel('notifications-live')` subscription on INSERT events for `notifications` table filtered by `recipient_user_id=eq.${user.id}`; on INSERT event, invalidates unread count and notifications queries; cleans up channel on unmount
- [x] T015 [US3] Wire `markAsRead` call into `NotificationItem` click handler in `src/components/notifications/NotificationItem.tsx` — calls `onRead(notification.id)` before navigating to the claim
- [x] T016 [US3] Wire `markAllAsRead` into "Mark all as read" button in `src/components/notifications/NotificationInbox.tsx` — disabled when no unread notifications remain
- [x] T017 [US3] Wire `useNotificationsRealtime` into `src/components/notifications/NotificationBell.tsx` — called inside the component so the Realtime channel is active while the bell is mounted

**Checkpoint**: US3 complete — all three user stories are independently functional and the full feature is end-to-end testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, mobile responsiveness, and error states across all components.

- [x] T018 [P] Add `aria-label` attributes to `NotificationBell.tsx` (dynamic label with unread count), `role="list"` and `role="listitem"` in `NotificationInbox.tsx`; Radix UI Popover handles keyboard navigation natively
- [x] T019 [P] Mobile responsiveness: popover `align="end"` with `w-80` width, `SubscribeButton` uses `hidden sm:inline` for label text — both mobile-friendly without additional changes
- [x] T020 Error state in `NotificationInbox.tsx` — shows "Unable to load notifications" with a "Try again" retry button when query errors
- [x] T021 Lint validated: `npm run lint` returns 0 errors (1 pre-existing warning in main.tsx unrelated to this feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 → T002 → T003 (sequential, same migration file)
- **Foundational (Phase 2)**: Depends on Phase 1 completion (T003 must finish before T004 — types depend on DB schema)
- **User Stories (Phase 3–5)**: All depend on Phase 2 (T004) completion
  - US1 (Phase 3), US2 (Phase 4), US3 (Phase 5) can proceed in priority order
  - US2 and US3 are sequentially dependent (US3 extends US2's hooks and components)
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 1+2. Fully independent.
- **US2 (P2)**: Depends on Phase 1+2. Independent of US1 (no Subscribe button needed to display notifications).
- **US3 (P3)**: Extends US2's hooks and components — depends on US2 tasks T008, T010, T011.

### Within Each User Story

- US1: T005 and T006 can run in parallel → T007 depends on both
- US2: T008 and T009 can run in parallel → T010 depends on T008+T009 → T011 depends on T010 → T012 depends on T011
- US3: T013 and T014 can run in parallel → T015 depends on T013 → T016 depends on T013 → T017 depends on T014

---

## Parallel Example: User Story 1

```
# T005 and T006 can run in parallel (different files):
Task A: "Create useClaimSubscription hook in src/hooks/useClaimSubscription.ts"
Task B: "Create SubscribeButton component in src/components/claims/SubscribeButton.tsx"

# After both complete:
Task C: "Integrate SubscribeButton into src/pages/ClaimDetail.tsx" (T007)
```

## Parallel Example: User Story 2

```
# T008 and T009 can run in parallel:
Task A: "Create useNotifications hook in src/hooks/useNotifications.ts"
Task B: "Create NotificationItem component in src/components/notifications/NotificationItem.tsx"

# After both complete:
Task C: "Create NotificationInbox component" (T010)
# Then T011, T012 in sequence
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004)
3. Complete Phase 3: User Story 1 (T005–T007)
4. **STOP and VALIDATE**: Subscribe/unsubscribe works end-to-end
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → DB schema + types ready
2. US1 → Subscribe button → validate → ship
3. US2 → Notification inbox → validate → ship
4. US3 → Mark read + Realtime → validate → ship
5. Polish → Accessibility + error states → final QA

### Parallel Team Strategy

With two developers after Phase 1+2 complete:
- Developer A: US1 (T005–T007) — subscribe/unsubscribe
- Developer B: US2 hook layer (T008) — notification data layer

US2 UI (T009–T012) and US3 (T013–T017) proceed sequentially after their prerequisites.

---

## Notes

- [P] tasks operate on different files with no shared dependencies — safe to parallelize
- T001–T002 must be in the same migration file — run sequentially
- T003 (applying migration) must complete before any TypeScript work begins
- US2 and US3 share the same hooks file (`useNotifications.ts`) — T013 extends T008's work
- No new npm packages needed — all dependencies already in project
- Run `npm run lint` after each phase to catch type errors early
- Supabase trigger SQL follows the pattern in `specs/002-claim-notifications/data-model.md`
