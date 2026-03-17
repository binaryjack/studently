# Shared Types - Visual Architecture

## Domain Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STUDENTLY PLATFORM                           │
│                      Shared Types Package                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    AUTH          │  │      USER        │  │     STUDENT      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ • User           │  │ • UserProfile    │  │ • Student        │
│ • LoginCred      │  │ • Role           │  │ • Progress       │
│ • Token          │  │ • Permission     │  │ • Status         │
│ • Session        │  │ • UserRole       │  │                  │
│ • MFAChallenge   │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    LEARNING      │  │    TIMESHEET     │  │     ABSENCE      │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ • LearningPath   │  │ • Timesheet      │  │ • Absence        │
│ • Module         │  │ • TimesheetEntry │  │ • AbsenceType    │
│ • Objective      │  │                  │  │ • AbsenceRequest │
│ • Competency     │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    DOCUMENT      │  │     WORKFLOW     │  │  COMMON/ERRORS   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ • Document       │  │ • Workflow       │  │ • BaseEntity     │
│ • DocumentType   │  │ • WorkflowStep   │  │ • Pagination     │
│ • Category       │  │ • WorkflowInst.  │  │ • AppError       │
│                  │  │                  │  │ • ValidationErr  │
│                  │  │                  │  │ • NotFoundErr    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Entity Relationships (ER-Diagram Style)

```
                        ┌─────────────────┐
                        │      USER       │
                        │─────────────────│
                        │ id (PK)         │
                        │ email (UNIQUE)  │
                        │ firstName       │
                        │ lastName        │
                        │ passwordHash    │
                        │ status          │
                        │ emailVerified   │
                        │ createdAt       │
                        │ updatedAt       │
                        │ deletedAt       │
                        └────────┬────────┘
                 ┌──────────────┼──────────────┐
                 │              │              │
        ┌────────▼────────┐  ┌──┴───────────┐ │
        │  USERPROFILE    │  │ LOGINCREDEN  │ │
        │─────────────────│  │──────────────│ │
        │ id (FK→User)    │  │ id (PK)      │ │
        │ avatarUrl       │  │ userId (FK)  │ │
        │ bio             │  │ hashedPass   │ │
        │ phone           │  │ loginAttempt │ │
        │ address         │  │ lastLoginAt  │ │
        │ timezone        │  │ lockedUntil  │ │
        │ preferredLang   │  └──────────────┘ │
        │ darkModeEnabled │                   │
        │ notifEnabled    │   ┌──────────────┐│
        │ emailVerified   │   │   SESSION    ││
        │ phoneVerified   │   │──────────────││
        └─────────────────┘   │ id (PK)      ││
                              │ userId (FK)  ││
        ┌─────────────────┐   │ token        ││
        │    USERROLE     │   │ refreshToken ││
        │─────────────────│   │ deviceId     ││
        │ id (PK)         │   │ ipAddress    ││
        │ userId (FK)     │   │ userAgent    ││
        │ roleId (FK) ────┼──>│ lastActivityAt
        │ assignedAt      │   │ expiresAt    ││
        │ assignedBy(FK)  │   │ revokedAt    ││
        │ revokedAt       │   └──────────────┘│
        │ expiresAt       │
        │ metadata        │   ┌──────────────┐│
        └─────────────────┘   │ MFACHALLENGE ││
                              │──────────────││
        ┌─────────────────┐   │ id (PK)      ││
        │      ROLE       │   │ userId (FK)  ││
        │─────────────────│   │ method       ││
        │ id (PK)         │   │ challenge    ││
        │ name (UNIQUE)   │   │ verCode      ││
        │ description     │   │ attempts     ││
        │ permissions[]   │   │ expiresAt    ││
        │ type            │   │ verifiedAt   ││
        │ isActive        │   └──────────────┘│
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  PERMISSION     │
        │─────────────────│
        │ id (PK)         │
        │ name (UNIQUE)   │
        │ description     │
        │ resource        │
        │ action          │
        │ scope           │
        └─────────────────┘


STUDENT DOMAIN:
                    ┌─────────────────┐
                    │    STUDENT      │
                    │─────────────────│
                    │ id (PK)         │
                    │ userId (FK)─────┼──────> USER
                    │ studentNumber   │
                    │ learningPathId──┼──────> LEARNINGPATH
                    │ status          │
                    │ enrollmentDate  │
                    │ expectedGradDt  │
                    │ instructorId ───┼──────> USER
                    │ mentorId ───────┼──────> USER
                    │ companyId       │
                    └────────┬────────┘
           ┌────────────────┼────────────────┐
           │                │                │
    ┌──────▼──────┐ ┌──────▼────────┐ ┌──────▼────────┐
    │ STUDENT     │ │ STUDENT       │ │ TIMESHEET     │
    │ PROGRESS    │ │ STATUS        │ │────────────── │
    │──────────── │ │───────────────│ │ id (PK)       │
    │ id (PK)     │ │ id (PK)       │ │ studentId(FK) │
    │ studentId   │ │ studentId(FK) │ │ weekStart     │
    │ competencyId│ │ status        │ │ weekEnd       │
    │ level       │ │ reason        │ │ totalHours    │
    │ progressPct │ │ changedAt     │ │ status        │
    │ assessDate  │ │ changedBy(FK) │ │ approvedBy    │
    │ nextReview  │ │ validUntil    │ │ entries[]     │
    │ assessor(FK)│ │ notes         │ └───────┬───────┘
    │ notes       │ └──────────────┘         │
    │ certUrl     │               ┌──────────▼─────────┐
    └─────────────┘               │ TIMESHEET ENTRY    │
                                  │─────────────────── │
                                  │ id (PK)            │
                                  │ timesheetId (FK)   │
                                  │ date               │
                                  │ clockInTime        │
                                  │ clockOutTime       │
                                  │ breakDuration      │
                                  │ totalHours         │
                                  │ workType           │
                                  │ description        │
                                  │ validated          │
                                  │ validatedAt        │
                                  │ validatedBy (FK)   │
                                  └────────────────────┘


LEARNING DOMAIN:
    ┌──────────────────┐
    │  LEARNING PATH   │
    │──────────────────│
    │ id (PK)          │
    │ name             │
    │ code (UNIQUE)    │
    │ level            │
    │ duration         │
    │ modules[]────────┼────────> LEARNING MODULE
    │ competencies[] ──┼────────> COMPETENCY
    │ isActive         │
    │ publishedAt      │
    └──────────────────┘

    ┌─────────────────────┐
    │  LEARNING MODULE    │
    │─────────────────────│
    │ id (PK)             │
    │ learningPathId(FK)  │
    │ name                │
    │ sequence            │
    │ duration            │
    │ objectives[]────────┼────────> LEARNING OBJECTIVE
    │ assessmentCriteria  │
    │ instructorId (FK)   │
    └──────────────────┬──┘
                       │
    ┌──────────────────▼──────┐
    │ LEARNING OBJECTIVE      │
    │─────────────────────────│
    │ id (PK)                 │
    │ moduleId (FK)           │
    │ description             │
    │ bloomLevel              │
    │ assessmentMethod        │
    │ successCriteria         │
    └─────────────────────────┘

    ┌──────────────────┐
    │  COMPETENCY      │
    │──────────────────│
    │ id (PK)          │
    │ name             │
    │ code (UNIQUE)    │
    │ category         │
    │ level            │
    │ assessmentMethods│
    └──────────────────┘


ABSENCE DOMAIN:
    ┌──────────────┐    ┌──────────────────┐
    │   ABSENCE    │    │  ABSENCE TYPE    │
    │──────────────│    │──────────────────│
    │ id (PK)      │    │ id (PK)          │
    │ studentId(FK)├───>│ name (UNIQUE)    │
    │ date         │    │ code (UNIQUE)    │
    │ type (FK)────┤    │ requiresApproval │
    │ duration     │    │ requiresDocs     │
    │ status       │    │ maxDaysPerYear   │
    │ reason       │    │ paidLeave        │
    │ approvedBy   │    └──────────────────┘
    │ attachments[]│
    └──────────────┘

    ┌─────────────────────┐
    │ ABSENCE REQUEST     │
    │─────────────────────│
    │ id (PK)             │
    │ studentId (FK)      │
    │ typeId (FK)─────┐   │
    │ startDate       │   │
    │ endDate         │   │
    │ reason          │   │
    │ status          │   │
    │ decidedBy (FK)  │   │
    │ decisionReason  │   │
    └─────────────────────┘


DOCUMENT DOMAIN:
    ┌──────────────┐    ┌──────────────────┐
    │  DOCUMENT    │    │ DOCUMENT TYPE    │
    │──────────────│    │──────────────────│
    │ id (PK)      │    │ id (PK)          │
    │ title        │    │ name (UNIQUE)    │
    │ fileUrl      │    │ code (UNIQUE)    │
    │ fileMimeType │    │ requiresApproval │
    │ fileSize     │    │ retentionDays    │
    │ fileHash     │    └──────────────────┘
    │ type (FK)────┼───────────────────────>
    │ category(FK) ├──> DOCUMENT CATEGORY
    │ uploadedBy   │    ┌──────────────────┐
    │ ownerId      │    │ id (PK)          │
    │ visibility   │    │ name (UNIQUE)    │
    │ expiresAt    │    │ code (UNIQUE)    │
    │ isArchived   │    │ icon             │
    │ tags[]       │    │ color            │
    └──────────────┘    └──────────────────┘


WORKFLOW DOMAIN:
    ┌──────────────────┐
    │    WORKFLOW      │
    │──────────────────│
    │ id (PK)          │
    │ name             │
    │ code (UNIQUE)    │
    │ type             │
    │ trigger          │
    │ steps[]──────────┼────────> WORKFLOW STEP
    │ isActive         │
    │ createdBy (FK)   │
    └──────────────────┘

    ┌────────────────────┐
    │  WORKFLOW STEP     │
    │────────────────────│
    │ id (PK)            │
    │ workflowId (FK)    │
    │ sequence           │
    │ name               │
    │ actionType         │
    │ assignedTo[]       │
    │ condition          │
    │ timeout            │
    │ onTimeoutAction    │
    └────────────────────┘

    ┌────────────────────────────┐
    │   WORKFLOW INSTANCE        │
    │────────────────────────────│
    │ id (PK)                    │
    │ workflowId (FK)────────┐   │
    │ triggeredBy (FK)       │   │
    │ contextData            │   │
    │ currentStep            │   │
    │ status                 │   │
    │ startedAt              │   │
    │ completedAt            │   │
    │ steps[] (StepInstance) │   │
    └────────────────────────┬───┘
                             │
    ┌────────────────────────▼────┐
    │  WORKFLOW STEP INSTANCE      │
    │──────────────────────────────│
    │ stepId                       │
    │ sequence                     │
    │ status                       │
    │ assignedTo                   │
    │ startedAt                    │
    │ completedAt                  │
    │ result                       │
    │ error                        │
    └────────────────────────────┘
```

## Package Structure Tree

```
packages/shared-types/
│
├── src/
│   │
│   ├── auth/                    # Authentication domain
│   │   ├── User.ts              # User entity
│   │   ├── LoginCredential.ts   # Password & history
│   │   ├── Token.ts             # JWT tokens
│   │   ├── Session.ts           # Session tracking
│   │   ├── MFAChallenge.ts      # Multi-factor auth
│   │   └── index.ts             # Barrel export
│   │
│   ├── user/                    # User domain
│   │   ├── UserProfile.ts       # Extended user info
│   │   ├── Role.ts              # RBAC role
│   │   ├── Permission.ts        # Fine-grained perm
│   │   ├── UserRole.ts          # M2M junction
│   │   └── index.ts             # Barrel export
│   │
│   ├── student/                 # Student domain
│   │   ├── Student.ts           # Enrollment
│   │   ├── StudentProgress.ts   # Competency progress
│   │   ├── StudentStatus.ts     # Status history
│   │   └── index.ts             # Barrel export
│   │
│   ├── learning/                # Learning domain
│   │   ├── LearningPath.ts      # Curriculum path
│   │   ├── LearningModule.ts    # Module
│   │   ├── LearningObjective.ts # Learning goal
│   │   ├── Competency.ts        # Skills
│   │   └── index.ts             # Barrel export
│   │
│   ├── timesheet/               # Timesheet domain
│   │   ├── Timesheet.ts         # Weekly sheet
│   │   ├── TimesheetEntry.ts    # Daily entry
│   │   └── index.ts             # Barrel export
│   │
│   ├── absence/                 # Absence domain
│   │   ├── Absence.ts           # Single absence
│   │   ├── AbsenceType.ts       # Category
│   │   ├── AbsenceRequest.ts    # Leave request
│   │   └── index.ts             # Barrel export
│   │
│   ├── document/                # Document domain
│   │   ├── Document.ts          # File entity
│   │   ├── DocumentType.ts      # Classification
│   │   ├── DocumentCategory.ts  # Grouping
│   │   └── index.ts             # Barrel export
│   │
│   ├── workflow/                # Workflow domain
│   │   ├── Workflow.ts          # Definition
│   │   ├── WorkflowStep.ts      # Single step
│   │   ├── WorkflowInstance.ts  # Runtime instance
│   │   └── index.ts             # Barrel export
│   │
│   ├── common/                  # Shared utilities
│   │   ├── BaseEntity.ts        # Base interface
│   │   ├── PaginationParams.ts  # Pagination input
│   │   ├── PaginationResponse.ts # Pagination output
│   │   └── index.ts             # Barrel export
│   │
│   ├── errors/                  # Error types
│   │   └── index.ts             # All error classes
│   │
│   └── index.ts                 # Root barrel export
│
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript config
├── README.md                    # Package documentation
├── IMPLEMENTATION.md            # Implementation details
└── .npmignore                   # NPM ignore rules
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Redux Store (uses shared-types for state & actions)       │ │
│  │ ├─ auth slice (User, Token, Session)                      │ │
│  │ ├─ student slice (Student, StudentProgress)               │ │
│  │ ├─ timesheet slice (Timesheet, TimesheetEntry)            │ │
│  │ └─ ... other slices                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
│                      Uses @studently/shared-types               │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
        ┌───────────▼──────────┐  ┌────────▼──────────┐
        │  API (Express.js)    │  │  IDP (Fastify)   │
        │                      │  │                  │
        │ Endpoints:           │  │ Routes:          │
        │ POST /auth/login     │  │ POST /oauth/auth │
        │ GET /students        │  │ POST /oauth/token│
        │ POST /timesheets     │  │ GET /userinfo    │
        │ ...                  │  │ ...              │
        │                      │  │                  │
        │ Uses shared-types    │  │ Uses shared-types│
        │ for request/response │  │ for payloads     │
        └───────────┬──────────┘  └────────┬─────────┘
                    │                      │
        ┌───────────┴──────────────────────┘
        │
        │      Uses shared-types
        │      for database entities
        │
        ▼
    ┌──────────────────────────────────┐
    │  PostgreSQL Database             │
    │                                  │
    │  Tables (from shared-types):     │
    │  ├─ users                        │
    │  ├─ user_profiles               │
    │  ├─ user_roles                  │
    │  ├─ roles                        │
    │  ├─ permissions                 │
    │  ├─ students                    │
    │  ├─ student_progress            │
    │  ├─ learning_paths              │
    │  ├─ competencies                │
    │  ├─ timesheets                  │
    │  ├─ timesheet_entries           │
    │  ├─ absences                    │
    │  ├─ documents                   │
    │  ├─ workflows                   │
    │  └─ workflow_instances          │
    │                                  │
    └──────────────────────────────────┘
```

## Import/Export Flow

```
src/index.ts (ROOT BARREL EXPORT)
  │
  ├─> export from ./auth/index.ts
  │     ├─> User, LoginCredential, Token, Session, MFAChallenge
  │
  ├─> export from ./user/index.ts
  │     ├─> UserProfile, Role, Permission, UserRole
  │
  ├─> export from ./student/index.ts
  │     ├─> Student, StudentProgress, StudentStatus
  │
  ├─> export from ./learning/index.ts
  │     ├─> LearningPath, LearningModule, LearningObjective, Competency
  │
  ├─> export from ./timesheet/index.ts
  │     ├─> Timesheet, TimesheetEntry
  │
  ├─> export from ./absence/index.ts
  │     ├─> Absence, AbsenceType, AbsenceRequest
  │
  ├─> export from ./document/index.ts
  │     ├─> Document, DocumentType, DocumentCategory
  │
  ├─> export from ./workflow/index.ts
  │     ├─> Workflow, WorkflowStep, WorkflowInstance, WorkflowStepInstance
  │
  ├─> export from ./common/index.ts
  │     ├─> BaseEntity, PaginationParams, PaginationResponse
  │
  └─> export from ./errors/index.ts
        ├─> AppError, ValidationError, NotFoundError, UnauthorizedError,
        │   ForbiddenError, ConflictError, InternalServerError

CONSUMERS:
  apps/api/package.json
    ├─> depends on @studently/shared-types
    └─> uses for request/response types

  apps/backoffice/package.json
    ├─> depends on @studently/shared-types
    └─> uses for Redux state & component props

  apps/idp/package.json
    ├─> depends on @studently/shared-types
    └─> uses for user & session types

  packages/validation-schemas/package.json
    ├─> depends on @studently/shared-types
    └─> creates Zod schemas from types
```

---

**Visual Architecture Created**: February 20, 2026
