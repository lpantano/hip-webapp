# QA Testing Checklist

**Sprint**: _____________
**Testing Period**: _____________
**Tester**: _____________
**Date**: _____________

---

## Pre-Testing Setup

- [ ] Pull latest code from `devel` branch
- [ ] Run `npm install` to update dependencies
- [ ] Run `npm run build` to verify build succeeds (no errors)
- [ ] Run `npm run lint` to check for linting errors
- [ ] Review sprint goals and issue list
- [ ] Set up test environment (local or staging)

---

## Sprint-Specific Features

### Feature 1: ______________________
**Issue #**: ______

**Test Cases**:
- [ ] Test case 1: ________________________________
- [ ] Test case 2: ________________________________
- [ ] Test case 3: ________________________________

**Notes**: _________________________________________


### Feature 2: ______________________
**Issue #**: ______

**Test Cases**:
- [ ] Test case 1: ________________________________
- [ ] Test case 2: ________________________________
- [ ] Test case 3: ________________________________

**Notes**: _________________________________________


### Feature 3: ______________________
**Issue #**: ______

**Test Cases**:
- [ ] Test case 1: ________________________________
- [ ] Test case 2: ________________________________
- [ ] Test case 3: ________________________________

**Notes**: _________________________________________

---

## Functional Testing

### Authentication & User Management
- [ ] Sign up with new account works
- [ ] Sign in with existing account works
- [ ] Sign out works correctly
- [ ] Password reset flow works
- [ ] OAuth (Google) authentication works
- [ ] User profile displays correctly
- [ ] User can update profile information
- [ ] User role permissions enforced

### Claim Management
- [ ] Submit new claim works
- [ ] Claim form validation works correctly
- [ ] PubMed ID lookup works
- [ ] DOI lookup works
- [ ] Custom URL submission works
- [ ] Claim appears in list after submission
- [ ] Claim details page loads correctly
- [ ] Claim search/filter works
- [ ] Claim sorting works

### Review System
- [ ] Submit review works
- [ ] Review form validation works
- [ ] Evidence classification selection works
- [ ] Quality indicators display correctly
- [ ] Review appears after submission
- [ ] Expert reviews highlighted appropriately
- [ ] Review count displays correctly

### Voting System
- [ ] Upvote/downvote on claims works
- [ ] Vote count updates correctly
- [ ] Can't vote multiple times
- [ ] Vote persists after page refresh
- [ ] Voting works on mobile

### Navigation & Routing
- [ ] All main navigation links work
- [ ] Back button works correctly
- [ ] Direct URL access works for all pages
- [ ] 404 page shows for invalid routes
- [ ] Protected routes redirect when not authenticated

---

## UI/UX Testing

### Desktop Testing (Chrome, 1920x1080)
- [ ] Layout looks correct
- [ ] No text overflow or truncation
- [ ] Images load properly
- [ ] Buttons are clickable and sized appropriately
- [ ] Forms are easy to use
- [ ] No visual bugs or misalignments

### Mobile Testing (iOS Safari, iPhone)
- [ ] Layout is responsive
- [ ] Text is readable (not too small)
- [ ] Touch targets are large enough (min 44x44px)
- [ ] Forms work with mobile keyboard
- [ ] Scrolling is smooth
- [ ] No horizontal scroll
- [ ] Gestures work (swipe, tap, hold)

### Mobile Testing (Android Chrome)
- [ ] Layout is responsive
- [ ] Text is readable
- [ ] Touch targets are appropriate
- [ ] Forms work correctly
- [ ] Scrolling is smooth
- [ ] No horizontal scroll

### Tablet Testing (iPad)
- [ ] Layout adapts appropriately
- [ ] All features accessible
- [ ] Touch interactions work

### Dark Mode
- [ ] Dark mode toggle works
- [ ] All colors display correctly in dark mode
- [ ] Text is readable in dark mode
- [ ] Images/icons visible in dark mode
- [ ] No white flashes when switching modes

### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] ARIA labels present on interactive elements
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader tested (if possible)
- [ ] Alt text on images
- [ ] Form labels associated correctly

---

## Performance Testing

### Page Load Performance
- [ ] Home page loads < 3 seconds
- [ ] Claim list page loads < 3 seconds
- [ ] Claim detail page loads < 3 seconds
- [ ] Profile page loads < 3 seconds
- [ ] Admin page loads < 5 seconds (if applicable)

### Runtime Performance
- [ ] No console errors
- [ ] No console warnings (or documented if expected)
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks (test with DevTools)
- [ ] Images optimized and load quickly
- [ ] Lazy loading works for off-screen content

### Network Performance
- [ ] App works on slow 3G connection (throttled)
- [ ] Loading states display appropriately
- [ ] Error states display for failed requests
- [ ] Retry mechanisms work

---

## Cross-Browser Testing

### Chrome (Desktop)
- [ ] All features work
- [ ] UI looks correct
- [ ] No console errors

### Safari (Desktop)
- [ ] All features work
- [ ] UI looks correct
- [ ] No console errors

### Firefox (Desktop)
- [ ] All features work
- [ ] UI looks correct
- [ ] No console errors

### Edge (Desktop)
- [ ] All features work
- [ ] UI looks correct
- [ ] No console errors

### Safari (iOS)
- [ ] All features work
- [ ] UI looks correct
- [ ] PWA install works

### Chrome (Android)
- [ ] All features work
- [ ] UI looks correct
- [ ] PWA install works

---

## Database & Backend Testing

### Data Persistence
- [ ] New data saves correctly
- [ ] Data updates work
- [ ] Data deletes work (if applicable)
- [ ] Data relationships maintained
- [ ] No orphaned records

### Database Migrations
- [ ] New migrations run successfully
- [ ] No migration errors in console
- [ ] Schema changes reflected in app
- [ ] No data loss from migrations

### API & Supabase
- [ ] All Supabase queries work
- [ ] Authentication state persists
- [ ] Real-time subscriptions work (if applicable)
- [ ] File uploads work (if applicable)
- [ ] Email notifications sent (if applicable)

---

## Regression Testing

### Previous Sprint Features
- [ ] Sprint -1 features still work
- [ ] Sprint -2 features still work
- [ ] Core features not affected

### Known Issues
- [ ] No new occurrences of previously fixed bugs
- [ ] Existing known issues documented (if not fixed)

---

## Security Testing

### Input Validation
- [ ] XSS protection (test with `<script>alert('xss')</script>`)
- [ ] SQL injection protection (Supabase handles this)
- [ ] Form validation prevents invalid data
- [ ] File upload restrictions enforced (if applicable)

### Authentication & Authorization
- [ ] Can't access protected routes without auth
- [ ] Can't access admin routes without admin role
- [ ] Can't modify other users' data
- [ ] Session management works correctly
- [ ] Tokens expire appropriately

---

## PWA Testing

### Installation
- [ ] PWA install prompt appears (mobile)
- [ ] PWA installs correctly
- [ ] App icon appears on home screen
- [ ] PWA opens in standalone mode

### Offline Behavior
- [ ] Service worker registers
- [ ] Offline page shows when disconnected (if implemented)
- [ ] App caches appropriately
- [ ] Update notifications work (if implemented)

---

## Issues Found

### Critical Issues (Blockers)
1. ____________________________________________
2. ____________________________________________

### Major Issues (Should Fix)
1. ____________________________________________
2. ____________________________________________

### Minor Issues (Nice to Fix)
1. ____________________________________________
2. ____________________________________________

### Enhancement Ideas
1. ____________________________________________
2. ____________________________________________

---

## Test Summary

**Total Tests Run**: ______
**Tests Passed**: ______
**Tests Failed**: ______
**Pass Rate**: ______%

**Critical Issues**: ______
**Major Issues**: ______
**Minor Issues**: ______

**Recommendation**:
- [ ] ✅ Ready to merge to main
- [ ] ⚠️ Minor issues - can merge with documented issues
- [ ] ❌ Critical issues - do not merge, need fixes

---

## Sign-off

**Tester Name**: _______________________
**Date**: _______________________
**Signature**: _______________________

**Developer Review**: _______________________
**Date**: _______________________

---

## Notes & Comments

_________________________________
_________________________________
_________________________________
_________________________________

---

*This checklist should be completed for each sprint testing period. File issues on GitHub for any bugs found.*
