# New GitHub Issues to Create

## Issue 1: Add tooltips to claim cards to explain each section

**Title**: Add tooltips to claim cards to explain each section

**Labels**: `enhancement`, `frontend`, `MVP`, `priority: high`

**Milestone**: Sprint 1: December 15-21, 2025

**Description**:
Add hover tooltips to claim cards to help users understand what each section means. This will improve the first-time user experience and reduce confusion.

### Sections needing tooltips:
- [ ] **Classification** - Explain what the classification categories mean
- [ ] **Evidence Status** - Explain the evidence quality indicators
- [ ] **Review Count** - Explain what reviews are and why they matter
- [ ] **Upvote Count** - Explain the community voting system
- [ ] **Evidence Balance** - Explain how the balance scale works
- [ ] **Publication Source** - Explain PubMed ID, DOI, and custom sources

### Acceptance Criteria:
- [ ] Tooltips appear on hover (desktop)
- [ ] Tooltips are accessible via tap/hold on mobile
- [ ] Tooltip text is clear and concise (1-2 sentences max)
- [ ] Tooltips use consistent styling across all sections
- [ ] Tooltips don't interfere with card interactions (clicks, etc.)
- [ ] Accessible via keyboard navigation
- [ ] Works in both light and dark mode

### Technical Notes:
- Use shadcn/ui Tooltip component (`npx shadcn@latest add tooltip` if not present)
- Follow existing component patterns in `src/components/`
- Consider using the info icon (ℹ️) or question mark icon
- Ensure mobile-friendly implementation

### Estimated Effort: 3-4 hours

---

## Issue 2: Add first-time video tutorial for new users

**Title**: Add first-time video tutorial for new users

**Labels**: `enhancement`, `frontend`, `onboarding`, `priority: high`

**Milestone**: Sprint 2: December 22-28, 2025

**Description**:
Create an embedded video tutorial that appears for first-time users to help them understand how to use Evidence Decoded effectively.

### Requirements:
- [ ] Video should be hosted on YouTube/Vimeo (embeddable)
- [ ] Show only to first-time users (track in localStorage or user preferences)
- [ ] Include a "Skip" and "Don't show again" option
- [ ] Video covers:
  - [ ] What Evidence Decoded is
  - [ ] How to submit a claim
  - [ ] How to review evidence
  - [ ] How to interpret the evidence balance
  - [ ] How to contribute as an expert

### Acceptance Criteria:
- [ ] Video modal appears on first visit after signup/login
- [ ] User can dismiss the tutorial
- [ ] User preference is saved (don't show again)
- [ ] Video is responsive and works on mobile
- [ ] "Watch tutorial again" option available in user menu or help section
- [ ] Video loads efficiently without blocking page load

### Technical Notes:
- Create a new component `src/components/onboarding/VideoTutorial.tsx`
- Use Dialog component from shadcn/ui
- Store preference in Supabase user_preferences table or localStorage
- Video should be hosted externally (YouTube unlisted video)
- Consider using react-player or native iframe embed

### Dependencies:
- Video content needs to be created/recorded first
- May need to create a help/tutorial section in the app

### Estimated Effort: 4-5 hours (excluding video creation time)

---

## Issue 3: Create review guidelines document

**Title**: Create comprehensive review guidelines for claim reviews

**Labels**: `documentation`, `community`, `priority: high`

**Milestone**: Sprint 3: December 29, 2025 - January 4, 2026

**Description**:
Create a comprehensive markdown document that provides clear guidelines for community members reviewing scientific claims.

### Content to Include:
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

### Acceptance Criteria:
- [ ] Document created at `docs/review-guidelines.md`
- [ ] Clear, accessible language (avoid excessive jargon)
- [ ] Includes practical examples
- [ ] Links to relevant external resources (if helpful)
- [ ] Reviewed by subject matter experts
- [ ] Follows markdown best practices

### Future Enhancement:
- Link this document from the review submission form
- Create a condensed version for in-app tooltips
- Translate to multiple languages

### Estimated Effort: 3-4 hours

---

## Issue 4: Add roadmap page to website

**Title**: Add public roadmap page to website

**Labels**: `frontend`, `documentation`, `community`, `priority: high`

**Milestone**: Sprint 3: December 29, 2025 - January 4, 2026

**Description**:
Create a dedicated roadmap page on the website that shows the community what features are planned, in progress, and completed.

### Requirements:
- [ ] Create `/roadmap` route
- [ ] Display roadmap information from markdown file
- [ ] Show timeline/quarters for planned features
- [ ] Include links to GitHub issues/milestones
- [ ] Allow community to suggest features (link to GitHub issues)

### Content Sections:
- [ ] **Completed** - Recently shipped features
- [ ] **In Progress** - Current sprint work
- [ ] **Planned** - Upcoming sprints (2-3 sprints ahead)
- [ ] **Future** - Long-term vision items
- [ ] **Community Requests** - Top-voted feature requests

### Acceptance Criteria:
- [ ] New page component created at `src/pages/Roadmap.tsx`
- [ ] Route added to router configuration
- [ ] Markdown file created at `docs/roadmap.md` with initial content
- [ ] Page is mobile-responsive
- [ ] Includes call-to-action for community participation
- [ ] Links to GitHub for issue tracking
- [ ] Updates automatically or has clear update date shown

### Technical Notes:
- Use similar layout to existing pages (About, Team)
- Consider using a timeline component or simple card layout
- Markdown can be read and parsed at build time or runtime
- May want to sync with GitHub milestones API (future enhancement)

### Estimated Effort: 3-4 hours

---

## Issue 5: Implement ambassador program application flow

**Title**: Implement ambassador program application flow

**Labels**: `enhancement`, `frontend`, `backend`, `community`, `priority: high`

**Milestone**: Sprint 4: January 5-11, 2026

**Description**:
Create the application flow for users to apply to become Health Integrity Ambassadors. This includes the form, backend storage, and admin review capabilities.

### Requirements:
- [ ] Application form with required fields
- [ ] Database table for ambassador applications
- [ ] Email notification to admins on new applications
- [ ] Admin interface to review applications
- [ ] Status tracking (pending, approved, rejected)
- [ ] Email notifications to applicants on status change

### Application Form Fields:
- [ ] Full name
- [ ] Email (pre-filled from user account)
- [ ] Location (city, state/country)
- [ ] Why do you want to be an ambassador? (textarea)
- [ ] What activities are you interested in? (checkboxes)
- [ ] Time commitment you can provide (dropdown)
- [ ] Relevant experience (optional, textarea)
- [ ] How did you hear about the program? (dropdown)
- [ ] Terms acceptance (checkbox)

### Acceptance Criteria:
- [ ] Form component created at `src/components/forms/AmbassadorApplicationForm.tsx`
- [ ] Form validation with Zod schema
- [ ] Database migration created for `ambassador_applications` table
- [ ] Application submission saves to database
- [ ] Toast notification on successful submission
- [ ] Email sent to admin team on new application
- [ ] Admin can view applications in Admin panel
- [ ] Admin can approve/reject applications

### Technical Notes:
- Create database table with fields above plus status, created_at, reviewed_at
- Use React Hook Form + Zod for validation
- Use Supabase Edge Function for email notifications
- Link from `/community` or create dedicated `/ambassador` page
- Consider rate limiting to prevent spam applications

### Dependencies:
- Email notification system must be configured
- Admin panel must exist (or create basic version)

### Estimated Effort: 5-6 hours

---

## Issue 6: Create ambassador portal page

**Title**: Create ambassador portal page for approved ambassadors

**Labels**: `enhancement`, `frontend`, `community`, `priority: medium`

**Milestone**: Sprint 4: January 5-11, 2026

**Description**:
Create a dedicated portal page for approved ambassadors where they can access resources, track activities, and connect with other ambassadors.

### Features:
- [ ] Dashboard showing ambassador stats
- [ ] Resource library access
- [ ] Activity tracking/logging
- [ ] Upcoming events calendar
- [ ] Ambassador community forum/chat (future)
- [ ] Recognition/badges for active ambassadors

### Portal Sections:
1. **Welcome & Overview**
   - Ambassador mission reminder
   - Quick links to key resources

2. **Resources**
   - Presentation slides download
   - Promotional materials
   - Talking points
   - Social media graphics
   - Email templates

3. **Activity Log**
   - Log activities (presentations, social shares, etc.)
   - View quarterly activity summary
   - Track progress toward commitments

4. **Community**
   - List of other ambassadors (optional, privacy-respecting)
   - Monthly call schedule
   - Discussion board (future)

5. **Support**
   - Contact support channel
   - FAQ section
   - Submit feedback

### Acceptance Criteria:
- [ ] Page component created at `src/pages/AmbassadorPortal.tsx`
- [ ] Route protected - only accessible to approved ambassadors
- [ ] Responsive design works on mobile
- [ ] All resources are accessible and downloadable
- [ ] Activity logging functionality works
- [ ] Stats display correctly

### Technical Notes:
- Check user role/status before allowing access
- Create new database table `ambassador_activities` for logging
- Store resources in Supabase Storage
- Use existing UI components for consistency

### Dependencies:
- Ambassador application flow must be complete
- Resource files must be created and uploaded
- User roles must include "ambassador" status

### Estimated Effort: 4-5 hours

---

## Issue 7: Create ambassador toolkit download section

**Title**: Create ambassador toolkit download section

**Labels**: `enhancement`, `frontend`, `community`, `priority: medium`

**Milestone**: Sprint 4: January 5-11, 2026

**Description**:
Create a section within the ambassador portal where ambassadors can download all toolkit materials in one place.

### Toolkit Materials:
- [ ] Presentation slides (PowerPoint/PDF)
- [ ] Promotional flyer (PDF, print-ready)
- [ ] Social media graphics pack (ZIP)
- [ ] Email templates (Word/PDF)
- [ ] Talking points guide (PDF)
- [ ] Ambassador handbook (PDF)
- [ ] Logo files (various formats)
- [ ] Video assets (if available)

### Acceptance Criteria:
- [ ] Download section in ambassador portal
- [ ] All files uploaded to Supabase Storage
- [ ] Each file has clear description and file size shown
- [ ] Download buttons work correctly
- [ ] Files are organized by category
- [ ] "Download All" option (ZIP file)
- [ ] Download tracking (analytics)

### Technical Notes:
- Store files in Supabase Storage bucket `ambassador-resources`
- Set appropriate permissions (authenticated ambassadors only)
- Create download links with proper CORS settings
- Consider CDN for faster downloads
- Track download counts in database

### Dependencies:
- All toolkit materials must be created/designed first
- Supabase Storage bucket must be configured

### Estimated Effort: 2-3 hours (excluding material creation)

---

## Summary

**Total New Issues**: 7
**Total Estimated Effort**: 24-31 hours across 4 sprints
**Sprints Affected**: 1, 2, 3, 4

These issues complement the existing backlog and focus on improving user experience, onboarding, and community engagement - all critical for the MVP and growth phase.
