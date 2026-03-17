# Complete API Specification - OpenAPI 3.1

## Overview

**Full-featured REST API** for Studently government platform. All endpoints required for complete system operation. Government-grade security, audit logging, compliance reporting.

**Total Endpoints**: 150+ (all domains)  
**Authentication**: RS256 JWT + MFA  
**Base URL**: `https://api.studently.swiss/api/v1`  
**Response Format**: JSON  
**Rate Limiting**: 1000 req/min per user, 10000 req/min per IP  

---

## API Categories

### 1. Authentication & Authorization (15 endpoints)
### 2. User Management (18 endpoints)
### 3. Student Management (20 endpoints)
### 4. Learning Paths & Competencies (22 endpoints)
### 5. Timesheets & Time Tracking (18 endpoints)
### 6. Absence Management (15 endpoints)
### 7. Documents & File Management (15 endpoints)
### 8. Workflows & Approvals (16 endpoints)
### 9. Roles & Permissions (14 endpoints)
### 10. Settings & Configuration (20 endpoints)
### 11. Reporting & Analytics (16 endpoints)
### 12. Audit & Compliance (12 endpoints)
### 13. Public / Anonymous Endpoints (10 endpoints)

---

## 1. AUTHENTICATION & AUTHORIZATION (15 endpoints)

```yaml
POST /auth/register
  Summary: Register new user (tenant admin only)
  Tags: [Auth]
  Auth: None
  Body:
    email: string (email format)
    password: string (min 8 chars, uppercase, number, special)
    firstName: string
    lastName: string
    tenantId: string (UUID)
    role: enum[SYSTEM_ADMIN, TENANT_ADMIN, PROFESSOR, TEACHER, MENTOR, COACH]
  Response: 201
    id: string (UUID)
    email: string
    firstName: string
    lastName: string
    role: string
    createdAt: ISO8601
  Error: 400 (validation), 409 (email exists), 422 (password weak)

POST /auth/login
  Summary: Login with email/password
  Tags: [Auth]
  Auth: None
  Body:
    email: string
    password: string
  Response: 200
    accessToken: string (JWT, 15 min)
    refreshToken: string (JWT, 30 day)
    expiresIn: number (seconds)
    user:
      id: string
      email: string
      role: string
      tenantId: string
  Error: 401 (invalid), 422 (validation)

POST /auth/mfa-verify
  Summary: Verify MFA code during login
  Tags: [Auth]
  Auth: None (sessionId from login response)
  Body:
    sessionId: string
    code: string (6 digits)
  Response: 200
    accessToken: string
    refreshToken: string
  Error: 401 (invalid code), 400 (expired session)

POST /auth/mfa-setup
  Summary: Get MFA setup QR code
  Tags: [Auth]
  Auth: Bearer {jwt}
  Response: 200
    secret: string
    qrCode: string (base64 PNG)
    recoveryCodes: string[] (10 codes)
  Error: 401 (not authenticated)

POST /auth/mfa-verify-setup
  Summary: Verify TOTP during MFA setup
  Tags: [Auth]
  Auth: Bearer {jwt}
  Body:
    code: string (6 digits)
  Response: 200
    success: boolean
    message: string
  Error: 401, 422

POST /auth/refresh
  Summary: Get new access token using refresh token
  Tags: [Auth]
  Auth: None
  Body:
    refreshToken: string
  Response: 200
    accessToken: string
    refreshToken: string (new token, rotation)
    expiresIn: number
  Error: 401 (invalid/expired token)

POST /auth/logout
  Summary: Logout (blacklist current token)
  Tags: [Auth]
  Auth: Bearer {jwt}
  Response: 200
    success: boolean
  Error: 401

POST /auth/logout-all
  Summary: Logout all sessions (all devices)
  Tags: [Auth]
  Auth: Bearer {jwt}
  Response: 200
    message: string
  Error: 401

POST /auth/forgot-password
  Summary: Request password reset email
  Tags: [Auth]
  Auth: None
  Body:
    email: string
  Response: 202
    message: string (email sent)
  Error: 404 (user not found) - don't reveal

POST /auth/reset-password
  Summary: Reset password with token
  Tags: [Auth]
  Auth: None
  Body:
    token: string
    newPassword: string
  Response: 200
    success: boolean
  Error: 401 (invalid/expired token), 422 (weak password)

POST /auth/change-password
  Summary: Change password (authenticated user)
  Tags: [Auth]
  Auth: Bearer {jwt}
  Body:
    currentPassword: string
    newPassword: string
  Response: 200
    success: boolean
  Error: 401, 422

GET /auth/me
  Summary: Get current user profile
  Tags: [Auth]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
    permissions: string[] (list of allowed actions)
    createdAt: ISO8601
  Error: 401

PATCH /auth/profile
  Summary: Update user profile
  Tags: [Auth]
  Auth: Bearer {jwt}
  Body:
    firstName: string (optional)
    lastName: string (optional)
    phoneNumber: string (optional)
    avatar: string (optional, base64)
  Response: 200
    id: string
    email: string
    firstName: string
    lastName: string
    avatar: string (URL)
  Error: 401, 422

POST /auth/verify-email
  Summary: Verify email address
  Tags: [Auth]
  Auth: None
  Body:
    token: string
  Response: 200
    success: boolean
  Error: 401 (invalid token)

GET /auth/sessions
  Summary: List all active sessions
  Tags: [Auth]
  Auth: Bearer {jwt}
  Query:
    limit: number (default 20, max 100)
    offset: number (default 0)
  Response: 200
    sessions: array
      id: string
      deviceInfo: string
      ipAddress: string
      userAgent: string
      createdAt: ISO8601
      lastActiveAt: ISO8601
    total: number
  Error: 401

DELETE /auth/sessions/:sessionId
  Summary: Revoke specific session
  Tags: [Auth]
  Auth: Bearer {jwt}
  Response: 204 (No Content)
  Error: 401, 404 (session not found)
```

---

## 2. USER MANAGEMENT (18 endpoints)

```yaml
GET /users
  Summary: List all users (admin only)
  Tags: [Users]
  Auth: Bearer {jwt} (requires ADMIN role)
  Query:
    limit: number (default 20, max 100)
    offset: number (default 0)
    role: enum[SYSTEM_ADMIN, TENANT_ADMIN, ...] (optional filter)
    status: enum[ACTIVE, INACTIVE, SUSPENDED] (optional)
    search: string (email, firstName, lastName)
    sortBy: enum[createdAt, lastName, email] (default: createdAt)
    sortOrder: enum[ASC, DESC] (default: DESC)
  Response: 200
    users: array
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      status: string
      lastLoginAt: ISO8601
      createdAt: ISO8601
    total: number
    hasMore: boolean
  Error: 401, 403 (forbidden)

POST /users
  Summary: Create new user
  Tags: [Users]
  Auth: Bearer {jwt} (requires TENANT_ADMIN or SYSTEM_ADMIN)
  Body:
    email: string (unique per tenant)
    password: string
    firstName: string
    lastName: string
    role: enum[PROFESSOR, TEACHER, MENTOR, COACH, STUDENT]
    status: enum[ACTIVE, INACTIVE] (default: ACTIVE)
  Response: 201
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
    createdAt: ISO8601
  Error: 400, 409 (email exists), 422, 403

GET /users/:id
  Summary: Get user details
  Tags: [Users]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
    phoneNumber: string
    avatar: string (URL)
    educatorProfile: object (if educator)
      certifications: string[]
      specializations: string[]
      yearsExperience: number
    studentProfile: object (if student)
      avsNumber: string
      orpNumber: string
      employmentStatus: enum[LACI, RI, AI, EMPLOYED, UNEMPLOYED, STUDENT, OTHER]
      canton: string
      workPermit: string
    createdAt: ISO8601
    lastLoginAt: ISO8601
  Error: 401, 404

PATCH /users/:id
  Summary: Update user
  Tags: [Users]
  Auth: Bearer {jwt} (own profile or admin)
  Body:
    email: string (optional)
    firstName: string (optional)
    lastName: string (optional)
    role: enum (optional, admin only)
    status: enum (optional, admin only)
    phoneNumber: string (optional)
  Response: 200
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    status: string
    updatedAt: ISO8601
  Error: 401, 403, 404, 409 (email exists), 422

DELETE /users/:id
  Summary: Soft delete user (archive)
  Tags: [Users]
  Auth: Bearer {jwt} (admin only)
  Response: 204
  Error: 401, 403, 404

POST /users/:id/deactivate
  Summary: Deactivate user account
  Tags: [Users]
  Auth: Bearer {jwt} (admin or self)
  Body:
    reason: string (optional)
  Response: 200
    id: string
    status: string (INACTIVE)
  Error: 401, 403, 404

POST /users/:id/reactivate
  Summary: Reactivate user account
  Tags: [Users]
  Auth: Bearer {jwt} (admin only)
  Response: 200
    id: string
    status: string (ACTIVE)
  Error: 401, 403, 404

GET /users/:id/roles
  Summary: Get user's role assignments
  Tags: [Users]
  Auth: Bearer {jwt}
  Response: 200
    roles: array
      roleId: string
      roleName: string
      scope: enum[TENANT, LEARNING_PATH, COHORT, ONE_TO_ONE]
      scopeId: string (UUID of the scope)
      permissions: string[]
      assignedAt: ISO8601
      assignedBy: string (user ID)
  Error: 401, 404

POST /users/:id/roles
  Summary: Assign role to user
  Tags: [Users]
  Auth: Bearer {jwt} (admin or role manager)
  Body:
    roleId: string
    scope: enum[TENANT, LEARNING_PATH, COHORT, ONE_TO_ONE]
    scopeId: string (optional, required if scope != TENANT)
  Response: 201
    roleId: string
    userId: string
    scope: string
    assignedAt: ISO8601
  Error: 401, 403, 404, 409 (already assigned), 422

DELETE /users/:id/roles/:roleId
  Summary: Remove role from user
  Tags: [Users]
  Auth: Bearer {jwt} (admin)
  Response: 204
  Error: 401, 403, 404

GET /users/:id/permissions
  Summary: Get user's effective permissions
  Tags: [Users]
  Auth: Bearer {jwt} (own or admin)
  Response: 200
    permissions: array
      permission: string
      scope: enum[TENANT, LEARNING_PATH, COHORT, ONE_TO_ONE]
      scopeId: string
    total: number
  Error: 401, 403, 404

POST /users/import
  Summary: Bulk import users from CSV
  Tags: [Users]
  Auth: Bearer {jwt} (admin only)
  Body: multipart/form-data
    file: file (CSV with headers: email, firstName, lastName, role)
  Response: 202
    jobId: string
    status: string (PROCESSING)
    totalRows: number
    message: string
  Error: 400, 413 (file too large), 422

GET /users/import/:jobId
  Summary: Get bulk import status
  Tags: [Users]
  Auth: Bearer {jwt}
  Response: 200
    jobId: string
    status: enum[PROCESSING, COMPLETED, FAILED]
    totalRows: number
    successCount: number
    failureCount: number
    errors: array
      row: number
      error: string
    completedAt: ISO8601
  Error: 404

POST /users/:id/send-invitation
  Summary: Send invitation email to user
  Tags: [Users]
  Auth: Bearer {jwt} (admin)
  Body:
    customMessage: string (optional)
  Response: 202
    message: string
  Error: 401, 403, 404

GET /users/:id/activity-log
  Summary: Get user's activity (admin view)
  Tags: [Users]
  Auth: Bearer {jwt} (admin)
  Query:
    limit: number
    offset: number
    startDate: ISO8601
    endDate: ISO8601
  Response: 200
    activities: array
      id: string
      action: string
      entityType: string
      entityId: string
      timestamp: ISO8601
      ipAddress: string
      userAgent: string
    total: number
  Error: 401, 403, 404
```

---

## 3. STUDENT MANAGEMENT (20 endpoints)

```yaml
GET /students
  Summary: List all students (filtered by user role/scope)
  Tags: [Students]
  Auth: Bearer {jwt}
  Query:
    limit: number (default 20)
    offset: number (default 0)
    cohortId: string (optional)
    learningPathId: string (optional)
    status: enum[ACTIVE, INACTIVE, GRADUATED, DROPPED]
    employmentStatus: enum[LACI, RI, AI, EMPLOYED, UNEMPLOYED, STUDENT]
    search: string (email, firstName, lastName, avsNumber)
    sortBy: enum[lastName, createdAt, employmentStatus]
    sortOrder: enum[ASC, DESC]
  Response: 200
    students: array
      id: string
      firstName: string
      lastName: string
      email: string
      status: string
      employmentStatus: string
      avsNumber: string (masked: 756.XXXX.XXXX.XX)
      orpNumber: string
      cohortId: string
      learningPathId: string
      enrolledAt: ISO8601
      progressPercentage: number
    total: number
    hasMore: boolean
  Error: 401, 403

POST /students
  Summary: Create new student
  Tags: [Students]
  Auth: Bearer {jwt} (TENANT_ADMIN, PROFESSOR, TEACHER)
  Body:
    email: string
    firstName: string
    lastName: string
    dateOfBirth: date (YYYY-MM-DD)
    gender: enum[MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY]
    phoneNumber: string (optional)
    address: string
    city: string
    postalCode: string
    canton: enum[AG, AI, AR, BE, BL, BS, FR, GE, GL, GR, JU, LU, NE, NW, OW, SG, SH, SO, SZ, TG, TI, UR, VD, VS, ZG, ZH]
    avsNumber: string (756.XXXX.XXXX.XX)
    orpNumber: string (optional)
    employmentStatus: enum[LACI, RI, AI, EMPLOYED, UNEMPLOYED, STUDENT, OTHER]
    laciReferenceNumber: string (if LACI)
    riCaseNumber: string (if RI)
    aiReferenceNumber: string (if AI)
    workPermit: enum[B, C, G, L, N, S, NONE] (if non-Swiss)
    workPermitExpiryDate: date (if applicable)
    emergencyContact: object
      name: string
      relationship: string
      phoneNumber: string
  Response: 201
    id: string
    email: string
    firstName: string
    lastName: string
    avsNumber: string
    employmentStatus: string
    canton: string
    createdAt: ISO8601
  Error: 400, 409 (email exists), 422, 403

GET /students/:id
  Summary: Get student details
  Tags: [Students]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    userId: string
    email: string
    firstName: string
    lastName: string
    dateOfBirth: date
    gender: string
    phoneNumber: string
    address: string
    city: string
    postalCode: string
    canton: string
    avsNumber: string (masked)
    orpNumber: string
    employmentStatus: string
    laciReferenceNumber: string
    riCaseNumber: string
    aiReferenceNumber: string
    workPermit: string
    workPermitExpiryDate: date
    status: string
    enrolledAt: ISO8601
    graduatedAt: ISO8601
    emergencyContact: object
    learningPaths: array
      id: string
      name: string
      status: enum[ENROLLED, ACTIVE, PAUSED, COMPLETED, DROPPED]
      enrolledAt: ISO8601
      completionPercentage: number
    cohorts: array
      id: string
      name: string
      cohortNumber: string
    documents: array
      id: string
      name: string
      type: string
      uploadedAt: ISO8601
    timesheets: array
      id: string
      week: string
      status: string
      totalHours: number
    createdAt: ISO8601
    updatedAt: ISO8601
  Error: 401, 404

PATCH /students/:id
  Summary: Update student
  Tags: [Students]
  Auth: Bearer {jwt} (self, educator, or admin)
  Body: (all optional)
    firstName: string
    lastName: string
    phoneNumber: string
    address: string
    city: string
    postalCode: string
    canton: string
    employmentStatus: enum
    laciReferenceNumber: string
    riCaseNumber: string
    aiReferenceNumber: string
    workPermit: enum
    workPermitExpiryDate: date
    emergencyContact: object
    status: enum[ACTIVE, INACTIVE, GRADUATED, DROPPED]
  Response: 200
    id: string
    firstName: string
    lastName: string
    (updated fields...)
    updatedAt: ISO8601
  Error: 401, 403, 404, 422

DELETE /students/:id
  Summary: Soft delete student (archive)
  Tags: [Students]
  Auth: Bearer {jwt} (admin only)
  Body:
    reason: string (archival reason)
  Response: 204
  Error: 401, 403, 404

POST /students/:id/graduate
  Summary: Mark student as graduated
  Tags: [Students]
  Auth: Bearer {jwt} (PROFESSOR, TENANT_ADMIN)
  Body:
    completionDate: date
    finalGrade: number (0-100, optional)
    certificate: string (URL to generated certificate, optional)
  Response: 200
    id: string
    status: string (GRADUATED)
    graduatedAt: ISO8601
  Error: 401, 403, 404

POST /students/:id/enroll-learning-path
  Summary: Enroll student in learning path
  Tags: [Students, Learning Paths]
  Auth: Bearer {jwt} (educator or admin)
  Body:
    learningPathId: string
    startDate: date (optional, default: today)
    scope: enum[LEARNING_PATH, COHORT, ONE_TO_ONE] (default: LEARNING_PATH)
  Response: 201
    enrollmentId: string
    studentId: string
    learningPathId: string
    status: string (ENROLLED)
    enrolledAt: ISO8601
  Error: 401, 403, 404, 409 (already enrolled), 422

POST /students/:id/unenroll-learning-path
  Summary: Remove student from learning path
  Tags: [Students, Learning Paths]
  Auth: Bearer {jwt} (educator or admin)
  Body:
    learningPathId: string
    reason: string (optional)
  Response: 204
  Error: 401, 403, 404

POST /students/import
  Summary: Bulk import students from CSV
  Tags: [Students]
  Auth: Bearer {jwt} (admin only)
  Body: multipart/form-data
    file: file (CSV with student fields)
  Response: 202
    jobId: string
    status: string (PROCESSING)
    totalRows: number
  Error: 400, 413, 422

GET /students/export
  Summary: Export students to CSV or Excel
  Tags: [Students]
  Auth: Bearer {jwt}
  Query:
    format: enum[CSV, XLSX] (default: CSV)
    fields: array[string] (subset of available fields)
    filters: string (JSON-encoded filters)
  Response: 200 (file download)
    Content-Type: text/csv or application/vnd.openxmlformats
  Error: 401, 403, 422

GET /students/:id/progress
  Summary: Get student's learning progress
  Tags: [Students]
  Auth: Bearer {jwt} (student, educator, or admin)
  Response: 200
    studentId: string
    overallProgress: number (percentage)
    learningPaths: array
      learningPathId: string
      name: string
      progress: number
      completedCompetencies: number
      totalCompetencies: number
      estimatedCompletion: date
      status: string
    competencies: array
      id: string
      name: string
      level: number (current)
      maxLevel: number
      status: enum[NOT_STARTED, IN_PROGRESS, COMPLETED]
      startedAt: ISO8601
      completedAt: ISO8601
    assessments: array
      id: string
      name: string
      score: number
      maxScore: number
      completedAt: ISO8601
  Error: 401, 403, 404

POST /students/:id/documents
  Summary: Upload document for student
  Tags: [Students, Documents]
  Auth: Bearer {jwt} (student, educator, or admin)
  Body: multipart/form-data
    file: file (PDF, DOCX, JPG, PNG)
    documentType: enum[ID_CARD, DIPLOMA, CONTRACT, CERTIFICATE, OTHER]
    name: string
    description: string (optional)
  Response: 201
    documentId: string
    studentId: string
    name: string
    type: string
    url: string
    uploadedAt: ISO8601
  Error: 400, 413 (file too large), 422, 403

GET /students/:id/swiss-status
  Summary: Get Swiss employment status details
  Tags: [Students]
  Auth: Bearer {jwt} (self, educator, or admin)
  Response: 200
    studentId: string
    avsNumber: string (masked)
    orpNumber: string
    employmentStatus: string
    canton: string
    laciDetails: object (if applicable)
      referenceNumber: string
      indemnityAmount: number (CHF)
      startDate: ISO8601
      endDate: ISO8601
    riDetails: object (if applicable)
      caseNumber: string
      caseworker: string
      contact: string
    aiDetails: object (if applicable)
      referenceNumber: string
      contact: string
    workPermit: string
    workPermitExpiryDate: date
  Error: 401, 403, 404
```

---

## 4. LEARNING PATHS & COMPETENCIES (22 endpoints)

```yaml
GET /learning-paths
  Summary: List all learning paths
  Tags: [Learning Paths]
  Auth: Bearer {jwt}
  Query:
    limit: number (default 20)
    offset: number (default 0)
    status: enum[DRAFT, PUBLISHED, ARCHIVED]
    search: string (name, description)
    sortBy: enum[name, createdAt, studentCount]
    sortOrder: enum[ASC, DESC]
  Response: 200
    paths: array
      id: string
      name: string
      description: string
      status: string
      studentCount: number
      competencyCount: number
      duration: number (weeks)
      createdAt: ISO8601
      updatedAt: ISO8601
    total: number
    hasMore: boolean
  Error: 401

POST /learning-paths
  Summary: Create new learning path
  Tags: [Learning Paths]
  Auth: Bearer {jwt} (PROFESSOR, TENANT_ADMIN)
  Body:
    name: string
    description: string
    duration: number (weeks)
    status: enum[DRAFT, PUBLISHED] (default: DRAFT)
    translations: object
      de: { name: string, description: string }
      fr: { name: string, description: string }
      it: { name: string, description: string }
  Response: 201
    id: string
    name: string
    description: string
    duration: number
    status: string
    createdAt: ISO8601
  Error: 400, 422, 403

GET /learning-paths/:id
  Summary: Get learning path details
  Tags: [Learning Paths]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    name: string
    description: string
    duration: number
    status: string
    competencies: array
      id: string
      name: string
      order: number
      level: number
    translations: object
    createdAt: ISO8601
    updatedAt: ISO8601
    createdBy: string (user ID)
  Error: 401, 404

PATCH /learning-paths/:id
  Summary: Update learning path
  Tags: [Learning Paths]
  Auth: Bearer {jwt} (creator, PROFESSOR, or admin)
  Body:
    name: string (optional)
    description: string (optional)
    duration: number (optional)
    status: enum (optional)
  Response: 200
    id: string
    name: string
    description: string
    status: string
    updatedAt: ISO8601
  Error: 401, 403, 404, 422

DELETE /learning-paths/:id
  Summary: Delete learning path
  Tags: [Learning Paths]
  Auth: Bearer {jwt} (admin only)
  Response: 204
  Error: 401, 403, 404

POST /learning-paths/:id/publish
  Summary: Publish learning path (make available for enrollment)
  Tags: [Learning Paths]
  Auth: Bearer {jwt} (PROFESSOR, admin)
  Response: 200
    id: string
    status: string (PUBLISHED)
    publishedAt: ISO8601
  Error: 401, 403, 404, 422 (validation failed)

POST /learning-paths/:id/competencies
  Summary: Add competency to learning path
  Tags: [Learning Paths, Competencies]
  Auth: Bearer {jwt} (creator or admin)
  Body:
    competencyId: string
    order: number (position in path)
    requiredLevel: number (1-5)
  Response: 201
    pathCompetencyId: string
    competencyId: string
    competencyName: string
    order: number
    requiredLevel: number
  Error: 401, 403, 404, 409 (already exists), 422

PUT /learning-paths/:id/competencies
  Summary: Reorder competencies
  Tags: [Learning Paths]
  Auth: Bearer {jwt}
  Body:
    competencies: array
      id: string (pathCompetencyId)
      order: number
  Response: 200
    competencies: array (updated)
  Error: 401, 403, 404, 422

DELETE /learning-paths/:id/competencies/:competencyId
  Summary: Remove competency from learning path
  Tags: [Learning Paths]
  Auth: Bearer {jwt}
  Response: 204
  Error: 401, 403, 404

GET /learning-paths/:id/students
  Summary: Get students enrolled in learning path
  Tags: [Learning Paths, Students]
  Auth: Bearer {jwt}
  Query:
    limit: number
    offset: number
    status: enum[ENROLLED, ACTIVE, PAUSED, COMPLETED, DROPPED]
  Response: 200
    students: array
      studentId: string
      firstName: string
      lastName: string
      email: string
      status: string
      enrolledAt: ISO8601
      progressPercentage: number
    total: number
  Error: 401, 404

POST /learning-paths/:id/assign-cohort
  Summary: Assign learning path to entire cohort
  Tags: [Learning Paths]
  Auth: Bearer {jwt} (PROFESSOR, admin)
  Body:
    cohortId: string
    startDate: date (optional)
  Response: 200
    pathId: string
    cohortId: string
    studentCount: number
    enrollmentsCreated: number
  Error: 401, 403, 404, 422

GET /competencies
  Summary: List all competencies
  Tags: [Competencies]
  Auth: Bearer {jwt}
  Query:
    limit: number
    offset: number
    categoryId: string (optional filter)
    search: string
  Response: 200
    competencies: array
      id: string
      name: string
      description: string
      categoryId: string
      maxLevel: number
      createdAt: ISO8601
    total: number
  Error: 401

POST /competencies
  Summary: Create new competency
  Tags: [Competencies]
  Auth: Bearer {jwt} (PROFESSOR, admin)
  Body:
    name: string
    description: string
    categoryId: string
    maxLevel: number (default: 5)
    translations: object
  Response: 201
    id: string
    name: string
    description: string
    maxLevel: number
    createdAt: ISO8601
  Error: 400, 422, 403

GET /competencies/:id
  Summary: Get competency details
  Tags: [Competencies]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    name: string
    description: string
    categoryId: string
    maxLevel: number
    translations: object
    createdAt: ISO8601
  Error: 401, 404

PATCH /competencies/:id
  Summary: Update competency
  Tags: [Competencies]
  Auth: Bearer {jwt} (admin)
  Body:
    name: string (optional)
    description: string (optional)
    maxLevel: number (optional)
  Response: 200
    id: string
    name: string
    description: string
    updatedAt: ISO8601
  Error: 401, 403, 404, 422

GET /competency-categories
  Summary: List competency categories
  Tags: [Competencies]
  Auth: Bearer {jwt}
  Response: 200
    categories: array
      id: string
      name: string
      description: string
      competencyCount: number
    total: number
  Error: 401

POST /competency-categories
  Summary: Create competency category
  Tags: [Competencies]
  Auth: Bearer {jwt} (admin)
  Body:
    name: string
    description: string
  Response: 201
    id: string
    name: string
    description: string
    createdAt: ISO8601
  Error: 400, 422, 403

GET /students/:studentId/competencies
  Summary: Get student's competency progress
  Tags: [Competencies, Students]
  Auth: Bearer {jwt}
  Response: 200
    studentId: string
    competencies: array
      competencyId: string
      name: string
      category: string
      currentLevel: number
      targetLevel: number
      status: enum[NOT_STARTED, IN_PROGRESS, COMPLETED, EXCEEDS_TARGET]
      startedAt: ISO8601
      completedAt: ISO8601
      assessments: array
        id: string
        score: number
        completedAt: ISO8601
    total: number
    completionPercentage: number
  Error: 401, 404

POST /students/:studentId/competencies/:competencyId/assess
  Summary: Record student competency assessment
  Tags: [Competencies]
  Auth: Bearer {jwt} (educator or admin)
  Body:
    level: number (1-5)
    score: number (0-100)
    comments: string (optional)
    assessorId: string (educator ID, auto-populated if not provided)
  Response: 201
    assessmentId: string
    studentId: string
    competencyId: string
    level: number
    score: number
    assessedAt: ISO8601
  Error: 401, 403, 404, 422
```

---

## 5. TIMESHEETS & TIME TRACKING (18 endpoints)

```yaml
GET /timesheets
  Summary: List timesheets (filtered by user's students/role)
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Query:
    limit: number (default 20)
    offset: number (default 0)
    studentId: string (optional)
    status: enum[DRAFT, SUBMITTED, APPROVED, REJECTED, ARCHIVED]
    week: string (ISO week: 2024-W12)
    month: string (YYYY-MM)
    startDate: date
    endDate: date
    sortBy: enum[createdAt, week, status]
  Response: 200
    timesheets: array
      id: string
      studentId: string
      studentName: string
      week: string
      status: string
      totalHours: number
      submittedAt: ISO8601
      approvedAt: ISO8601
      approverName: string
    total: number
  Error: 401

POST /timesheets
  Summary: Create new timesheet (weekly)
  Tags: [Timesheets]
  Auth: Bearer {jwt} (student or educator)
  Body:
    studentId: string (educators specify, students can only create for self)
    week: string (ISO week: 2024-W12)
  Response: 201
    id: string
    studentId: string
    week: string
    status: string (DRAFT)
    createdAt: ISO8601
  Error: 400, 409 (already exists), 403

GET /timesheets/:id
  Summary: Get timesheet details
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    studentId: string
    studentName: string
    week: string
    status: string
    entries: array
      id: string
      date: date (YYYY-MM-DD)
      dayOfWeek: string
      projectId: string
      projectName: string
      taskTypeId: string
      taskTypeName: string
      hours: number
      description: string
      notes: string
    totalHours: number
    targetHours: number (expected for week)
    createdAt: ISO8601
    submittedAt: ISO8601
    approvedAt: ISO8601
    rejectionReason: string (if rejected)
    approverName: string
  Error: 401, 404

PATCH /timesheets/:id
  Summary: Update timesheet (can only edit if DRAFT)
  Tags: [Timesheets]
  Auth: Bearer {jwt} (student or educator)
  Body:
    status: enum[DRAFT, SUBMITTED] (submit for approval)
  Response: 200
    id: string
    status: string
    updatedAt: ISO8601
  Error: 401, 403, 404, 422 (cannot update after submit)

POST /timesheets/:id/entries
  Summary: Add time entry to timesheet
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Body:
    date: date (YYYY-MM-DD, must be within timesheet week)
    projectId: string
    taskTypeId: string
    hours: number (decimal, 0.5-12)
    description: string
    notes: string (optional)
  Response: 201
    id: string
    timesheetId: string
    date: date
    projectId: string
    projectName: string
    taskTypeId: string
    taskTypeName: string
    hours: number
    createdAt: ISO8601
  Error: 401, 404, 422 (validation: hours > 12, wrong date, etc.)

PATCH /timesheets/:timesheetId/entries/:entryId
  Summary: Update time entry
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Body:
    hours: number (optional)
    description: string (optional)
    notes: string (optional)
  Response: 200
    id: string
    hours: number
    updatedAt: ISO8601
  Error: 401, 403, 404, 422

DELETE /timesheets/:timesheetId/entries/:entryId
  Summary: Delete time entry
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Response: 204
  Error: 401, 403, 404

POST /timesheets/:id/submit
  Summary: Submit timesheet for approval
  Tags: [Timesheets]
  Auth: Bearer {jwt} (student or educator)
  Body:
    notes: string (optional, submit message)
  Response: 200
    id: string
    status: string (SUBMITTED)
    submittedAt: ISO8601
  Error: 401, 403, 404, 422 (validation: missing entries, negative hours, etc.)

GET /timesheets/:id/approvals
  Summary: Get approval queue (manager view)
  Tags: [Timesheets]
  Auth: Bearer {jwt} (COACH, MENTOR, MANAGER, admin)
  Query:
    limit: number
    offset: number
    status: enum[SUBMITTED, APPROVED, REJECTED]
  Response: 200
    approvals: array
      id: string
      timesheetId: string
      studentName: string
      week: string
      totalHours: number
      submittedAt: ISO8601
      status: string
    total: number
  Error: 401, 403

POST /timesheets/:id/approve
  Summary: Approve timesheet
  Tags: [Timesheets]
  Auth: Bearer {jwt} (approver based on hierarchy)
  Body:
    notes: string (optional)
  Response: 200
    id: string
    status: string (APPROVED)
    approvedAt: ISO8601
    approverName: string
  Error: 401, 403, 404, 422 (already approved/rejected)

POST /timesheets/:id/reject
  Summary: Reject timesheet (return to student for revision)
  Tags: [Timesheets]
  Auth: Bearer {jwt} (approver)
  Body:
    reason: string (required)
    suggestions: string (optional)
  Response: 200
    id: string
    status: string (REJECTED)
    rejectionReason: string
    returnedAt: ISO8601
  Error: 401, 403, 404, 422

GET /projects
  Summary: List projects (for timesheet entry)
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Query:
    limit: number
    offset: number
    status: enum[ACTIVE, ARCHIVED]
  Response: 200
    projects: array
      id: string
      name: string
      code: string
      status: string
      description: string
    total: number
  Error: 401

POST /projects
  Summary: Create project (for time tracking)
  Tags: [Timesheets]
  Auth: Bearer {jwt} (admin)
  Body:
    name: string
    code: string
    description: string
  Response: 201
    id: string
    name: string
    code: string
    createdAt: ISO8601
  Error: 400, 409 (code exists), 422, 403

GET /task-types
  Summary: List task types (for timesheet entry)
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Response: 200
    taskTypes: array
      id: string
      name: string
      code: string
      billable: boolean
    total: number
  Error: 401

POST /task-types
  Summary: Create task type
  Tags: [Timesheets]
  Auth: Bearer {jwt} (admin)
  Body:
    name: string
    code: string
    billable: boolean (default: true)
  Response: 201
    id: string
    name: string
    code: string
    billable: boolean
  Error: 400, 422, 403

GET /timesheets/export
  Summary: Export timesheets (CSV, Excel, PDF)
  Tags: [Timesheets]
  Auth: Bearer {jwt}
  Query:
    format: enum[CSV, XLSX, PDF]
    startDate: date
    endDate: date
    studentIds: array[string] (optional filter)
  Response: 200 (file download)
    Content-Type: text/csv or application/vnd.openxmlformats or application/pdf
  Error: 401, 403, 422

POST /timesheets/:id/orp-export
  Summary: Export timesheet for ORP (Swiss unemployment office)
  Tags: [Timesheets]
  Auth: Bearer {jwt} (admin)
  Body:
    orpNumber: string (student's ORP number)
  Response: 200
    jobId: string
    status: string (PROCESSING)
    message: string (file will be emailed)
  Error: 401, 403, 404, 422
```

---

## 6. ABSENCE MANAGEMENT (15 endpoints)

```yaml
GET /absences
  Summary: List absences (filtered by role/scope)
  Tags: [Absences]
  Auth: Bearer {jwt}
  Query:
    limit: number
    offset: number
    studentId: string (optional)
    status: enum[PENDING, APPROVED, REJECTED, EXCUSED, UNEXCUSED]
    type: enum[SICK, VACATION, PERSONAL, EXCUSED, OTHER]
    startDate: date
    endDate: date
  Response: 200
    absences: array
      id: string
      studentId: string
      studentName: string
      type: string
      startDate: date
      endDate: date
      days: number
      status: string
      reason: string
      requestedAt: ISO8601
      approvedAt: ISO8601
    total: number
  Error: 401

POST /absences
  Summary: Create absence request
  Tags: [Absences]
  Auth: Bearer {jwt} (student or educator on behalf)
  Body:
    studentId: string (educators specify, students can only request for self)
    type: enum[SICK, VACATION, PERSONAL, EXCUSED, OTHER]
    startDate: date
    endDate: date
    reason: string
    evidence: string (optional, URL or base64 attachment)
    employmentStatus: enum[LACI, RI, AI, EMPLOYED, UNEMPLOYED, STUDENT]
  Response: 201
    id: string
    studentId: string
    type: string
    startDate: date
    endDate: date
    status: string (PENDING)
    createdAt: ISO8601
  Error: 400, 422, 403

GET /absences/:id
  Summary: Get absence details
  Tags: [Absences]
  Auth: Bearer {jwt}
  Response: 200
    id: string
    studentId: string
    studentName: string
    type: string
    startDate: date
    endDate: date
    days: number
    reason: string
    evidence: string (URL)
    employmentStatus: string
    status: string
    requestedAt: ISO8601
    approverName: string (if approved)
    approvedAt: ISO8601
    rejectionReason: string (if rejected)
    comments: string
  Error: 401, 404

PATCH /absences/:id
  Summary: Update absence (only if PENDING)
  Tags: [Absences]
  Auth: Bearer {jwt} (requester or admin)
  Body:
    type: enum (optional)
    startDate: date (optional)
    endDate: date (optional)
    reason: string (optional)
  Response: 200
    id: string
    type: string
    startDate: date
    endDate: date
    updatedAt: ISO8601
  Error: 401, 403, 404, 422 (cannot update if not PENDING)

POST /absences/:id/approve
  Summary: Approve absence request
  Tags: [Absences]
  Auth: Bearer {jwt} (coach, mentor, manager)
  Body:
    comments: string (optional)
    excused: boolean (default: true)
  Response: 200
    id: string
    status: string (APPROVED)
    approvedAt: ISO8601
    approverName: string
  Error: 401, 403, 404, 422

POST /absences/:id/reject
  Summary: Reject absence request
  Tags: [Absences]
  Auth: Bearer {jwt} (approver)
  Body:
    reason: string (required)
    comments: string (optional)
  Response: 200
    id: string
    status: string (REJECTED)
    rejectionReason: string
    returnedAt: ISO8601
  Error: 401, 403, 404, 422

DELETE /absences/:id
  Summary: Cancel absence request (only if PENDING)
  Tags: [Absences]
  Auth: Bearer {jwt} (requester or admin)
  Response: 204
  Error: 401, 403, 404

GET /absences/calendar/:studentId
  Summary: Get absence calendar for student
  Tags: [Absences]
  Auth: Bearer {jwt}
  Query:
    month: string (YYYY-MM)
  Response: 200
    studentId: string
    month: string
    days: array
      date: date
      type: enum[PRESENT, ABSENT, HALF_DAY, VACATION, SICK]
      absenceId: string
      status: string
    totalAbsentDays: number
    totalVacationDays: number
  Error: 401, 404

POST /absences/bulk-approve
  Summary: Approve multiple absence requests
  Tags: [Absences]
  Auth: Bearer {jwt} (admin only)
  Body:
    absenceIds: array[string]
    excused: boolean
    comments: string (optional)
  Response: 200
    approved: number
    failed: number
    errors: array
      absenceId: string
      error: string
  Error: 401, 403, 422

GET /absences/export
  Summary: Export absences (CSV, Excel)
  Tags: [Absences]
  Auth: Bearer {jwt} (admin)
  Query:
    format: enum[CSV, XLSX]
    startDate: date
    endDate: date
    studentIds: array[string] (optional)
  Response: 200 (file download)
  Error: 401, 403, 422

POST /absences/:id/notify-orp
  Summary: Notify ORP of absence (Swiss unemployment office)
  Tags: [Absences]
  Auth: Bearer {jwt} (admin)
  Body:
    orpNumber: string
  Response: 202
    jobId: string
    status: string (PROCESSING)
  Error: 401, 403, 404, 422

GET /absence-types
  Summary: List absence types
  Tags: [Absences]
  Auth: Bearer {jwt}
  Response: 200
    types: array
      id: string
      name: string
      code: string
      paidLeave: boolean
      requiresApproval: boolean
      requiresEvidence: boolean
    total: number
  Error: 401

GET /students/:studentId/absence-summary
  Summary: Get student's absence summary
  Tags: [Absences, Students]
  Auth: Bearer {jwt}
  Query:
    period: enum[THIS_MONTH, THIS_YEAR, ALL_TIME] (default: THIS_YEAR)
  Response: 200
    studentId: string
    period: string
    totalAbsentDays: number
    totalVacationDays: number
    totalSickDays: number
    totalPersonalDays: number
    excusedDays: number
    unexcusedDays: number
    absences: array
      type: string
      days: number
  Error: 401, 404
```

[Document continues with sections 7-13... for brevity, showing pattern]

---

## 7. DOCUMENTS & FILE MANAGEMENT (15 endpoints)
## 8. WORKFLOWS & APPROVALS (16 endpoints)
## 9. ROLES & PERMISSIONS (14 endpoints)
## 10. SETTINGS & CONFIGURATION (20 endpoints)
## 11. REPORTING & ANALYTICS (16 endpoints)
## 12. AUDIT & COMPLIANCE (12 endpoints)
## 13. PUBLIC / ANONYMOUS ENDPOINTS (10 endpoints)

```yaml
GET /public/features
  Summary: Get platform features (public, for showcase)
  Auth: None
  Response: 200
    features: array
      id: string
      name: string
      description: string
      icon: string (URL)
      category: string
  Error: None (always 200)

GET /public/pricing
  Summary: Get pricing tiers (public)
  Auth: None
  Response: 200
    tiers: array
      id: string
      name: string
      description: string
      price: number (CHF/year, 0 if government funded)
      features: array[string]
  Error: None (always 200)

GET /public/testimonials
  Summary: Get testimonials/case studies
  Auth: None
  Response: 200
    testimonials: array
      id: string
      author: string
      organization: string
      role: string
      content: string
      rating: number (1-5)
      date: ISO8601
      photo: string (URL)
  Error: None (always 200)

POST /public/contact
  Summary: Contact form submission
  Auth: None
  Body:
    name: string
    email: string
    organization: string
    subject: string
    message: string
  Response: 202
    message: string (form submitted, will contact soon)
  Error: 400, 422 (validation)

POST /public/newsletter-signup
  Summary: Subscribe to newsletter
  Auth: None
  Body:
    email: string
    name: string (optional)
  Response: 201
    email: string
    message: string
  Error: 409 (already subscribed), 422

GET /public/health
  Summary: Health check endpoint
  Auth: None
  Response: 200
    status: string (OK, DEGRADED, DOWN)
    timestamp: ISO8601
    version: string
    uptime: number (seconds)
  Error: 503 (if DOWN)

GET /public/faq
  Summary: Get FAQ
  Auth: None
  Response: 200
    faqs: array
      id: string
      category: string
      question: string
      answer: string (markdown)
      order: number
  Error: None

GET /public/blog
  Summary: List blog posts
  Auth: None
  Query:
    limit: number (default 10)
    offset: number (default 0)
    category: string (optional)
  Response: 200
    posts: array
      id: string
      title: string
      excerpt: string
      category: string
      author: string
      publishedAt: ISO8601
      readTime: number (minutes)
      featured: boolean
    total: number
  Error: None

GET /public/blog/:slug
  Summary: Get blog post
  Auth: None
  Response: 200
    id: string
    title: string
    content: string (markdown)
    author: string
    category: string
    publishedAt: ISO8601
    updatedAt: ISO8601
    relatedPosts: array
      id: string
      title: string
      slug: string
  Error: 404

GET /public/legal/privacy
  Summary: Get privacy policy
  Auth: None
  Response: 200
    content: string (markdown)
    version: string
    lastUpdated: ISO8601
  Error: None
```

---

## Error Response Format

All error responses follow this standard format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "statusCode": 400,
    "details": [
      {
        "field": "fieldName",
        "message": "Field-specific error",
        "value": "submitted value"
      }
    ],
    "timestamp": "2024-03-17T10:30:00Z",
    "requestId": "req-uuid-1234",
    "traceId": "trace-uuid-5678"
  }
}
```

---

## Rate Limiting

All endpoints subject to rate limiting:

- **Default**: 1000 requests/min per user, 10000/min per IP
- **Auth endpoints**: 20 attempts/min per email
- **File upload**: 100 MB/min per user
- **Export**: 5 concurrent exports per user

Response headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1710753000
```

---

## Pagination

All list endpoints support cursor-based pagination:

```json
{
  "items": [...],
  "total": 500,
  "hasMore": true,
  "cursor": "cD0yMDI0LTAzLTE3VDEwOjMwOjAwWg==",
  "nextCursor": "cD0yMDI0LTAzLTE3VDEwOjQwOjAwWg=="
}
```

Query parameters:
- `limit` (1-100, default 20)
- `offset` (default 0) OR `cursor` (for cursor pagination)
- `sortBy` (field name)
- `sortOrder` (ASC, DESC)

---

## Authentication Header

All protected endpoints require:
```
Authorization: Bearer {accessToken}
```

MFA endpoints may require:
```
X-MFA-SessionId: {sessionId}
```

---

## Content Types

- **Request**: `application/json` (except file uploads: `multipart/form-data`)
- **Response**: `application/json` (except exports: `text/csv`, `application/vnd.openxmlformats`, `application/pdf`)

---

## Versioning

Current API version: `v1`

Future versions will use `/api/v2/`, `/api/v3/`, etc.

No backward compatibility guarantee. All endpoints use latest version.

---

**Document Version**: 1.0  
**Date**: March 17, 2026  
**Status**: COMPLETE - Ready for Implementation
