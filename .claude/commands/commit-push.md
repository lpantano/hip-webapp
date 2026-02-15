---
model: haiku
---

# Commit and Push

## Input
Optional: Commit message or description of changes. If not provided, Claude will analyze the changes and create an appropriate commit message.

## Task
Analyze current git changes, create a meaningful commit following project conventions, and push to the remote repository.

## Output Format
Show:
- Summary of changed files
- Generated commit message
- Commit result
- Push result

## Instructions

1. **Check current git status**
   - Run `git status` to see all changes (never use -uall flag)
   - Run `git diff` to see staged and unstaged changes
   - Run `git log -1` to see the last commit message for style reference

2. **Analyze changes**
   - Review the diff output to understand what was modified
   - Identify the type of change (feature, fix, refactor, docs, etc.)
   - Determine which files should be staged

3. **Create commit message**
   - Follow conventional commit style: `type: brief description`
   - Types: feat, fix, refactor, docs, style, test, chore
   - Keep it concise (50 chars or less for first line)
   - Focus on the "why" rather than the "what"
   - Match the style of recent commits in the repository
   - If user provided a message via $ARGUMENTS, use it as guidance

4. **Stage and commit**
   - Stage relevant files with `git add <file1> <file2>...` (prefer specific files over `git add .`)
   - Avoid staging sensitive files (.env, credentials, etc.)
   - Create commit with message including co-author attribution:
     ```bash
     git commit -m "$(cat <<'EOF'
     <commit message here>

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     EOF
     )"
     ```

5. **Push to remote**
   - Run `git push` to push changes to remote
   - If push fails due to upstream changes, run `git pull --rebase` first
   - Report the results clearly

6. **Verify**
   - Run `git status` to confirm everything is pushed
   - Show the commit SHA and branch status

## Safety Notes

- NEVER commit files that likely contain secrets (.env, credentials.json, etc.)
- If sensitive files are detected, warn the user and skip them
- If there are no changes to commit, inform the user
- If push fails, explain the error and suggest next steps
- Don't use `--force` or `--no-verify` flags unless explicitly requested
- If pre-commit hooks fail, fix the issues and create a NEW commit (never amend unless requested)
- Prefer staging specific files by name rather than using `git add -A` or `git add .`

## Example Usage

```
/commit-push
# Analyzes changes and creates appropriate commit message

/commit-push "fix login bug"
# Uses "fix login bug" as guidance for commit message

/commit-push "add dark mode toggle"
# Creates commit with message based on "add dark mode toggle"
```
