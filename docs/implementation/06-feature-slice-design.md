# Feature Slice Design (FSD) Implementation

## Overview
Feature Slice Design is a non-negotiable architectural pattern for the Studently platform. It enforces high cohesion and low coupling by organizing code around business features rather than technical layers.

## Core Principles

### 1. Feature-First Organization
Code is organized by business features (student, timesheet, workflow), not technical layers (controllers, services, repositories).

### 2. Public API
Each feature exports a well-defined public API. Internal implementation details are private.

### 3. Unidirectional Dependencies
Features can only depend on:
- Shared layers (below them)
- Other features at the same level (carefully)
- Never on features above them

### 4. Layers

```
┌────────────────────────────────────────┐
│              App Layer                 │  ← Application initialization
├────────────────────────────────────────┤
│            Features Layer              │  ← Business features (student, timesheet)
├────────────────────────────────────────┤
│            Entities Layer              │  ← Business entities and schemas
├────────────────────────────────────────┤
│             Shared Layer               │  ← Reusable utilities, UI components
└────────────────────────────────────────┘
```

## Backend Structure

### Full Feature Slice Example: Student Feature

```
packages/backend/src/features/student/
├── index.ts                           # Public API exports
│
├── api/                               # External interface layer
│   ├── student.controller.ts          # HTTP request handlers
│   ├── student.routes.ts              # Route definitions
│   └── student.validation.ts          # Zod schemas for DTOs
│
├── model/                             # Domain models
│   ├── student.types.ts               # TypeScript interfaces
│   ├── student.entity.ts              # Entity definition
│   └── student-document.types.ts      # Related entities
│
├── lib/                               # Business logic
│   ├── student.service.ts             # Service (business logic)
│   ├── student.repository.ts          # Data access
│   ├── student-document.service.ts    # Sub-domain services
│   └── student-import.service.ts      # Feature-specific utilities
│
└── config/                            # Feature configuration
    └── student.config.ts
```

### index.ts (Public API)

```typescript
// packages/backend/src/features/student/index.ts

/**
 * Student Feature - Public API
 * 
 * This is the ONLY file that other features should import from.
 * Internal implementation details are private.
 */

// Export types
export type {
  Student,
  StudentDocument,
  CreateStudentInput,
  UpdateStudentInput,
  StudentFilters,
} from './model/student.types';

// Export service factory
export { StudentService } from './lib/student.service';

// Export routes (for app setup)
export { studentRoutes } from './api/student.routes';

// DO NOT export:
// - Repository (internal implementation)
// - Controller (internal implementation)
// - Validation schemas (internal to API layer)
```

### API Layer

```typescript
// packages/backend/src/features/student/api/student.controller.ts

import { Request, Response } from 'express';
import { StudentService } from '../lib/student.service';
import { getTenantContext } from '../../../shared/lib/tenant-context';
import { 
  CreateStudentSchema, 
  UpdateStudentSchema,
  StudentQuerySchema 
} from './student.validation';

/**
 * Student controller factory
 * NO classes allowed - use factory functions
 */
export const StudentController = function() {
  const studentService = StudentService();

  /**
   * GET /students
   * List students with cursor pagination
   */
  const findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = StudentQuerySchema.parse(req.query);
      const result = await studentService.findAll(query);
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * GET /students/:id
   * Get student by ID
   */
  const findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const student = await studentService.findById(id);
      
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * POST /students
   * Create new student
   */
  const create = async (req: Request, res: Response): Promise<void> => {
    try {
      const input = CreateStudentSchema.parse(req.body);
      const { userId } = getTenantContext();
      
      const student = await studentService.create(input, userId);
      
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * PATCH /students/:id
   * Update student
   */
  const update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const input = UpdateStudentSchema.parse(req.body);
      const { userId } = getTenantContext();
      
      const student = await studentService.update(id, input, userId);
      
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  /**
   * DELETE /students/:id
   * Soft delete student
   */
  const remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = getTenantContext();
      
      await studentService.softDelete(id, userId);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  return {
    findAll,
    findById,
    create,
    update,
    remove,
  };
};
```

```typescript
// packages/backend/src/features/student/api/student.routes.ts

import { Router } from 'express';
import { StudentController } from './student.controller';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/permission.middleware';

/**
 * Student routes
 */
export const studentRoutes = (): Router => {
  const router = Router();
  const controller = StudentController();

  // All routes require authentication
  router.use(authMiddleware);

  router.get('/', 
    requirePermission('student.read'),
    controller.findAll
  );
  
  router.get('/:id', 
    requirePermission('student.read'),
    controller.findById
  );
  
  router.post('/', 
    requirePermission('student.create'),
    controller.create
  );
  
  router.patch('/:id', 
    requirePermission('student.update'),
    controller.update
  );
  
  router.delete('/:id', 
    requirePermission('student.delete'),
    controller.remove
  );

  return router;
};
```

### Service Layer

```typescript
// packages/backend/src/features/student/lib/student.service.ts

import { StudentRepository } from './student.repository';
import { Student, CreateStudentInput, UpdateStudentInput } from '../model/student.types';
import { CursorPaginationRequest, CursorPaginationResponse } from '../../../shared/types';
import { getTenantId } from '../../../shared/lib/tenant-context';

/**
 * Student service factory
 * Contains business logic
 */
export const StudentService = function() {
  const repository = StudentRepository();

  /**
   * Find all students with pagination
   */
  const findAll = async (
    request: CursorPaginationRequest
  ): Promise<CursorPaginationResponse<Student>> => {
    const tenantId = getTenantId();
    return repository.findAll(tenantId, request);
  };

  /**
   * Find student by ID
   */
  const findById = async (id: string): Promise<Student | null> => {
    const tenantId = getTenantId();
    return repository.findById(tenantId, id);
  };

  /**
   * Create new student
   */
  const create = async (
    input: CreateStudentInput,
    createdBy: string
  ): Promise<Student> => {
    const tenantId = getTenantId();
    
    // Business logic: Generate student code
    const code = await generateStudentCode(tenantId);
    
    // Business logic: Validate unique email
    const existing = await repository.findByEmail(tenantId, input.email);
    if (existing) {
      throw new Error('Student with this email already exists');
    }
    
    const student: Student = {
      id: crypto.randomUUID(),
      sequence: 0, // Will be set by database trigger
      code,
      order: 0,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      updatedBy: createdBy,
      isSelected: false,
      isActive: true,
      currentStatus: 'ENROLLED',
      ...input,
    };
    
    return repository.create(student);
  };

  /**
   * Update student
   */
  const update = async (
    id: string,
    input: UpdateStudentInput,
    updatedBy: string
  ): Promise<Student | null> => {
    const tenantId = getTenantId();
    
    // Business logic: Check if student exists
    const existing = await repository.findById(tenantId, id);
    if (!existing) {
      return null;
    }
    
    // Business logic: Validate email change
    if (input.email && input.email !== existing.email) {
      const emailTaken = await repository.findByEmail(tenantId, input.email);
      if (emailTaken && emailTaken.id !== id) {
        throw new Error('Email already in use');
      }
    }
    
    return repository.update(tenantId, id, {
      ...input,
      updatedAt: new Date().toISOString(),
      updatedBy,
    });
  };

  /**
   * Soft delete student
   */
  const softDelete = async (id: string, deletedBy: string): Promise<void> => {
    const tenantId = getTenantId();
    await repository.update(tenantId, id, {
      isActive: false,
      updatedAt: new Date().toISOString(),
      updatedBy: deletedBy,
    });
  };

  /**
   * Generate unique student code
   * Format: STU-{year}-{sequence}
   */
  const generateStudentCode = async (tenantId: string): Promise<string> => {
    const year = new Date().getFullYear();
    const count = await repository.countByYear(tenantId, year);
    const sequence = String(count + 1).padStart(4, '0');
    return `STU-${year}-${sequence}`;
  };

  return {
    findAll,
    findById,
    create,
    update,
    softDelete,
  };
};
```

### Repository Layer

```typescript
// packages/backend/src/features/student/lib/student.repository.ts

import { db } from '../../../shared/lib/database';
import { Student } from '../model/student.types';
import { CursorPaginationRequest, CursorPaginationResponse } from '../../../shared/types';

/**
 * Student repository factory
 * Handles data access
 */
export const StudentRepository = function() {
  const TABLE_NAME = 'students';

  /**
   * Find all with cursor pagination
   */
  const findAll = async (
    tenantId: string,
    request: CursorPaginationRequest
  ): Promise<CursorPaginationResponse<Student>> => {
    const { cursor, limit = 20, filters = {} } = request;
    
    let query = db(TABLE_NAME)
      .where({ tenant_id: tenantId, is_active: true })
      .orderBy('sequence', 'asc');
    
    // Apply cursor
    if (cursor) {
      query = query.where('sequence', '>', cursor);
    }
    
    // Apply filters
    if (filters.status) {
      query = query.where('current_status', filters.status);
    }
    if (filters.learningPathCode) {
      query = query.where('current_learning_path_code', filters.learningPathCode);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('first_name', 'ilike', `%${filters.search}%`)
          .orWhere('last_name', 'ilike', `%${filters.search}%`)
          .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }
    
    // Fetch limit + 1 to check for more items
    const items = await query.limit(limit + 1);
    
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? resultItems[resultItems.length - 1].sequence : null;
    
    return {
      items: resultItems.map(mapToStudent),
      nextCursor,
      hasMore,
    };
  };

  /**
   * Find by ID
   */
  const findById = async (tenantId: string, id: string): Promise<Student | null> => {
    const row = await db(TABLE_NAME)
      .where({ tenant_id: tenantId, id })
      .first();
    
    return row ? mapToStudent(row) : null;
  };

  /**
   * Find by email
   */
  const findByEmail = async (tenantId: string, email: string): Promise<Student | null> => {
    const row = await db(TABLE_NAME)
      .where({ tenant_id: tenantId, email })
      .first();
    
    return row ? mapToStudent(row) : null;
  };

  /**
   * Create student
   */
  const create = async (student: Student): Promise<Student> => {
    const [row] = await db(TABLE_NAME)
      .insert(mapToDb(student))
      .returning('*');
    
    return mapToStudent(row);
  };

  /**
   * Update student
   */
  const update = async (
    tenantId: string,
    id: string,
    updates: Partial<Student>
  ): Promise<Student | null> => {
    const [row] = await db(TABLE_NAME)
      .where({ tenant_id: tenantId, id })
      .update(mapToDb(updates))
      .returning('*');
    
    return row ? mapToStudent(row) : null;
  };

  /**
   * Count students by enrollment year
   */
  const countByYear = async (tenantId: string, year: number): Promise<number> => {
    const result = await db(TABLE_NAME)
      .where({ tenant_id: tenantId })
      .whereRaw(`EXTRACT(YEAR FROM enrollment_date) = ?`, [year])
      .count('* as count')
      .first();
    
    return Number(result?.count || 0);
  };

  /**
   * Map database row to Student entity
   */
  const mapToStudent = (row: any): Student => ({
    id: row.id,
    sequence: row.sequence,
    code: row.code,
    order: row.order,
    tenantId: row.tenant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    isSelected: row.is_selected,
    isActive: row.is_active,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    nationality: row.nationality,
    email: row.email,
    phone: row.phone,
    mobilePhone: row.mobile_phone,
    streetAddress: row.street_address,
    city: row.city,
    postalCode: row.postal_code,
    canton: row.canton,
    country: row.country,
    orpNumber: row.orp_number,
    employmentStatus: row.employment_status,
    avsNumber: row.avs_number,
    enrollmentDate: row.enrollment_date,
    expectedGraduationDate: row.expected_graduation_date,
    currentLearningPathCode: row.current_learning_path_code,
    currentStatus: row.current_status,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    emergencyContactRelationship: row.emergency_contact_relationship,
    profileImageUrl: row.profile_image_url,
    notes: row.notes,
  });

  /**
   * Map Student entity to database row
   */
  const mapToDb = (student: Partial<Student>): any => {
    const row: any = {};
    
    if (student.id !== undefined) row.id = student.id;
    if (student.code !== undefined) row.code = student.code;
    if (student.order !== undefined) row.order = student.order;
    if (student.tenantId !== undefined) row.tenant_id = student.tenantId;
    if (student.createdBy !== undefined) row.created_by = student.createdBy;
    if (student.updatedBy !== undefined) row.updated_by = student.updatedBy;
    if (student.isSelected !== undefined) row.is_selected = student.isSelected;
    if (student.isActive !== undefined) row.is_active = student.isActive;
    if (student.firstName !== undefined) row.first_name = student.firstName;
    if (student.lastName !== undefined) row.last_name = student.lastName;
    // ... map all other fields
    
    return row;
  };

  return {
    findAll,
    findById,
    findByEmail,
    create,
    update,
    countByYear,
  };
};
```

## Frontend Structure

### Feature Slice for Student (Frontend)

```
packages/frontend/src/features/student/
├── index.ts                           # Public API
│
├── api/                               # API communication
│   └── student.api.ts                 # Axios calls to backend
│
├── model/                             # Domain models
│   ├── student.types.ts               # TypeScript interfaces
│   └── student.store.ts               # Zustand store
│
├── lib/                               # Business logic
│   ├── student.hooks.ts               # React hooks
│   └── student.utils.ts               # Utility functions
│
└── ui/                                # UI components
    ├── student-list.tsx               # List view
    ├── student-detail.tsx             # Detail view
    ├── student-form.tsx               # Create/Edit form
    └── student-card.tsx               # Card component
```

### Frontend Feature Example

```typescript
// packages/frontend/src/features/student/index.ts

export { StudentList } from './ui/student-list';
export { StudentDetail } from './ui/student-detail';
export { StudentForm } from './ui/student-form';

export { useStudents, useStudent, useCreateStudent } from './lib/student.hooks';

export type { Student, CreateStudentInput } from './model/student.types';
```

```typescript
// packages/frontend/src/features/student/lib/student.hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/student.api';
import { Student, CreateStudentInput } from '../model/student.types';

/**
 * Hook to fetch students with cursor pagination
 */
export const useStudents = function(cursor?: number, limit: number = 20) {
  return useQuery({
    queryKey: ['students', cursor, limit],
    queryFn: () => studentApi.findAll({ cursor, limit }),
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch single student
 */
export const useStudent = function(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentApi.findById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create student
 */
export const useCreateStudent = function() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateStudentInput) => studentApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};
```

## Shared Layer

### Shared Structure

```
packages/backend/src/shared/
├── lib/                               # Utilities
│   ├── database.ts                    # Database connection
│   ├── tenant-context.ts              # Tenant context
│   ├── logger.ts                      # Logging
│   └── cache.ts                       # Redis cache
│
├── middleware/                        # Express middleware
│   ├── auth.middleware.ts
│   ├── permission.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
│
├── types/                             # Shared types
│   ├── pagination.types.ts
│   ├── api.types.ts
│   └── index.ts
│
└── config/                            # Configuration
    └── app.config.ts
```

## Dependency Rules

### ✅ Allowed Dependencies

```typescript
// Feature can import from shared
import { getTenantId } from '../../../shared/lib/tenant-context';
import { db } from '../../../shared/lib/database';

// Feature can import from entities
import { BaseEntity } from '../../../entities/base-entity';

// Feature can import from another feature's PUBLIC API
import { WorkflowService } from '../../workflow'; // OK - public API

// Shared can import from entities
import { BaseEntity } from '../../entities/base-entity';
```

### ❌ Forbidden Dependencies

```typescript
// Feature CANNOT import from app
import { app } from '../../../app'; // FORBIDDEN

// Feature CANNOT import internals from another feature
import { StudentRepository } from '../../student/lib/student.repository'; // FORBIDDEN

// Shared CANNOT import from features
import { StudentService } from '../../features/student/lib/student.service'; // FORBIDDEN
```

## App Layer

```typescript
// packages/backend/src/app.ts

import express from 'express';
import { studentRoutes } from './features/student';
import { timesheetRoutes } from './features/timesheet';
import { workflowRoutes } from './features/workflow';
import { authMiddleware } from './shared/middleware/auth.middleware';
import { errorMiddleware } from './shared/middleware/error.middleware';

const app = express();

// Global middleware
app.use(express.json());
app.use(authMiddleware);

// Feature routes
app.use('/api/v1/students', studentRoutes());
app.use('/api/v1/timesheets', timesheetRoutes());
app.use('/api/v1/workflows', workflowRoutes());

// Error handling
app.use(errorMiddleware);

export { app };
```

## Testing Strategy

### Unit Tests (Per Feature)

```typescript
// packages/backend/src/features/student/lib/student.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';

// Mock repository
vi.mock('./student.repository');

describe('StudentService', () => {
  let service: ReturnType<typeof StudentService>;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    
    vi.mocked(StudentRepository).mockReturnValue(mockRepository);
    
    service = StudentService();
  });

  it('should create student with generated code', async () => {
    const input = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      enrollmentDate: '2026-03-17',
    };
    
    mockRepository.create.mockResolvedValue({ id: '123', ...input });
    
    const result = await service.create(input, 'user-123');
    
    expect(result.code).toMatch(/^STU-\d{4}-\d{4}$/);
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
