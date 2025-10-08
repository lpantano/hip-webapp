# Development Role Testing Guide

This document explains how to test different user roles during development.

## Method 1: Environment Variables (Recommended for CI/Testing)

1. Create or edit `.env.local` in the project root
2. Add the `VITE_DEV_USER_ROLES` variable with comma-separated roles:

```bash
# Test as regular user
VITE_DEV_USER_ROLES=user

# Test as expert
VITE_DEV_USER_ROLES=expert,user

# Test as researcher  
VITE_DEV_USER_ROLES=researcher,user

# Test as admin
VITE_DEV_USER_ROLES=admin,user

# Test as expert and researcher
VITE_DEV_USER_ROLES=expert,researcher,user
```

3. Restart your development server
4. The console will show: `🚀 [DEV] Using overridden roles: [role1, role2]`

## Method 2: Dev Role Selector (Recommended for Interactive Testing)

### Option A: Always Show (Environment Variable)
1. Add `VITE_SHOW_DEV_ROLE_TESTER=true` to your `.env.local`
2. Restart the development server
3. The yellow "Dev Role Tester" card will appear in the bottom-right corner

### Option B: Toggle On-Demand (Keyboard Shortcut)
1. Start the development server (no env variable needed)
2. Press **Ctrl+Shift+D** (or **⌘+Shift+D** on Mac) to toggle the dev tools
3. Press the same shortcut again to hide it

### Using the Dev Role Selector:
1. Click role buttons to toggle them on/off
2. Click "Apply & Reload" to test the roles
3. The page will reload with the selected roles
4. Use the "✕" button to close (when toggled via keyboard)

## Available Roles

- `user` - Regular user (default)
- `expert` - Healthcare professional/expert
- `researcher` - Academic researcher  
- `admin` - Administrator
- `ambassador` - Community ambassador
- `founding_expert` - Founding expert member
- `founding_user` - Founding user member

## Testing Scenarios for JoinSection

### Scenario 1: Not logged in
- Expected: Both "Sign Up Now" and expert application buttons should be enabled

### Scenario 2: Logged in as regular user
- Set roles: `user`
- Expected: "Sign Up Now" button disabled (shows "Welcome Back!"), expert application buttons enabled

### Scenario 3: Logged in as expert
- Set roles: `expert,user`  
- Expected: "Sign Up Now" button disabled, expert application buttons disabled (show "Already Member")

### Scenario 4: Logged in as researcher
- Set roles: `researcher,user`
- Expected: "Sign Up Now" button disabled, expert application buttons disabled (show "Already Member")

## Controlling Dev Tools Visibility

### Show/Hide Options:
1. **Environment Variable**: Set `VITE_SHOW_DEV_ROLE_TESTER=true` in `.env.local` (always visible)
2. **Keyboard Toggle**: Press `Ctrl+Shift+D` / `⌘+Shift+D` (show on-demand)
3. **Disabled**: Comment out env variable and don't use keyboard shortcut (hidden)

### When to Use Each Method:
- **Environment Variable**: When actively developing role-based features
- **Keyboard Toggle**: When you occasionally need to test roles
- **Disabled**: When working on non-role-related features

## Notes

- Role overrides only work in development mode
- The dev role selector saves to localStorage, which persists across browser sessions
- Environment variables take precedence over localStorage
- In production, roles are always fetched from the database
- Clear localStorage or comment out environment variables to return to normal behavior
- Keyboard shortcut works even when `VITE_SHOW_DEV_ROLE_TESTER` is not set