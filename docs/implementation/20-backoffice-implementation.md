# Backoffice Implementation - Full Platform Specification

## Overview

**Purpose**: Complete institutional platform for managing all aspects of vocational training programs

**Scope**: ALL features, all domains, all user roles (SYSTEM_ADMIN through STUDENT)

**Target Users**:
- **System Admins**: Platform configuration, tenant management
- **Tenant Admins**: Institution settings, user management, compliance reporting
- **Professors**: Learning path design, student progress monitoring
- **Teachers**: Daily instruction, student grading, document management
- **Mentors/Coaches**: Student mentoring, feedback, one-on-one guidance
- **Students**: Learning progress, timesheet entry, workflow participation

**Technology Stack**:
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux + Redux-Saga (NOT Zustand)
- **Routing**: React Router v6
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library
- **Build**: Vite

**Design**: Dark mode, responsive, desktop-first for complex operations, mobile-selective views

---

## Application Architecture

### Redux Store Structure

```typescript
// Root state
interface RootState {
  // Domain stores
  auth: AuthState
  users: UsersState
  students: StudentsState
  learningPaths: LearningPathsState
  competencies: CompetenciesState
  timesheets: TimesheetsState
  absences: AbsencesState
  documents: DocumentsState
  workflows: WorkflowsState
  roles: RolesState
  settings: SettingsState
  reporting: ReportingState
  
  // UI stores
  ui: UIState
  notifications: NotificationsState
  modals: ModalsState
}
```

### Redux-Saga Middleware Architecture

```
User Action → Action Creator → Redux Action
  ↓
Redux Reducer (state update)
  ↓
Redux-Saga Middleware
  ↓
Side Effect (API call, localStorage, etc.)
  ↓
Success Action OR Error Action
  ↓
Reducer (handle response)
  ↓
UI Update via Selectors
```

### Folder Structure

```
src/
├── app/
│   ├── App.tsx (root)
│   ├── store.ts (Redux config)
│   └── hooks.ts (typed useAppDispatch, useAppSelector)
│
├── features/ (Feature Slice Design - by domain)
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── MFASetup.tsx
│   │   │   └── ProfileMenu.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── store/
│   │   │   ├── authSlice.ts (reducer + actions)
│   │   │   ├── authSaga.ts (async logic)
│   │   │   ├── authSelectors.ts
│   │   │   └── authTypes.ts
│   │   └── index.ts (scoped exports)
│   │
│   ├── students/
│   │   ├── components/
│   │   │   ├── StudentGrid.tsx (admin view)
│   │   │   ├── StudentCard.tsx (card view)
│   │   │   ├── StudentForm.tsx
│   │   │   ├── StudentProgress.tsx
│   │   │   └── StudentImport.tsx
│   │   ├── pages/
│   │   │   ├── StudentListPage.tsx
│   │   │   ├── StudentDetailPage.tsx
│   │   │   └── StudentCreatePage.tsx
│   │   ├── store/
│   │   │   ├── studentsSlice.ts
│   │   │   ├── studentsSaga.ts
│   │   │   ├── studentsSelectors.ts
│   │   │   └── studentsTypes.ts
│   │   └── index.ts
│   │
│   ├── learning-paths/
│   │   ├── components/
│   │   │   ├── PathEditor.tsx (flow builder)
│   │   │   ├── PathCard.tsx
│   │   │   ├── CompetencyAdder.tsx
│   │   │   └── CompetencyMatrix.tsx
│   │   ├── pages/
│   │   │   ├── PathListPage.tsx
│   │   │   ├── PathDetailPage.tsx
│   │   │   ├── PathCreatePage.tsx
│   │   │   └── CompetencyManagementPage.tsx
│   │   ├── store/
│   │   │   ├── pathsSlice.ts
│   │   │   ├── pathsSaga.ts
│   │   │   ├── pathsSelectors.ts
│   │   │   └── pathsTypes.ts
│   │   └── index.ts
│   │
│   ├── timesheets/
│   │   ├── components/
│   │   │   ├── TimesheetGrid.tsx (week view, desktop-only)
│   │   │   ├── TimesheetForm.tsx (mobile, form view)
│   │   │   ├── TimeEntryRow.tsx
│   │   │   ├── ApprovalQueue.tsx (manager view)
│   │   │   └── TimesheetStats.tsx
│   │   ├── pages/
│   │   │   ├── TimesheetListPage.tsx
│   │   │   ├── TimesheetEditPage.tsx
│   │   │   └── TimesheetApprovalsPage.tsx
│   │   ├── store/
│   │   │   ├── timesheetsSlice.ts
│   │   │   ├── timesheetsSaga.ts
│   │   │   ├── timesheetsSelectors.ts
│   │   │   └── timesheetsTypes.ts
│   │   └── index.ts
│   │
│   ├── absences/
│   │   ├── components/
│   │   │   ├── AbsenceCalendar.tsx
│   │   │   ├── AbsenceForm.tsx
│   │   │   ├── AbsenceCard.tsx
│   │   │   ├── AbsenceApprovalQueue.tsx
│   │   │   └── AbsenceSummary.tsx
│   │   ├── pages/
│   │   │   ├── AbsenceListPage.tsx
│   │   │   └── AbsenceCalendarPage.tsx
│   │   ├── store/
│   │   │   ├── absencesSlice.ts
│   │   │   ├── absencesSaga.ts
│   │   │   ├── absencesSelectors.ts
│   │   │   └── absencesTypes.ts
│   │   └── index.ts
│   │
│   ├── documents/
│   │   ├── components/
│   │   │   ├── DocumentGrid.tsx (admin, desktop-only)
│   │   │   ├── DocumentCard.tsx (card view, mobile-friendly)
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── DocumentSearch.tsx
│   │   │   └── DocumentViewer.tsx (PDF, image preview)
│   │   ├── pages/
│   │   │   ├── DocumentListPage.tsx
│   │   │   └── DocumentDetailPage.tsx
│   │   ├── store/
│   │   │   ├── documentsSlice.ts
│   │   │   ├── documentsSaga.ts
│   │   │   ├── documentsSelectors.ts
│   │   │   └── documentsTypes.ts
│   │   └── index.ts
│   │
│   ├── workflows/
│   │   ├── components/
│   │   │   ├── WorkflowBuilder.tsx (visual editor, desktop-only)
│   │   │   ├── WorkflowExecutor.tsx (mobile-friendly execution)
│   │   │   ├── StepCard.tsx
│   │   │   ├── DecisionNode.tsx
│   │   │   └── WorkflowHistory.tsx
│   │   ├── pages/
│   │   │   ├── WorkflowListPage.tsx
│   │   │   ├── WorkflowEditorPage.tsx
│   │   │   └── WorkflowInstancePage.tsx
│   │   ├── store/
│   │   │   ├── workflowsSlice.ts
│   │   │   ├── workflowsSaga.ts
│   │   │   ├── workflowsSelectors.ts
│   │   │   └── workflowsTypes.ts
│   │   └── index.ts
│   │
│   ├── settings/
│   │   ├── components/
│   │   │   ├── SettingsForm.tsx
│   │   │   ├── SettingsCategoryNav.tsx
│   │   │   ├── ThemeCustomizer.tsx (dark mode)
│   │   │   ├── MailConfig.tsx
│   │   │   └── IntegrationManager.tsx
│   │   ├── pages/
│   │   │   ├── SettingsPage.tsx (main)
│   │   │   ├── GeneralSettingsPage.tsx
│   │   │   ├── UsersSettingsPage.tsx
│   │   │   ├── AppearanceSettingsPage.tsx
│   │   │   └── SecuritySettingsPage.tsx
│   │   ├── store/
│   │   │   ├── settingsSlice.ts
│   │   │   ├── settingsSaga.ts
│   │   │   ├── settingsSelectors.ts
│   │   │   └── settingsTypes.ts
│   │   └── index.ts
│   │
│   └── reporting/
│       ├── components/
│       │   ├── ReportBuilder.tsx (report query designer)
│       │   ├── ReportViewer.tsx
│       │   ├── ChartComponent.tsx (pie, bar, line, table)
│       │   ├── ExportButton.tsx (CSV, Excel, PDF)
│       │   └── FilterPanel.tsx
│       ├── pages/
│       │   ├── ReportListPage.tsx
│       │   ├── ReportBuilderPage.tsx
│       │   ├── ReportViewPage.tsx
│       │   └── DashboardPage.tsx (executive overview)
│       ├── store/
│       │   ├── reportingSlice.ts
│       │   ├── reportingSaga.ts
│       │   ├── reportingSelectors.ts
│       │   └── reportingTypes.ts
│       └── index.ts
│
├── shared/
│   ├── components/
│   │   ├── Layout/ (desktop & mobile layouts)
│   │   │   ├── MainLayout.tsx (header + sidebar + main)
│   │   │   ├── AuthLayout.tsx (centered login)
│   │   │   └── SettingsLayout.tsx (sidebar nav)
│   │   ├── Navigation/
│   │   │   ├── Header.tsx (top bar, user menu, notifications)
│   │   │   ├── Sidebar.tsx (collapsible navigation)
│   │   │   ├── MobileNav.tsx (mobile hamburger menu)
│   │   │   └── Breadcrumb.tsx
│   │   ├── DataDisplay/
│   │   │   ├── Table.tsx (responsive, sortable, filterable)
│   │   │   ├── Grid.tsx (responsive grid, desktop-first)
│   │   │   ├── Card.tsx (standard card component)
│   │   │   ├── List.tsx
│   │   │   └── Pagination.tsx
│   │   ├── Forms/
│   │   │   ├── FormField.tsx (label + input + error)
│   │   │   ├── FormGroup.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── TextArea.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── TimePicker.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── Buttons/
│   │   │   ├── Button.tsx (primary, secondary, tertiary, danger)
│   │   │   ├── IconButton.tsx
│   │   │   └── ButtonGroup.tsx
│   │   ├── Modals/
│   │   │   ├── Modal.tsx (generic modal)
│   │   │   ├── ConfirmDialog.tsx (delete confirmation)
│   │   │   ├── FormModal.tsx (form in modal)
│   │   │   └── AlertDialog.tsx
│   │   ├── Feedback/
│   │   │   ├── Notification.tsx (toast at top)
│   │   │   ├── Toast.tsx (bottom right)
│   │   │   ├── Spinner.tsx
│   │   │   ├── SkeletonLoader.tsx
│   │   │   └── EmptyState.tsx (no data message)
│   │   ├── Charts/
│   │   │   ├── BarChart.tsx (recharts wrapper)
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── ChartTooltip.tsx
│   │   └── Indicators/
│   │       ├── Badge.tsx (status badge)
│   │       ├── Avatar.tsx (user avatar)
│   │       ├── StatusIndicator.tsx
│   │       └── ProgressBar.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts (get current auth state)
│   │   ├── usePermissions.ts (check user permissions)
│   │   ├── useUserRole.ts (get current user role)
│   │   ├── useMobile.ts (media query hook)
│   │   ├── useQuery.ts (query params)
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   │
│   ├── utils/
│   │   ├── api.ts (Axios instance with interceptors)
│   │   ├── validation.ts (Zod schemas)
│   │   ├── formatters.ts (date, currency, numbers)
│   │   ├── helpers.ts (utilities)
│   │   └── constants.ts (app-wide constants)
│   │
│   └── types/
│       ├── index.ts (shared types)
│       ├── api.ts (API response types)
│       ├── domain.ts (domain models)
│       └── ui.ts (UI state types)
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│       ├── globals.css (Tailwind directives)
│       ├── tokens.css (dark mode variables)
│       └── animations.css (custom animations)
│
├── middleware/
│   ├── authMiddleware.ts (protect routes)
│   ├── errorMiddleware.ts (error boundary)
│   └── permissionMiddleware.ts (role-based access)
│
├── main.tsx (Vite entry point)
└── index.css (Tailwind)
```

---

## Core Features & Pages

### 1. AUTHENTICATION & AUTHORIZATION

**Login Page** (`/login`)
- Email + password form
- "Forgot password" link
- Remember me checkbox
- Social login (optional, Google/Apple)
- Error messaging
- Loading state

**MFA Setup Page** (`/setup-mfa`)
- QR code (TOTP)
- Manual entry field
- Recovery codes (download)
- Verification step
- Skip option (optional)

**Profile Page** (`/profile`)
- View current user info
- Edit name, avatar
- Change password form
- Active sessions list (device + IP + last active)
- Logout all sessions button
- MFA status & management

**Protected Routes**:
- All pages except `/login` require authentication
- Route guards via middleware
- Automatic redirect to login on 401

---

### 2. DASHBOARD (Role-based variants)

**System Admin Dashboard** (`/dashboard`)
- Tenant overview (active tenants, user count)
- System health status
- Recent activity log
- Announcements panel

**Tenant Admin Dashboard** (`/dashboard`)
- User count & growth chart
- Active learning paths
- Student enrollment chart
- Recent activity (user logins, imports, settings changes)
- Quick links to Users, Students, Settings

**Professor Dashboard** (`/dashboard`)
- My learning paths (cards)
- Students I teach (grid)
- Recent submissions (timesheets, documents)
- Upcoming deadlines

**Teacher Dashboard** (`/dashboard`)
- Assigned students (grid)
- Today's classes (schedule)
- Pending approvals (timesheets, absences, workflows)
- Recent student activity

**Coach/Mentor Dashboard** (`/dashboard`)
- Assigned students (list)
- Progress overview (bar chart)
- Pending 1:1 meetings
- Performance metrics

**Student Dashboard** (`/dashboard`)
- My learning paths (progress cards)
- Current week timesheet (quick entry)
- Upcoming deadlines
- Messages/notifications
- Recent grades/feedback

---

### 3. STUDENT MANAGEMENT

**Student List Page** (`/students`)
- **Desktop View** (admin/educator):
  - Data grid (responsive, virtualized for performance)
  - Columns: Name, Email, Status, Cohort, Employment Status, Actions
  - Sorting, filtering, pagination
  - Bulk select (delete, export, reassign)
  - Search (name, email, AVS)
  - Filters: Status, Cohort, Employment Status, Canton
  - Column visibility toggle

- **Mobile View** (selective):
  - Hidden: Admin grids
  - Visible: Student list (card view)
  - Tap card to view details

**Student Detail Page** (`/students/:id`)
- Profile information (personal, contact, emergency)
- Swiss employment status (LACI, RI, AI, ORP)
- Work permit information
- Learning path enrollments (with progress)
- Competency status (progress bar per competency)
- Timesheets (recent submissions)
- Absences (calendar view)
- Documents (list)
- Audit log (changes made)
- Actions: Edit, Assign learning path, Upload document, Create workflow

**Student Create/Edit Page** (`/students/new` or `/students/:id/edit`)
- Form with Zod validation
- Fields: Name, email, DOB, gender, phone, address, city, postal code, canton
- Swiss fields: AVS number, ORP number, employment status, LACI reference, work permit
- Emergency contact
- Auto-save draft (localStorage)
- Success/error notifications

**Student Import Page** (`/students/import`)
- CSV upload (drag & drop)
- Preview table (first 10 rows)
- Progress bar during processing
- Success/error report (downloadable)
- Retry failed rows option

**Student Export Page** (`/students/export`)
- Select fields to export
- Filter options
- Format: CSV, Excel
- Automatic download

---

### 4. LEARNING PATHS & COMPETENCIES

**Learning Paths List Page** (`/learning-paths`)
- Card grid (responsive)
- Per card: Name, description, status, student count, duration
- Actions: Edit, Duplicate, Publish/Archive, Delete
- Filter: Status, search
- Sort: Name, created date, student count
- Bulk actions: Publish, Archive, Delete

**Learning Path Editor Page** (`/learning-paths/:id/edit`)
- **Desktop View** (admin):
  - Form: Name, description, duration
  - Competency list (drag-to-reorder)
  - Per competency: Name, level, actions (remove)
  - Add competency button
  - Publish/Save button
  - Preview button

- **Mobile View** (hidden):
  - Editor not available on mobile

**Competency Management Page** (`/settings/competencies`)
- **Desktop**: Grid of competencies, searchable
- Form to create/edit competency: Name, description, max level, category
- Bulk import from template

**Role Matrix** (`/learning-paths/:id/roles`)
- **Desktop-Only** (complex admin grid)
- Matrix: Rows = Competencies, Columns = Roles
- Per cell: Required level (select)
- Visualize role requirements at a glance

---

### 5. TIMESHEETS & TIME TRACKING

**Timesheet List Page** (`/timesheets`)
- **Educator/Manager View**:
  - List/grid of timesheets
  - Filters: Student, status, week range
  - Columns: Student name, week, total hours, status, approver, actions
  - Approve/Reject buttons
  - Bulk approve

- **Student View**:
  - My timesheets (list)
  - Status badges
  - Edit link (if DRAFT)

**Timesheet Edit Page** (`/timesheets/:id`)
- **Desktop View** (educator):
  - Week calendar grid (Mon-Fri)
  - Per day: Hours input, project/task dropdown
  - Auto-calculate total hours
  - Validation: No day > 12 hours, total < 50 hours/week
  - Save & Submit buttons

- **Mobile View** (student):
  - Form-based entry (not grid)
  - Date picker (today, prev days)
  - Hours + project/task form
  - Add entry button
  - Submit button

**Approval Queue Page** (`/timesheets/approvals`)
- **Manager-only view**
- List of submitted timesheets awaiting approval
- Per timesheet: Student name, week, total hours, submitted date
- Inline approve/reject with comments
- Bulk actions

**ORP Export Page** (`/timesheets/orp-export`)
- Select timesheet or date range
- Enter ORP number
- Generate export file
- Email to unemployment office (optional)

---

### 6. ABSENCE MANAGEMENT

**Absence Calendar Page** (`/absences/calendar`)
- Calendar view (month)
- Per student visible in their own view
- Per absence type: color-coded (sick=red, vacation=blue, personal=orange)
- Click date to see details
- Tooltips on hover (type, status, reason)

**Absence List Page** (`/absences`)
- **Educator/Manager View**:
  - List with filters (student, status, type, date range)
  - Columns: Student, type, dates, days, status, actions
  - Approve/Reject inline
  - Bulk approve

- **Student View**:
  - My requests (list)
  - Status badges
  - Edit/delete if PENDING
  - Calendar view

**Absence Request Form** (`/absences/new` or within modal)
- Fields: Type, start date, end date, reason, optional evidence (file upload)
- Submit for approval button
- Show expected approver

**Absence Approvals Page** (`/absences/approvals`)
- **Manager-only view**
- Submitted requests awaiting approval
- Per request: Student, dates, reason, submitted by
- Approve/Reject with optional comments
- Bulk actions

---

### 7. DOCUMENTS & FILE MANAGEMENT

**Document Library Page** (`/documents`)
- **Desktop View** (admin):
  - Grid/table (columns: Name, type, student, uploaded date, actions)
  - Search (by name, student)
  - Filters: Type, date range, student
  - Bulk select (delete, export, print)

- **Mobile View** (student):
  - Card view (document card with thumb + type)
  - Tap to view/download

**Document Upload Modal/Page** (`/documents/upload`)
- Drag & drop file input
- File type selector (ID card, diploma, contract, certificate, other)
- Optional name & description
- Auto-scan & classify using AI (coming soon)
- Upload progress bar
- Success confirmation

**Document Viewer** (`/documents/:id`)
- File preview (PDF, images)
- Metadata: Type, upload date, uploaded by, student
- Download button
- Delete button (admin only)
- Print button
- Full-screen view option

**Document Search Page** (`/documents/search`)
- Full-text search (filename, metadata)
- Advanced filters: Type, date range, student, uploader
- Search results (list)
- Bulk actions (download as ZIP, delete)

---

### 8. WORKFLOWS & APPROVALS

**Workflow List Page** (`/workflows`)
- Card grid (desktop) / list (mobile)
- Per workflow: Name, description, status, usage count
- Actions: Edit, Activate/Deactivate, Delete
- Search & filter

**Workflow Builder Page** (`/workflows/:id/edit`)
- **Desktop-Only** (complex visual editor)
- Canvas area (drag & drop)
- Workflow steps:
  - Start node
  - Action nodes (send email, create task, update student)
  - Decision nodes (IF/THEN/ELSE branching)
  - Approval nodes (assign to role + wait)
  - End node
- Toolbar: Add step, connect, delete, save
- Preview/test button
- Publish button

**Workflow Execution Page** (`/workflows/:instanceId`)
- **Mobile-friendly**
- Show current step
- For approval steps: Show details + Approve/Reject buttons
- For action steps: Show action + Continue button
- History: Show previous steps
- Status indicator

**Approval Dashboard** (`/approvals`)
- My pending approvals (list)
- Per approval: Type, description, requester, submitted date, action buttons
- Approve/Reject inline with comments

---

### 9. ROLES & PERMISSIONS MANAGEMENT

**Roles Page** (`/settings/roles`)
- **Admin-only**
- List of roles (SYSTEM_ADMIN, TENANT_ADMIN, PROFESSOR, etc.)
- Per role: Permissions list (checkbox matrix)
- Create/edit role form

**Role Assignment Page** (`/users/:userId/roles`)
- Show user's current roles
- Role scopes: TENANT, LEARNING_PATH, COHORT, ONE_TO_ONE
- Add role: Select role + scope + scope target
- Remove role button
- View effective permissions (merged)

**Permissions Matrix** (`/settings/permissions`)
- **Admin-only, Desktop-only**
- Matrix: Rows = Roles, Columns = Permissions
- Per cell: Checkbox (allowed/denied)
- Visual: Green (allowed), Red (denied), Gray (N/A)
- Quick filters by permission category

---

### 10. SETTINGS & CONFIGURATION

**General Settings** (`/settings/general`)
- Institution name
- Logo upload (header logo)
- Email from address
- Support email
- Notification settings (email preferences)

**Appearance Settings** (`/settings/appearance`)
- Dark mode (toggle, default on)
- Color theme customizer
  - Primary color picker
  - Accent color picker
  - Background tone slider
  - Live preview
- Font size toggle (normal, large, extra large)
- Reset to defaults

**User Management Settings** (`/settings/users`)
- List of all users
- Add user button
- Edit user form (role, status)
- Bulk import from CSV
- Session management (logout user)

**Integrations** (`/settings/integrations`)
- ORP integration (API key, endpoint)
- Email service (SMTP config)
- Document storage (cloud provider)
- AI provider (OpenAI/Anthropic key)
- Webhook management

**Security Settings** (`/settings/security`)
- Password policy (length, complexity)
- Session timeout (auto-logout)
- IP whitelist (optional)
- Two-factor authentication enforcement (per role)
- Login attempt limit
- Audit log settings

**GDPR & Compliance** (`/settings/compliance`)
- Data retention policy
- Consent log
- Data subject request form
- Export all user data
- Delete all user data (button with warning)

---

### 11. REPORTING & ANALYTICS

**Dashboard** (`/reports`)
- Executive overview (widgets)
  - Total students
  - Active learning paths
  - Total hours tracked
  - Average completion time
  - Compliance metrics (ORP reporting rate, absence rate)
- Charts: Student enrollment trend, hours per week, competency distribution

**Report Builder** (`/reports/builder`)
- Query builder UI:
  - Select data source (Students, Timesheets, Absences, etc.)
  - Select fields (columns)
  - Add filters (date range, status, etc.)
  - Group by option
  - Sort options
- Preview table (first 100 rows)
- Save report button
- Export button (CSV, Excel, PDF)

**Pre-built Reports** (`/reports/templates`)
- Student Roster (name, email, status, cohort)
- Learning Path Progress (student, path, completion %, avg competency level)
- Timesheet Report (student, week, hours, approver)
- Absence Report (student, type, days, status)
- Competency Assessment (student, competency, level)
- Compliance Report (ORP reporting status, LACI cases, RI cases, AI cases)

**Scheduled Reports** (`/reports/scheduled`)
- Create scheduled report (daily/weekly/monthly email)
- Select report template
- Email recipients
- Manage existing schedules

---

### 12. AUDIT & COMPLIANCE

**Audit Log** (`/audit`)
- **Admin-only**
- Searchable, filterable log of all system actions
- Columns: Timestamp, user, action, entity type, entity ID, old value, new value, IP address
- Filters: User, action type, entity type, date range
- Export (CSV)

**GDPR Data Subject Requests** (`/gdpr/requests`)
- **Admin-only**
- Form to create request
- Request type: Access (SAR), Delete (RTBF), Portability
- Requested by (email)
- Auto-fill request ID
- Status tracking (Received, Processing, Completed, Denied)
- Download/email response

**Consent Log** (`/compliance/consent`)
- Record of all user consents (cookie banner, terms, etc.)
- Per record: User, type, timestamp, IP, user agent
- Export (CSV)

---

## Mobile-Selective Visibility Strategy

### **DESKTOP** (1025px+)
- All features visible
- Full grids for data management (Students, Learning Paths, Role Matrix, Competency Matrix)
- Workflow builder
- Advanced settings

### **MOBILE** (≤1024px)
**HIDDEN**:
- Admin data grids (students list, users grid)
- Workflow builder (too complex for mobile)
- Role matrix, Permission matrix
- Timesheet week grid (replaced with form)
- Document grid (replaced with card list)

**VISIBLE** (restructured for mobile):
- Navigation (hamburger menu)
- Student card view (instead of grid)
- Timesheet form entry (instead of grid)
- Absence calendar
- Document card list
- Workflow execution (approval buttons)
- Settings (all pages, reformatted)
- Reports (data table)

**Touch-Friendly Adjustments**:
- Buttons: Min 48px × 48px
- Input fields: 44px height
- Card padding: 16px
- Bottom sheets for modals (instead of centered modals)

---

## Redux + Redux-Saga Implementation Details

### Auth Saga Pattern

```typescript
// authSaga.ts
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  try {
    const response = yield call(authAPI.login, action.payload);
    yield put(authSlice.actions.loginSuccess(response.data));
    yield call(localStorage.setItem, 'token', response.data.accessToken);
    yield put(push('/dashboard')); // react-router navigation
  } catch (error) {
    yield put(authSlice.actions.loginFailure(error.message));
  }
}

function* refreshTokenSaga() {
  try {
    const token = yield call(localStorage.getItem, 'refreshToken');
    const response = yield call(authAPI.refresh, token);
    yield put(authSlice.actions.tokenRefreshed(response.data.accessToken));
    yield call(localStorage.setItem, 'token', response.data.accessToken);
  } catch (error) {
    yield put(authSlice.actions.logout());
    yield put(push('/login'));
  }
}

function* setupAuthSaga() {
  yield takeLatest(authSlice.actions.login.type, loginSaga);
  yield takeLatest(authSlice.actions.logout.type, logoutSaga);
  yield spawn(function* tokenRefreshWatcher() {
    while (true) {
      yield delay(15 * 60 * 1000); // 15 min
      yield put(authSlice.actions.refreshToken());
    }
  });
}

export default setupAuthSaga;
```

### Students Saga Pattern

```typescript
function* fetchStudentsSaga(action: PayloadAction<StudentsFilters>) {
  try {
    yield put(studentsSlice.actions.setLoading(true));
    const response = yield call(
      studentsAPI.fetchStudents,
      action.payload
    );
    yield put(studentsSlice.actions.setStudents(response.data.students));
    yield put(studentsSlice.actions.setTotal(response.data.total));
    yield put(studentsSlice.actions.setLoading(false));
  } catch (error) {
    yield put(studentsSlice.actions.setError(error.message));
    yield put(notificationsSlice.actions.addNotification({
      type: 'error',
      message: 'Failed to load students'
    }));
  }
}

function* createStudentSaga(action: PayloadAction<StudentFormData>) {
  try {
    const response = yield call(studentsAPI.createStudent, action.payload);
    yield put(studentsSlice.actions.addStudent(response.data));
    yield put(notificationsSlice.actions.addNotification({
      type: 'success',
      message: 'Student created successfully'
    }));
    yield put(push(`/students/${response.data.id}`));
  } catch (error) {
    yield put(notificationsSlice.actions.addNotification({
      type: 'error',
      message: error.response?.data?.message || 'Failed to create student'
    }));
  }
}
```

### Selectors Pattern

```typescript
// studentsSelectors.ts
const selectStudents = (state: RootState) => state.students.items;
const selectLoading = (state: RootState) => state.students.loading;
const selectTotal = (state: RootState) => state.students.total;

// Memoized selectors (recompute only when inputs change)
export const selectStudentsByStatus = createSelector(
  [selectStudents, (_state, status: string) => status],
  (students, status) => students.filter(s => s.status === status)
);

export const selectStudentCount = createSelector(
  [selectStudents],
  (students) => students.length
);

// Usage in component
const { useAppSelector } = require('@/app/hooks');
function StudentList() {
  const students = useAppSelector(selectStudents);
  const loading = useAppSelector(selectLoading);
  // ...
}
```

---

## Validation Schema (Zod)

```typescript
// validation.ts
export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required')
});

export const StudentFormSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Invalid email').unique('Email already exists'),
  dateOfBirth: z.string().pipe(z.coerce.date()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  avsNumber: z.string().regex(/^756\.\d{4}\.\d{4}\.\d{2}$/, 'Invalid AVS format'),
  canton: z.enum([...SwissCantons]),
  employmentStatus: z.enum(['LACI', 'RI', 'AI', 'EMPLOYED', 'UNEMPLOYED']),
  address: z.string().min(1, 'Address required'),
  city: z.string().min(1, 'City required'),
  postalCode: z.string().regex(/^\d{4}$/, 'Invalid postal code'),
  phoneNumber: z.string().optional(),
});

export const TimesheetEntrySchema = z.object({
  date: z.string().pipe(z.coerce.date()),
  projectId: z.string().uuid(),
  taskTypeId: z.string().uuid(),
  hours: z.number().min(0.5).max(12),
  description: z.string().min(1),
});
```

---

## Dark Mode Implementation

### Tailwind Dark Mode

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg-primary: #0f0f0f;
    --color-bg-secondary: #1a1a1a;
    --color-border: #2a2a2a;
    --color-text-primary: #ffffff;
    --color-text-secondary: #b0b0b0;
  }
}

/* Tailwind dark mode classes */
.dark {
  @apply bg-slate-950 text-white;
}

.dark .card {
  @apply bg-slate-900 border-slate-800;
}
```

### Theme Provider (React Context)

```typescript
interface ThemeContextValue {
  isDark: boolean;
  primaryColor: string;
  accentColor: string;
  setTheme: (config: ThemeConfig) => void;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : DEFAULT_THEME;
  });

  return (
    <ThemeContext.Provider value={{ ...theme, setTheme }}>
      <div style={{
        '--primary-color': theme.primaryColor,
        '--accent-color': theme.accentColor,
      } as React.CSSProperties}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

---

## Error Handling & Validation

### API Error Interceptor

```typescript
// utils/api.ts
const api = axios.create({ baseURL: 'https://api.studently.swiss/api/v1' });

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission denied error
      store.dispatch(notificationsSlice.actions.addNotification({
        type: 'error',
        message: 'You do not have permission to perform this action'
      }));
    } else if (error.response?.status === 422) {
      // Validation error
      return Promise.reject({
        type: 'validation',
        errors: error.response.data.details
      });
    }
    return Promise.reject(error);
  }
);
```

### Form Error Handling

```typescript
function StudentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(StudentFormSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        error={errors.email?.message}
      >
        <input
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
      </FormField>
    </form>
  );
}
```

---

## Performance Optimization

### Code Splitting by Route

```typescript
// Routes are lazy-loaded per feature
const StudentListPage = lazy(() => import('@/features/students/pages/StudentListPage'));
const StudentDetailPage = lazy(() => import('@/features/students/pages/StudentDetailPage'));
```

### Memoization

```typescript
const StudentCard = React.memo(({ student }: Props) => {
  return <StudentCardComponent student={student} />;
}, (prev, next) => prev.student.id === next.student.id); // Custom comparison
```

### Virtual List for Large Grids

```typescript
import { FixedSizeList as List } from 'react-window';

function StudentGrid({ students }: Props) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <StudentRow student={students[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={students.length}
      itemSize={60}
    >
      {Row}
    </List>
  );
}
```

---

## Development Timeline

**Phase 1: Foundation (Weeks 1-2)**
- Redux store setup + sagas
- Auth (login, MFA, refresh tokens)
- Component library (atoms, molecules)
- Shared layout components (Header, Sidebar, MainLayout)

**Phase 2: Core Features (Weeks 3-6)**
- Dashboard (role variants)
- Student management (list, detail, form, import/export)
- Learning paths (list, editor, competencies)
- Timesheets (list, grid/form, approvals)

**Phase 3: Advanced Features (Weeks 7-10)**
- Absences (calendar, approvals)
- Documents (library, upload, viewer)
- Workflows (builder, execution)
- Reporting (builder, pre-built reports)

**Phase 4: Settings & Polish (Weeks 11-12)**
- Settings (all pages)
- Audit log
- GDPR compliance
- Dark mode refinement
- Mobile optimization
- Testing & bug fixes

---

**Document Version**: 1.0  
**Date**: March 17, 2026  
**Status**: READY FOR DEVELOPMENT
