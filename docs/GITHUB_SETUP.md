# GitHub Milestones & Issues Setup Guide

This guide will help you create the milestones and issues for the release plan.

---

## Quick Start (Automated)

The easiest way to set up all milestones and issues is to use the automated bash script:

```bash
# Run from repository root
./scripts/setup-github-milestones.sh
```

**Prerequisites:**
- GitHub CLI (`gh`) installed: https://cli.github.com/
- Authenticated with GitHub: `gh auth login`
- Repository access to `lpantano/evidence-decoded`

The script will:
1. ✅ Create 8 milestones with proper due dates and descriptions
2. ✅ Assign 20 existing issues to their respective milestones
3. ✅ Create 7 new issues with full descriptions and labels

**Time saved:** ~30-45 minutes of manual work!

---

## Manual Setup (Alternative)

If you prefer to set things up manually, follow the steps below.

### Step 1: Create Milestones on GitHub

Go to: `https://github.com/lpantano/evidence-decoded/milestones`

Click **"New milestone"** and create each of these:

### Milestone 1: Sprint 1 - Core UX Improvements
- **Title**: Sprint 1: Core UX Improvements & Quick Wins
- **Due Date**: December 21, 2025
- **Description**:
```
Focus on MVP issues, claim card usability, and quick UI fixes.
Work: Dec 15-19 | Testing: Dec 20-21
Capacity: ~7 hours
```

### Milestone 2: Sprint 2 - First-Time User Experience
- **Title**: Sprint 2: First-Time User Experience
- **Due Date**: December 28, 2025
- **Description**:
```
Onboarding improvements, user guidance features, video tutorial integration.
Work: Dec 22-26 | Testing: Dec 27-28
Capacity: ~7 hours
```

### Milestone 3: Sprint 3 - Community Documentation
- **Title**: Sprint 3: Community Documentation
- **Due Date**: January 4, 2026
- **Description**:
```
Community guidelines, roadmap visibility, terms review.
Work: Dec 29-Jan 2 | Testing: Jan 3-4
Capacity: ~7 hours
```

### Milestone 4: Sprint 4 - Ambassador Program Launch
- **Title**: Sprint 4: Ambassador Program Launch
- **Due Date**: January 11, 2026
- **Description**:
```
Ambassador program implementation and community engagement features.
Work: Jan 5-9 | Testing: Jan 10-11
Capacity: ~7 hours
```

### Milestone 5: Sprint 5 - Design & Mobile Polish
- **Title**: Sprint 5: Design & Mobile Polish
- **Due Date**: January 18, 2026
- **Description**:
```
iOS fixes, design consistency, mobile experience improvements.
Work: Jan 12-16 | Testing: Jan 17-18
Capacity: ~7 hours
```

### Milestone 6: Sprint 6 - Code Quality & Refactoring
- **Title**: Sprint 6: Code Quality & Refactoring
- **Due Date**: January 25, 2026
- **Description**:
```
Code cleanup, technical debt reduction, performance improvements.
Work: Jan 19-23 | Testing: Jan 24-25
Capacity: ~7 hours
```

### Milestone 7: Sprint 7 - Advanced Features & Analytics
- **Title**: Sprint 7: Advanced Features & Analytics
- **Due Date**: February 1, 2026
- **Description**:
```
Analytics integration, error handling, component refactoring.
Work: Jan 26-30 | Testing: Jan 31-Feb 1
Capacity: ~7 hours
```

### Milestone 8: Sprint 8 - Final Polish & Donation
- **Title**: Sprint 8: Final Polish & Donation
- **Due Date**: February 8, 2026
- **Description**:
```
Donation system, final bug fixes, release preparation.
Work: Feb 2-6 | Testing: Feb 7-8
Capacity: ~6 hours
```

---

## Step 2: Create New Issues

Go to: `https://github.com/lpantano/evidence-decoded/issues/new`

### Issue 1: Add tooltips to claim cards

**Title**: Add tooltips to claim cards to explain each section

**Labels**: `enhancement`, `frontend`, `MVP`, `priority: high`

**Milestone**: Sprint 1: Core UX Improvements & Quick Wins

**Assignees**: (assign to yourself or leave blank)

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 1

---

### Issue 2: First-time video tutorial

**Title**: Add first-time video tutorial for new users

**Labels**: `enhancement`, `frontend`, `priority: high`

**Milestone**: Sprint 2: First-Time User Experience

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 2

---

### Issue 3: Review guidelines

**Title**: Create comprehensive review guidelines for claim reviews

**Labels**: `documentation`, `community`, `priority: high`

**Milestone**: Sprint 3: Community Documentation

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 3

---

### Issue 4: Roadmap page

**Title**: Add public roadmap page to website

**Labels**: `frontend`, `documentation`, `community`, `priority: high`

**Milestone**: Sprint 3: Community Documentation

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 4

---

### Issue 5: Ambassador application flow

**Title**: Implement ambassador program application flow

**Labels**: `enhancement`, `frontend`, `backend`, `community`, `priority: high`

**Milestone**: Sprint 4: Ambassador Program Launch

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 5

---

### Issue 6: Ambassador portal

**Title**: Create ambassador portal page for approved ambassadors

**Labels**: `enhancement`, `frontend`, `community`, `priority: medium`

**Milestone**: Sprint 4: Ambassador Program Launch

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 6

---

### Issue 7: Ambassador toolkit downloads

**Title**: Create ambassador toolkit download section

**Labels**: `enhancement`, `frontend`, `community`, `priority: medium`

**Milestone**: Sprint 4: Ambassador Program Launch

**Description**: Copy from `docs/NEW_ISSUES.md` - Issue 7

---

## Step 3: Assign Existing Issues to Milestones

### Sprint 1 Issues (Dec 15-21, 2025)
- #110: Bullets and text alignment → Sprint 1
- #109: Clickable links → Sprint 1
- #51: Claim submitted info → Sprint 1
- #48: Invalid PubMed ID error → Sprint 1

### Sprint 2 Issues (Dec 22-28, 2025)
- #5: Redesign upvote button → Sprint 2
- #18: Change "Install App" button → Sprint 2
- #49: Claims sorting → Sprint 2

### Sprint 3 Issues (Dec 29-Jan 4, 2026)
- #33: Review terms of use → Sprint 3
- #31: Team page integration → Sprint 3

### Sprint 4 Issues (Jan 5-11, 2026)
- #36: Topics for category → Sprint 4

### Sprint 5 Issues (Jan 12-18, 2026)
- #26: Design issues iOS18 → Sprint 5
- #57: Coding workflow into webpage → Sprint 5

### Sprint 6 Issues (Jan 19-25, 2026)
- #83: Standardize form state management → Sprint 6
- #81: Fix getCategoryColor utility → Sprint 6
- #78: Reusable form submission hook → Sprint 6
- #85: Audit unused dependencies → Sprint 6

### Sprint 7 Issues (Jan 26-Feb 1, 2026)
- #62: Add Google Analytics → Sprint 7
- #86: React Error Boundaries → Sprint 7
- #84: Break down large component files → Sprint 7

### Sprint 8 Issues (Feb 2-8, 2026)
- #61: Donation buttons → Sprint 8

---

## Step 4: Create Labels (if not exist)

Go to: `https://github.com/lpantano/evidence-decoded/labels`

Make sure these labels exist:
- `MVP` (color: #d73a4a)
- `enhancement` (color: #a2eeef)
- `frontend` (color: #15bc0e)
- `backend` (color: #5319e7)
- `documentation` (color: #0075ca)
- `community` (color: #7057ff)
- `design` (color: #3469ef)
- `priority: high` (color: #d93f0b)
- `priority: medium` (color: #86bb54)
- `priority: low` (color: #3656a7)
- `onboarding` (color: #fbca04)

---

## Step 5: Using GitHub CLI (Optional)

If you have GitHub CLI installed, you can use these commands:

### Create Milestones
```bash
# Sprint 1
gh milestone create --title "Sprint 1: Core UX Improvements & Quick Wins" --due-date 2025-12-21 --description "Focus on MVP issues, claim card usability, and quick UI fixes. Work: Dec 15-19 | Testing: Dec 20-21. Capacity: ~7 hours"

# Sprint 2
gh milestone create --title "Sprint 2: First-Time User Experience" --due-date 2025-12-28 --description "Onboarding improvements, user guidance features, video tutorial integration. Work: Dec 22-26 | Testing: Dec 27-28. Capacity: ~7 hours"

# Sprint 3
gh milestone create --title "Sprint 3: Community Documentation" --due-date 2026-01-04 --description "Community guidelines, roadmap visibility, terms review. Work: Dec 29-Jan 2 | Testing: Jan 3-4. Capacity: ~7 hours"

# Sprint 4
gh milestone create --title "Sprint 4: Ambassador Program Launch" --due-date 2026-01-11 --description "Ambassador program implementation and community engagement features. Work: Jan 5-9 | Testing: Jan 10-11. Capacity: ~7 hours"

# Sprint 5
gh milestone create --title "Sprint 5: Design & Mobile Polish" --due-date 2026-01-18 --description "iOS fixes, design consistency, mobile experience improvements. Work: Jan 12-16 | Testing: Jan 17-18. Capacity: ~7 hours"

# Sprint 6
gh milestone create --title "Sprint 6: Code Quality & Refactoring" --due-date 2026-01-25 --description "Code cleanup, technical debt reduction, performance improvements. Work: Jan 19-23 | Testing: Jan 24-25. Capacity: ~7 hours"

# Sprint 7
gh milestone create --title "Sprint 7: Advanced Features & Analytics" --due-date 2026-02-01 --description "Analytics integration, error handling, component refactoring. Work: Jan 26-30 | Testing: Jan 31-Feb 1. Capacity: ~7 hours"

# Sprint 8
gh milestone create --title "Sprint 8: Final Polish & Donation" --due-date 2026-02-08 --description "Donation system, final bug fixes, release preparation. Work: Feb 2-6 | Testing: Feb 7-8. Capacity: ~6 hours"
```

### Assign Existing Issues to Milestones
```bash
# Sprint 1
gh issue edit 110 --milestone "Sprint 1: Core UX Improvements & Quick Wins"
gh issue edit 109 --milestone "Sprint 1: Core UX Improvements & Quick Wins"
gh issue edit 51 --milestone "Sprint 1: Core UX Improvements & Quick Wins"
gh issue edit 48 --milestone "Sprint 1: Core UX Improvements & Quick Wins"

# Sprint 2
gh issue edit 5 --milestone "Sprint 2: First-Time User Experience"
gh issue edit 18 --milestone "Sprint 2: First-Time User Experience"
gh issue edit 49 --milestone "Sprint 2: First-Time User Experience"

# Sprint 3
gh issue edit 33 --milestone "Sprint 3: Community Documentation"
gh issue edit 31 --milestone "Sprint 3: Community Documentation"

# Sprint 4
gh issue edit 36 --milestone "Sprint 4: Ambassador Program Launch"

# Sprint 5
gh issue edit 26 --milestone "Sprint 5: Design & Mobile Polish"
gh issue edit 57 --milestone "Sprint 5: Design & Mobile Polish"

# Sprint 6
gh issue edit 83 --milestone "Sprint 6: Code Quality & Refactoring"
gh issue edit 81 --milestone "Sprint 6: Code Quality & Refactoring"
gh issue edit 78 --milestone "Sprint 6: Code Quality & Refactoring"
gh issue edit 85 --milestone "Sprint 6: Code Quality & Refactoring"

# Sprint 7
gh issue edit 62 --milestone "Sprint 7: Advanced Features & Analytics"
gh issue edit 86 --milestone "Sprint 7: Advanced Features & Analytics"
gh issue edit 84 --milestone "Sprint 7: Advanced Features & Analytics"

# Sprint 8
gh issue edit 61 --milestone "Sprint 8: Final Polish & Donation"
```

---

## Quick Reference: Sprint Summary

| Sprint | Dates | Theme | Issues |
|--------|-------|-------|--------|
| 1 | Dec 15-21 | Core UX Improvements | #110, #109, #51, #48, NEW: Tooltips |
| 2 | Dec 22-28 | First-Time User Experience | #5, #18, #49, NEW: Video Tutorial |
| 3 | Dec 29-Jan 4 | Community Documentation | #33, #31, NEW: Review Guidelines, Roadmap |
| 4 | Jan 5-11 | Ambassador Program Launch | #36, NEW: Ambassador (3 issues) |
| 5 | Jan 12-18 | Design & Mobile Polish | #26, #57 |
| 6 | Jan 19-25 | Code Quality & Refactoring | #83, #81, #78, #85 |
| 7 | Jan 26-Feb 1 | Advanced Features & Analytics | #62, #86, #84 |
| 8 | Feb 2-8 | Final Polish & Donation | #61 |

---

## Next Steps

1. ✅ Review all documentation files created
2. ⬜ Create milestones on GitHub
3. ⬜ Create 7 new issues from NEW_ISSUES.md
4. ⬜ Assign existing issues to milestones
5. ⬜ Review and adjust priorities as needed
6. ⬜ Start Sprint 1 on December 15, 2025

---

## Documents Created

- ✅ `/docs/RELEASE_PLAN.md` - Complete release plan with all sprints
- ✅ `/docs/NEW_ISSUES.md` - Detailed new issue descriptions
- ✅ `/docs/roadmap.md` - Public-facing roadmap content
- ✅ `/docs/QA_CHECKLIST.md` - Comprehensive testing checklist
- ✅ `/docs/GITHUB_SETUP.md` - This setup guide

---

**Questions?** Review the CLAUDE.md rules and reach out if you need help!
