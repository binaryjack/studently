# @studently/shared-types

Shared TypeScript interfaces and types for all Studently packages and applications.

## Overview

This package provides a single source of truth for all domain entities across the Studently platform. Each interface is implemented as one TypeScript file per entity, following the feature slice design pattern.

## Package Structure

```
src/
├── auth/           # Authentication & authorization
│   ├── User.ts
│   ├── LoginCredential.ts
│   ├── Token.ts
│   ├── Session.ts
│   ├── MFAChallenge.ts
│   └── index.ts
├── user/           # User profiles, roles, permissions
│   ├── UserProfile.ts
│   ├── Role.ts
│   ├── Permission.ts
│   ├── UserRole.ts
│   └── index.ts
├── student/        # Student enrollment and progress
│   ├── Student.ts
│   ├── StudentProgress.ts
│   ├── StudentStatus.ts
│   └── index.ts
├── learning/       # Learning paths and competencies
│   ├── LearningPath.ts
│   ├── LearningModule.ts
│   ├── LearningObjective.ts
│   ├── Competency.ts
│   └── index.ts
├── timesheet/      # Work hours and timesheets
│   ├── Timesheet.ts
│   ├── TimesheetEntry.ts
│   └── index.ts
├── absence/        # Absences and leave requests
│   ├── Absence.ts
│   ├── AbsenceType.ts
│   ├── AbsenceRequest.ts
│   └── index.ts
├── document/       # Document management
│   ├── Document.ts
│   ├── DocumentType.ts
│   ├── DocumentCategory.ts
│   └── index.ts
├── workflow/       # Workflow definitions and instances
│   ├── Workflow.ts
│   ├── WorkflowStep.ts
│   ├── WorkflowInstance.ts
│   └── index.ts
├── common/         # Shared utilities
│   ├── BaseEntity.ts
│   ├── PaginationParams.ts
│   ├── PaginationResponse.ts
│   └── index.ts
├── errors/         # Error types
│   └── index.ts
└── index.ts        # Root barrel export
```

## Usage

### Import specific types

```typescript
// Import from specific domain
import { User, Token } from "@studently/shared-types/auth";
import { Student, StudentProgress } from "@studently/shared-types/student";
import { Timesheet, TimesheetEntry } from "@studently/shared-types/timesheet";

// Or import from subpath export
import type { User, LoginCredential } from "@studently/shared-types";
```

### Import error types

```typescript
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
} from "@studently/shared-types";

// Usage
throw new ValidationError("Email is required", {
  field: "email",
});
```

### Use in API responses

```typescript
import type { PaginationResponse, Student } from "@studently/shared-types";

// Backend
const response: PaginationResponse<Student> = {
  data: students,
  total: 150,
  page: 1,
  limit: 20,
  totalPages: 8,
  hasNextPage: true,
  hasPreviousPage: false,
};
```

### Use in Redux/state management

```typescript
import type { Student, Timesheet } from "@studently/shared-types/student";
import type { Timesheet } from "@studently/shared-types/timesheet";

interface StudentState {
  students: Student[];
  selectedStudent: Student | null;
  timesheets: Timesheet[];
  loading: boolean;
  error: string | null;
}
```

## Entity Relationships

All entities follow these principles:

1. **One Interface Per File** - Each entity is a separate TypeScript file
2. **Immutable IDs** - Primary keys (id) and foreign keys (FK) are immutable UUIDs
3. **Soft Deletes** - All entities extend `BaseEntity` with `deletedAt` field
4. **Timestamps** - `createdAt` and `updatedAt` on every entity
5. **Type Safety** - Union types for enums (not string literals)
6. **No Circular Dependencies** - Parent-child relationships only
7. **FK Documentation** - Foreign key references documented in JSDoc comments

## Common Interfaces

### BaseEntity

Every entity extends `BaseEntity`:

```typescript
interface BaseEntity {
  id: string;              // UUID
  createdAt: string;       // ISO8601
  updatedAt: string;       // ISO8601
  deletedAt: string | null; // ISO8601 or null for active records
}
```

### PaginationParams & PaginationResponse

For list endpoints:

```typescript
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
}

interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

## Domain Overview

### Auth Domain
- `User` - Core user entity
- `LoginCredential` - Password and login history
- `Token` - JWT access/refresh token pair
- `Session` - Active user session
- `MFAChallenge` - Multi-factor authentication

### User Domain
- `UserProfile` - Extended user information
- `Role` - RBAC role definition
- `Permission` - Fine-grained permission
- `UserRole` - Junction table (many-to-many)

### Student Domain
- `Student` - Student enrollment record
- `StudentProgress` - Competency achievement
- `StudentStatus` - Status change history

### Learning Domain
- `LearningPath` - Curriculum path
- `LearningModule` - Module within path
- `LearningObjective` - Learning goal (Bloom's Taxonomy)
- `Competency` - Skill/knowledge to demonstrate

### Timesheet Domain
- `Timesheet` - Weekly timesheet (parent)
- `TimesheetEntry` - Daily entry (child)

### Absence Domain
- `Absence` - Single absence day
- `AbsenceType` - Absence category
- `AbsenceRequest` - Multi-day leave request

### Document Domain
- `Document` - File with metadata
- `DocumentType` - Document classification
- `DocumentCategory` - Grouping/tagging

### Workflow Domain
- `Workflow` - Process definition
- `WorkflowStep` - Single step
- `WorkflowInstance` - Runtime execution

## Error Types

All errors extend `AppError`:

```typescript
class AppError {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

Specific error types:
- `ValidationError` - 400 Bad Request
- `UnauthorizedError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden
- `NotFoundError` - 404 Not Found
- `ConflictError` - 409 Conflict
- `InternalServerError` - 500 Server Error

## Development

### Type checking

```bash
pnpm type-check
```

### Build

```bash
pnpm build
```

### Clean

```bash
pnpm clean
```

## Integration with Other Packages

This package is used by:

- `apps/api` - Backend REST API (request/response types)
- `apps/backoffice` - Frontend React app (Redux state, component props)
- `apps/idp` - Identity provider (user and session types)
- `packages/validation-schemas` - Zod schemas (validation)
- `apps/showcase` - Marketing website (shared types)

## Notes

- **No Runtime Dependencies** - This is a type-only package
- **Zero Circular Dependencies** - Safe to import everywhere
- **Feature Slice Design** - Each domain is self-contained
- **Documentation** - JSDoc comments on every interface
- **Immutability** - TypeScript `readonly` where appropriate

## Contributing

When adding new entities:

1. Create new file in appropriate domain folder
2. Extend `BaseEntity`
3. Add JSDoc with FK documentation
4. Export from domain `index.ts`
5. Export from root `index.ts`
6. Update this README

## Version

1.0.0 - February 20, 2026

## License

MIT
