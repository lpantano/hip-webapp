# Upstream Sync Workflow

This document describes the automated upstream synchronization workflow for keeping your fork in sync with the upstream repository.

## Overview

The sync workflow automatically synchronizes the `main` and `devel` branches with the upstream repository at [Health-Integrity-Project/webapp](https://github.com/Health-Integrity-Project/webapp).

## Workflow File

- **Location**: `.github/workflows/sync-upstream.yml`
- **Upstream Repository**: `https://github.com/Health-Integrity-Project/webapp.git`

## Triggers

The workflow runs in three scenarios:

1. **Push Events**: Automatically when code is pushed to `main` or `devel` branches
2. **Manual Trigger**: Can be manually triggered via GitHub Actions UI
3. **Scheduled**: Runs daily at midnight UTC to catch any upstream changes

## How It Works

### 1. Automatic Merge (No Conflicts)

When there are no merge conflicts:
- Fetches the latest changes from upstream
- Merges changes into the current branch
- Pushes the merged changes automatically
- ✅ No manual intervention needed

### 2. Conflicts Detected

When merge conflicts are detected:
- Creates a new branch named `sync-upstream-<branch>-<timestamp>`
- Attempts the merge and commits all changes (including conflicts)
- Creates a Pull Request with detailed instructions
- 🔧 **Manual resolution required**

### 3. Already Up to Date

When the fork is already synchronized:
- Detects no differences with upstream
- Exits gracefully
- ✅ No action needed

## Resolving Merge Conflicts

When the workflow creates a PR for conflicts, follow these steps:

### Step 1: Fetch the Sync Branch

```bash
# Fetch all branches
git fetch origin

# List sync branches (look for sync-upstream-*)
git branch -r | grep sync-upstream

# Checkout the sync branch
git checkout sync-upstream-main-<timestamp>
# or
git checkout sync-upstream-devel-<timestamp>
```

### Step 2: Resolve Conflicts

```bash
# View files with conflicts
git status

# Open conflicted files in your editor and resolve conflicts
# Look for conflict markers: <<<<<<<, =======, >>>>>>>

# After resolving each file, stage it
git add <resolved-file>

# Continue until all conflicts are resolved
```

### Step 3: Commit and Push

```bash
# Verify all conflicts are resolved
git status

# If any files remain unstaged, add them
git add .

# Commit the resolved changes
git commit -m "chore: resolve merge conflicts from upstream sync"

# Push to the sync branch
git push origin sync-upstream-<branch>-<timestamp>
```

### Step 4: Merge the PR

- Go to the PR on GitHub
- Review the changes
- Click "Merge pull request"
- Delete the sync branch after merging

## Manual Sync

You can also manually sync with upstream using git commands:

### Sync Main Branch

```bash
# Ensure you're on the main branch
git checkout main

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

### Sync Devel Branch

```bash
# Ensure you're on the devel branch
git checkout devel

# Fetch upstream changes
git fetch upstream

# Merge upstream changes
git merge upstream/devel

# Push to your fork
git push origin devel
```

## Checking Sync Status

You can manually check if your fork is up to date:

```bash
# Fetch upstream
git fetch upstream

# Compare your branch with upstream
git log HEAD..upstream/main  # For main branch
git log HEAD..upstream/devel # For devel branch

# If output is empty, you're up to date
# If there are commits, you're behind upstream
```

## Workflow Configuration

### Permissions Required

The workflow needs these permissions:
- `contents: write` - To push merged changes
- `pull-requests: write` - To create PRs for conflicts

### Environment

The workflow uses:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- GitHub CLI (`gh`) - For creating pull requests

## Troubleshooting

### Workflow Fails

1. **Check the workflow run logs** in the Actions tab
2. **Common issues**:
   - Network connectivity to upstream
   - Permission issues (check repository settings)
   - Upstream branch doesn't exist

### Can't Push After Resolving Conflicts

```bash
# Make sure you're on the correct branch
git branch

# Try force pushing (be careful!)
git push origin sync-upstream-<branch>-<timestamp> --force
```

### Want to Abort a Sync

```bash
# If you're in the middle of a merge
git merge --abort

# Delete the sync branch locally
git branch -D sync-upstream-<branch>-<timestamp>

# Delete the sync branch remotely
git push origin --delete sync-upstream-<branch>-<timestamp>

# Close the PR on GitHub
```

## Best Practices

1. **Review PRs carefully** - Upstream changes might conflict with your custom modifications
2. **Keep local changes minimal** - Consider contributing changes back to upstream instead of maintaining a fork
3. **Test after syncing** - Run your test suite after merging upstream changes
4. **Sync regularly** - Don't let your fork fall too far behind upstream
5. **Document customizations** - Keep track of what you've changed from upstream

## Disabling Auto-Sync

If you want to disable automatic syncing:

1. Go to `.github/workflows/sync-upstream.yml`
2. Comment out or remove the `push:` and `schedule:` triggers
3. Keep only `workflow_dispatch:` for manual triggering

## Related Workflows

- [auto-version.yml](.github/workflows/auto-version.yml) - Automatic version bumping
- [build-and-test.yml](.github/workflows/build-and-test.yml) - CI/CD pipeline

## Questions?

If you encounter issues with the sync workflow:
1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review the workflow run logs
3. Open an issue in the repository
