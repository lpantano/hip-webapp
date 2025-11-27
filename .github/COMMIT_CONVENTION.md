# Commit Message Convention

This project uses **Conventional Commits** for automatic version bumping.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types and Version Bumping

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | **MINOR** (1.0.4 → 1.1.0) | `feat: add dark mode toggle` |
| `fix:` | **PATCH** (1.0.4 → 1.0.5) | `fix: resolve login redirect issue` |
| `feat!:` or `BREAKING CHANGE` | **MAJOR** (1.0.4 → 2.0.0) | `feat!: redesign authentication API` |
| `chore:`, `docs:`, `style:`, etc. | **PATCH** (1.0.4 → 1.0.5) | `chore: update dependencies` |

## Common Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `build:` - Build system changes

## Examples

### Minor Version Bump (New Feature)
```bash
git commit -m "feat: add user profile page

- Created new profile component
- Added profile editing functionality
- Integrated with user API"
```

### Patch Version Bump (Bug Fix)
```bash
git commit -m "fix: resolve caching issue in service worker

The service worker was not updating properly on version changes.
Updated cache invalidation logic."
```

### Major Version Bump (Breaking Change)
```bash
git commit -m "feat!: redesign authentication system

BREAKING CHANGE: Authentication tokens now use JWT instead of session cookies.
Clients must update to use the new authentication flow."
```

Or:

```bash
git commit -m "feat: redesign authentication system

This changes the authentication flow from session-based to JWT-based.

BREAKING CHANGE: All existing sessions will be invalidated.
Clients must implement new JWT authentication."
```

### Other Changes (Default to Patch)
```bash
git commit -m "chore: update dependencies"
git commit -m "docs: update README with new setup instructions"
git commit -m "style: format code with prettier"
```

## Workflow

### When merging to main:

1. **Use conventional commit messages** on your feature branch
2. **Merge to main** via PR
3. **Automatic version bump** happens on push to main
4. **GitHub Release** is created automatically

### Manual version bump:

If you need to manually trigger a version bump:

1. Go to Actions tab in GitHub
2. Select "Auto Version Bump" workflow
3. Click "Run workflow"
4. Choose version type: patch, minor, or major

## Tips

✅ **DO:**
- Use clear, descriptive commit messages
- Reference issue numbers: `fix: resolve login bug (#123)`
- Use scopes for context: `feat(auth): add OAuth support`
- Write commit body for complex changes

❌ **DON'T:**
- Use vague messages like "fix stuff" or "update"
- Mix multiple unrelated changes in one commit
- Forget the colon after type: `fix login bug` ❌ → `fix: login bug` ✅

## Scopes (Optional)

Scopes provide additional context:

- `feat(auth):` - Authentication features
- `fix(ui):` - UI bug fixes
- `feat(pwa):` - PWA-related features
- `fix(api):` - API fixes
- `perf(cache):` - Cache performance improvements

Example:
```bash
git commit -m "feat(pwa): implement offline support

Added service worker caching for offline functionality.
Users can now access previously viewed content offline."
```

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
