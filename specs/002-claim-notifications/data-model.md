# Data Model: Claim Subscription Notifications

**Branch**: `002-claim-notifications` | **Date**: 2026-02-27

---

## New Tables

### `claim_subscriptions`

Stores a user's opt-in to follow a specific claim.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | |
| `user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Subscriber |
| `claim_id` | uuid | NOT NULL, FK → claims(id) ON DELETE CASCADE | Followed claim |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Subscription timestamp |

**Constraints**:
- `UNIQUE (user_id, claim_id)` — one subscription per user per claim
- ON DELETE CASCADE on both FK columns — removing a user or claim cleans up subscriptions automatically

**RLS Policies**:
- `SELECT`: `auth.uid() = user_id` — users can only read their own subscriptions
- `INSERT`: `auth.uid() = user_id` — users can only create subscriptions for themselves
- `DELETE`: `auth.uid() = user_id` — users can only delete their own subscriptions

---

### `notifications`

Persisted in-app notification records, one row per event per subscribed user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | |
| `recipient_user_id` | uuid | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Notification recipient |
| `claim_id` | uuid | NOT NULL, FK → claims(id) ON DELETE CASCADE | Associated claim |
| `type` | notification_type | NOT NULL | Enum: new_paper, new_review, status_changed |
| `message` | text | NOT NULL | Human-readable description of the event |
| `read` | boolean | NOT NULL, DEFAULT false | Read/unread state |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Event timestamp |

**RLS Policies**:
- `SELECT`: `auth.uid() = recipient_user_id` — users can only see their own notifications
- `UPDATE`: `auth.uid() = recipient_user_id` — users can only mark their own notifications as read
- No INSERT from client — notifications are created exclusively by database triggers
- No DELETE from client — notifications are retained (soft lifecycle via claim CASCADE)

---

## New Enum

### `notification_type`

```sql
CREATE TYPE notification_type AS ENUM (
  'new_paper',
  'new_review',
  'status_changed'
);
```

---

## New Database Triggers

### Trigger 1: New Paper Notification

**Event**: AFTER INSERT on `publications`
**Fires**: Once per new paper row

**Logic**:
1. Find all subscribers of `publications.claim_id`
2. Exclude the subscriber whose `user_id = NEW.submitted_by` (self-notification exclusion)
3. For each remaining subscriber, INSERT a row into `notifications` with:
   - `type = 'new_paper'`
   - `message = 'A new paper was added to a claim you follow: ' || claim.title`

---

### Trigger 2: New Review Notification

**Event**: AFTER INSERT OR UPDATE on `publication_scores`
**Fires**: Once per review submission or update

**Logic**:
1. Resolve `claim_id` via `publication_scores.publication_id → publications.claim_id`
2. Find all subscribers of that `claim_id`
3. Exclude the subscriber whose `user_id = NEW.expert_user_id`
4. For each remaining subscriber, INSERT a row into `notifications` with:
   - `type = 'new_review'`
   - `message = 'An expert reviewed a paper on a claim you follow: ' || claim.title`

---

### Trigger 3: Status Change Notification

**Event**: AFTER UPDATE on `claims` (when `evidence_status` changes)
**Condition**: `OLD.evidence_status IS DISTINCT FROM NEW.evidence_status`
**Fires**: Once per status change event

**Logic**:
1. Find all subscribers of `NEW.id` (the updated claim)
2. No self-exclusion needed — status changes are system-driven, not user-driven
3. For each subscriber, INSERT a row into `notifications` with:
   - `type = 'status_changed'`
   - `message = 'The evidence status changed on a claim you follow: ' || NEW.title || ' → ' || NEW.evidence_status`

---

## Existing Tables (Read-Only for This Feature)

No changes to existing tables.

| Table | Role in Feature |
|-------|----------------|
| `claims` | Source of claim metadata for notifications; trigger target for status changes |
| `publications` | Trigger source for new_paper notifications |
| `publication_scores` | Trigger source for new_review notifications |
| `auth.users` | Source of user identity for RLS and trigger logic |

---

## State Transitions

### Subscription State

```
[Not Subscribed] --subscribe--> [Subscribed]
[Subscribed] --unsubscribe--> [Not Subscribed]
```

### Notification Read State

```
[Unread] --mark read (single or all)--> [Read]
```
Read state is one-way — there is no "mark unread" in this phase.

---

## Index Recommendations

| Table | Index | Purpose |
|-------|-------|---------|
| `claim_subscriptions` | `(claim_id)` | Fast subscriber lookup in triggers |
| `claim_subscriptions` | `(user_id)` | Fast subscription list per user |
| `notifications` | `(recipient_user_id, read, created_at DESC)` | Efficient inbox query with unread count |
| `notifications` | `(claim_id)` | Fast cascade cleanup on claim deletion |
