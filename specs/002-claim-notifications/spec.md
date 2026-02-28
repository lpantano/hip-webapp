# Feature Specification: Claim Subscription Notifications

**Feature Branch**: `002-claim-notifications`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "we want to allow users to get updates if they subscribe to a claim, when the claims get new paper or new review or change status (any of them is true in a given event). updates will be in the app only for now. like the gold standard for notifications in design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subscribe to a Claim (Priority: P1)

A logged-in user visits a claim detail page and wants to follow its progress. They click a "Subscribe" button to opt in to receiving in-app updates whenever the claim changes — such as a new paper being added, an expert submitting a review, or the evidence status changing.

**Why this priority**: Subscription is the gateway to all other notification functionality. Without it, no updates can be delivered. It is the core foundation and the simplest deliverable that provides immediate user control.

**Independent Test**: Can be fully tested by subscribing to a claim and verifying subscription state persists across sessions — without needing notification delivery to work.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on a claim detail page, **When** they click "Subscribe", **Then** a visual indicator confirms they are subscribed and the button changes to reflect the subscribed state.
2. **Given** a user is already subscribed to a claim, **When** they click "Unsubscribe", **Then** the subscription is removed and the button returns to its default unsubscribed state.
3. **Given** a non-authenticated user is on a claim detail page, **When** they attempt to subscribe, **Then** they are prompted to sign in before subscribing.
4. **Given** a logged-in user returns to a claim they previously subscribed to, **When** they view the claim, **Then** the subscribe button reflects their current subscribed state.

---

### User Story 2 - Receive In-App Notifications (Priority: P2)

A subscribed user receives in-app notifications when a claim they follow has activity — a new paper is linked, an expert completes a review, or the claim's evidence status changes. The notifications appear in a persistent, accessible inbox within the app that the user can check at any time.

**Why this priority**: This is the core value delivery of the feature. Without persisted, event-driven notifications, subscriptions have no purpose. This story is the most impactful and visible part of the feature for end users.

**Independent Test**: Can be fully tested by triggering a claim event (add a paper) and verifying a notification appears in the user's notification inbox with the correct title and description.

**Acceptance Scenarios**:

1. **Given** a user is subscribed to a claim, **When** a new paper is added to that claim, **Then** an in-app notification is created and visible in their notification inbox.
2. **Given** a user is subscribed to a claim, **When** an expert submits or updates a review on a paper linked to that claim, **Then** an in-app notification is created.
3. **Given** a user is subscribed to a claim, **When** the claim's evidence status changes, **Then** an in-app notification is created reflecting the new status.
4. **Given** multiple events occur on a claim before the user checks, **When** the user opens their notification inbox, **Then** they see individual notifications for each event, ordered by most recent first.
5. **Given** a user is not subscribed to a claim, **When** an event occurs on that claim, **Then** no notification is generated for that user.

---

### User Story 3 - Manage Notifications (Priority: P3)

A user with accumulated notifications can mark them as read individually or all at once, and can navigate from a notification directly to the relevant claim or paper. A notification indicator in the app header shows an unread badge count.

**Why this priority**: Core usability and polish. Without read/unread state and navigation, the notification inbox is not actionable. This story makes the system complete and aligned with gold-standard notification UX.

**Independent Test**: Can be fully tested by marking notifications as read and verifying the unread count badge updates, and that clicking a notification navigates to the correct content.

**Acceptance Scenarios**:

1. **Given** a user has unread notifications, **When** they view the notification indicator in the app header, **Then** they see a badge with the count of unread notifications.
2. **Given** a user opens their notification inbox, **When** they click "Mark all as read", **Then** all notifications are marked read and the unread badge is removed.
3. **Given** a user opens a notification for a new paper, **When** they click it, **Then** they are taken to the relevant claim detail page and the notification is marked as read.
4. **Given** a user has no unread notifications, **When** they view the header, **Then** no badge is displayed.

---

### Edge Cases

- What happens when a user subscribes to a claim that is subsequently deleted? Their subscription and all associated notifications should be cleaned up automatically.
- What if a user unsubscribes and then re-subscribes? Only events occurring after the most recent subscription date generate new notifications.
- What happens when the user has a very large number of notifications? The inbox should paginate or load notifications progressively to avoid performance degradation.
- What if the same event could be interpreted as multiple notification types? Each qualifying event type generates its own distinct notification.
- Should a user receive a notification for their own actions on a subscribed claim? No — users are not notified of changes they themselves made.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any authenticated user to subscribe to any claim.
- **FR-002**: System MUST allow authenticated users to unsubscribe from a claim they are currently subscribed to.
- **FR-003**: System MUST display the current subscription state (subscribed or not) of a claim to the authenticated user viewing it.
- **FR-004**: System MUST generate an in-app notification for each subscribed user when a new paper (publication) is linked to a claim they follow.
- **FR-005**: System MUST generate an in-app notification for each subscribed user when an expert submits or updates a review on any paper linked to a claim they follow.
- **FR-006**: System MUST generate an in-app notification for each subscribed user when a claim's evidence status changes.
- **FR-007**: System MUST NOT generate a notification for a user for an event that was triggered by that same user.
- **FR-008**: System MUST provide a notification inbox accessible from the main application header where users can view all their notifications.
- **FR-009**: System MUST display a visual unread badge in the header indicating the count of unread notifications when the count is greater than zero.
- **FR-010**: System MUST allow users to mark individual notifications as read.
- **FR-011**: System MUST allow users to mark all notifications as read in a single action.
- **FR-012**: System MUST link each notification to the relevant claim so the user can navigate directly to it.
- **FR-013**: System MUST record the timestamp of each notification and display notifications in reverse chronological order.
- **FR-014**: System MUST NOT generate notifications for events that occurred before the user subscribed to a claim.

### Key Entities

- **Claim Subscription**: Represents a user's opt-in to follow a specific claim. Key attributes: subscriber user, claim reference, subscription timestamp.
- **Notification**: An in-app message generated by a claim event for a subscribed user. Key attributes: recipient user, linked claim, notification type (new paper / new review / status change), descriptive message, read/unread state, creation timestamp.
- **Notification Type**: A category defining what triggered a notification — one of: new paper added, new expert review submitted, evidence status changed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can subscribe or unsubscribe from a claim in under 2 seconds with immediate visual feedback.
- **SC-002**: Notifications appear in the user's inbox within 30 seconds of the triggering event occurring.
- **SC-003**: 100% of qualifying events (new paper, new review, status change) on subscribed claims result in a notification being delivered to all relevant subscribed users.
- **SC-004**: Users can view, navigate from, and dismiss notifications without leaving the main app flow.
- **SC-005**: The unread notification count badge accurately reflects the true count of unread notifications at all times.
- **SC-006**: Users can navigate from any notification to its associated claim in a single interaction.

## Assumptions

- In-app notifications only — no email, push, or SMS delivery in this phase.
- All authenticated users regardless of role may subscribe to any claim.
- Events are generated automatically when the underlying data changes (papers added, reviews submitted, status updated) — no manual admin triggering required.
- A single qualifying event generates one notification per subscribed user — no batching or digest grouping in this phase.
- Notification history is retained indefinitely unless the parent claim is deleted.
- If a claim is deleted, all related subscriptions and notifications for that claim are removed.
- The notification inbox will paginate when the notification count is large; exact page size to be determined at implementation time.

## Dependencies

- Existing claims, publications, and publication_scores tables must remain stable as event sources.
- User authentication system must be available to gate subscription and notification access.
