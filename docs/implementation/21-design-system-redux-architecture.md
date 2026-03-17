# Design System & Redux Architecture - Advanced Specifications

## Part 1: Dark Mode Design System

### Color Tokens

#### Primary Surfaces

```css
/* Base Backgrounds */
--color-surface-1: #0f0f0f;   /* Darkest - Page background */
--color-surface-2: #1a1a1a;   /* Cards, modals, elevated elements */
--color-surface-3: #242424;   /* Hovered cards, subtle elevation */
--color-surface-4: #2f2f2f;   /* Secondary cards, grouped sections */

/* Text Colors */
--color-text-primary: #ffffff;    /* Main text */
--color-text-secondary: #b0b0b0;  /* Secondary text, labels */
--color-text-tertiary: #808080;   /* Placeholder, disabled text */
--color-text-inverse: #0f0f0f;    /* Text on light backgrounds */

/* Borders & Dividers */
--color-border-primary: #2a2a2a;   /* Standard borders */
--color-border-secondary: #1f1f1f; /* Subtle borders, dividers */
--color-border-focus: #0071e3;     /* Focus states */

/* Interactive Elements */
--color-interactive-hover: #333333; /* Background on hover */
--color-interactive-active: #404040; /* Background on active/pressed */
--color-interactive-disabled: #1a1a1a; /* Disabled state background */
```

#### Semantic Colors

```css
/* Actions & CTAs */
--color-primary: #0071e3;         /* Blue - Primary actions */
--color-primary-hover: #0055b3;   /* Darker blue - Hover state */
--color-primary-active: #004499;  /* Even darker - Active state */
--color-primary-disabled: #1a1a1a; /* Disabled primary button */

/* Positive/Success */
--color-success: #10b981;         /* Green */
--color-success-light: #6ee7b7;   /* Light green - backgrounds */
--color-success-dark: #059669;    /* Dark green - hover */

/* Warning */
--color-warning: #f59e0b;         /* Orange/Yellow */
--color-warning-light: #fcd34d;   /* Light - backgrounds */
--color-warning-dark: #d97706;    /* Dark - hover */

/* Error/Danger */
--color-error: #ef4444;           /* Red */
--color-error-light: #fecaca;     /* Light red - backgrounds */
--color-error-dark: #dc2626;      /* Dark red - hover */

/* Info */
--color-info: #3b82f6;            /* Blue */
--color-info-light: #93c5fd;      /* Light blue - backgrounds */
--color-info-dark: #1d4ed8;       /* Dark blue - hover */

/* Neutral (grays) */
--color-neutral-50: #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d1d5db;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-600: #4b5563;
--color-neutral-700: #374151;
--color-neutral-800: #1f2937;
--color-neutral-900: #111827;
```

#### Opacity Scales

```css
/* Semantic alpha colors (for overlays, backgrounds) */
--color-overlay-primary: rgba(7, 113, 227, 0.1);    /* Blue overlay */
--color-overlay-success: rgba(16, 185, 129, 0.1);   /* Green overlay */
--color-overlay-warning: rgba(245, 158, 11, 0.1);   /* Orange overlay */
--color-overlay-error: rgba(239, 68, 68, 0.1);      /* Red overlay */
--color-overlay-dark: rgba(0, 0, 0, 0.3);           /* Dark overlay */

/* Opacity values */
--opacity-disabled: 0.5;
--opacity-hover: 1;
--opacity-active: 1;
--opacity-subtle: 0.7;
```

### Spacing Scale

```css
--space-0: 0;
--space-1: 2px;
--space-2: 4px;
--space-3: 8px;
--space-4: 12px;
--space-5: 16px;      /* Base spacing unit */
--space-6: 24px;
--space-7: 32px;
--space-8: 48px;
--space-9: 64px;
--space-10: 80px;
--space-11: 96px;
--space-12: 128px;

/* Common patterns */
--padding-xs: 8px;
--padding-sm: 12px;
--padding-base: 16px;
--padding-lg: 24px;
--padding-xl: 32px;

--margin-xs: 4px;
--margin-sm: 8px;
--margin-base: 16px;
--margin-lg: 24px;
--margin-xl: 32px;
```

### Typography Scale

```css
/* Font Families */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
--font-mono: 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--font-size-xs: 12px;     /* Labels, badges */
--font-size-sm: 14px;     /* Secondary text, captions */
--font-size-base: 16px;   /* Body text (default) */
--font-size-lg: 18px;     /* Small headlines */
--font-size-xl: 20px;     /* Subsection titles */
--font-size-2xl: 24px;    /* Section titles */
--font-size-3xl: 28px;    /* Page subtitles */
--font-size-4xl: 32px;    /* Page titles */
--font-size-5xl: 36px;    /* Hero headlines */
--font-size-6xl: 48px;    /* Extra large headlines */

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
--line-height-loose: 2;

/* Font Weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;

/* Text Styles */
--text-xs: 12px / 1.2;
--text-sm: 14px / 1.5;
--text-base: 16px / 1.5;
--text-lg: 18px / 1.6;

--heading-xs: 14px / 1.2 700;   /* Label, small heading */
--heading-sm: 16px / 1.4 600;   /* Subsection */
--heading-base: 20px / 1.4 700; /* Section heading */
--heading-lg: 24px / 1.3 700;   /* Page subtitle */
--heading-xl: 32px / 1.2 700;   /* Page title */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 4px;     /* Buttons, small elements */
--radius-base: 8px;   /* Standard (cards, inputs) */
--radius-md: 12px;    /* Medium elements */
--radius-lg: 16px;    /* Large cards, modals */
--radius-xl: 24px;    /* Extra large */
--radius-full: 9999px; /* Fully rounded (pills, avatars) */

/* Common patterns */
--border-radius-button: 6px;
--border-radius-input: 8px;
--border-radius-card: 12px;
--border-radius-modal: 16px;
```

### Shadow System

```css
/* Elevation shadows (dark mode adapted) */
--shadow-none: none;

--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.4);

--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.5);

--shadow-base: 
  0 4px 6px rgba(0, 0, 0, 0.6),
  0 2px 4px rgba(0, 0, 0, 0.4);

--shadow-md: 
  0 8px 12px rgba(0, 0, 0, 0.6),
  0 4px 8px rgba(0, 0, 0, 0.4);

--shadow-lg: 
  0 12px 24px rgba(0, 0, 0, 0.7),
  0 6px 12px rgba(0, 0, 0, 0.5);

--shadow-xl: 
  0 20px 40px rgba(0, 0, 0, 0.8),
  0 10px 20px rgba(0, 0, 0, 0.5);

/* Focus shadows (for accessibility) */
--shadow-focus: 0 0 0 3px rgba(7, 113, 227, 0.3);

/* Inner shadows */
--shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.4);
```

### Breakpoints

```css
--breakpoint-mobile: 320px;
--breakpoint-tablet: 640px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
--breakpoint-ultra: 1536px;

/* Media query helpers */
@media (min-width: 640px) { /* Tablet and up */ }
@media (min-width: 1024px) { /* Desktop and up */ }
@media (min-width: 1280px) { /* Wide desktop and up */ }
@media (max-width: 639px) { /* Mobile only */ }
@media (max-width: 1023px) { /* Mobile and tablet */ }
```

### Animations & Transitions

```css
/* Durations */
--duration-fastest: 50ms;
--duration-faster: 100ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
--duration-slowest: 1000ms;

/* Timing Functions */
--easing-ease-in: cubic-bezier(0.4, 0, 1, 1);
--easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
--easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--easing-ease-linear: linear;

/* Common Transitions */
--transition-all: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-colors: color 200ms, background-color 200ms;
--transition-opacity: opacity 200ms;
--transition-transform: transform 200ms;
```

### Component Styles

#### Button Variants

```css
/* Primary Button */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: var(--transition-all);
  min-height: 44px; /* Touch target */
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
}

.btn-primary:active {
  background-color: var(--color-primary-active);
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--color-interactive-disabled);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  opacity: 0.5;
}

/* Secondary Button */
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-border-primary);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  transition: var(--transition-all);
}

.btn-secondary:hover {
  background-color: var(--color-interactive-hover);
  border-color: var(--color-primary);
}

/* Danger Button */
.btn-danger {
  background-color: var(--color-error);
  color: white;
  /* ... same as primary but with error color ... */
}
```

#### Input Styles

```css
.input-field {
  padding: 10px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-base);
  background-color: var(--color-surface-2);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-family: var(--font-sans);
  transition: var(--transition-all);
  min-height: 40px; /* Touch target */
}

.input-field:hover {
  border-color: var(--color-border-focus);
  background-color: var(--color-surface-3);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  background-color: var(--color-surface-2);
}

.input-field::placeholder {
  color: var(--color-text-tertiary);
}

.input-field:disabled {
  background-color: var(--color-interactive-disabled);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}
```

#### Card Styles

```css
.card {
  background-color: var(--color-surface-2);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--padding-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-all);
}

.card:hover {
  border-color: var(--color-border-focus);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card.clickable {
  cursor: pointer;
}
```

#### Badge/Tag Styles

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background-color: var(--color-neutral-800);
  color: var(--color-text-secondary);
}

.badge.success {
  background-color: rgba(16, 185, 129, 0.2);
  color: var(--color-success-light);
}

.badge.error {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--color-error-light);
}

.badge.warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: var(--color-warning-light);
}
```

#### Status Indicator Colors

```css
.status-active { color: var(--color-success); }
.status-inactive { color: var(--color-neutral-500); }
.status-pending { color: var(--color-warning); }
.status-error { color: var(--color-error); }
.status-processing { color: var(--color-info); }
.status-completed { color: var(--color-success); }
```

---

## Part 2: Redux Store Architecture

### Store Configuration

```typescript
// store.ts
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './rootSaga';

// Import slices
import authReducer from '@/features/auth/store/authSlice';
import usersReducer from '@/features/users/store/usersSlice';
import studentsReducer from '@/features/students/store/studentsSlice';
import learningPathsReducer from '@/features/learning-paths/store/pathsSlice';
import competenciesReducer from '@/features/competencies/store/competenciesSlice';
import timesheetsReducer from '@/features/timesheets/store/timesheetsSlice';
import absencesReducer from '@/features/absences/store/absencesSlice';
import documentsReducer from '@/features/documents/store/documentsSlice';
import workflowsReducer from '@/features/workflows/store/workflowsSlice';
import rolesReducer from '@/features/roles/store/rolesSlice';
import settingsReducer from '@/features/settings/store/settingsSlice';
import reportingReducer from '@/features/reporting/store/reportingSlice';
import notificationsReducer from '@/shared/store/notificationsSlice';
import uiReducer from '@/shared/store/uiSlice';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    // Domain stores
    auth: authReducer,
    users: usersReducer,
    students: studentsReducer,
    learningPaths: learningPathsReducer,
    competencies: competenciesReducer,
    timesheets: timesheetsReducer,
    absences: absencesReducer,
    documents: documentsReducer,
    workflows: workflowsReducer,
    roles: rolesReducer,
    settings: settingsReducer,
    reporting: reportingReducer,
    
    // UI stores
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
```

### Auth Store Example (Complete)

```typescript
// features/auth/store/authTypes.ts
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  mfaRequired: boolean;
  sessionId: string | null;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  permissions: string[];
  createdAt: string;
}

// features/auth/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  mfaRequired: false,
  sessionId: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login flow
    login: (state, action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    
    loginMFARequired: (state, action: PayloadAction<string>) => {
      state.mfaRequired = true;
      state.sessionId = action.payload;
      state.loading = false;
    },
    
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.mfaRequired = false;
      state.error = null;
    },
    
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.mfaRequired = false;
    },

    // MFA verification
    verifyMFA: (state, action: PayloadAction<{ sessionId: string; code: string }>) => {
      state.loading = true;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.mfaRequired = false;
      state.sessionId = null;
    },

    // Token refresh
    tokenRefresh: (state) => {
      // Saga handles this
    },

    tokenRefreshed: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },

    // Profile
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },
});

// features/auth/store/authSelectors.ts
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectMFARequired = (state: RootState) => state.auth.mfaRequired;
export const selectUserRole = (state: RootState) => state.auth.user?.role;
export const selectUserPermissions = (state: RootState) => state.auth.user?.permissions || [];

// Memoized selector: Check if user has permission
export const selectHasPermission = createSelector(
  [selectUserPermissions, (_state, permission: string) => permission],
  (permissions, permission) => permissions.includes(permission)
);

// features/auth/store/authSaga.ts
import { call, put, take, select, fork, cancel, delay } from 'redux-saga/effects';
import * as authAPI from '@/shared/api/authAPI';
import { authSlice } from './authSlice';
import { selectAccessToken, selectRefreshToken } from './authSelectors';

function* loginSaga(action: PayloadAction<LoginCredentials>) {
  try {
    const response: LoginResponse = yield call(
      authAPI.login,
      action.payload
    );

    if (response.mfaRequired) {
      // User has MFA enabled
      yield put(authSlice.actions.loginMFARequired(response.sessionId));
    } else {
      // Login successful
      yield put(authSlice.actions.loginSuccess(response));
      yield call(localStorage.setItem, 'accessToken', response.accessToken);
      yield call(localStorage.setItem, 'refreshToken', response.refreshToken);
    }
  } catch (error: any) {
    yield put(authSlice.actions.loginFailure(
      error.response?.data?.message || 'Login failed'
    ));
  }
}

function* mfaVerifySaga(action: PayloadAction<MFAVerifyPayload>) {
  try {
    const response: LoginResponse = yield call(
      authAPI.verifyMFA,
      action.payload
    );
    
    yield put(authSlice.actions.loginSuccess(response));
    yield call(localStorage.setItem, 'accessToken', response.accessToken);
    yield call(localStorage.setItem, 'refreshToken', response.refreshToken);
  } catch (error: any) {
    yield put(authSlice.actions.loginFailure('MFA verification failed'));
  }
}

function* logoutSaga() {
  try {
    const token: string = yield select(selectAccessToken);
    yield call(authAPI.logout, token);
  } catch (error) {
    // Ignore errors on logout
  } finally {
    yield call(localStorage.removeItem, 'accessToken');
    yield call(localStorage.removeItem, 'refreshToken');
    yield put(authSlice.actions.logout());
  }
}

// Token refresh: Refresh before expiry (every 14 minutes for 15-min tokens)
function* tokenRefreshWatcher() {
  while (true) {
    yield delay(14 * 60 * 1000); // 14 minutes
    
    try {
      const refreshToken: string = yield select(selectRefreshToken);
      const response: TokenRefreshResponse = yield call(
        authAPI.refreshToken,
        refreshToken
      );
      
      yield put(authSlice.actions.tokenRefreshed(response.accessToken));
      yield call(localStorage.setItem, 'accessToken', response.accessToken);
    } catch (error) {
      // Refresh failed, logout user
      yield put(authSlice.actions.logout());
    }
  }
}

export function* authSaga() {
  yield takeLatest(authSlice.actions.login.type, loginSaga);
  yield takeLatest(authSlice.actions.verifyMFA.type, mfaVerifySaga);
  yield takeLatest(authSlice.actions.logout.type, logoutSaga);
  yield fork(tokenRefreshWatcher);
}
```

### Students Store Example

```typescript
// features/students/store/studentsTypes.ts
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED';
  employmentStatus: 'LACI' | 'RI' | 'AI' | 'EMPLOYED' | 'UNEMPLOYED' | 'STUDENT';
  avsNumber: string; // Masked
  orpNumber: string;
  canton: string;
  phoneNumber?: string;
  address: string;
  city: string;
  postalCode: string;
  cohortId: string;
  learningPaths: LearningPathEnrollment[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentsState {
  items: Student[];
  selectedStudent: Student | null;
  loading: boolean;
  error: string | null;
  total: number;
  filters: StudentsFilters;
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface StudentsFilters {
  search?: string;
  status?: string;
  employmentStatus?: string;
  cohortId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// features/students/store/studentsSlice.ts
export const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // Fetch students
    fetchStudents: (state, action: PayloadAction<StudentsFilters>) => {
      state.loading = true;
      state.filters = action.payload;
    },

    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.items = action.payload;
      state.loading = false;
    },

    setTotal: (state, action: PayloadAction<number>) => {
      state.total = action.payload;
    },

    // Fetch single student
    fetchStudent: (state, action: PayloadAction<string>) => {
      state.loading = true;
    },

    setSelectedStudent: (state, action: PayloadAction<Student>) => {
      state.selectedStudent = action.payload;
      state.loading = false;
    },

    // Create student
    createStudent: (state, action: PayloadAction<StudentFormData>) => {
      state.loading = true;
    },

    addStudent: (state, action: PayloadAction<Student>) => {
      state.items.unshift(action.payload);
      state.total += 1;
      state.loading = false;
    },

    // Update student
    updateStudent: (state, action: PayloadAction<{ id: string; data: Partial<StudentFormData> }>) => {
      state.loading = true;
    },

    updateStudentInList: (state, action: PayloadAction<Student>) => {
      const index = state.items.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.loading = false;
    },

    // Delete student
    deleteStudent: (state, action: PayloadAction<string>) => {
      state.loading = true;
    },

    removeStudent: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(s => s.id !== action.payload);
      state.total -= 1;
      state.loading = false;
    },

    // Pagination
    setPagination: (state, action: PayloadAction<{ limit: number; offset: number }>) => {
      state.pagination = action.payload;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

// features/students/store/studentsSaga.ts
function* fetchStudentsSaga(action: PayloadAction<StudentsFilters>) {
  try {
    const { pagination } = yield select((state: RootState) => state.students);
    
    const response = yield call(
      studentsAPI.fetchStudents,
      {
        ...action.payload,
        limit: pagination.limit,
        offset: pagination.offset,
      }
    );

    yield put(studentsSlice.actions.setStudents(response.data.students));
    yield put(studentsSlice.actions.setTotal(response.data.total));
  } catch (error: any) {
    yield put(studentsSlice.actions.setError(
      error.response?.data?.message || 'Failed to fetch students'
    ));
  }
}

function* createStudentSaga(action: PayloadAction<StudentFormData>) {
  try {
    const response = yield call(studentsAPI.createStudent, action.payload);
    
    yield put(studentsSlice.actions.addStudent(response.data));
    yield put(notificationsSlice.actions.addNotification({
      id: `notify-${Date.now()}`,
      type: 'success',
      message: `Student ${response.data.firstName} ${response.data.lastName} created successfully`,
      duration: 5000,
    }));

    // Navigate to student detail page
    yield put(push(`/students/${response.data.id}`));
  } catch (error: any) {
    const errorMessage = error.response?.data?.details?.[0]?.message || 
                        error.response?.data?.message || 
                        'Failed to create student';
    
    yield put(studentsSlice.actions.setError(errorMessage));
    yield put(notificationsSlice.actions.addNotification({
      id: `notify-${Date.now()}`,
      type: 'error',
      message: errorMessage,
      duration: 7000,
    }));
  }
}

export function* studentsSaga() {
  yield takeLatest(studentsSlice.actions.fetchStudents.type, fetchStudentsSaga);
  yield takeLatest(studentsSlice.actions.createStudent.type, createStudentSaga);
  yield takeLatest(studentsSlice.actions.updateStudent.type, updateStudentSaga);
  yield takeLatest(studentsSlice.actions.deleteStudent.type, deleteStudentSaga);
}
```

### Notifications Store (UI)

```typescript
// shared/store/notificationsSlice.ts
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // ms, auto-remove if set
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] as Notification[] },
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.push(action.payload);
      
      // Auto-remove after duration
      if (action.payload.duration) {
        setTimeout(() => {
          state.items = state.items.filter(n => n.id !== action.payload.id);
        }, action.payload.duration);
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(n => n.id !== action.payload);
    },

    clearAll: (state) => {
      state.items = [];
    },
  },
});
```

### Root Saga Combiner

```typescript
// rootSaga.ts
import { fork } from 'redux-saga/effects';
import { authSaga } from '@/features/auth/store/authSaga';
import { usersSaga } from '@/features/users/store/usersSaga';
import { studentsSaga } from '@/features/students/store/studentsSaga';
import { learningPathsSaga } from '@/features/learning-paths/store/pathsSaga';
import { timesheetsSaga } from '@/features/timesheets/store/timesheetsSaga';
import { absencesSaga } from '@/features/absences/store/absencesSaga';
import { documentsSaga } from '@/features/documents/store/documentsSaga';
import { workflowsSaga } from '@/features/workflows/store/workflowsSaga';
import { settingsSaga } from '@/features/settings/store/settingsSaga';
import { reportingSaga } from '@/features/reporting/store/reportingSaga';

export function* rootSaga() {
  yield fork(authSaga);
  yield fork(usersSaga);
  yield fork(studentsSaga);
  yield fork(learningPathsSaga);
  yield fork(timesheetsSaga);
  yield fork(absencesSaga);
  yield fork(documentsSaga);
  yield fork(workflowsSaga);
  yield fork(settingsSaga);
  yield fork(reportingSaga);
}
```

### Hooks for Components

```typescript
// app/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use these hooks instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Convenience hooks for common patterns
export const useAuth = () => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const error = useAppSelector(selectAuthError);
  const loading = useAppSelector(selectAuthLoading);

  return { user, isAuthenticated, error, loading };
};

export const usePermission = (permission: string) => {
  return useAppSelector(state => selectHasPermission(state, permission));
};

export const useStudents = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector(state => state.students.items);
  const loading = useAppSelector(state => state.students.loading);
  const error = useAppSelector(state => state.students.error);
  const total = useAppSelector(state => state.students.total);

  return {
    students,
    loading,
    error,
    total,
    fetch: (filters: StudentsFilters) => dispatch(studentsSlice.actions.fetchStudents(filters)),
    create: (data: StudentFormData) => dispatch(studentsSlice.actions.createStudent(data)),
    delete: (id: string) => dispatch(studentsSlice.actions.deleteStudent(id)),
  };
};
```

### Component Usage Example

```typescript
// features/students/pages/StudentListPage.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { studentsSlice } from '../store/studentsSlice';
import { selectStudents, selectLoading } from '../store/studentsSelectors';

export const StudentListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectStudents);
  const loading = useAppSelector(selectLoading);

  useEffect(() => {
    dispatch(studentsSlice.actions.fetchStudents({
      status: 'ACTIVE',
      sortBy: 'lastName',
      sortOrder: 'ASC',
    }));
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="student-list">
      <Grid
        data={students}
        columns={[
          { key: 'firstName', label: 'First Name' },
          { key: 'lastName', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: '', render: (row) => <StudentActions student={row} /> },
        ]}
      />
    </div>
  );
};
```

---

## Mobile Viewport Breakpoints & Responsive Design

### Media Query Strategy

```css
/* Base: Mobile first (default) */
.container {
  width: 100%;
  padding: 0 16px;
}

/* Tablet: 640px and up */
@media (min-width: 640px) {
  .container {
    max-width: 640px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }

  .grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Show admin components */
  .admin-grid {
    display: grid !important;
  }

  /* Show desktop-only tables */
  .desktop-table {
    display: table !important;
  }
}

/* Desktop (wide): 1280px and up */
@media (min-width: 1280px) {
  .container {
    max-width: 1400px;
  }

  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Touch-Friendly Tap Targets

```css
/* Minimum 44x44px for mobile (iOS), 48x48px for Android */
.button,
.input-field,
.checkbox,
.radio {
  min-height: 48px;
  min-width: 48px;
}

/* Increase tap target spacing on mobile */
@media (max-width: 640px) {
  .button,
  .card {
    margin: 8px 0;
  }

  .list-item {
    min-height: 56px;
    padding: 12px 16px;
  }
}
```

---

## Accessibility Guidelines

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- Text on background: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components & graphical objects: 3:1 minimum

#### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order logical and visible
- Focus indicator 3px minimum
- No keyboard trap

#### Screen Reader Support
- Semantic HTML (buttons, links, landmarks)
- ARIA labels for custom components
- Alt text for images
- Form labels associated with inputs

#### Focus Management
```css
/* Clear focus indicator */
:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Avoid auto-focus unless necessary */
/* Use announcements for dynamic updates */
[role="alert"] {
  /* Screen reader will announce immediately */
}
```

---

**Document Version**: 1.0  
**Date**: March 17, 2026  
**Status**: COMPLETE - Ready for Implementation
