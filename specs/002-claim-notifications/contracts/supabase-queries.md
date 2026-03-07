# Supabase Query Contracts: Claim Subscription Notifications

**Branch**: `002-claim-notifications` | **Date**: 2026-02-27

This document defines all Supabase client queries and mutations used by this feature, with expected inputs, outputs, and error conditions.

---

## Subscriptions

### Get Subscription Status for a Claim

**Hook**: `useClaimSubscription(claimId: string)`
**Purpose**: Check if the current user is subscribed to a specific claim.

```typescript
// Query
const { data } = await supabase
  .from('claim_subscriptions')
  .select('id')
  .eq('claim_id', claimId)
  .eq('user_id', user.id)
  .maybeSingle()

// Returns: { id: string } | null
// null = not subscribed, { id } = subscribed
```

**TanStack Query key**: `['claim-subscription', claimId, userId]`

---

### Subscribe to a Claim

**Mutation**: `useSubscribeClaim()`
**Purpose**: Create a subscription for the current user on a claim.

```typescript
// Mutation
const { error } = await supabase
  .from('claim_subscriptions')
  .insert({ claim_id: claimId, user_id: user.id })

// Success: invalidate ['claim-subscription', claimId, userId]
// Error: if already subscribed, Supabase returns unique violation — treat as no-op
```

**Optimistic update**: Immediately reflect subscribed state in UI before server confirms.

---

### Unsubscribe from a Claim

**Mutation**: `useUnsubscribeClaim()`
**Purpose**: Remove a subscription for the current user on a claim.

```typescript
// Mutation
const { error } = await supabase
  .from('claim_subscriptions')
  .delete()
  .eq('claim_id', claimId)
  .eq('user_id', user.id)

// Success: invalidate ['claim-subscription', claimId, userId]
```

**Optimistic update**: Immediately reflect unsubscribed state in UI before server confirms.

---

## Notifications

### Fetch Notification Inbox

**Hook**: `useNotifications()`
**Purpose**: Fetch all notifications for the current user, ordered by most recent first.

```typescript
// Query (paginated, 20 per page)
const { data } = await supabase
  .from('notifications')
  .select('id, claim_id, type, message, read, created_at, claims(title)')
  .eq('recipient_user_id', user.id)
  .order('created_at', { ascending: false })
  .range(offset, offset + 19)

// Returns: Array of notification rows with embedded claim title
```

**TanStack Query key**: `['notifications', userId, page]`
**Stale time**: 0 (always fresh — Realtime handles live updates)

---

### Fetch Unread Count

**Hook**: `useUnreadNotificationCount()`
**Purpose**: Get the count of unread notifications for the badge display.

```typescript
// Query
const { count } = await supabase
  .from('notifications')
  .select('id', { count: 'exact', head: true })
  .eq('recipient_user_id', user.id)
  .eq('read', false)

// Returns: number
```

**TanStack Query key**: `['notifications-unread-count', userId]`
**Live update**: Supabase Realtime channel supplements this with INSERT events.

---

### Mark a Single Notification as Read

**Mutation**: triggered when user clicks a notification

```typescript
// Mutation
const { error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId)
  .eq('recipient_user_id', user.id)  // RLS enforcement at query level too

// Success: invalidate ['notifications', userId] and ['notifications-unread-count', userId]
```

---

### Mark All Notifications as Read

**Mutation**: triggered by "Mark all as read" button

```typescript
// Mutation
const { error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('recipient_user_id', user.id)
  .eq('read', false)

// Success: invalidate ['notifications', userId] and ['notifications-unread-count', userId]
```

---

## Realtime Subscription Contract

**Purpose**: Receive live notification inserts to update badge count without polling.

```typescript
// Set up in useUnreadNotificationCount hook or a dedicated useNotificationsRealtime hook
const channel = supabase
  .channel('notifications-live')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_user_id=eq.${user.id}`,
    },
    (payload) => {
      // Increment local unread count state
      // Or: invalidate ['notifications-unread-count', userId] query
    }
  )
  .subscribe()

// Cleanup: channel.unsubscribe() on component unmount
```

---

## Error Handling Contracts

| Operation | Error Condition | Handling |
|-----------|----------------|---------|
| Subscribe | Already subscribed (unique violation) | Treat as success, no-op |
| Subscribe | Not authenticated | Redirect to sign-in |
| Unsubscribe | Subscription not found | Treat as success, no-op |
| Fetch notifications | Network error | Show empty state with retry |
| Mark as read | Row not found (already read) | Treat as success, no-op |
| Mark all as read | No unread notifications | Treat as success, no-op |

---

## TypeScript Types

```typescript
type NotificationType = 'new_paper' | 'new_review' | 'status_changed'

interface Notification {
  id: string
  claim_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
  claims?: { title: string }
}

interface ClaimSubscription {
  id: string
  user_id: string
  claim_id: string
  created_at: string
}
```
