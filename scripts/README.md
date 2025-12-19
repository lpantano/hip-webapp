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

### `populate-claim-labels.ts`

One-time population script to automatically infer and assign topic labels to existing claims.

**Purpose:** Analyzes claim titles and descriptions using keyword matching to intelligently infer appropriate topic labels (like pregnancy, nutrition, exercise, etc.) and updates the database.

**Prerequisites:**
- Node.js and npm installed
- `tsx` package for running TypeScript: `npm install -g tsx`
- `.env.local` file with Supabase credentials:
  - `SUPABASE_URL` or `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (required for bypassing RLS)

**Usage:**
```bash
# Dry run (preview changes without saving)
tsx scripts/populate-claim-labels.ts --dry-run

# Live run (apply changes to database)
tsx scripts/populate-claim-labels.ts
```

**What it does:**
1. Fetches all claims from the database
2. Analyzes each claim's title and description for keywords
3. Infers appropriate labels based on 90+ keyword mappings across 36 labels
4. Updates the `labels` column in the database
5. Provides detailed statistics and summary

**Label Categories:**
- **Reproductive & Lifecycle** (10 labels): pregnancy, fertility, menopause, etc.
- **Nutrition & Diet** (4 labels): nutrition, supplements, diet, etc.
- **Physical Health & Fitness** (5 labels): exercise, sleep, fitness, etc.
- **Body Systems** (8 labels): heart-health, bone-health, hormone-health, etc.
- **Mental & Cognitive Health** (5 labels): mental-health, stress, anxiety, etc.
- **General** (3 labels): general-health, chronic-pain, aging

**Behavior:**
- Updates claims even if they already have labels (overwrites)
- Skips claims where no labels can be inferred
- Shows preview of old vs new labels when updating

**Example Output:**
```
✓ [a1b2c3d4...] NEW [3 labels]: "Does exercise during pregnancy improve outcomes?"
   Labels: [pregnancy, exercise, general-health]

↻ [e5f6g7h8...] UPDATE [2 labels]: "Vitamin D supplementation for bone health"
   Old: [nutrition]
   New: [nutrition, supplements, bone-health]
```

**Time saved:** Manually categorizing hundreds of claims would take hours

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
