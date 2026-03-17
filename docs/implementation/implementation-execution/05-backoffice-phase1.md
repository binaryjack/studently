# AGENT-5: Backoffice Implementation - Phase 1 (Core)

## SYSTEM INSTRUCTIONS
Read: `.github/copilot-instructions.md` → React patterns, component composition, accessibility.

## SPECIFICATION
Read: `docs/implementation/20-backoffice-implementation.md` → Full architecture, Redux integration, mobile-selective views.

## TASKS

### Task 1: Layout Components
**Output**: `frontend/src/shared/components/Layout/`
- MainLayout.tsx (Header + Sidebar + Main content area + Footer)
  - Responsive: Sidebar collapses on tablet/mobile (hamburger icon)
  - Header: Logo, user menu, notifications, theme toggle
  - Sidebar: Navigation menu, role-based links (conditional visibility)
  - Main: Content area with padding
  - Dark mode: All surfaces using design system tokens

- AuthLayout.tsx (Centered form layout for login/register)
  - Background: Dark gradient
  - Card: Centered, shadow, rounded

- SettingsLayout.tsx (Sidebar nav on left, content on right)
  - Desktop: 2-column
  - Mobile: Stack vertically

**Requirements**:
- Responsive (mobile-first)
- Accessibility (landmark regions, skip navigation link)
- Dark mode only

### Task 2: Navigation Components
**Output**: `frontend/src/shared/components/Navigation/`
- Header.tsx (top bar with logo, navigation links, user menu)
  - Mobile: Hamburger toggle for sidebar
  - User menu: Profile, settings, logout
  - Notifications icon with badge count

- Sidebar.tsx (collapsible vertical navigation)
  - Navigation items (role-based visibility)
  - Icons + labels (collapse to icons-only on mobile)
  - Active state indicator
  - Collapse toggle

- MobileNav.tsx (hamburger menu for mobile)
  - Drawer overlay (click outside closes)
  - Same navigation items as desktop

- Breadcrumb.tsx (navigation context)

**Requirements**:
- Role-based links (e.g., "Admin" section only visible to admins)
- Active state (highlight current page)
- Accessibility (aria-current, role="navigation")

### Task 3: Dashboard Pages (Role Variants)
**Output**: `frontend/src/features/reporting/pages/DashboardPage.tsx`
- System Admin Dashboard
  - Tenant overview (active tenants, user count growth)
  - System health status (API, DB, services)
  - Recent activity log widget
  - Announcements panel

- Tenant Admin Dashboard
  - User count & growth chart
  - Active learning paths widget
  - Student enrollment chart
  - Quick action buttons (Users, Students, Settings)

- Professor Dashboard
  - My learning paths (card grid)
  - Students I teach (table)
  - Recent submissions (timesheets, documents)
  - Upcoming deadlines

- Teacher Dashboard
  - Assigned students (table)
  - Today's classes (schedule)
  - Pending approvals count
  - Recent student activity

- Coach/Mentor Dashboard
  - Assigned students (list with progress)
  - Progress overview (bar chart)
  - Pending 1:1 meetings
  - Performance metrics

- Student Dashboard
  - My learning paths (progress cards)
  - Current week timesheet (quick entry form)
  - Upcoming deadlines (list)
  - Messages/notifications (recent)
  - Recent grades/feedback (cards)

**Requirements**:
- Redux selectors for data
- Charts (recharts) for metrics
- Responsive grid layout
- Data refresh (React Query or polling)

### Task 4: Authentication Pages
**Output**: `frontend/src/features/auth/pages/`
- LoginPage.tsx (email, password, MFA setup link)
  - Form validation (React Hook Form + Zod)
  - Loading state (spinner on button)
  - Error messages (field-level + form-level)
  - Remember me checkbox
  - Auto-redirect to dashboard if logged in

- MFASetupPage.tsx (TOTP QR code, manual entry, recovery codes)
  - Display QR code (QRCode library)
  - Manual entry field (copy-paste friendly)
  - Recovery codes (download + display)
  - Verify button (test TOTP code)
  - Skip option (back to login)

- MFAVerifyPage.tsx (6-digit code entry during login)
  - Code input (focus on first digit, auto-focus next)
  - Verify button
  - Error message on invalid code
  - Resend code link (if SMS)

- ProfilePage.tsx (user profile view/edit)
  - Current user info (name, email, avatar)
  - Edit form (name, avatar upload)
  - Change password form
  - Active sessions list (device, IP, last active)
  - Logout all sessions button
  - MFA status (enabled/disabled) + manage button

**Requirements**:
- Form validation with Zod
- Redux dispatch (login, verifyMFA actions)
- Redirect on success (useNavigate)
- Error handling (display error messages)

### Task 5: Student Management Pages
**Output**: `frontend/src/features/students/pages/`
- StudentListPage.tsx
  - Desktop: Data grid (Table component, virtualized, 1000+ rows)
  - Mobile: Card grid (hidden desktop grid, visible mobile cards)
  - Columns: First name, Last name, Email, Status, Employment status, Actions
  - Sorting (click header to sort)
  - Filtering (status, cohort, employment status dropdowns)
  - Pagination (prev/next, page size selector)
  - Bulk select (checkbox in header)
  - Search (name, email, AVS)
  - Actions: Edit, View, Delete, Export

- StudentDetailPage.tsx (read-only view of student)
  - Personal info (name, email, DOB, gender, phone)
  - Address (street, city, postal code, canton)
  - Swiss fields (AVS masked, ORP, employment status, LACI/RI/AI references, work permit)
  - Learning paths (enrolled paths with progress)
  - Competencies (progress table)
  - Timesheets (recent submissions)
  - Absences (calendar view)
  - Documents (file list)
  - Audit log (changes made to this student)
  - Actions: Edit, Enroll learning path, Upload document, Create workflow

- StudentCreatePage.tsx (form to create new student)
  - Form fields (all from Student entity)
  - Validation (Zod schema)
  - Auto-save draft (localStorage)
  - Save + Create another checkbox
  - Success notification + redirect to detail

- StudentEditPage.tsx (edit existing student)
  - Form fields (all editable fields)
  - Validation (Zod schema)
  - Cancel/Save buttons
  - Success notification + redirect to detail

- StudentImportPage.tsx (bulk import from CSV)
  - File upload (drag & drop)
  - Preview table (first 10 rows)
  - Column mapping (if needed)
  - Progress bar during import
  - Success/error report (downloadable)
  - Retry failed rows

**Requirements**:
- Redux: fetch, create, update, delete actions
- Mobile-selective: Grid hidden on mobile, cards visible
- Pagination support
- Error handling + notifications
- Accessibility (keyboard navigation, screen reader labels)

### Task 6: Protected Routes & Auth Guard
**Output**: `frontend/src/middleware/` + `frontend/src/app/App.tsx`
- ProtectedRoute component (check isAuthenticated, redirect to /login if not)
- RoleBasedRoute component (check user role, show 403 if not allowed)
- App routing structure (React Router v6)
  - Public routes: /login, /reset-password
  - Protected routes: /dashboard, /students, /settings, etc.
  - Role-based: /audit (admin only), /settings/compliance (admin only)

**Requirements**:
- Redux selector to check auth state
- Redirect to login on 401
- Show 403 for insufficient permissions

### Task 7: Error Boundary & Fallback UI
**Output**: `frontend/src/middleware/ErrorBoundary.tsx` + error pages
- Error boundary (catch React errors, display fallback UI)
- 404 page (page not found)
- 403 page (permission denied)
- 500 page (server error)
- Loading page (full page spinner)

## TESTS

### Unit Tests
**File**: `frontend/__tests__/pages/auth.test.tsx`, `frontend/__tests__/pages/students.test.tsx`
- LoginPage: Render → fill form → submit → dispatch login action
- StudentListPage: Render → verify table columns → verify sort icons → verify filter dropdowns
- StudentCreatePage: Render → fill form → verify validation → submit → verify success notification
- ProtectedRoute: LoggedOut → redirect to /login | LoggedIn → render page

**Target**: ≥80% coverage (page logic, not Redux/API)

### Integration Tests
**File**: `frontend/__tests__/integration/pages.integration.tsx`
- Auth flow: Render LoginPage → Fill form → Dispatch login action → Redux updates → Navigate to dashboard → Render DashboardPage
- Student CRUD: Render StudentListPage → Click create → StudentCreatePage → Fill form → Submit → Table updates with new student
- Protected route: Not logged in → ProtectedRoute → Redirect to /login → Login → Access protected route

**Tool**: React Testing Library + Vitest  
**Target**: ≥75% coverage (page workflows)

### E2E Tests
**File**: `frontend/__tests__/e2e/pages.e2e.ts`
- Full login flow: Start at /login → Fill form → Click login → MFA page → Enter code → Dashboard
- Full student management: Dashboard → Click Students → See student list → Click create → Fill form → Verify success notification → See new student in list → Click student → See detail page
- Error handling: Try invalid login → See error message → Try valid login → Success

**Tool**: Playwright OR Cypress  
**Target**: ≥70% coverage (user-facing workflows)

## REPORTING

```
[AGENT-5-PHASE1] BACKOFFICE IMPLEMENTATION - PHASE 1
Status: [COMPLETED|IN-PROGRESS|FAILED]
Tasks: [n/7] completed
  ✓ Layout Components (3 layouts)
  ✓ Navigation Components (4 components)
  ✓ Dashboard Pages (6 role variants)
  ✓ Authentication Pages (4 pages)
  ✓ Student Management Pages (5 pages)
  ✓ Protected Routes & Auth Guard
  ✓ Error Boundary & Fallback UI

Tests: unit=X/X | integration=Y/Y | e2e=Z/Z
Code: frontend/src/features/ + frontend/src/shared/components/
Files Created:
  - shared/components/Layout/ (3 layouts)
  - shared/components/Navigation/ (4 components)
  - features/reporting/pages/DashboardPage.tsx (6 variants)
  - features/auth/pages/ (4 pages)
  - features/students/pages/ (5 pages)
  - middleware/ProtectedRoute.tsx + RoleBasedRoute.tsx
  - middleware/ErrorBoundary.tsx
  - pages/ (404, 403, 500)
  - app/App.tsx (routing)
  - __tests__/ (unit + integration + e2e)

Issues: [0|list]
Next: [Ready for Agent-6 (Backoffice Phase 2) and Agent-7 (Showcase Website)]
```

## SUCCESS CRITERIA

- [ ] All pages render without errors
- [ ] Login flow works (form → Redux dispatch → dashboard redirect)
- [ ] Protected routes redirect unauthenticated users to /login
- [ ] Role-based routes show 403 for insufficient permissions
- [ ] Student list displays correctly (desktop grid + mobile cards)
- [ ] Student create/edit forms validate and submit
- [ ] Dashboard shows role-specific widgets
- [ ] Error boundary catches errors gracefully
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Accessibility: Keyboard navigation, screen reader support
- [ ] Unit tests: ≥80% pass rate
- [ ] Integration tests: ≥75% pass rate
- [ ] E2E tests: ≥70% pass rate
- [ ] Dark mode applied to all pages
- [ ] Zero blocking issues

---

**Agent-5-Phase1 Version**: 1.0  
**Estimated Duration**: 4-5 days  
**Start When**: After Agent-3 (Design System) + Agent-4 (Redux) available (can mock APIs)
