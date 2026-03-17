# AGENT-4: Redux + Redux-Saga Setup

## SYSTEM INSTRUCTIONS
Read: `.github/copilot-instructions.md` → Redux patterns, state management architecture, async operations.

## SPECIFICATION
Read: `docs/implementation/21-design-system-redux-architecture.md` (Part 2: Redux Store Architecture)

## TASKS

### Task 1: Redux Store Configuration
**Output**: `frontend/src/app/store.ts` + `frontend/src/app/hooks.ts`
- Configure Redux store with Thunk + Redux-Saga middleware
- Export typed hooks (useAppDispatch, useAppSelector)
- Export RootState, AppDispatch types
- Saga middleware initialization
- Development tools (Redux DevTools)

**Requirements**:
- TypeScript strict mode
- Middleware order (default middleware + saga + logger)

### Task 2: Auth Slice & Saga (Complete)
**Output**: `frontend/src/features/auth/store/`
- authTypes.ts (AuthState, User interface, LoginCredentials, etc.)
- authSlice.ts (createSlice with 15+ reducers: login, loginSuccess, loginFailure, verifyMFA, logout, tokenRefresh, setUser, clearError, etc.)
- authSelectors.ts (selectUser, selectIsAuthenticated, selectUserRole, memoized selectHasPermission)
- authSaga.ts (loginSaga, mfaVerifySaga, logoutSaga, tokenRefreshWatcher with delay)

**Implementation**:
- JWT token handling (store in state + localStorage)
- MFA flow (session ID management)
- Token refresh automation (every 14 minutes)
- Error handling with typed errors

### Task 3: Students Slice & Saga
**Output**: `frontend/src/features/students/store/`
- studentsTypes.ts (Student, StudentsState, StudentsFilters interfaces)
- studentsSlice.ts (20+ reducers: fetchStudents, setStudents, fetchStudent, setSelectedStudent, createStudent, addStudent, updateStudent, updateStudentInList, deleteStudent, removeStudent, setPagination, setError, clearError, etc.)
- studentsSelectors.ts (selectStudents, selectLoading, selectTotal, memoized selectStudentsByStatus, selectStudentCount)
- studentsSaga.ts (fetchStudentsSaga, createStudentSaga, updateStudentSaga, deleteStudentSaga with error handling + notifications)

**Implementation**:
- Pagination support (limit, offset)
- Filtering & sorting (saga applies filters to API call)
- Notifications on success/error
- Notification dispatch to UI

### Task 4: Notifications Slice (UI State)
**Output**: `frontend/src/shared/store/notificationsSlice.ts`
- notificationsSlice (addNotification, removeNotification, clearAll reducers)
- Notification interface (id, type, message, duration, action)
- Auto-dismiss logic (setTimeout in reducer OR saga)

**Requirements**:
- Auto-dismiss after duration (5-7 seconds default)
- Manual dismiss capability
- Multiple notifications support (queue)

### Task 5: UI Slice (App State)
**Output**: `frontend/src/shared/store/uiSlice.ts`
- UI state (sidebarOpen, mobileMenuOpen, theme, language, etc.)
- Reducers (toggleSidebar, setTheme, setLanguage, etc.)
- Selectors (selectSidebarOpen, selectTheme, etc.)

**Requirements**:
- Persist to localStorage (sidebar state, theme, language)
- Hydrate on app load

### Task 6: Hooks & Utilities
**Output**: `frontend/src/app/hooks.ts` + `frontend/src/shared/hooks/`
- useAuth() (user, isAuthenticated, error, loading, login, logout functions)
- usePermission(permission) (check if user has permission)
- useStudents() (students, loading, error, total, fetch, create, delete functions)
- useNotification() (add, remove, clear functions)
- useMobile() (media query hook for responsive logic)
- useQuery() (parse URL query parameters)
- useLocalStorage(key) (persisted state)
- useDebounce(value, delay) (debounced value for searches)

**Requirements**:
- Type-safe (return proper types)
- Dispatch actions correctly
- Handle errors gracefully

### Task 7: Root Saga Combiner
**Output**: `frontend/src/rootSaga.ts`
- Fork all domain sagas (authSaga, studentsSaga, learningPathsSaga, etc.)
- Root saga runs all in parallel with fork()

**Requirements**:
- Easy to add new sagas
- All sagas run simultaneously

### Task 8: Type Definitions & Validation Schemas
**Output**: `frontend/src/shared/types/` + `frontend/src/shared/utils/validation.ts`
- Zod schemas (LoginSchema, StudentFormSchema, TimesheetEntrySchema, etc.)
- TypeScript interfaces (API request/response types)
- Domain models (match backend)

## TESTS

### Unit Tests
**File**: `frontend/__tests__/store/auth.test.ts`, `frontend/__tests__/store/students.test.ts`
- Reducer tests (action → state change)
  - loginSuccess action sets user + token
  - logout action clears all auth state
  - addStudent action adds to list
- Selector tests (state → derived value)
  - selectIsAuthenticated returns true if user present
  - selectStudentsByStatus filters correctly
  - selectHasPermission checks permission list

**Target**: ≥90% coverage (all reducers, all selectors)

### Saga Integration Tests
**File**: `frontend/__tests__/sagas/auth.saga.test.ts`, `frontend/__tests__/sagas/students.saga.test.ts`
- loginSaga: Dispatch login action → API call → loginSuccess action → localStorage update
- mfaVerifySaga: Dispatch verifyMFA → API call → loginSuccess action
- logoutSaga: Dispatch logout → API call → blacklist token → clear localStorage
- tokenRefreshWatcher: Every 14 minutes, refresh token automatically
- fetchStudentsSaga: Dispatch fetchStudents → API call → setStudents action → setTotal action
- createStudentSaga: Dispatch createStudent → API call → addStudent action → notification action → navigate

**Tool**: redux-saga-test-plan  
**Target**: ≥85% coverage (all sagas, success + error paths)

### E2E Redux Tests
**File**: `frontend/__tests__/e2e/store.e2e.ts`
- Full login flow: Dispatch login → loginSuccess → Dispatch refresh → tokenRefreshed
- Full student CRUD: Dispatch fetchStudents → Dispatch createStudent → Dispatch updateStudent → Dispatch deleteStudent
- Multi-action flow: Dispatch fetchStudents + addNotification → verify both state slices updated
- Error recovery: Dispatch failed action → catch error → dispatch clearError → verify state

**Tool**: Vitest + Redux store  
**Target**: ≥80% coverage (user-facing workflows)

## REPORTING

```
[AGENT-4] REDUX + REDUX-SAGA SETUP
Status: [COMPLETED|IN-PROGRESS|FAILED]
Tasks: [n/8] completed
  ✓ Redux Store Configuration
  ✓ Auth Slice & Saga (complete)
  ✓ Students Slice & Saga
  ✓ Notifications Slice
  ✓ UI Slice
  ✓ Hooks & Utilities (8+)
  ✓ Root Saga Combiner
  ✓ Type Definitions & Zod Schemas

Tests: unit=X/X | saga_integration=Y/Y | e2e=Z/Z
Code: frontend/src/app/ + frontend/src/features/ + frontend/src/shared/
Files Created:
  - app/store.ts (Redux configuration)
  - app/hooks.ts (typed hooks)
  - features/auth/store/ (authSlice, authSaga, authSelectors, authTypes)
  - features/students/store/ (studentsSlice, studentsSaga, studentsSelectors, studentsTypes)
  - shared/store/ (notificationsSlice, uiSlice)
  - shared/hooks/ (custom hooks: useAuth, usePermission, useMobile, etc.)
  - shared/types/ (interfaces)
  - shared/utils/validation.ts (Zod schemas)
  - rootSaga.ts
  - __tests__/ (unit + saga + e2e)

Issues: [0|list]
Next: [Ready for Agent-6 (Backoffice) - can proceed after Agent-3 (Design System)]
```

## SUCCESS CRITERIA

- [ ] Redux store initializes without errors
- [ ] All slices registered in store
- [ ] Redux DevTools works in development
- [ ] Auth saga: login → MFA → token refresh → logout flow works
- [ ] Students saga: fetch → create → update → delete flow works
- [ ] Notifications dispatched and displayed on success/error
- [ ] Hooks are type-safe and return correct types
- [ ] Unit tests: ≥90% pass rate
- [ ] Saga tests: ≥85% pass rate
- [ ] E2E tests: ≥80% pass rate
- [ ] Zod schemas validate correctly
- [ ] localStorage persistence works (tokens, UI state)
- [ ] Zero blocking issues

---

**Agent-4 Version**: 1.0  
**Estimated Duration**: 3-4 days  
**Start When**: After Agent-2-Phase1 (API endpoints) OR in parallel (mock API for testing)
