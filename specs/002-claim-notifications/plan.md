# Implementation Plan: Claim Subscription Notifications

**Branch**: `002-claim-notifications` | **Date**: 2026-02-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-claim-notifications/spec.md`

## Summary

Allow authenticated users to subscribe to health claims and receive persistent in-app notifications when qualifying events occur: a new paper is added, an expert submits or updates a review, or the claim's evidence status changes. Notifications are delivered via a notification inbox (popover panel) accessible from the app header, with a live unread badge count driven by Supabase Realtime. The implementation adds two new database tables (`claim_subscriptions`, `notifications`), three PostgreSQL trigger functions, four new React components, three new React hooks, and integrations into two existing files (Header, ClaimDetail).

## Technical Context

**Language/Version**: TypeScript 5.8 (React 18.3, Vite 7.2)
**Primary Dependencies**: Supabase 2.55, TanStack Query 5.83, shadcn/ui (Radix UI Popover + Badge), lucide-react (Bell icon), sonner (toast feedback)
**Storage**: PostgreSQL via Supabase — two new tables, one new enum, three new trigger functions
**Testing**: Manual via `npm run dev`; lint via `npm run lint`
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Single web application (React SPA)
**Performance Goals**: Notifications visible within 30 seconds of triggering event; subscribe/unsubscribe reflects in UI under 2 seconds
**Constraints**: In-app only (no email/push). No new npm packages. Additive DB changes only. Mobile responsive.
**Scale/Scope**: All authenticated users; notification inbox paginated at 20 per page

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TypeScript, no `any` | PASS | All new code uses explicit types; `any` forbidden |
| II. Simplicity First | PASS | No over-engineering; Realtime + triggers is the minimal correct solution |
| III. Security | PASS | RLS on both new tables; users can only read/update their own rows; INSERT-only from triggers |
| IV. Component Architecture | PASS | Components placed in `src/components/notifications/` and `src/components/claims/`; Header and ClaimDetail modified at integration points only |
| V. Modern Styling | PASS | Tailwind + shadcn/ui Popover + Badge; mobile responsive; dark mode compatible |
| VI. State Management | PASS | TanStack Query for server state; local state for optimistic updates |
| VII. Form Validation | N/A | No forms in this feature |
| Supabase Auth Standards | PASS | Auth-gated subscription; RLS enforced |
| Database Access Patterns | PASS | Supabase client from `src/integrations/supabase/client.ts`; types from generated `types.ts` |
| Migration Discipline | PASS | New migration file required for schema changes |
| Accessibility | PASS | Bell icon has aria-label; popover keyboard navigable; notifications list has proper ARIA |
| Performance | PASS | TanStack Query caching + Realtime; pagination for inbox |

**Constitution Check result: ALL PASS — no violations.**

## Project Structure

### Documentation (this feature)

```text
specs/002-claim-notifications/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: decisions and rationale
├── data-model.md        # Phase 1: tables, triggers, RLS
├── quickstart.md        # Phase 1: developer onboarding guide
├── contracts/
│   └── supabase-queries.md   # Phase 1: query/mutation contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── notifications/              # NEW
│   │   ├── NotificationBell.tsx   # Bell icon + unread badge for Header
│   │   ├── NotificationInbox.tsx  # Popover list of notifications
│   │   └── NotificationItem.tsx   # Single notification row
│   └── claims/
│       └── SubscribeButton.tsx    # NEW: subscribe/unsubscribe toggle
├── hooks/
│   ├── useClaimSubscription.ts    # NEW: subscription state + mutations
│   ├── useNotifications.ts        # NEW: inbox fetch + mark-read mutations
│   └── useNotificationsRealtime.ts # NEW: Supabase Realtime channel
├── components/layout/
│   └── Header.tsx                 # MODIFIED: add <NotificationBell />
└── pages/
    └── ClaimDetail.tsx            # MODIFIED: add <SubscribeButton />

supabase/migrations/
└── [timestamp]_add_claim_notifications.sql  # NEW: schema + triggers
```

**Structure Decision**: Single web application. New components in feature-appropriate directories (`notifications/` and `claims/`). Two existing files modified at their natural integration points only.

## Implementation Phases

### Phase A: Database Foundation

1. Create migration `supabase/migrations/[timestamp]_add_claim_notifications.sql`:
   - `CREATE TYPE notification_type`
   - `CREATE TABLE claim_subscriptions` with indexes + RLS
   - `CREATE TABLE notifications` with indexes + RLS
   - Three trigger functions + triggers (new_paper, new_review, status_changed)
2. Update `src/integrations/supabase/types.ts` with new table types (or regenerate)

**Deliverable**: Database schema ready; triggers fire on qualifying events.

### Phase B: React Hooks

1. `useClaimSubscription.ts` — subscription status query + subscribe/unsubscribe mutations with optimistic updates
2. `useNotifications.ts` — inbox query (paginated) + unread count + mark-single-read + mark-all-read mutations
3. `useNotificationsRealtime.ts` — Supabase Realtime channel for live INSERT events on notifications table

**Deliverable**: All data access logic encapsulated; hooks independently testable.

### Phase C: UI Components

1. `NotificationItem.tsx` — single notification row (icon by type, message, relative time, bold for unread)
2. `NotificationInbox.tsx` — scrollable list + "Mark all as read" button + empty state + pagination
3. `NotificationBell.tsx` — Bell icon + Badge overlay + Popover wrapping NotificationInbox; wires Realtime hook
4. `SubscribeButton.tsx` — toggle button with Bell icon, subscribed/unsubscribed states, auth guard

**Deliverable**: All UI components renderable in isolation.

### Phase D: Integration

1. Integrate `<NotificationBell />` into `Header.tsx` (after social icons, before hamburger, auth-gated)
2. Integrate `<SubscribeButton claimId={claim.id} />` into `ClaimDetail.tsx` action cluster

**Deliverable**: Feature fully integrated and end-to-end testable.

## Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Specification | [spec.md](./spec.md) | Complete |
| Research | [research.md](./research.md) | Complete |
| Data Model | [data-model.md](./data-model.md) | Complete |
| Query Contracts | [contracts/supabase-queries.md](./contracts/supabase-queries.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |
| Tasks | tasks.md | Pending (`/speckit.tasks`) |
