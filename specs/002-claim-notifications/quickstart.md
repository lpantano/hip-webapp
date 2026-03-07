# Quickstart: Claim Subscription Notifications

**Branch**: `002-claim-notifications` | **Date**: 2026-02-27

This guide enables a developer to understand and implement this feature end-to-end.

---

## Feature Overview

Allow authenticated users to subscribe to health claims and receive in-app notifications when qualifying events occur: a new paper is added, an expert submits/updates a review, or the claim's evidence status changes.

---

## Architecture at a Glance

```
User clicks Subscribe on ClaimDetail
         │
         ▼
claim_subscriptions table (new row)

Qualifying event occurs (paper added / review submitted / status changed)
         │
         ▼
PostgreSQL trigger fires
         │
         ▼
notifications table (one row per subscribed user, excluding event actor)
         │
         ├──► Supabase Realtime → client receives INSERT event → badge count increments
         └──► TanStack Query (30s polling fallback)

User opens Notification Bell (Header)
         │
         ▼
NotificationInbox popover (list of notifications)
         │
User clicks notification → navigate to claim + mark notification as read
User clicks "Mark all as read" → bulk update
```

---

## New Files to Create

### Database Migration

```
supabase/migrations/[timestamp]_add_claim_notifications.sql
```

Contents:
1. `CREATE TYPE notification_type AS ENUM ('new_paper', 'new_review', 'status_changed')`
2. `CREATE TABLE claim_subscriptions` (with indexes + RLS)
3. `CREATE TABLE notifications` (with indexes + RLS)
4. `CREATE FUNCTION notify_subscribers_new_paper()` + trigger
5. `CREATE FUNCTION notify_subscribers_new_review()` + trigger
6. `CREATE FUNCTION notify_subscribers_status_change()` + trigger

### React Hooks

```
src/hooks/useClaimSubscription.ts      — subscribe/unsubscribe + status query
src/hooks/useNotifications.ts          — inbox fetch, unread count, mark-read mutations
src/hooks/useNotificationsRealtime.ts  — Supabase Realtime channel for live badge updates
```

### React Components

```
src/components/notifications/NotificationBell.tsx       — bell icon + unread badge (goes in Header)
src/components/notifications/NotificationInbox.tsx      — popover list of notifications
src/components/notifications/NotificationItem.tsx       — single notification row
src/components/claims/SubscribeButton.tsx               — subscribe/unsubscribe toggle for ClaimDetail
```

---

## Integration Points in Existing Files

### [src/components/layout/Header.tsx](../../src/components/layout/Header.tsx)

Add `<NotificationBell />` in the right-side container, after social icons and before the hamburger menu (approximately after line 80). Render only when `user` is authenticated.

### [src/pages/ClaimDetail.tsx](../../src/pages/ClaimDetail.tsx)

Add `<SubscribeButton claimId={claim.id} />` in the claim action cluster (near vote and share buttons, approximately around line 200–250).

---

## Key Implementation Notes

### Subscribe Button

- Shows "Subscribe" (bell outline icon) when not subscribed, "Subscribed" (bell filled icon) when subscribed.
- Use optimistic updates via TanStack Query `useMutation` — flip state immediately, revert on error.
- Non-authenticated users: clicking subscribe opens the existing sign-in prompt (same as vote button pattern).
- Query key: `['claim-subscription', claimId, userId]`

### Notification Bell

- Renders a `Bell` icon (lucide-react, already available) with a numeric badge overlay when `unreadCount > 0`.
- Badge uses the existing shadcn/ui `Badge` component with a red/destructive variant.
- Opens a `Popover` (shadcn/ui, already in project) containing `NotificationInbox`.
- On popover open, optionally trigger mark-all-read (design decision: mark as read only when user clicks individual items, not on panel open).

### Notification Inbox

- Renders a scrollable list of `NotificationItem` components.
- Shows "No notifications" empty state when list is empty.
- "Mark all as read" button at the top of the list.
- Pagination: load first 20, "Load more" button for additional pages.
- Each item: icon representing type (📄 paper, 🔬 review, 📊 status), message text, relative timestamp, bold/normal weight for unread/read state.

### Realtime Integration

- In `useNotificationsRealtime`, set up a `supabase.channel()` subscription on `notifications` table INSERT events filtered by `recipient_user_id`.
- On INSERT event: invalidate `['notifications-unread-count', userId]` query to refresh badge count.
- Clean up channel subscription on unmount.
- This hook is called once from `NotificationBell` or a top-level layout component.

### Database Triggers

Each trigger function follows this pattern:
```sql
CREATE OR REPLACE FUNCTION notify_subscribers_new_paper()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO notifications (recipient_user_id, claim_id, type, message)
  SELECT
    cs.user_id,
    NEW.claim_id,
    'new_paper',
    'A new paper was added to a claim you follow: ' || c.title
  FROM claim_subscriptions cs
  JOIN claims c ON c.id = NEW.claim_id
  WHERE cs.claim_id = NEW.claim_id
    AND cs.user_id != COALESCE(NEW.submitted_by, '00000000-0000-0000-0000-000000000000');
  RETURN NEW;
END;
$$;
```

---

## Testing Checklist

### P1 - Subscribe/Unsubscribe

- [ ] Subscribe button visible on ClaimDetail when authenticated
- [ ] Button state reflects current subscription status on load
- [ ] Subscribing creates a row in `claim_subscriptions`
- [ ] Unsubscribing removes the row
- [ ] Non-authenticated user sees sign-in prompt on click
- [ ] Button state is optimistic (updates immediately on click)

### P2 - Notifications Generated

- [ ] Adding a paper to a subscribed claim generates a notification for all subscribers
- [ ] Submitting a review generates a notification for all subscribers
- [ ] Updating a review generates a notification for all subscribers
- [ ] Changing evidence_status generates a notification for all subscribers
- [ ] No notification generated for the user who triggered the event
- [ ] No notification generated for non-subscribed users

### P3 - Notification Inbox

- [ ] Bell icon visible in Header when authenticated
- [ ] Badge shows correct unread count
- [ ] Badge disappears when unread count is 0
- [ ] Clicking bell opens notification popover
- [ ] Notifications list in reverse chronological order
- [ ] Clicking a notification navigates to the claim and marks it read
- [ ] "Mark all as read" clears unread count and badge
- [ ] Empty state shown when no notifications exist
- [ ] Realtime: badge updates within 30 seconds of a new notification

---

## Run Locally

```bash
# Start development server
npm run dev

# Apply migration (requires Supabase CLI)
npx supabase db push

# Lint check
npm run lint
```
