# User Roles & Hierarchy System

## Overview

A flexible, normalized role-based access control (RBAC) system that handles:
- **Educators**: Teacher, Professor, Mentor, Coach, Trainer
- **Students**: Basic student, Tutor, Teaching Assistant, Class Representative
- **Administrators**: Tenant Admin, System Admin
- **Role Hierarchy**: Inheritance and permission escalation

Each user can have **multiple roles** with different permissions and scope (tenant-wide, learning path, cohort, class, or one-on-one).

## Core Principles

1. **User is separate from Role** - User table has identity, Role table defines permissions
2. **Many-to-Many Relationships** - User can have multiple roles, roles can have multiple users
3. **Role Inheritance** - Professor > Teacher > Mentor in permission hierarchy
4. **Scoped Permissions** - Same role can have different permissions based on scope (full cohort vs. one student)
5. **Normalized Design** - Separate tables for User, Role, UserRole, Permission, RolePermission

## Entity Hierarchy

### User Types & Roles

```
USER (core identity)
├── Educator Roles
│   ├── Professor (highest authority for learning path)
│   ├── Teacher (instructor, delivers curriculum)
│   ├── Mentor (guides student development, optional)
│   ├── Coach (focused on specific skills/competencies)
│   └── Trainer (specialized instructor, workshops)
│
├── Student Roles
│   ├── Student (base role)
│   ├── Tutor (helps peers)
│   ├── Teaching Assistant (supports teacher)
│   └── Class Representative (student leader)
│
└── Admin Roles
    ├── Tenant Admin (manage all students/teachers in tenant)
    ├── Program Admin (manage learning path/program)
    └── System Admin (platform-level access)
```

## Entity Definitions

### User (Core Identity)

```typescript
import { BaseEntity, FlaggedEntity } from '@shared/types';

/**
 * Core user entity - identity for any person in system
 * Both educators and students are Users
 */
export interface User extends BaseEntity, FlaggedEntity {
  // Identity
  firstName: string;
  lastName: string;
  email: string; // Primary contact
  
  // User Type
  userType: 'STUDENT' | 'EDUCATOR' | 'ADMIN' | 'STAFF';
  
  // Profile
  dateOfBirth?: string;
  profileImageUrl?: string;
  bio?: string;
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  lastLoginAt?: string;
  
  // Preferences
  preferredLanguage?: string; // ISO 639-1
  timezone?: string; // IANA timezone
}

/**
 * Student-specific profile extension
 * Only for users with STUDENT userType
 */
export interface StudentProfile extends BaseEntity {
  userId: string; // FK to User
  enrollmentDate: string;
  expectedGraduationDate?: string;
  currentLearningPathCode?: string;
  currentStatus: 'ENROLLED' | 'ACTIVE' | 'ON_LEAVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';
  // Other student-specific fields...
}

/**
 * Educator-specific profile extension
 * Only for users with EDUCATOR userType
 */
export interface EducatorProfile extends BaseEntity {
  userId: string; // FK to User
  
  // Professional Info
  employeeId?: string;
  department?: string;
  specialization?: string; // e.g., "Full Stack Development", "Data Science"
  qualifications?: string[]; // Degrees, certifications
  
  // Availability
  hoursPerWeekAvailable?: number;
  maxStudentsPerCohort?: number;
  
  // Experience
  yearsOfExperience?: number;
  experienceAreas?: string[];
  
  // External Links
  linkedinProfile?: string;
  portfolioUrl?: string;
  
  // Status
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  approvedByAdminId?: string;
}
```

**Database Schema:**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 0,
  
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  user_type VARCHAR(50) NOT NULL, -- 'STUDENT', 'EDUCATOR', 'ADMIN', 'STAFF'
  
  date_of_birth DATE,
  profile_image_url TEXT,
  bio TEXT,
  
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMP,
  
  preferred_language VARCHAR(10),
  timezone VARCHAR(100),
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, email),
  UNIQUE(tenant_id, code),
  INDEX idx_users_tenant (tenant_id),
  INDEX idx_users_type (tenant_id, user_type),
  INDEX idx_users_status (tenant_id, status)
);

CREATE TABLE educator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  employee_id VARCHAR(100),
  department VARCHAR(255),
  specialization VARCHAR(255),
  qualifications TEXT[],
  
  hours_per_week_available DECIMAL(5, 2),
  max_students_per_cohort INTEGER,
  
  years_of_experience SMALLINT,
  experience_areas TEXT[],
  
  linkedin_profile VARCHAR(255),
  portfolio_url VARCHAR(255),
  
  approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  approved_at TIMESTAMP,
  approved_by_admin_id UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_educator_tenant (tenant_id),
  INDEX idx_educator_approval (approval_status)
);

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  enrollment_date DATE NOT NULL,
  expected_graduation_date DATE,
  current_learning_path_code VARCHAR(255),
  current_status VARCHAR(50) NOT NULL DEFAULT 'ENROLLED',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  INDEX idx_student_tenant (tenant_id),
  INDEX idx_student_status (current_status)
);
```

---

### Role (Permission Set Definition)

```typescript
/**
 * Role definition - not assigned to users, but defines permission sets
 * Roles are hierarchical
 */
export interface Role extends BaseEntity, FlaggedEntity {
  // Role identity
  roleKey: string; // 'PROFESSOR', 'TEACHER', 'MENTOR', 'STUDENT', 'ADMIN'
  displayName: string; // "Professor", "Teacher", etc.
  description?: string;
  
  // Hierarchy
  parentRoleKey?: string; // For inheritance (e.g., PROFESSOR inherits from TEACHER)
  hierarchyLevel: number; // 0=highest (admin), 100=lowest (student)
  
  // Classification
  roleCategory: 'EDUCATOR' | 'STUDENT' | 'ADMIN' | 'STAFF';
  
  // Scope
  scopeType: 'PLATFORM' | 'TENANT' | 'LEARNING_PATH' | 'COHORT' | 'CLASS' | 'ONE_TO_ONE';
  canHaveMultipleScopes: boolean; // Can user have role in multiple contexts?
  
  // Defaults
  defaultPermissions?: string[]; // FK array to Permission codes
}
```

**Database Schema:**

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id), -- NULL for platform roles
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 0,
  
  role_key VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  parent_role_key VARCHAR(100),
  hierarchy_level SMALLINT NOT NULL,
  
  role_category VARCHAR(50) NOT NULL,
  scope_type VARCHAR(50) NOT NULL,
  can_have_multiple_scopes BOOLEAN DEFAULT false,
  
  default_permissions TEXT[],
  
  is_selected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, role_key),
  INDEX idx_roles_category (role_category),
  INDEX idx_roles_hierarchy (hierarchy_level)
);
```

---

### UserRole (User ← → Role Assignment with Scope)

```typescript
/**
 * Junction table: User can have multiple roles with different scopes
 * e.g., User can be TEACHER for Learning Path A, MENTOR for Student B
 */
export interface UserRole extends BaseEntity {
  userId: string; // FK to User
  roleKey: string; // FK to Role.roleKey
  
  // Scope of this role assignment
  scopeType: 'PLATFORM' | 'TENANT' | 'LEARNING_PATH' | 'COHORT' | 'CLASS' | 'ONE_TO_ONE';
  scopeId?: string; // ID of learning path, cohort, class, or student
  scopeName?: string; // e.g., "Full Stack 2026 Q1" (denormalized for quick access)
  
  // Assignment metadata
  assignedDate: string;
  unassignedDate?: string; // NULL if currently assigned
  isActive: boolean; // Currently in this role
  
  // Permissions override
  customPermissions?: string[]; // Can override role defaults for this scope
  permissionOverride?: 'EXTEND' | 'RESTRICT'; // Add or remove from role defaults
  
  // Approval (for some roles)
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedByUserId?: string;
  approvedAt?: string;
  
  // Metrics
  studentsCount?: number; // How many students does this educator have in this scope?
  maxStudents?: number; // Limit for this assignment
}
```

**Database Schema:**

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 0,
  
  role_key VARCHAR(100) NOT NULL,
  
  scope_type VARCHAR(50) NOT NULL,
  scope_id VARCHAR(255),
  scope_name VARCHAR(255),
  
  assigned_date DATE NOT NULL,
  unassigned_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  custom_permissions TEXT[],
  permission_override VARCHAR(50),
  
  approval_status VARCHAR(50),
  approved_by_user_id UUID,
  approved_at TIMESTAMP,
  
  students_count INTEGER,
  max_students INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, user_id, role_key, scope_id),
  INDEX idx_user_roles_user (tenant_id, user_id),
  INDEX idx_user_roles_active (tenant_id, is_active),
  INDEX idx_user_roles_role (role_key),
  INDEX idx_user_roles_scope (scope_type, scope_id)
);
```

---

### Permission (Granular Actions)

```typescript
/**
 * Permission definition - granular actions that roles can have
 * e.g., 'student:view', 'student:update:grades', 'class:manage'
 */
export interface Permission extends BaseEntity {
  // Permission identity
  permissionKey: string; // e.g., 'students:read', 'grades:write', 'class:manage'
  displayName: string;
  description?: string;
  
  // Classification
  resource: string; // 'students', 'grades', 'class', 'workflow', 'reports'
  action: string; // 'read', 'create', 'update', 'delete', 'manage'
  
  // Scope constraint
  canBeScopedTo?: string[]; // ['LEARNING_PATH', 'COHORT'] - which scopes can use this?
}
```

**Database Schema:**

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id), -- NULL for platform permissions
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  permission_key VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  
  can_be_scoped_to TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(tenant_id, permission_key),
  INDEX idx_permissions_resource (resource),
  INDEX idx_permissions_action (action)
);
```

---

### RolePermission (Role ← → Permission Junction)

```typescript
/**
 * Junction table: Role has multiple permissions
 */
export interface RolePermission extends BaseEntity {
  roleKey: string; // FK to Role
  permissionKey: string; // FK to Permission
  
  // Permission can be further scoped
  scopeLimitation?: 'SELF' | 'OWN_STUDENTS' | 'OWN_COHORT' | 'FULL_TENANT';
  // e.g., TEACHER can update grades for OWN_STUDENTS, PROFESSOR can update for FULL_TENANT
}
```

**Database Schema:**

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  
  role_key VARCHAR(100) NOT NULL,
  permission_key VARCHAR(255) NOT NULL,
  
  scope_limitation VARCHAR(50), -- 'SELF', 'OWN_STUDENTS', 'OWN_COHORT', 'FULL_TENANT'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  
  UNIQUE(role_key, permission_key),
  INDEX idx_role_permissions_role (role_key),
  INDEX idx_role_permissions_permission (permission_key)
);
```

---

## Role Hierarchy & Examples

### Educator Role Hierarchy

```
┌─────────────────────────────────────────┐
│  SYSTEM_ADMIN (hierarchy: 0)            │
│  - Full platform access                 │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  TENANT_ADMIN (hierarchy: 10)           │
│  - Manage all users & roles in tenant   │
│  - Reports, compliance                  │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  PROGRAM_ADMIN (hierarchy: 20)          │
│  - Manage learning path, teachers       │
│  - Create cohorts, assign teachers      │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  PROFESSOR (hierarchy: 30)              │
│  - Owner of learning path/program       │
│  - Final grade approval                 │
│  - Can manage all teachers in program   │
│  - Define curriculum                    │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  TEACHER (hierarchy: 40)                │
│  - Delivers curriculum                  │
│  - Manages one cohort                   │
│  - Records grades, attendance           │
│  - Can assign MENTOR to students        │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  MENTOR (hierarchy: 50)                 │
│  - 1-on-1 student guidance              │
│  - Can view student progress            │
│  - Provides feedback, coaching          │
│  - Cannot modify grades                 │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  COACH (hierarchy: 60)                  │
│  - Focused skill/competency coaching    │
│  - Can assess against competencies      │
│  - Limited to assigned students         │
│  - Cannot modify official grades        │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  TRAINER (hierarchy: 70)                │
│  - Workshop/session instructor          │
│  - Delivers specific content            │
│  - Can track attendance                 │
│  - Cannot grade, limited scope          │
└─────────────────────────────────────────┘
```

### Student Role Hierarchy

```
┌─────────────────────────────────────────┐
│  STUDENT (hierarchy: 80)                │
│  - Basic enrollment                     │
│  - View own progress                    │
│  - Submit assignments                   │
└─────────────────────────────────────────┘
           │
        ┌──┴──┬─────────┬──────────┐
        ▼     ▼         ▼          ▼
    TUTOR TEACHING_   CLASS_      (additional
    (help  ASSISTANT  REP         student
     peers)(supports  (leader)    roles)
            teacher)
```

---

## Scope Examples

### Learning Path Scope
```typescript
UserRole {
  userId: "prof-123",
  roleKey: "PROFESSOR",
  scopeType: "LEARNING_PATH",
  scopeId: "full-stack-2026-q1",
  scopeName: "Full Stack Development 2026 Q1",
  isActive: true
}
// Professor owns and manages entire learning path curriculum
```

### Cohort Scope
```typescript
UserRole {
  userId: "teacher-456",
  roleKey: "TEACHER",
  scopeType: "COHORT",
  scopeId: "fs-2026-q1-cohort-a",
  scopeName: "Cohort A - Full Stack 2026 Q1",
  isActive: true,
  studentsCount: 25,
  maxStudents: 30
}
// Teacher manages one cohort (25 students max 30)
```

### One-to-One Scope
```typescript
UserRole {
  userId: "mentor-789",
  roleKey: "MENTOR",
  scopeType: "ONE_TO_ONE",
  scopeId: "student-xyz",
  scopeName: "John Doe",
  isActive: true
}
// Mentor has 1-on-1 relationship with specific student
```

---

## Default Roles & Permissions

### Platform Default Roles

```typescript
const DEFAULT_ROLES: Role[] = [
  // Admin Roles
  {
    roleKey: 'SYSTEM_ADMIN',
    displayName: 'System Administrator',
    roleCategory: 'ADMIN',
    scopeType: 'PLATFORM',
    hierarchyLevel: 0,
    defaultPermissions: ['*:*'], // All permissions
  },
  
  {
    roleKey: 'TENANT_ADMIN',
    displayName: 'Tenant Administrator',
    roleCategory: 'ADMIN',
    scopeType: 'TENANT',
    hierarchyLevel: 10,
    defaultPermissions: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'roles:read', 'roles:assign',
      'reports:read', 'compliance:read',
    ],
  },
  
  // Educator Roles
  {
    roleKey: 'PROFESSOR',
    displayName: 'Professor',
    roleCategory: 'EDUCATOR',
    scopeType: 'LEARNING_PATH',
    hierarchyLevel: 30,
    defaultPermissions: [
      'learning_path:read', 'learning_path:update', 'learning_path:manage',
      'curriculum:manage', 'competencies:manage',
      'teachers:manage', 'grades:approve', 'reports:read',
    ],
  },
  
  {
    roleKey: 'TEACHER',
    displayName: 'Teacher',
    parentRoleKey: 'PROFESSOR',
    roleCategory: 'EDUCATOR',
    scopeType: 'COHORT',
    canHaveMultipleScopes: true,
    hierarchyLevel: 40,
    defaultPermissions: [
      'cohort:read', 'students:read', 'grades:write',
      'attendance:write', 'assignments:read',
      'mentor:assign', 'feedback:write',
    ],
  },
  
  {
    roleKey: 'MENTOR',
    displayName: 'Mentor',
    parentRoleKey: 'TEACHER',
    roleCategory: 'EDUCATOR',
    scopeType: 'ONE_TO_ONE',
    canHaveMultipleScopes: true,
    hierarchyLevel: 50,
    defaultPermissions: [
      'student:read', 'progress:read', 'feedback:write',
      'competencies:assess:own_student',
    ],
  },
  
  {
    roleKey: 'COACH',
    displayName: 'Coach',
    parentRoleKey: 'MENTOR',
    roleCategory: 'EDUCATOR',
    scopeType: 'ONE_TO_ONE',
    canHaveMultipleScopes: true,
    hierarchyLevel: 60,
    defaultPermissions: [
      'student:read', 'competencies:assess', 'feedback:write',
    ],
  },
  
  // Student Roles
  {
    roleKey: 'STUDENT',
    displayName: 'Student',
    roleCategory: 'STUDENT',
    scopeType: 'LEARNING_PATH',
    hierarchyLevel: 80,
    defaultPermissions: [
      'own_profile:read', 'own_profile:update',
      'progress:read', 'assignments:read', 'assignments:submit',
      'grades:read', 'feedback:read',
    ],
  },
  
  {
    roleKey: 'TEACHING_ASSISTANT',
    displayName: 'Teaching Assistant',
    roleCategory: 'STUDENT',
    scopeType: 'COHORT',
    hierarchyLevel: 75,
    defaultPermissions: [
      'students:read', 'attendance:read', 'assignments:read',
      'feedback:read', 'cohort:manage_minor',
    ],
  },
];
```

---

## Permission Examples

```typescript
const DEFAULT_PERMISSIONS: Permission[] = [
  // Student Permissions
  { permissionKey: 'own_profile:read', resource: 'profile', action: 'read' },
  { permissionKey: 'own_profile:update', resource: 'profile', action: 'update' },
  { permissionKey: 'progress:read', resource: 'progress', action: 'read' },
  { permissionKey: 'assignments:read', resource: 'assignments', action: 'read' },
  { permissionKey: 'assignments:submit', resource: 'assignments', action: 'create' },
  { permissionKey: 'grades:read', resource: 'grades', action: 'read' },
  { permissionKey: 'feedback:read', resource: 'feedback', action: 'read' },
  
  // Teacher Permissions
  { permissionKey: 'students:read', resource: 'students', action: 'read', canBeScopedTo: ['COHORT', 'LEARNING_PATH'] },
  { permissionKey: 'grades:write', resource: 'grades', action: 'update', canBeScopedTo: ['COHORT'] },
  { permissionKey: 'grades:approve', resource: 'grades', action: 'approve', canBeScopedTo: ['LEARNING_PATH'] },
  { permissionKey: 'attendance:write', resource: 'attendance', action: 'write', canBeScopedTo: ['COHORT'] },
  { permissionKey: 'feedback:write', resource: 'feedback', action: 'create', canBeScopedTo: ['COHORT', 'ONE_TO_ONE'] },
  { permissionKey: 'mentor:assign', resource: 'mentor', action: 'assign', canBeScopedTo: ['COHORT'] },
  
  // Competency Assessment
  { permissionKey: 'competencies:assess', resource: 'competencies', action: 'assess', canBeScopedTo: ['ONE_TO_ONE'] },
  { permissionKey: 'competencies:assess:own_student', resource: 'competencies', action: 'assess', canBeScopedTo: ['ONE_TO_ONE'] },
  { permissionKey: 'competencies:manage', resource: 'competencies', action: 'manage', canBeScopedTo: ['LEARNING_PATH'] },
  
  // Admin Permissions
  { permissionKey: 'users:read', resource: 'users', action: 'read' },
  { permissionKey: 'users:create', resource: 'users', action: 'create' },
  { permissionKey: 'users:update', resource: 'users', action: 'update' },
  { permissionKey: 'users:delete', resource: 'users', action: 'delete' },
  { permissionKey: 'roles:read', resource: 'roles', action: 'read' },
  { permissionKey: 'roles:assign', resource: 'roles', action: 'assign' },
  
  // Wildcard
  { permissionKey: '*:*', resource: '*', action: '*' }, // Full access
];
```

---

## Query Examples

### Get User with All Roles & Scopes

```typescript
interface UserWithRoles {
  user: User;
  educatorProfile?: EducatorProfile;
  studentProfile?: StudentProfile;
  roles: (UserRole & { role: Role; permissions: Permission[] })[];
}

const findUserWithRoles = async (
  tenantId: string,
  userId: string,
): Promise<UserWithRoles> => {
  // Query user
  const user = await db.query<User>(
    `SELECT * FROM users WHERE id = $1 AND tenant_id = $2`,
    [userId, tenantId],
  );

  // Load profile based on user type
  let profile;
  if (user.userType === 'EDUCATOR') {
    profile = await db.queryOne(
      `SELECT * FROM educator_profiles WHERE user_id = $1`,
      [userId],
    );
  } else if (user.userType === 'STUDENT') {
    profile = await db.queryOne(
      `SELECT * FROM student_profiles WHERE user_id = $1`,
      [userId],
    );
  }

  // Load all roles with permissions
  const userRoles = await db.query(
    `SELECT ur.*, r.display_name, r.hierarchy_level,
            json_agg(p.permission_key) as permissions
     FROM user_roles ur
     JOIN roles r ON ur.role_key = r.role_key
     LEFT JOIN role_permissions rp ON r.role_key = rp.role_key
     LEFT JOIN permissions p ON rp.permission_key = p.permission_key
     WHERE ur.user_id = $1 AND ur.tenant_id = $2 AND ur.is_active = true
     GROUP BY ur.id, r.display_name, r.hierarchy_level`,
    [userId, tenantId],
  );

  return {
    user,
    ...(user.userType === 'EDUCATOR' && { educatorProfile: profile }),
    ...(user.userType === 'STUDENT' && { studentProfile: profile }),
    roles: userRoles,
  };
};
```

### Get Teacher's Students

```typescript
const getTeacherStudents = async (
  tenantId: string,
  teacherId: string,
): Promise<Student[]> => {
  return db.query(
    `SELECT DISTINCT s.* FROM students s
     JOIN user_roles ur ON ur.scope_id LIKE CONCAT('%', s.current_learning_path_code, '%')
     WHERE ur.user_id = $1 AND ur.tenant_id = $2
       AND ur.role_key = 'TEACHER' AND ur.is_active = true
     ORDER BY s.last_name, s.first_name`,
    [teacherId, tenantId],
  );
};
```

### Get Mentor's Students

```typescript
const getMentorStudents = async (
  tenantId: string,
  mentorId: string,
): Promise<User[]> => {
  return db.query(
    `SELECT u.* FROM users u
     JOIN user_roles ur ON u.id = ur.scope_id
     WHERE ur.user_id = $1 AND ur.tenant_id = $2
       AND ur.role_key = 'MENTOR' AND ur.scope_type = 'ONE_TO_ONE'
       AND ur.is_active = true
     ORDER BY u.last_name, u.first_name`,
    [mentorId, tenantId],
  );
};
```

### Check Permission with Scope

```typescript
const hasPermission = async (
  tenantId: string,
  userId: string,
  permissionKey: string,
  scopeType?: string,
  scopeId?: string,
): Promise<boolean> => {
  const result = await db.queryOne(
    `SELECT COUNT(*) as count FROM user_roles ur
     JOIN role_permissions rp ON ur.role_key = rp.role_key
     JOIN permissions p ON rp.permission_key = p.permission_key
     WHERE ur.user_id = $1 AND ur.tenant_id = $2
       AND p.permission_key = $3 AND ur.is_active = true
       ${scopeType ? 'AND ur.scope_type = $4' : ''}
       ${scopeId ? `AND ur.scope_id = $${scopeType ? 5 : 4}` : ''}`,
    scopeType && scopeId
      ? [userId, tenantId, permissionKey, scopeType, scopeId]
      : scopeType
        ? [userId, tenantId, permissionKey, scopeType]
        : [userId, tenantId, permissionKey],
  );

  return result.count > 0;
};
```

---

## Implementation Guide

### Step 1: Create Base Entities
- User (single table for all user types)
- Role (permission set definitions)
- Permission (granular actions)

### Step 2: Create Junction Tables
- UserRole (assign roles to users with scope)
- RolePermission (assign permissions to roles)

### Step 3: Create Type-Specific Profiles
- EducatorProfile (for EDUCATOR user type)
- StudentProfile (for STUDENT user type)

### Step 4: Seed Default Roles & Permissions
- 6-8 default educator roles
- 3-4 default student roles
- 20+ default permissions

### Step 5: Implement Permission Checks
- Create middleware to validate permissions
- Consider scope when checking permissions
- Cache permission checks for performance

### Step 6: Create Management APIs
- Assign role to user: POST /users/{id}/roles
- Update user permissions: PUT /users/{id}/roles/{roleId}
- List users by role: GET /roles/{roleKey}/users
- Check permissions: GET /users/{id}/permissions

---

## TypeScript Service Examples

### RoleService

```typescript
export const RoleService = function(roleRepo: RoleRepository) {
  /**
   * Assign role to user with scope
   */
  const assignRole = async (
    tenantId: string,
    userId: string,
    roleName: string,
    scopeType: string,
    scopeId?: string,
  ) => {
    // Verify user exists
    const user = await userRepo.findById(tenantId, userId);
    if (!user) throw new Error('User not found');

    // Get role definition
    const role = await roleRepo.findByKey(tenantId, roleName);
    if (!role) throw new Error('Role not found');

    // Verify scope validity
    if (scopeType === 'COHORT' && !scopeId) throw new Error('Cohort ID required');
    if (scopeType === 'ONE_TO_ONE' && !scopeId) throw new Error('Student ID required');

    // Create user role assignment
    return await userRoleRepo.create({
      tenantId,
      userId,
      roleKey: roleName,
      scopeType,
      scopeId,
      assignedDate: new Date(),
      isActive: true,
    });
  };

  /**
   * Get all permissions for user in scope
   */
  const getUserPermissions = async (
    tenantId: string,
    userId: string,
    scopeType?: string,
    scopeId?: string,
  ): Promise<string[]> => {
    const userRoles = await userRoleRepo.findByUserId(
      tenantId,
      userId,
      scopeType,
      scopeId,
    );

    const permissions = new Set<string>();

    for (const userRole of userRoles) {
      const rolePerms = await roleRepo.getPermissions(userRole.roleKey);
      rolePerms.forEach(p => permissions.add(p.permissionKey));

      // Add custom permissions if override is EXTEND
      if (userRole.permissionOverride === 'EXTEND' && userRole.customPermissions) {
        userRole.customPermissions.forEach(p => permissions.add(p));
      }

      // Remove custom permissions if override is RESTRICT
      if (userRole.permissionOverride === 'RESTRICT' && userRole.customPermissions) {
        userRole.customPermissions.forEach(p => permissions.delete(p));
      }
    }

    return Array.from(permissions);
  };

  return {
    assignRole,
    getUserPermissions,
    // ... more methods
  };
};
```

---

## Related to Student Entity

When a User with STUDENT user type is created, it must also have:

```typescript
// In Student creation
const createStudent = async (
  tenantId: string,
  userId: string,
  input: CreateStudentInput,
) => {
  // User already created with userType='STUDENT'
  
  // Create student profile
  const student = await studentProfileRepo.create({
    userId,
    enrollmentDate: input.enrollmentDate,
    expectedGraduationDate: input.expectedGraduationDate,
    currentLearningPathCode: input.learningPathCode,
    currentStatus: 'ENROLLED',
  });

  // Assign base STUDENT role
  await userRoleRepo.create({
    userId,
    roleKey: 'STUDENT',
    scopeType: 'LEARNING_PATH',
    scopeId: input.learningPathCode,
    assignedDate: new Date(),
    isActive: true,
  });

  return student;
};
```

---

## Summary

This role/hierarchy system provides:

✅ **Flexible Role Assignment** - Users can have multiple roles with different scopes  
✅ **Role Hierarchy** - Inheritance from Professor → Teacher → Mentor → Coach  
✅ **Granular Permissions** - Fine-grained actions (read, write, manage)  
✅ **Scope Control** - Same role can have different permissions based on scope  
✅ **Student & Educator Support** - Works for both user types  
✅ **Audit Trail** - Track who assigned what role when  
✅ **Permission Caching** - Performance optimization for frequent checks  

Perfect for:
- Swiss educational institutions with complex hierarchies
- Multi-level governance (Program Admin → Professor → Teacher → Student)
- Flexible mentoring relationships (1-on-1 coaching)
- Competency-based assessment and coaching

---

**Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Complete & Ready for Implementation
