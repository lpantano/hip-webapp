#!/bin/bash

# GitHub Milestones and Issues Setup Script
# This script creates milestones and assigns issues for the Evidence Decoded release plan
# Requires: GitHub CLI (gh) installed and authenticated

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Repository info
REPO="lpantano/evidence-decoded"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Evidence Decoded - GitHub Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI is installed and authenticated${NC}\n"

# Function to create milestone
create_milestone() {
    local title="$1"
    local due_date="$2"
    local description="$3"

    echo -e "${YELLOW}Creating milestone: ${title}${NC}"

    # Convert date to ISO 8601 format with time
    local due_date_iso="${due_date}T23:59:59Z"

    # Create milestone using GitHub API
    local response=$(gh api \
        --method POST \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/repos/${REPO}/milestones" \
        -f title="$title" \
        -f state='open' \
        -f description="$description" \
        -f due_on="$due_date_iso" 2>&1)

    if echo "$response" | grep -q '"number"'; then
        echo -e "${GREEN}✓ Created: ${title}${NC}\n"
    elif echo "$response" | grep -q "already_exists"; then
        echo -e "${YELLOW}⚠ Milestone already exists: ${title}${NC}\n"
    else
        echo -e "${RED}✗ Failed to create: ${title}${NC}"
        echo -e "${RED}Error: ${response}${NC}\n"
    fi
}

# Function to get milestone number by title
get_milestone_number() {
    local title="$1"
    gh api "/repos/${REPO}/milestones" --jq ".[] | select(.title==\"$title\") | .number" 2>/dev/null
}

# Function to assign issue to milestone
assign_issue() {
    local issue_number="$1"
    local milestone_title="$2"

    echo -e "${YELLOW}Assigning issue #${issue_number} to ${milestone_title}${NC}"

    # Get milestone number
    local milestone_number=$(get_milestone_number "$milestone_title")

    if [ -z "$milestone_number" ]; then
        echo -e "${RED}✗ Milestone not found: ${milestone_title}${NC}\n"
        return 1
    fi

    # Assign issue to milestone
    local response=$(gh api \
        --method PATCH \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/repos/${REPO}/issues/${issue_number}" \
        -F milestone="$milestone_number" 2>&1)

    if echo "$response" | grep -q '"number"'; then
        echo -e "${GREEN}✓ Assigned issue #${issue_number}${NC}\n"
    else
        echo -e "${RED}✗ Failed to assign issue #${issue_number}${NC}"
        echo -e "${RED}Error: ${response}${NC}\n"
    fi
}

# Function to create issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local milestone_title="$4"

    echo -e "${YELLOW}Creating issue: ${title}${NC}"

    # Get milestone number
    local milestone_number=$(get_milestone_number "$milestone_title")

    if [ -z "$milestone_number" ]; then
        echo -e "${RED}✗ Milestone not found: ${milestone_title}${NC}\n"
        return 1
    fi

    # Convert comma-separated labels to array
    IFS=',' read -ra label_array <<< "$labels"

    # Build the gh api command with labels
    local gh_cmd="gh api --method POST -H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28' '/repos/${REPO}/issues' -f title=\"\$title\" -f body=\"\$body\" -F milestone=\"\$milestone_number\""

    for label in "${label_array[@]}"; do
        gh_cmd+=" -f labels[]=\"$label\""
    done

    # Create issue using GitHub API
    local response=$(eval "$gh_cmd" 2>&1)

    if echo "$response" | grep -q '"number"'; then
        local issue_num=$(echo "$response" | grep -o '"number":[0-9]*' | head -1 | cut -d: -f2)
        echo -e "${GREEN}✓ Created issue #${issue_num}: ${title}${NC}\n"
    else
        echo -e "${RED}✗ Failed to create issue: ${title}${NC}"
        echo -e "${RED}Error: ${response}${NC}\n"
    fi
}

echo -e "${BLUE}Step 1: Creating Milestones${NC}\n"

# # Create Sprint 1
# create_milestone \
#     "Sprint 1: Core UX Improvements & Quick Wins" \
#     "2025-12-21" \
#     "Focus on MVP issues, claim card usability, and quick UI fixes. Work: Dec 15-19 | Testing: Dec 20-21. Capacity: ~7 hours"

# # Create Sprint 2
# create_milestone \
#     "Sprint 2: First-Time User Experience" \
#     "2025-12-28" \
#     "Onboarding improvements, user guidance features, video tutorial integration. Work: Dec 22-26 | Testing: Dec 27-28. Capacity: ~7 hours"

# # Create Sprint 3
# create_milestone \
#     "Sprint 3: Community Documentation" \
#     "2026-01-04" \
#     "Community guidelines, roadmap visibility, terms review. Work: Dec 29-Jan 2 | Testing: Jan 3-4. Capacity: ~7 hours"

# # Create Sprint 4
# create_milestone \
#     "Sprint 4: Ambassador Program Launch" \
#     "2026-01-11" \
#     "Ambassador program implementation and community engagement features. Work: Jan 5-9 | Testing: Jan 10-11. Capacity: ~7 hours"

# # Create Sprint 5
# create_milestone \
#     "Sprint 5: Design & Mobile Polish" \
#     "2026-01-18" \
#     "iOS fixes, design consistency, mobile experience improvements. Work: Jan 12-16 | Testing: Jan 17-18. Capacity: ~7 hours"

# # Create Sprint 6
# create_milestone \
#     "Sprint 6: Code Quality & Refactoring" \
#     "2026-01-25" \
#     "Code cleanup, technical debt reduction, performance improvements. Work: Jan 19-23 | Testing: Jan 24-25. Capacity: ~7 hours"

# # Create Sprint 7
# create_milestone \
#     "Sprint 7: Advanced Features & Analytics" \
#     "2026-02-01" \
#     "Analytics integration, error handling, component refactoring. Work: Jan 26-30 | Testing: Jan 31-Feb 1. Capacity: ~7 hours"

# # Create Sprint 8
# create_milestone \
#     "Sprint 8: Final Polish & Donation" \
#     "2026-02-08" \
#     "Donation system, final bug fixes, release preparation. Work: Feb 2-6 | Testing: Feb 7-8. Capacity: ~6 hours"

# echo -e "${BLUE}Step 2: Assigning Existing Issues to Milestones${NC}\n"

# # Sprint 1 Issues
# assign_issue 110 "Sprint 1: Core UX Improvements & Quick Wins"
# assign_issue 109 "Sprint 1: Core UX Improvements & Quick Wins"
# assign_issue 51 "Sprint 1: Core UX Improvements & Quick Wins"
# assign_issue 48 "Sprint 1: Core UX Improvements & Quick Wins"

# # Sprint 2 Issues
# assign_issue 5 "Sprint 2: First-Time User Experience"
# assign_issue 18 "Sprint 2: First-Time User Experience"
# assign_issue 49 "Sprint 2: First-Time User Experience"

# # Sprint 3 Issues
# assign_issue 33 "Sprint 3: Community Documentation"
# assign_issue 31 "Sprint 3: Community Documentation"

# # Sprint 4 Issues
# assign_issue 36 "Sprint 4: Ambassador Program Launch"

# # Sprint 5 Issues
# assign_issue 26 "Sprint 5: Design & Mobile Polish"
# assign_issue 57 "Sprint 5: Design & Mobile Polish"

# # Sprint 6 Issues
# assign_issue 83 "Sprint 6: Code Quality & Refactoring"
# assign_issue 81 "Sprint 6: Code Quality & Refactoring"
# assign_issue 78 "Sprint 6: Code Quality & Refactoring"
# assign_issue 85 "Sprint 6: Code Quality & Refactoring"

# # Sprint 7 Issues
# assign_issue 62 "Sprint 7: Advanced Features & Analytics"
# assign_issue 86 "Sprint 7: Advanced Features & Analytics"
# assign_issue 84 "Sprint 7: Advanced Features & Analytics"

# # Sprint 8 Issues
# assign_issue 61 "Sprint 8: Final Polish & Donation"

echo -e "${BLUE}Step 3: Creating New Issues${NC}\n"

# Issue 1: Tooltips
create_issue \
    "Add tooltips to claim cards to explain each section" \
    "Add hover tooltips to claim cards to help users understand what each section means. This will improve the first-time user experience and reduce confusion.

## Sections needing tooltips:
- [ ] **Classification** - Explain what the classification categories mean
- [ ] **Evidence Status** - Explain the evidence quality indicators
- [ ] **Review Count** - Explain what reviews are and why they matter
- [ ] **Upvote Count** - Explain the community voting system
- [ ] **Evidence Balance** - Explain how the balance scale works
- [ ] **Publication Source** - Explain PubMed ID, DOI, and custom sources

## Acceptance Criteria:
- [ ] Tooltips appear on hover (desktop)
- [ ] Tooltips are accessible via tap/hold on mobile
- [ ] Tooltip text is clear and concise (1-2 sentences max)
- [ ] Tooltips use consistent styling across all sections
- [ ] Tooltips don't interfere with card interactions (clicks, etc.)
- [ ] Accessible via keyboard navigation
- [ ] Works in both light and dark mode

## Technical Notes:
- Use shadcn/ui Tooltip component (\`npx shadcn@latest add tooltip\` if not present)
- Follow existing component patterns in \`src/components/\`
- Consider using the info icon (ℹ️) or question mark icon
- Ensure mobile-friendly implementation

**Estimated Effort**: 3-4 hours" \
    "enhancement,frontend,MVP,priority: high" \
    "Sprint 1: Core UX Improvements & Quick Wins"

# Issue 2: Video Tutorial
create_issue \
    "Add first-time video tutorial for new users" \
    "Create an embedded video tutorial that appears for first-time users to help them understand how to use Evidence Decoded effectively.

## Requirements:
- [ ] Video should be hosted on YouTube/Vimeo (embeddable)
- [ ] Show only to first-time users (track in localStorage or user preferences)
- [ ] Include a \"Skip\" and \"Don't show again\" option
- [ ] Video covers:
  - [ ] What Evidence Decoded is
  - [ ] How to submit a claim
  - [ ] How to review evidence
  - [ ] How to interpret the evidence balance
  - [ ] How to contribute as an expert

## Acceptance Criteria:
- [ ] Video modal appears on first visit after signup/login
- [ ] User can dismiss the tutorial
- [ ] User preference is saved (don't show again)
- [ ] Video is responsive and works on mobile
- [ ] \"Watch tutorial again\" option available in user menu or help section
- [ ] Video loads efficiently without blocking page load

## Technical Notes:
- Create a new component \`src/components/onboarding/VideoTutorial.tsx\`
- Use Dialog component from shadcn/ui
- Store preference in Supabase user_preferences table or localStorage
- Video should be hosted externally (YouTube unlisted video)
- Consider using react-player or native iframe embed

## Dependencies:
- Video content needs to be created/recorded first
- May need to create a help/tutorial section in the app

**Estimated Effort**: 4-5 hours (excluding video creation time)" \
    "enhancement,frontend,priority: high" \
    "Sprint 2: First-Time User Experience"

# Issue 3: Review Guidelines
create_issue \
    "Create comprehensive review guidelines for claim reviews" \
    "Create a comprehensive markdown document that provides clear guidelines for community members reviewing scientific claims.

## Content to Include:
- [ ] **What is a review?** - Purpose and importance
- [ ] **Who can review?** - Roles and permissions
- [ ] **Review process** - Step-by-step guide
- [ ] **Quality criteria** - What makes a good review
- [ ] **Evidence evaluation** - How to assess study quality
- [ ] **Bias recognition** - Common biases to watch for
- [ ] **Classification guidelines** - How to categorize claims
- [ ] **Citation standards** - How to cite sources properly
- [ ] **Code of conduct** - Professional behavior expectations
- [ ] **Common mistakes** - What to avoid
- [ ] **Examples** - Good vs. poor reviews

## Acceptance Criteria:
- [ ] Document created at \`docs/review-guidelines.md\`
- [ ] Clear, accessible language (avoid excessive jargon)
- [ ] Includes practical examples
- [ ] Links to relevant external resources (if helpful)
- [ ] Reviewed by subject matter experts
- [ ] Follows markdown best practices

## Future Enhancement:
- Link this document from the review submission form
- Create a condensed version for in-app tooltips
- Translate to multiple languages

**Estimated Effort**: 3-4 hours" \
    "documentation,community,priority: high" \
    "Sprint 3: Community Documentation"

# Issue 4: Roadmap Page
create_issue \
    "Add public roadmap page to website" \
    "Create a dedicated roadmap page on the website that shows the community what features are planned, in progress, and completed.

## Requirements:
- [ ] Create \`/roadmap\` route
- [ ] Display roadmap information from markdown file
- [ ] Show timeline/quarters for planned features
- [ ] Include links to GitHub issues/milestones
- [ ] Allow community to suggest features (link to GitHub issues)

## Content Sections:
- [ ] **Completed** - Recently shipped features
- [ ] **In Progress** - Current sprint work
- [ ] **Planned** - Upcoming sprints (2-3 sprints ahead)
- [ ] **Future** - Long-term vision items
- [ ] **Community Requests** - Top-voted feature requests

## Acceptance Criteria:
- [ ] New page component created at \`src/pages/Roadmap.tsx\`
- [ ] Route added to router configuration
- [ ] Markdown file at \`docs/roadmap.md\` with initial content (already exists)
- [ ] Page is mobile-responsive
- [ ] Includes call-to-action for community participation
- [ ] Links to GitHub for issue tracking
- [ ] Updates automatically or has clear update date shown

## Technical Notes:
- Use similar layout to existing pages (About, Team)
- Consider using a timeline component or simple card layout
- Markdown can be read and parsed at build time or runtime
- May want to sync with GitHub milestones API (future enhancement)

**Estimated Effort**: 3-4 hours" \
    "frontend,documentation,community,priority: high" \
    "Sprint 3: Community Documentation"

# Issue 5: Ambassador Application Flow
create_issue \
    "Implement ambassador program application flow" \
    "Create the application flow for users to apply to become Health Integrity Ambassadors. This includes the form, backend storage, and admin review capabilities.

## Requirements:
- [ ] Application form with required fields
- [ ] Database table for ambassador applications
- [ ] Email notification to admins on new applications
- [ ] Admin interface to review applications
- [ ] Status tracking (pending, approved, rejected)
- [ ] Email notifications to applicants on status change

## Application Form Fields:
- [ ] Full name
- [ ] Email (pre-filled from user account)
- [ ] Location (city, state/country)
- [ ] Why do you want to be an ambassador? (textarea)
- [ ] What activities are you interested in? (checkboxes)
- [ ] Time commitment you can provide (dropdown)
- [ ] Relevant experience (optional, textarea)
- [ ] How did you hear about the program? (dropdown)
- [ ] Terms acceptance (checkbox)

## Acceptance Criteria:
- [ ] Form component created at \`src/components/forms/AmbassadorApplicationForm.tsx\`
- [ ] Form validation with Zod schema
- [ ] Database migration created for \`ambassador_applications\` table
- [ ] Application submission saves to database
- [ ] Toast notification on successful submission
- [ ] Email sent to admin team on new application
- [ ] Admin can view applications in Admin panel
- [ ] Admin can approve/reject applications

## Technical Notes:
- Create database table with fields above plus status, created_at, reviewed_at
- Use React Hook Form + Zod for validation
- Use Supabase Edge Function for email notifications
- Link from \`/community\` or create dedicated \`/ambassador\` page
- Consider rate limiting to prevent spam applications

## Dependencies:
- Email notification system must be configured
- Admin panel must exist (or create basic version)

**Estimated Effort**: 5-6 hours" \
    "enhancement,frontend,backend,community,priority: high" \
    "Sprint 4: Ambassador Program Launch"

# Issue 6: Ambassador Portal
create_issue \
    "Create ambassador portal page for approved ambassadors" \
    "Create a dedicated portal page for approved ambassadors where they can access resources, track activities, and connect with other ambassadors.

## Features:
- [ ] Dashboard showing ambassador stats
- [ ] Resource library access
- [ ] Activity tracking/logging
- [ ] Upcoming events calendar
- [ ] Ambassador community forum/chat (future)
- [ ] Recognition/badges for active ambassadors

## Portal Sections:
1. **Welcome & Overview** - Ambassador mission reminder, quick links to key resources
2. **Resources** - Presentation slides, promotional materials, talking points, social media graphics, email templates
3. **Activity Log** - Log activities, view quarterly summary, track progress
4. **Community** - List of other ambassadors, monthly call schedule, discussion board (future)
5. **Support** - Contact support, FAQ, submit feedback

## Acceptance Criteria:
- [ ] Page component created at \`src/pages/AmbassadorPortal.tsx\`
- [ ] Route protected - only accessible to approved ambassadors
- [ ] Responsive design works on mobile
- [ ] All resources are accessible and downloadable
- [ ] Activity logging functionality works
- [ ] Stats display correctly

## Technical Notes:
- Check user role/status before allowing access
- Create new database table \`ambassador_activities\` for logging
- Store resources in Supabase Storage
- Use existing UI components for consistency

## Dependencies:
- Ambassador application flow must be complete
- Resource files must be created and uploaded
- User roles must include \"ambassador\" status

**Estimated Effort**: 4-5 hours" \
    "enhancement,frontend,community,priority: medium" \
    "Sprint 4: Ambassador Program Launch"

# Issue 7: Ambassador Toolkit Downloads
create_issue \
    "Create ambassador toolkit download section" \
    "Create a section within the ambassador portal where ambassadors can download all toolkit materials in one place.

## Toolkit Materials:
- [ ] Presentation slides (PowerPoint/PDF)
- [ ] Promotional flyer (PDF, print-ready)
- [ ] Social media graphics pack (ZIP)
- [ ] Email templates (Word/PDF)
- [ ] Talking points guide (PDF)
- [ ] Ambassador handbook (PDF)
- [ ] Logo files (various formats)
- [ ] Video assets (if available)

## Acceptance Criteria:
- [ ] Download section in ambassador portal
- [ ] All files uploaded to Supabase Storage
- [ ] Each file has clear description and file size shown
- [ ] Download buttons work correctly
- [ ] Files are organized by category
- [ ] \"Download All\" option (ZIP file)
- [ ] Download tracking (analytics)

## Technical Notes:
- Store files in Supabase Storage bucket \`ambassador-resources\`
- Set appropriate permissions (authenticated ambassadors only)
- Create download links with proper CORS settings
- Consider CDN for faster downloads
- Track download counts in database

## Dependencies:
- All toolkit materials must be created/designed first
- Supabase Storage bucket must be configured

**Estimated Effort**: 2-3 hours (excluding material creation)" \
    "enhancement,frontend,community,priority: medium" \
    "Sprint 4: Ambassador Program Launch"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Summary:${NC}"
echo "- Created 8 milestones"
echo "- Assigned 20 existing issues to milestones"
echo "- Created 7 new issues"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review milestones at: https://github.com/${REPO}/milestones"
echo "2. Review issues at: https://github.com/${REPO}/issues"
echo "3. Start Sprint 1 on December 15, 2025!"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
