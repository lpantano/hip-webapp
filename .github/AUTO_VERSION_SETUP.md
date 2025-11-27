# Automatic Versioning Setup

This project has automatic version bumping configured! Here's what you need to know:

## ✅ What's Already Set Up

1. **GitHub Action** (`.github/workflows/auto-version.yml`)
   - Automatically bumps version when pushing to `main`
   - Analyzes commit messages using Conventional Commits
   - Creates GitHub Releases automatically

2. **Build Configuration**
   - Production builds: Use semantic version from package.json
   - Development builds: Use timestamped versions for cache busting

3. **Netlify Configuration**
   - Main branch: Production builds with stable versions
   - Devel branch: Development builds with auto-updating caches

## 🚀 How to Use

### Standard Workflow

1. **Work on `devel` branch:**
   ```bash
   git checkout devel
   # Make changes
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

2. **Create PR to `main`:**
   - Create pull request from `devel` to `main`
   - Review and merge

3. **Automatic version bump:**
   - GitHub Action runs on push to `main`
   - Analyzes your commit message
   - Bumps version accordingly
   - Creates a new commit: `chore: bump version to X.Y.Z`
   - Creates GitHub Release

### Commit Message Types

Use these prefixes to control version bumping:

| Prefix | Bump Type | Example |
|--------|-----------|---------|
| `feat:` | MINOR | `feat: add user dashboard` |
| `fix:` | PATCH | `fix: resolve login timeout` |
| `feat!:` or `BREAKING CHANGE` | MAJOR | `feat!: redesign API` |
| `chore:`, `docs:`, etc. | PATCH | `chore: update dependencies` |

See [COMMIT_CONVENTION.md](COMMIT_CONVENTION.md) for full guide.

## 🎯 Examples

### Adding a new feature (MINOR bump: 1.0.4 → 1.1.0)
```bash
git commit -m "feat: implement offline mode

Added service worker caching for offline support.
Users can now access previously viewed pages offline."
```

### Fixing a bug (PATCH bump: 1.0.4 → 1.0.5)
```bash
git commit -m "fix: correct PWA cache invalidation

Service worker now properly invalidates cache on version updates."
```

### Breaking change (MAJOR bump: 1.0.4 → 2.0.0)
```bash
git commit -m "feat!: redesign authentication

BREAKING CHANGE: Switched from session-based to JWT authentication.
All existing sessions will be invalidated."
```

## 🔧 Manual Version Bump

If you need to manually control the version:

### Via npm scripts (local):
```bash
npm run version:patch  # 1.0.4 → 1.0.5
npm run version:minor  # 1.0.4 → 1.1.0
npm run version:major  # 1.0.4 → 2.0.0

git add package.json package-lock.json
git commit -m "chore: bump version to X.Y.Z"
git push
```

### Via GitHub Actions (remote):
1. Go to **Actions** tab on GitHub
2. Select **"Auto Version Bump"** workflow
3. Click **"Run workflow"**
4. Choose version type (patch/minor/major)
5. Click **"Run workflow"**

## 📝 Important Notes

- ⚠️ The workflow only runs on **push to `main`**
- ⚠️ It skips if the commit message contains `"chore: bump version"` (prevents loops)
- ⚠️ The workflow uses `[skip ci]` to prevent triggering other workflows
- ✅ GitHub Releases are created automatically with each version bump
- ✅ Both `package.json` and `package-lock.json` are updated

## 🔍 Checking Version Bumps

### In GitHub:
- Check the **Releases** page for new releases
- Check **Actions** tab to see workflow runs
- Check commit history for `"chore: bump version"` commits

### Locally:
```bash
git pull
cat package.json | grep version
# or
npm version
```

### In Browser (deployed app):
Open DevTools Console:
```
Service Worker loaded, version: 1.1.0
```

## 🐛 Troubleshooting

### Version didn't bump automatically

**Check:**
1. Did you push to `main`? (not `devel`)
2. Did you use conventional commit format? (`feat:`, `fix:`, etc.)
3. Check GitHub Actions tab for errors
4. Make sure the last commit wasn't already a version bump

### Need to disable auto-versioning temporarily

Disable the workflow:
1. Go to `.github/workflows/auto-version.yml`
2. Comment out or delete the file
3. Commit and push

### Need to change version bump logic

Edit `.github/workflows/auto-version.yml` and adjust the "Determine version bump type" step.

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [PWA Versioning Guide](../PWA_VERSIONING.md)
- [Commit Convention Guide](COMMIT_CONVENTION.md)
