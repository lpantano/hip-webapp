# Release Plan - Evidence Decoded

## Release Cycle Structure
- **Duration**: 1 week per cycle
- **Work Days**: 5 days (Mon-Fri)
- **Testing**: 2 days (Sat-Sun)
- **Capacity**: ~7 hours of work per cycle (with AI assistance)
- **Start Date**: December 15, 2025 (Sunday)

## Milestone Schedule

### Sprint 1: December 15-21, 2025
**Theme**: Core UX Improvements & Quick Wins
**Work**: Dec 15-19 | **Testing**: Dec 20-21

**Goals**:
- Fix critical MVP issues
- Improve claim card usability
- Quick UI fixes

**Issues**:
- #110: Bullets and text alignment
- #109: Clickable links
- #51: Claim submitted info improvements
- #48: Invalid PubMed ID error handling
- **NEW**: Add tooltips to claim cards

**Estimated Effort**: 6-7 hours

---

### Sprint 2: December 22-28, 2025
**Theme**: First-Time User Experience
**Work**: Dec 22-26 | **Testing**: Dec 27-28

**Goals**:
- Onboarding improvements
- User guidance features
- Video tutorial integration

**Issues**:
- **NEW**: First-time video tutorial for new users
- #5: Redesign upvote button
- #18: Change "Install App" button text
- #49: Claims sorting improvements

**Estimated Effort**: 6-7 hours

---

### Sprint 3: December 29, 2025 - January 4, 2026
**Theme**: Community Documentation
**Work**: Dec 29-Jan 2 | **Testing**: Jan 3-4

**Goals**:
- Community guidelines
- Roadmap visibility
- Terms review

**Issues**:
- **NEW**: Create review guidelines document
- **NEW**: Add roadmap page to website
- #33: Review terms of use
- #31: Team page integration into About

**Estimated Effort**: 6-7 hours

---

### Sprint 4: January 5-11, 2026
**Theme**: Ambassador Program Launch
**Work**: Jan 5-9 | **Testing**: Jan 10-11

**Goals**:
- Ambassador program implementation
- Community engagement features

**Issues**:
- **NEW**: Implement ambassador program application flow
- **NEW**: Create ambassador portal page
- **NEW**: Ambassador toolkit download section
- #36: Topics for category in front page

**Estimated Effort**: 7 hours

---

### Sprint 5: January 12-18, 2026
**Theme**: Design & Mobile Polish
**Work**: Jan 12-16 | **Testing**: Jan 17-18

**Goals**:
- iOS fixes
- Design consistency
- Mobile experience

**Issues**:
- #26: Design issues in iOS18
- #57: Coding workflow into webpage
- **NEW**: Mobile UX improvements

**Estimated Effort**: 6-7 hours

---

### Sprint 6: January 19-25, 2026
**Theme**: Code Quality & Refactoring
**Work**: Jan 19-23 | **Testing**: Jan 24-25

**Goals**:
- Code cleanup
- Technical debt
- Performance

**Issues**:
- #83: Standardize form state management
- #81: Fix getCategoryColor utility (good first issue)
- #78: Reusable form submission hook
- #85: Audit unused dependencies

**Estimated Effort**: 6-7 hours

---

### Sprint 7: January 26 - February 1, 2026
**Theme**: Advanced Features & Analytics
**Work**: Jan 26-30 | **Testing**: Jan 31-Feb 1

**Goals**:
- Analytics integration
- Error handling
- Component refactoring

**Issues**:
- #62: Add Google Analytics
- #86: React Error Boundaries
- #84: Break down large component files

**Estimated Effort**: 7 hours

---

### Sprint 8: February 2-8, 2026
**Theme**: Final Polish & Donation
**Work**: Feb 2-6 | **Testing**: Feb 7-8

**Goals**:
- Donation system
- Final bug fixes
- Release preparation

**Issues**:
- #61: Fix donation buttons
- Any remaining bugs from previous sprints
- Final QA before major release

**Estimated Effort**: 5-6 hours

---

## QA Testing Checklist Template

### Pre-Testing Setup
- [ ] Pull latest code from devel branch
- [ ] Run `npm install` to update dependencies
- [ ] Run `npm run build` to verify build succeeds
- [ ] Run `npm run lint` to check for linting errors

### Functional Testing
- [ ] Test all new features on desktop
- [ ] Test all new features on mobile (iOS Safari)
- [ ] Test all new features on mobile (Chrome Android)
- [ ] Verify authentication flows still work
- [ ] Test claim submission and review flows
- [ ] Check all forms for validation

### UI/UX Testing
- [ ] Verify responsive design on multiple screen sizes
- [ ] Check dark mode compatibility
- [ ] Test keyboard navigation
- [ ] Verify accessibility (screen reader if possible)
- [ ] Check for visual bugs or misalignments

### Performance Testing
- [ ] Page load times acceptable
- [ ] No console errors or warnings
- [ ] Images load properly
- [ ] Animations smooth

### Cross-Browser Testing
- [ ] Chrome/Edge (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Mobile browsers

### Regression Testing
- [ ] Previous sprint features still work
- [ ] No new bugs introduced
- [ ] Database migrations successful

---

## Issue Creation Needed

### High Priority (Create Now)
1. **Add tooltips to claim cards** - Sprint 1
2. **First-time video tutorial** - Sprint 2
3. **Create review guidelines document** - Sprint 3
4. **Add roadmap page to website** - Sprint 3
5. **Implement ambassador program** - Sprint 4
6. **Create ambassador portal** - Sprint 4
7. **Ambassador toolkit downloads** - Sprint 4

### Labels to Use
- `MVP` - Critical for minimum viable product
- `frontend` - Frontend work
- `design` - Design/UI work
- `community` - Community features
- `documentation` - Documentation
- `priority: high` - Must do this sprint
- `priority: medium` - Should do if time permits
- `priority: low` - Nice to have

---

## Notes

- **Flexibility**: If a sprint runs over, move lower-priority items to next sprint
- **Buffer**: Each sprint has ~1 hour buffer for unexpected issues
- **Dependencies**: Some issues may depend on others - track these
- **Community Feedback**: Monitor beta-tester-feedback label for urgent issues
- **Code Reviews**: All PRs should be reviewed before merging to devel
- **Main Branch**: Merge devel to main after successful testing periods

---

## Success Metrics

### Per Sprint
- All high-priority issues completed
- Zero regression bugs
- QA checklist completed
- Documentation updated

### Overall (8 Sprints)
- MVP issues resolved
- New user onboarding complete
- Ambassador program live
- Community guidelines published
- Code quality improved
- Mobile experience polished
