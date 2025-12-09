#!/bin/bash

# Sprint Status Viewer
# Displays the current sprint status and upcoming sprints

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

REPO="lpantano/evidence-decoded"

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Evidence Decoded - Sprint Status${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Get current date
current_date=$(date +%Y-%m-%d)
echo -e "${CYAN}Current Date: ${current_date}${NC}\n"

# Function to display milestone info
display_milestone() {
    local milestone_title="$1"

    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}${milestone_title}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Get milestone info using API
    local milestone_data=$(gh api "/repos/${REPO}/milestones" --jq ".[] | select(.title==\"$milestone_title\")" 2>/dev/null)

    if [ -z "$milestone_data" ]; then
        echo -e "${RED}Milestone not found${NC}\n"
        return
    fi

    # Extract milestone details
    local due_date=$(echo "$milestone_data" | jq -r '.due_on // "No due date"' | cut -d'T' -f1)
    local open_issues=$(echo "$milestone_data" | jq -r '.open_issues // 0')
    local closed_issues=$(echo "$milestone_data" | jq -r '.closed_issues // 0')
    local description=$(echo "$milestone_data" | jq -r '.description // "No description"')

    echo -e "${CYAN}Due Date:${NC} $due_date"
    echo -e "${CYAN}Progress:${NC} $closed_issues closed / $open_issues open"
    echo -e "${CYAN}Description:${NC} $description"
    echo ""

    # Get milestone number for issue query
    local milestone_number=$(echo "$milestone_data" | jq -r '.number')

    # Get issues for this milestone
    echo -e "${CYAN}Issues:${NC}"
    gh api "/repos/${REPO}/issues?milestone=${milestone_number}&state=all&per_page=100" \
        --jq '.[] | "#\(.number) \(if .state == "closed" then "✓" else "○" end) \(.title)"' 2>/dev/null || echo "No issues found"

    echo ""
}# Check which sprint we're in
echo -e "${GREEN}Sprint Schedule:${NC}\n"

echo "Sprint 1: Dec 15-21, 2025 (Core UX Improvements)"
echo "Sprint 2: Dec 22-28, 2025 (First-Time User Experience)"
echo "Sprint 3: Dec 29-Jan 4, 2026 (Community Documentation)"
echo "Sprint 4: Jan 5-11, 2026 (Ambassador Program Launch)"
echo "Sprint 5: Jan 12-18, 2026 (Design & Mobile Polish)"
echo "Sprint 6: Jan 19-25, 2026 (Code Quality & Refactoring)"
echo "Sprint 7: Jan 26-Feb 1, 2026 (Advanced Features & Analytics)"
echo "Sprint 8: Feb 2-8, 2026 (Final Polish & Donation)"
echo ""

# Show current and next sprint
echo -e "${GREEN}Current Sprint Status:${NC}\n"

# Determine current sprint based on date
if [[ "$current_date" < "2025-12-15" ]]; then
    echo -e "${YELLOW}Before Sprint 1 starts${NC}"
    echo -e "Next: Sprint 1 starts on December 15, 2025\n"
    display_milestone "Sprint 1: Core UX Improvements & Quick Wins"
elif [[ "$current_date" < "2025-12-22" ]]; then
    echo -e "${GREEN}In Sprint 1${NC}\n"
    display_milestone "Sprint 1: Core UX Improvements & Quick Wins"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 2: First-Time User Experience"
elif [[ "$current_date" < "2025-12-29" ]]; then
    echo -e "${GREEN}In Sprint 2${NC}\n"
    display_milestone "Sprint 2: First-Time User Experience"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 3: Community Documentation"
elif [[ "$current_date" < "2026-01-05" ]]; then
    echo -e "${GREEN}In Sprint 3${NC}\n"
    display_milestone "Sprint 3: Community Documentation"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 4: Ambassador Program Launch"
elif [[ "$current_date" < "2026-01-12" ]]; then
    echo -e "${GREEN}In Sprint 4${NC}\n"
    display_milestone "Sprint 4: Ambassador Program Launch"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 5: Design & Mobile Polish"
elif [[ "$current_date" < "2026-01-19" ]]; then
    echo -e "${GREEN}In Sprint 5${NC}\n"
    display_milestone "Sprint 5: Design & Mobile Polish"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 6: Code Quality & Refactoring"
elif [[ "$current_date" < "2026-01-26" ]]; then
    echo -e "${GREEN}In Sprint 6${NC}\n"
    display_milestone "Sprint 6: Code Quality & Refactoring"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 7: Advanced Features & Analytics"
elif [[ "$current_date" < "2026-02-02" ]]; then
    echo -e "${GREEN}In Sprint 7${NC}\n"
    display_milestone "Sprint 7: Advanced Features & Analytics"
    echo -e "${CYAN}Next Sprint:${NC}"
    display_milestone "Sprint 8: Final Polish & Donation"
elif [[ "$current_date" < "2026-02-09" ]]; then
    echo -e "${GREEN}In Sprint 8 (Final Sprint)${NC}\n"
    display_milestone "Sprint 8: Final Polish & Donation"
else
    echo -e "${GREEN}All sprints completed! 🎉${NC}\n"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Quick Links:${NC}"
echo "Milestones: https://github.com/${REPO}/milestones"
echo "Issues: https://github.com/${REPO}/issues"
echo "Project Board: https://github.com/${REPO}/projects"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
