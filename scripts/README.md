# Scripts Directory

This directory contains utility scripts for the Evidence Decoded project.

---

## Available Scripts

### `setup-github-milestones.sh`

Automated setup script for GitHub milestones and issues based on the release plan.

**Purpose:** Creates all milestones, assigns existing issues, and creates new feature issues for the 8-sprint release cycle.

**Prerequisites:**
- GitHub CLI (`gh`) installed: https://cli.github.com/
- Authenticated with GitHub CLI: `gh auth login`
- Repository access to `lpantano/evidence-decoded`

**Usage:**
```bash
# From repository root
./scripts/setup-github-milestones.sh
```

**What it does:**
1. Creates 8 milestones (Sprint 1 through Sprint 8) with:
   - Proper titles
   - Due dates
   - Sprint descriptions
2. Assigns 20 existing issues to appropriate milestones:
   - Sprint 1: #110, #109, #51, #48
   - Sprint 2: #5, #18, #49
   - Sprint 3: #33, #31
   - Sprint 4: #36
   - Sprint 5: #26, #57
   - Sprint 6: #83, #81, #78, #85
   - Sprint 7: #62, #86, #84
   - Sprint 8: #61
3. Creates 7 new issues:
   - Add tooltips to claim cards (Sprint 1)
   - First-time video tutorial (Sprint 2)
   - Review guidelines document (Sprint 3)
   - Public roadmap page (Sprint 3)
   - Ambassador application flow (Sprint 4)
   - Ambassador portal page (Sprint 4)
   - Ambassador toolkit downloads (Sprint 4)

**Output:**
- Colored terminal output showing progress
- Success/failure messages for each operation
- Summary at the end

**Error Handling:**
- Exits on first error (set -e)
- Checks for GitHub CLI installation
- Checks for authentication
- Handles existing milestones gracefully

**Time saved:** ~30-45 minutes of manual GitHub work

---

### `sprint-status.sh`

View the current sprint status and upcoming work.

**Purpose:** Displays which sprint is currently active, shows open/closed issues for the current sprint, and previews the next sprint.

**Prerequisites:**
- GitHub CLI (`gh`) installed and authenticated
- Repository access to `lpantano/evidence-decoded`

**Usage:**
```bash
# From repository root
./scripts/sprint-status.sh
```

**What it displays:**
- Current date and active sprint
- Sprint schedule overview
- Current sprint milestone details
- List of issues (open/closed) for current sprint
- Next sprint preview
- Quick links to GitHub milestones and issues

**Use cases:**
- Daily standup preparation
- Sprint planning
- Quick status check
- Team updates

---

### Other Scripts

#### `debug-claim-state.ts`
TypeScript script for debugging claim states.

#### `debug-single-claim.ts`
TypeScript script for debugging individual claims.

#### `populate-evidence-status.ts`
Script to populate evidence status for existing claims.

#### `query-claim-data.ts`
Utility script to query claim data from the database.

---

## Adding New Scripts

When adding new scripts to this directory:

1. **Name clearly:** Use descriptive, kebab-case names
2. **Add shebang:** Start with appropriate shebang (`#!/bin/bash` or `#!/usr/bin/env node`)
3. **Make executable:** Run `chmod +x scripts/your-script.sh`
4. **Document here:** Add entry to this README
5. **Add comments:** Include purpose, usage, and prerequisites in script
6. **Error handling:** Use `set -e` for bash scripts
7. **Follow conventions:** Match code style from CLAUDE.md

---

## Best Practices

- Test scripts locally before committing
- Use environment variables for sensitive data
- Provide clear error messages
- Include usage examples in comments
- Handle edge cases and errors gracefully
- Use colors for better terminal output (when appropriate)
- Check prerequisites before running main logic

---

## Troubleshooting

### GitHub CLI Issues

**Problem:** `gh: command not found`
**Solution:** Install GitHub CLI from https://cli.github.com/

**Problem:** `gh auth status` fails
**Solution:** Run `gh auth login` and follow the prompts

**Problem:** Permission denied when creating issues
**Solution:** Ensure you have write access to the repository

### Script Execution Issues

**Problem:** `Permission denied` when running script
**Solution:** Run `chmod +x scripts/your-script.sh`

**Problem:** Script fails midway
**Solution:** Check error message, fix issue, re-run script (idempotent operations handle duplicates)

---

For more information, see:
- Release Plan: `/docs/RELEASE_PLAN.md`
- GitHub Setup Guide: `/docs/GITHUB_SETUP.md`
- New Issues Documentation: `/docs/NEW_ISSUES.md`
