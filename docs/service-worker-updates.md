# Service Worker Update Notification

## Overview

The app now includes a user-friendly update notification system that prompts users when a new version of the app is available.

## How It Works

### 1. Service Worker Registration (`src/main.tsx`)

- The service worker is registered on app load
- Automatically checks for updates immediately and then every hour
- When an update is detected, the `UpdateNotificationManager` component is notified

### 2. Update Notification Component (`src/components/UpdateNotification.tsx`)

The component has two main parts:

#### `UpdateNotification`
- Displays a card in the bottom-right corner of the screen
- Shows a clear message about the available update
- Provides two options:
  - **Update Now**: Activates the new service worker and reloads the page
  - **Later**: Dismisses the notification (user can continue using the current version)

#### `UpdateNotificationManager`
- Manages the update notification lifecycle
- Listens for service worker updates
- Coordinates the update process when the user clicks "Update Now"

### 3. Service Worker (`public/sw.js`)

- Listens for the `SKIP_WAITING` message from the main thread
- When received, activates the new service worker immediately
- Cleans up old caches and takes control of all pages

## User Experience

1. User continues working with the current version
2. A new version is deployed
3. The service worker detects the new version in the background
4. A notification appears in the bottom-right corner
5. User can choose to:
   - **Update Now**: App reloads with the new version
   - **Later**: Continue with current version, notification disappears
   - **Close (X)**: Same as "Later"

## Technical Details

### Update Check Frequency

- Immediate check when the app loads
- Periodic checks every 60 minutes
- Manual checks when the browser tab becomes visible again (handled by the browser)

### Update Process

1. New service worker is detected (`updatefound` event)
2. Wait for the new service worker to be in `installed` state
3. Show the notification to the user
4. If user clicks "Update Now":
   - Send `SKIP_WAITING` message to the new service worker
   - New service worker calls `skipWaiting()` and takes control
   - Listen for `controllerchange` event
   - Reload the page with the new version

### Fallback Behavior

- If the user dismisses the notification, they continue with the current version
- The update will be available the next time they reload the app manually
- The notification will not appear again for this update (until they reload)

## Testing Updates Locally

1. Make a change to the app
2. Build the app: `npm run build`
3. Serve the built app (the service worker only works with the production build)
4. Open the app in a browser
5. Make another change and rebuild
6. The update notification should appear in the already-open browser tab

## Configuration

To change the update check interval, modify the interval in `src/main.tsx`:

```typescript
// Check for updates every hour (60 * 60 * 1000 ms)
setInterval(() => {
  registration.update();
}, 60 * 60 * 1000);
```

To customize the notification appearance, edit the styles in `src/components/UpdateNotification.tsx`.
