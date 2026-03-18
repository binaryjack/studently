# Type Reorganization - Common Types Library

## Overview
Consolidated reusable types into a centralized `common` folder hierarchy, reducing duplication and establishing a single source of truth for cross-domain types.

## New Common Type Structure

```
packages/shared-types/src/common/
├── BaseEntity.ts           (existing)
├── PaginationParams.ts     (existing)
├── PaginationResponse.ts   (existing)
├── types.ts                (reexports common types)
├── enums.ts                (NEW - universally reusable enums)
├── actions.ts              (NEW - action/operation type definitions)
└── index.ts                (exports all common types)
```

## Common/Enums.ts - Universally Reusable Types

### Generic Level/Proficiency Types
- **`ProficiencyLevel`** - "beginner" | "intermediate" | "advanced" | "expert"
  - Used by: StudentProgress, Competency, etc.
  - Imported by: student, learning domains

### Generic Status Types
- **`ApprovalStatus`** - "pending" | "approved" | "rejected"
  - Used by: Timesheets, Absence requests, etc.
  - Imported by: timesheet, absence domains

- **`ProcessingStatus`** - "pending" | "in-progress" | "completed" | "failed"
  - Used by: Workflow execution, task processing, etc.
  - Imported by: workflow domain

### Generic Scope & Visibility Types
- **`OrganizationalScope`** - "own" | "team" | "organization" | "global"
  - Used by: Permissions and access control
  - Imported by: user domain

- **`VisibilityLevel`** - "private" | "team" | "organization" | "public"
  - Used by: Documents, shared resources
  - Imported by: document domain

### Universal/Temporal Types
- **`DayOfWeek`** - Days of the week
  - Used by: Timesheets, scheduling
  - Imported by: timesheet domain

- **`Language`** - "de-CH" | "fr-CH" | "it-CH" | "en"
  - Used by: User preferences, localization
  - Imported by: user domain

- **`SortOrder`** - "asc" | "desc"
  - Used by: Pagination across all APIs
  - Imported by: common domain (existing)

## Common/Actions.ts - Action Type Definitions

### CRUD Operations
- **`CRUDAction`** - "view" | "create" | "update" | "delete" | "execute"
  - Used by: Permission system, role-based access control
  - Imported by: user domain (as PermissionAction)

### Workflow Operations
- **`WorkflowAction`** - "decision" | "task" | "notification" | "webhook"
  - Used by: Workflow step definitions
  - Imported by: workflow domain (as ActionType)

### Activity/Work Types
- **`ActivityType`** - "theoretical" | "practical" | "project" | "break"
  - Used by: Timesheet entries, work type tracking
  - Imported by: timesheet domain (as WorkType)

### Assessment Types
- **`AssessmentMethod`** - "quiz" | "project" | "presentation" | "practical" | "portfolio"
  - Used by: Learning objectives, competency evaluation
  - Imported by: learning domain

## Domain-Specific Type Aliases

Each domain maintains semantic domain-specific aliases that reference common types:

### Auth Domain (`auth/types.ts`)
- ✅ `UserStatus` (domain-specific, not aliased)

### User Domain (`user/types.ts`)
- ✅ `PreferredLanguage` = `Language` (from common)
- ✅ `RoleType` (domain-specific)
- ✅ `PermissionAction` = `CRUDAction` (from common)
- ✅ `PermissionScope` = `OrganizationalScope` (from common)

### Student Domain (`student/types.ts`)
- ✅ `ProgressLevel` = `ProficiencyLevel` (from common)
- ✅ `StudentStatus` (domain-specific)
- ✅ `StudentStatusState` (domain-specific)

### Learning Domain (`learning/types.ts`)
- ✅ `CompetencyLevel` = `ProficiencyLevel` (from common)
- ✅ `AssessmentMethod` = `AssessmentMethod` (from common)
- ✅ `BloomLevel` (domain-specific)
- ✅ `LearningLevel` (domain-specific)

### Timesheet Domain (`timesheet/types.ts`)
- ✅ `DayOfWeek` = `DayOfWeek` (from common - reexported)
- ✅ `WorkType` = `ActivityType` (from common)
- ✅ `TimesheetStatus` (domain-specific, uses `ApprovalStatus`)

### Absence Domain (`absence/types.ts`)
- ✅ `AbsenceStatus` = `ApprovalStatus` (from common)
- ✅ `AbsenceDuration` (domain-specific)

### Document Domain (`document/types.ts`)
- ✅ `DocumentVisibility` = `VisibilityLevel` (from common)

### Workflow Domain (`workflow/types.ts`)
- ✅ `ActionType` = `WorkflowAction` (from common)
- ✅ `WorkflowInstanceStatus` = `ProcessingStatus` | "cancelled"
- ✅ `StepInstanceStatus` = `ProcessingStatus` | "skipped"
- ✅ `WorkflowType` (domain-specific)

## Benefits Achieved

### 1. **DRY Principle**
- Types defined once in common, reused across domains
- Changes to `ProficiencyLevel` automatically affect all domains using it

### 2. **Semantic Clarity**
- Domain-specific aliases (PermissionScope = OrganizationalScope) provide context
- Generic names in common folder explain the purpose
- Clear naming hierarchy: generic (common) → domain-specific

### 3. **Consistency**
- All approval workflows use same `ApprovalStatus`
- All processing tasks use same `ProcessingStatus`
- All proficiency tracking uses same `ProficiencyLevel`

### 4. **Maintainability**
- Bug fix or enhancement in `ApprovalStatus` flows to all consumers
- Type definition centralization enables future refactoring
- Reduced cognitive load on developers (fewer type definitions to memorize)

### 5. **Scalability**
- Easy to add new domains that reuse common types
- Type evolution is centralized and manageable
- Common types become foundation for API versioning

## Usage Examples

### Importing Common Types
```typescript
// Direct import from common
import { 
  DayOfWeek, 
  ProficiencyLevel, 
  ApprovalStatus,
  ProcessingStatus,
  Language,
  CRUDAction,
  VisibilityLevel 
} from '@studently/shared-types/common';

// Or from package root
import { 
  DayOfWeek, 
  ProficiencyLevel, 
  ApprovalStatus 
} from '@studently/shared-types';
```

### Using in Domain Interfaces
```typescript
// User domain - using common types
import { User, PermissionAction, PermissionScope } from '@studently/shared-types/user';

interface UserPermission {
  action: PermissionAction;    // Maps to CRUDAction
  scope: PermissionScope;      // Maps to OrganizationalScope
}

// Learning domain - using common types
import { Competency, CompetencyLevel, AssessmentMethod } from '@studently/shared-types/learning';

interface CompetencyEvaluation {
  competency: Competency;
  level: CompetencyLevel;      // Maps to ProficiencyLevel
  method: AssessmentMethod;    // Reused from common
}

// Workflow domain - using common types
import { WorkflowInstanceStatus, ActionType, ProcessingStatus } from '@studently/shared-types/workflow';

interface WorkflowExecution {
  status: WorkflowInstanceStatus;  // Uses ProcessingStatus | "cancelled"
  actionType: ActionType;           // Maps to WorkflowAction
}
```

## Type Hierarchy Summary

```
Common Types (Universally Reusable)
├── Enums (common/enums.ts)
│   ├── DayOfWeek
│   ├── ProficiencyLevel
│   ├── OrganizationalScope
│   ├── VisibilityLevel
│   ├── ApprovalStatus
│   ├── ProcessingStatus
│   ├── Language
│   └── SortOrder
│
└── Actions (common/actions.ts)
    ├── CRUDAction
    ├── WorkflowAction
    ├── ActivityType
    └── AssessmentMethod

Domain-Specific Types (with Common Aliases)
├── Auth → UserStatus
├── User → RoleType, (aliases to Language, CRUDAction, OrganizationalScope)
├── Student → StudentStatus, StudentStatusState, (alias to ProficiencyLevel)
├── Learning → BloomLevel, LearningLevel, (aliases to ProficiencyLevel, AssessmentMethod)
├── Timesheet → TimesheetStatus, (aliases to DayOfWeek, ActivityType)
├── Absence → AbsenceDuration, (alias to ApprovalStatus)
├── Document → (alias to VisibilityLevel)
└── Workflow → WorkflowType, (aliases to ProcessingStatus, WorkflowAction)
```

## Migration Guide

### For Existing Code
No breaking changes! All domain-specific aliases maintain backward compatibility:

```typescript
// Old way (still works)
import { PermissionAction } from '@studently/shared-types/user';

// New way (more explicit about common usage)
import { CRUDAction } from '@studently/shared-types/common';

// Both refer to the same type
type Action = PermissionAction | CRUDAction; // Valid - they're identical
```

### For New Code
Use common types directly when designing APIs that span multiple domains:

```typescript
import { ApprovalStatus, ProcessingStatus, ProficiencyLevel } from '@studently/shared-types/common';

interface AuditLog {
  action: ApprovalStatus;  // Generic approval tracking
  executionStatus: ProcessingStatus;  // Generic execution tracking
  assessmentLevel: ProficiencyLevel;  // Generic proficiency tracking
}
```

## File Statistics

- **New files created:** 2 (enums.ts, actions.ts)
- **Files updated:** 11 (domain types.ts + index files)
- **Total common types:** 12 (8 enums + 4 actions)
- **Domain aliases:** 15+
- **Duplicate types eliminated:** 8+
