---
model: haiku
---

# Sync Branches

## Input
No input required. This command syncs the local main and devel branches with their remote counterparts on GitHub.

## Task
Fetch the latest changes from the remote repository and update the local main and devel branches to match their remote versions, then push any local commits if needed.

## Output Format
Confirmation messages showing:
- Current branch status
- Fetch results from remote
- Sync status for main branch
- Sync status for devel branch
- Any conflicts or issues encountered

## Instructions

1. **Check current status**
   - Show the current branch
   - Show the git status to understand what's uncommitted

2. **Fetch from remote**
   - Run `git fetch origin` to get the latest remote changes
   - This updates the remote tracking branches without modifying local branches

3. **Sync main branch**
   - Switch to main branch: `git checkout main`
   - Pull latest changes: `git pull origin main`
   - Push any local commits: `git push origin main`
   - Report any conflicts or issues

4. **Sync devel branch**
   - Switch to devel branch: `git checkout devel`
   - Pull latest changes: `git pull origin devel`
   - Push any local commits: `git push origin devel`
   - Report any conflicts or issues

5. **Return to original branch**
   - Switch back to the branch the user was on before running this command

6. **Summary**
   - Provide a clear summary of what was synced
   - Note any branches that are ahead/behind
   - Warn about any conflicts that need manual resolution

## Safety Notes
- If there are uncommitted changes, warn the user before proceeding
- If a merge conflict occurs, stop and explain the issue
- Never force push unless explicitly confirmed by the user
- If a branch doesn't exist locally, create it from the remote tracking branch
