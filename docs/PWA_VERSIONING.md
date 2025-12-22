# PWA Version Management

## Overview

This project uses automatic PWA versioning based on build mode:

- **Production builds**: Use semantic versioning from package.json (e.g., `1.0.4`)
- **Development builds**: Use timestamped versions (e.g., `1.0.4-dev.1732586400000`)

This ensures development builds always get fresh caches while production versions remain stable.

## Quick Reference

| Environment | Branch | Build Command | Version Format | Cache Behavior |
|------------|--------|---------------|----------------|----------------|
| **Production** | `main` | `npm run build` | `1.0.4` | Stable, version-controlled |
| **Development** | `devel` | `npm run build:dev` | `1.0.4-dev.{timestamp}` | Updates every build |
| **PR Preview** | `feature/*` | `npm run build:dev` | `1.0.4-dev.{timestamp}` | Unique per deploy |
| **Local Dev** | any | `npm run build:dev` | `1.0.4-dev.{timestamp}` | Updates every build |

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Developer Workflow                                          │
└─────────────────────────────────────────────────────────────┘

1. Work on devel branch
   ↓
   git commit -m "feat: add new feature"
   ↓
   git push origin devel
   ↓
   Netlify builds with version: 1.0.4-dev.1732586400000
   Deploy to: https://devel--your-site.netlify.app
   ✅ Fresh cache on every build

2. Create PR: devel → main
   ↓
   Review & Merge
   ↓
   Push to main
   ↓
   🤖 GitHub Action runs:
      - Analyzes commit: "feat: add new feature"
      - Determines: MINOR bump
      - Updates: 1.0.4 → 1.1.0
      - Commits: "chore: bump version to 1.1.0"
      - Creates: GitHub Release v1.1.0
   ↓
   Netlify builds with version: 1.1.0
   Deploy to: https://your-site.netlify.app
   ✅ Cache updates to: healthintegrityproject-v1.1.0

Result: Users get updated PWA with new cache version
```

## Build Commands

### Development Build
```bash
npm run build:dev
```
- Version: `1.0.4-dev.{timestamp}`
- Cache updates on every build
- Perfect for testing

### Production Build
```bash
npm run build
```
- Version: `1.0.4` (from package.json)
- Cache only updates when version changes
- Stable and controlled

## Version Management

### Automatic Version Bumping (Recommended)

Version bumping happens **automatically** when you push to the `main` branch, based on your commit messages using [Conventional Commits](.github/COMMIT_CONVENTION.md):

| Commit Message | Version Bump | Example |
|----------------|--------------|---------|
| `feat: add new feature` | **MINOR** (1.0.4 → 1.1.0) | New functionality |
| `fix: resolve bug` | **PATCH** (1.0.4 → 1.0.5) | Bug fixes |
| `feat!: breaking change` | **MAJOR** (1.0.4 → 2.0.0) | Breaking changes |

**Workflow:**
1. Work on `devel` branch with conventional commit messages
2. Create PR to `main`
3. Merge PR → **Version automatically bumps!**
4. GitHub Release is created automatically

**Example commits:**
```bash
# Minor version bump
git commit -m "feat: add dark mode toggle"

# Patch version bump
git commit -m "fix: resolve service worker caching issue"

# Major version bump
git commit -m "feat!: redesign authentication system

BREAKING CHANGE: Authentication now uses JWT instead of sessions"
```

See [Commit Convention Guide](.github/COMMIT_CONVENTION.md) for full details.

### Manual Version Bumping (Alternative)

You can also manually bump versions:

```bash
# Bug fixes (1.0.4 → 1.0.5)
npm run version:patch

# New features (1.0.4 → 1.1.0)
npm run version:minor

# Breaking changes (1.0.4 → 2.0.0)
npm run version:major
```

Then commit and push:
```bash
git add package.json package-lock.json
git commit -m "chore: bump version to X.Y.Z"
git push
```

## How It Works

1. **vite.config.ts** reads the version from package.json
2. For dev builds, it appends a timestamp: `-dev.{timestamp}`
3. The version is injected into `public/sw.js` at build time
4. Service worker uses this version for cache naming

## Testing Cache Updates

### During Development:
```bash
npm run build:dev
# Each build gets a new cache version automatically
```

### Before Production Release:
1. Test with current version
2. Bump version: `npm run version:patch`
3. Build: `npm run build`
4. Verify cache updates in browser DevTools → Application → Cache Storage

## Netlify Deployment Behavior

The `netlify.toml` is configured to use different build commands per branch:

### **Main Branch** (Production)
- Build command: `npm run build`
- Version: `1.0.4`
- Stable cache, only updates when version is bumped
- URL: https://your-site.netlify.app

### **Devel Branch** (Preview)
- Build command: `npm run build:dev`
- Version: `1.0.4-dev.{timestamp}`
- Fresh cache on every deployment
- URL: https://devel--your-site.netlify.app

### **Deploy Previews** (PRs)
- Build command: `npm run build:dev`
- Version: `1.0.4-dev.{timestamp}`
- Each deploy gets unique cache
- URL: https://deploy-preview-123--your-site.netlify.app

This ensures:
- ✅ Production builds are stable and controlled
- ✅ Development builds always test with fresh cache
- ✅ No cache conflicts between environments
- ✅ Each deployment is independently cacheable

## Checking Version in Browser

Open DevTools Console, the service worker logs:
```
Service Worker loaded, version: 1.0.4-dev.1732586400000
```

Or check in Application → Service Workers → Source
