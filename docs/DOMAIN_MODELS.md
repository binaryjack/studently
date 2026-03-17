# Studently Domain Models & Entity Relationships

## Overview

This document defines all core entities across the 8 domains of the Studently platform. Each entity is implemented as one TypeScript interface per file in `packages/shared-types/`.

---

## 1. AUTH DOMAIN

### Purpose
Handles authentication, tokens, sessions, and multi-factor authentication.

### Entities

#### User (Core)
- **id**: UUID (PK)
- **email**: string (unique)
- **firstName**: string
- **lastName**: string
- **passwordHash**: string (hashed)
- **status**: "active" | "inactive" | "suspended" | "deleted"
- **emailVerified**: boolean
- **createdAt**: ISO8601
- **updatedAt**: ISO8601
- **deletedAt**: ISO8601 | null (soft delete)

#### LoginCredential
- **id**: UUID (PK)
- **userId**: UUID (FK → User)
- **hashedPassword**: string
- **passwordChangedAt**: ISO8601
- **loginAttempts**: number
- **lastLoginAt**: ISO8601 | null
- **lockedUntil**: ISO8601 | null
- **requiresPasswordChange**: boolean

#### Token
- **accessToken**: string (JWT)
- **refreshToken**: string (JWT)
- **expiresIn**: number (seconds)
- **tokenType**: "Bearer"
- **scope**: string[]
- **issuedAt**: ISO8601
- **expiresAt**: ISO8601

#### Session
- **id**: UUID (PK)
- **userId**: UUID (FK → User)
- **token**: string (hashed)
- **refreshToken**: string (hashed)
- **deviceId**: string
- **ipAddress**: string
- **userAgent**: string
- **lastActivityAt**: ISO8601
- **expiresAt**: ISO8601
- **revokedAt**: ISO8601 | null
- **createdAt**: ISO8601

#### MFAChallenge
- **id**: UUID (PK)
- **userId**: UUID (FK → User)
- **method**: "totp" | "sms" | "email"
- **challenge**: string (encrypted)
- **verificationCode**: string | null
- **attempts**: number
- **maxAttempts**: 3
- **expiresAt**: ISO8601
- **verifiedAt**: ISO8601 | null
- **createdAt**: ISO8601

---

## 2. USER DOMAIN

### Purpose
Manages user profiles, permissions, roles, and access control.

### Entities

#### UserProfile (extends User)
- **id**: UUID (PK, FK → User)
- **avatarUrl**: string | null
- **bio**: string | null
- **phone**: string | null
- **address**: string | null
- **city**: string | null
- **state**: string | null
- **country**: string | null
- **postalCode**: string | null
- **timezone**: string (default: "Europe/Zurich")
- **preferredLanguage**: "de-CH" | "fr-CH" | "it-CH" | "en"
- **darkModeEnabled**: boolean (default: true)
- **notificationsEnabled**: boolean
- **emailVerified**: boolean
- **phoneVerified**: boolean
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### Role
- **id**: UUID (PK)
- **name**: string (unique)
- **description**: string
- **permissions**: UUID[] (FK → Permission)
- **type**: "system" | "custom"
- **isActive**: boolean
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### Permission
- **id**: UUID (PK)
- **name**: string (unique, e.g., "student:view", "timesheet:create")
- **description**: string
- **resource**: string (e.g., "student", "timesheet", "document")
- **action**: "view" | "create" | "update" | "delete" | "execute"
- **scope**: "own" | "team" | "organization" | "global"
- **createdAt**: ISO8601

#### UserRole
- **id**: UUID (PK)
- **userId**: UUID (FK → User)
- **roleId**: UUID (FK → Role)
- **assignedAt**: ISO8601
- **assignedBy**: UUID (FK → User)
- **revokedAt**: ISO8601 | null
- **expiresAt**: ISO8601 | null
- **metadata**: Record<string, any>

---

## 3. STUDENT DOMAIN

### Purpose
Tracks student enrollment, progress, and academic status.

### Entities

#### Student
- **id**: UUID (PK)
- **userId**: UUID (FK → User)
- **studentNumber**: string (unique, immutable)
- **learningPathId**: UUID (FK → LearningPath)
- **status**: "enrolled" | "in-progress" | "completed" | "suspended" | "graduated"
- **enrollmentDate**: ISO8601
- **expectedGraduationDate**: ISO8601
- **actualGraduationDate**: ISO8601 | null
- **instructorId**: UUID (FK → User) | null
- **mentorId**: UUID (FK → User) | null
- **companyId**: UUID (FK → Company) | null
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### StudentProgress
- **id**: UUID (PK)
- **studentId**: UUID (FK → Student)
- **competencyId**: UUID (FK → Competency)
- **levelAchieved**: "beginner" | "intermediate" | "advanced" | "expert"
- **progressPercentage**: number (0-100)
- **assessmentDate**: ISO8601
- **nextReviewDate**: ISO8601 | null
- **assessorId**: UUID (FK → User)
- **notes**: string | null
- **certificateUrl**: string | null
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### StudentStatus
- **id**: UUID (PK)
- **studentId**: UUID (FK → Student)
- **status**: "active" | "on-leave" | "suspended" | "completed" | "withdrawn"
- **reason**: string | null
- **changedAt**: ISO8601
- **changedBy**: UUID (FK → User)
- **validUntil**: ISO8601 | null
- **notes**: string | null

---

## 4. LEARNING DOMAIN

### Purpose
Defines learning paths, modules, objectives, and competency frameworks.

### Entities

#### LearningPath
- **id**: UUID (PK)
- **name**: string
- **description**: string
- **code**: string (unique, immutable)
- **level**: "foundation" | "intermediate" | "advanced" | "specialized"
- **duration**: number (weeks)
- **modules**: UUID[] (FK → LearningModule)
- **competencies**: UUID[] (FK → Competency)
- **isActive**: boolean
- **publishedAt**: ISO8601 | null
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### LearningModule
- **id**: UUID (PK)
- **learningPathId**: UUID (FK → LearningPath)
- **name**: string
- **description**: string
- **sequence**: number
- **duration**: number (hours)
- **objectives**: UUID[] (FK → LearningObjective)
- **assessmentCriteria**: string[]
- **instructorId**: UUID (FK → User) | null
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### LearningObjective
- **id**: UUID (PK)
- **moduleId**: UUID (FK → LearningModule)
- **description**: string
- **bloomLevel**: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"
- **assessmentMethod**: "quiz" | "project" | "presentation" | "practical" | "portfolio"
- **successCriteria**: string[]
- **createdAt**: ISO8601

#### Competency
- **id**: UUID (PK)
- **name**: string
- **description**: string
- **code**: string (unique)
- **category**: string (e.g., "technical", "soft-skills", "language")
- **level**: "foundation" | "intermediate" | "advanced" | "expert"
- **assessmentMethods**: string[]
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

---

## 5. TIMESHEET DOMAIN

### Purpose
Records work hours, breaks, and attendance.

### Entities

#### Timesheet
- **id**: UUID (PK)
- **studentId**: UUID (FK → Student)
- **weekStartDate**: ISO8601 (immutable)
- **weekEndDate**: ISO8601 (immutable)
- **totalHours**: number
- **status**: "draft" | "submitted" | "approved" | "rejected"
- **approvedBy**: UUID (FK → User) | null
- **approvedAt**: ISO8601 | null
- **rejectionReason**: string | null
- **entries**: UUID[] (FK → TimesheetEntry)
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### TimesheetEntry
- **id**: UUID (PK)
- **timesheetId**: UUID (FK → Timesheet)
- **date**: ISO8601 (immutable)
- **dayOfWeek**: "monday" | "tuesday" | ... | "sunday"
- **clockInTime**: ISO8601
- **clockOutTime**: ISO8601
- **breakDuration**: number (minutes)
- **totalHours**: number
- **workType**: "theoretical" | "practical" | "project" | "break"
- **description**: string | null
- **validated**: boolean
- **validatedAt**: ISO8601 | null
- **validatedBy**: UUID (FK → User) | null

---

## 6. ABSENCE DOMAIN

### Purpose
Manages absences, leave requests, and attendance tracking.

### Entities

#### Absence
- **id**: UUID (PK)
- **studentId**: UUID (FK → Student)
- **date**: ISO8601 (immutable)
- **type**: UUID (FK → AbsenceType)
- **duration**: "half-day" | "full-day"
- **status**: "pending" | "approved" | "rejected"
- **reason**: string | null
- **approvedBy**: UUID (FK → User) | null
- **approvedAt**: ISO8601 | null
- **attachments**: string[] (document URLs)
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### AbsenceType
- **id**: UUID (PK)
- **name**: string (unique, e.g., "sick-leave", "vacation", "personal")
- **code**: string (unique)
- **requiresApproval**: boolean
- **requiresDocumentation**: boolean
- **maxDaysPerYear**: number | null
- **paidLeave**: boolean
- **createdAt**: ISO8601

#### AbsenceRequest
- **id**: UUID (PK)
- **studentId**: UUID (FK → Student)
- **typeId**: UUID (FK → AbsenceType)
- **startDate**: ISO8601
- **endDate**: ISO8601
- **reason**: string
- **status**: "pending" | "approved" | "rejected" | "cancelled"
- **requestedAt**: ISO8601
- **decidedAt**: ISO8601 | null
- **decidedBy**: UUID (FK → User) | null
- **decisionReason**: string | null
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

---

## 7. DOCUMENT DOMAIN

### Purpose
Manages documents, certificates, and file storage.

### Entities

#### Document
- **id**: UUID (PK)
- **title**: string
- **description**: string | null
- **fileUrl**: string
- **fileMimeType**: string
- **fileSize**: number (bytes)
- **fileHash**: string (SHA256)
- **type**: UUID (FK → DocumentType)
- **category**: UUID (FK → DocumentCategory) | null
- **uploadedBy**: UUID (FK → User)
- **ownerId**: UUID (FK → Student | User)
- **visibility**: "private" | "team" | "organization" | "public"
- **expiresAt**: ISO8601 | null
- **isArchived**: boolean
- **tags**: string[]
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### DocumentType
- **id**: UUID (PK)
- **name**: string (unique, e.g., "certificate", "diploma", "transcript")
- **code**: string (unique)
- **description**: string
- **requiresApproval**: boolean
- **retentionDays**: number | null
- **createdAt**: ISO8601

#### DocumentCategory
- **id**: UUID (PK)
- **name**: string (unique)
- **code**: string (unique)
- **description**: string
- **icon**: string | null
- **color**: string | null
- **createdAt**: ISO8601

---

## 8. WORKFLOW DOMAIN

### Purpose
Handles business processes, approvals, and task management.

### Entities

#### Workflow
- **id**: UUID (PK)
- **name**: string
- **description**: string
- **code**: string (unique)
- **type**: "approval" | "task-assignment" | "notification" | "integration"
- **trigger**: string (event that starts workflow)
- **steps**: UUID[] (FK → WorkflowStep)
- **isActive**: boolean
- **createdBy**: UUID (FK → User)
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

#### WorkflowStep
- **id**: UUID (PK)
- **workflowId**: UUID (FK → Workflow)
- **sequence**: number
- **name**: string
- **description**: string
- **actionType**: "decision" | "task" | "notification" | "webhook"
- **assignedTo**: UUID[] (FK → User / Role)
- **condition**: string | null (logical expression)
- **timeout**: number (seconds) | null
- **onTimeoutAction**: string | null
- **createdAt**: ISO8601

#### WorkflowInstance
- **id**: UUID (PK)
- **workflowId**: UUID (FK → Workflow)
- **triggeredBy**: UUID (FK → User)
- **contextData**: Record<string, any>
- **currentStep**: number
- **status**: "pending" | "in-progress" | "completed" | "failed" | "cancelled"
- **startedAt**: ISO8601
- **completedAt**: ISO8601 | null
- **steps**: WorkflowStepInstance[]
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

---

## 9. ADDITIONAL DOMAINS

### Settings Domain

#### Setting
- **id**: UUID (PK)
- **key**: string (unique)
- **value**: any
- **type**: "string" | "number" | "boolean" | "json"
- **category**: string (e.g., "security", "notifications", "general")
- **isPublic**: boolean
- **createdAt**: ISO8601
- **updatedAt**: ISO8601

### Reporting Domain

#### Report
- **id**: UUID (PK)
- **templateId**: UUID (FK → ReportTemplate)
- **title**: string
- **generatedBy**: UUID (FK → User)
- **filters**: Record<string, any>
- **data**: any[]
- **exportFormat**: "pdf" | "excel" | "csv" | "json"
- **url**: string | null
- **generatedAt**: ISO8601
- **expiresAt**: ISO8601 | null

### Audit Domain

#### AuditLog
- **id**: UUID (PK)
- **userId**: UUID (FK → User)
- **action**: string (e.g., "student:update", "timesheet:approve")
- **resource**: string
- **resourceId**: UUID
- **changes**: Record<string, {before: any, after: any}>
- **ipAddress**: string
- **userAgent**: string
- **status**: "success" | "failure"
- **errorMessage**: string | null
- **createdAt**: ISO8601

---

## Entity Relationships Diagram

```
User (1) ──────── (1..*) UserProfile
  │
  ├── (1..*) LoginCredential
  ├── (1..*) Session
  ├── (1..*) MFAChallenge
  └── (1..*) UserRole ──────── (1) Role
                                  │
                                  └── (1..*) Permission

Student (1) ──────── (1) User
  │
  ├── (1) LearningPath ──────── (1..*) LearningModule
  │                                        │
  │                                        └── (1..*) LearningObjective
  │
  ├── (1..*) StudentProgress ──────---- (1) Competency
  ├── (1..*) StudentStatus
  ├── (1..*) Timesheet ──────---- (1..*) TimesheetEntry
  ├── (1..*) Absence ──────---- (1) AbsenceType
  ├── (1..*) AbsenceRequest ──────---- (1) AbsenceType
  └── (1..*) Document ──────---- (1) DocumentType
                                  │
                                  └── (1) DocumentCategory

Workflow (1) ──────---- (1..*) WorkflowStep
  │
  └── (1..*) WorkflowInstance

AuditLog (1) ──────---- (1) User
```

---

## Implementation Notes

### File Structure (packages/shared-types)
```
src/
├── auth/
│   ├── User.ts
│   ├── LoginCredential.ts
│   ├── Token.ts
│   ├── Session.ts
│   ├── MFAChallenge.ts
│   └── index.ts
├── user/
│   ├── UserProfile.ts
│   ├── Role.ts
│   ├── Permission.ts
│   ├── UserRole.ts
│   └── index.ts
├── student/
│   ├── Student.ts
│   ├── StudentProgress.ts
│   ├── StudentStatus.ts
│   └── index.ts
├── learning/
│   ├── LearningPath.ts
│   ├── LearningModule.ts
│   ├── LearningObjective.ts
│   ├── Competency.ts
│   └── index.ts
├── timesheet/
│   ├── Timesheet.ts
│   ├── TimesheetEntry.ts
│   └── index.ts
├── absence/
│   ├── Absence.ts
│   ├── AbsenceType.ts
│   ├── AbsenceRequest.ts
│   └── index.ts
├── document/
│   ├── Document.ts
│   ├── DocumentType.ts
│   ├── DocumentCategory.ts
│   └── index.ts
├── workflow/
│   ├── Workflow.ts
│   ├── WorkflowStep.ts
│   ├── WorkflowInstance.ts
│   └── index.ts
├── common/
│   ├── BaseEntity.ts (with id, createdAt, updatedAt, deletedAt)
│   ├── PaginationParams.ts
│   ├── PaginationResponse.ts
│   └── index.ts
├── errors/
│   ├── AppError.ts
│   ├── ValidationError.ts
│   ├── NotFoundError.ts
│   ├── UnauthorizedError.ts
│   ├── ForbiddenError.ts
│   └── index.ts
└── index.ts (root barrel export)
```

### Key Principles

1. **One Interface Per File**: Each entity is a separate file for modularity
2. **Immutable IDs**: Primary keys and foreign keys are immutable (UUIDs)
3. **Soft Deletes**: All entities have `deletedAt` for audit trails
4. **Timestamps**: All entities have `createdAt`, `updatedAt`
5. **Type Safety**: Use union types for enums (not string literals)
6. **Relationships**: FKs are explicit comments in the interface
7. **No Circular Dependencies**: Parent-child, no cycles
8. **Zod Validation**: Each interface has corresponding Zod schema

---

**Last Updated**: February 20, 2026
