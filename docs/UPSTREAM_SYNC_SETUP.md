# Upstream Sync Setup Guide

This guide walks you through setting up the automated upstream sync workflow for a private upstream repository.

## Prerequisites

- Your fork: `lpantano/hip-webapp` (personal repository)
- Upstream: `Health-Integrity-Project/webapp` (organization private repository)
- You need admin access to your fork to add secrets

## Step 1: Create a Personal Access Token (PAT)

You need a GitHub Personal Access Token with access to the private upstream repository.

### Option A: Fine-Grained Personal Access Token (Recommended)

1. Go to GitHub Settings: https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"** → **"Generate new token (fine-grained)"**
3. Configure the token:
   - **Token name**: `Upstream Sync - lpantano/hip-webapp`
   - **Expiration**: Choose your preferred expiration (90 days, 1 year, or custom)
   - **Repository access**: Select **"Only select repositories"**
   - Choose: `Health-Integrity-Project/webapp`
   - **Repository permissions**:
     - Contents: **Read-only** ✅
     - Metadata: **Read-only** (automatically selected)
4. Click **"Generate token"**
5. **Copy the token immediately** - you won't be able to see it again!

### Option B: Classic Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Configure the token:
   - **Note**: `Upstream Sync - lpantano/hip-webapp`
   - **Expiration**: Choose your preferred expiration
   - **Scopes**: Select **`repo`** (Full control of private repositories)
4. Click **"Generate token"**
5. **Copy the token immediately**

> **Note**: Fine-grained tokens are more secure as they have limited scope.

## Step 2: Add the Token as a Repository Secret

1. Go to your fork's settings:
   - Navigate to: https://github.com/lpantano/hip-webapp/settings/secrets/actions
   - Or: Repository → Settings → Secrets and variables → Actions

2. Click **"New repository secret"**

3. Add the secret:
   - **Name**: `UPSTREAM_SYNC_TOKEN`
   - **Value**: Paste the PAT you created in Step 1
   - Click **"Add secret"**

## Step 3: Verify the Secret

After adding the secret, you should see:
- Secret name: `UPSTREAM_SYNC_TOKEN`
- Updated: [timestamp]

## Step 4: Test the Workflow

### Manual Test

1. Go to the Actions tab: https://github.com/lpantano/hip-webapp/actions
2. Click on **"Sync with Upstream"** workflow
3. Click **"Run workflow"** button
4. Select the branch (main or devel)
5. Click **"Run workflow"**
6. Watch the workflow run and check for errors

### Check the Logs

If the workflow fails:
1. Click on the failed workflow run
2. Click on the job name: "Sync Fork with Upstream"
3. Expand the "Add upstream remote" step
4. Look for authentication errors

Common errors:
- `Authentication failed` → Token is invalid or expired
- `Repository not found` → Token doesn't have access to the upstream repo
- `fatal: could not read Username` → Token format is incorrect

## Step 5: Automatic Syncing

Once the workflow is working, it will automatically:
- ✅ Sync when you push to `main` or `devel`
- ✅ Sync daily at midnight UTC
- ✅ Can be manually triggered anytime

## Token Maintenance

### Token Expiration

If you set an expiration on your token, you'll need to:
1. Generate a new token before the old one expires
2. Update the `UPSTREAM_SYNC_TOKEN` secret with the new value
3. No other changes needed - the workflow will use the new token automatically

### Rotating Tokens

For security best practices:
1. Rotate tokens periodically (every 90 days recommended)
2. Delete old tokens after creating new ones
3. Monitor the workflow runs for authentication failures

## Security Best Practices

### Do's ✅
- Use fine-grained tokens with minimal permissions (read-only access to contents)
- Set token expiration dates
- Rotate tokens regularly
- Use repository secrets (never commit tokens to code)
- Monitor workflow runs for suspicious activity

### Don'ts ❌
- Never commit the PAT to the repository
- Don't share the PAT with anyone
- Don't use tokens with write access if only read is needed
- Don't set tokens to never expire
- Don't reuse tokens across multiple repositories

## Troubleshooting

### Workflow fails with "Authentication failed"

**Problem**: The token is invalid, expired, or doesn't have access.

**Solutions**:
1. Check if the token has expired
2. Verify the token has access to `Health-Integrity-Project/webapp`
3. Regenerate the token and update the secret
4. Ensure you copied the token correctly (no extra spaces)

### Workflow fails with "Repository not found"

**Problem**: The token doesn't have permission to access the private upstream repo.

**Solutions**:
1. Verify you're a member of the `Health-Integrity-Project` organization
2. Check that the upstream repository name is correct
3. Ensure the token has `repo` scope (classic) or Contents read permission (fine-grained)
4. For fine-grained tokens, verify the repository is selected

### Workflow succeeds but doesn't sync

**Problem**: The workflow runs but no changes are pulled.

**Solutions**:
1. Check if there are actually changes in upstream
2. Verify the branch names match (main/devel exist in both repos)
3. Check the workflow logs for "Already up to date" message

### Can't access organization repository

**Problem**: Organization has SSO enabled.

**Solutions**:
1. After creating the token, authorize it for SSO
2. Go to: https://github.com/settings/tokens
3. Find your token and click **"Configure SSO"**
4. Click **"Authorize"** next to `Health-Integrity-Project`

## Alternative: Deploy Keys

If you prefer not to use a PAT, you can use deploy keys:

### Pros
- Repository-specific (more secure)
- No expiration
- No user association

### Cons
- More complex setup
- Read-only by default
- Requires SSH configuration in workflow

**For most use cases, a fine-grained PAT is simpler and sufficient.**

## Monitoring

### Check Sync Status

View recent workflow runs:
- https://github.com/lpantano/hip-webapp/actions/workflows/sync-upstream.yml

### Set Up Notifications

1. Go to: https://github.com/lpantano/hip-webapp/settings/notifications
2. Enable notifications for:
   - Actions workflow runs
   - Failed workflow runs

### Daily Sync Schedule

The workflow runs daily at:
- **Time**: 00:00 UTC (midnight)
- **Frequency**: Once per day
- **Branches checked**: Both main and devel

To change the schedule, edit `.github/workflows/sync-upstream.yml`:
```yaml
schedule:
  - cron: '0 0 * * *'  # Midnight UTC daily
```

## Support

If you encounter issues:
1. Check the [main documentation](UPSTREAM_SYNC.md)
2. Review workflow run logs in GitHub Actions
3. Verify your token permissions
4. Check GitHub status: https://www.githubstatus.com/

## Related Documentation

- [Upstream Sync Workflow Documentation](UPSTREAM_SYNC.md)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
