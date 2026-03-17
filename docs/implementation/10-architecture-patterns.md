# Architecture & Design Patterns Strategy

## Overview

Based on the Studently platform architecture, we can leverage **11 core design patterns** to avoid monolithic implementations and maintain modularity, scalability, and testability from day one.

---

## 1. Domain-Driven Design (DDD) - Core Architecture

**Status**: ✅ Already identified in docs  
**Scope**: Entire application

### Bounded Contexts (Domains)

```
┌──────────────────────────────────────────────────────────────┐
│                    STUDENTLY PLATFORM                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │   Identity  │  │   Learning  │  │    Workflow      │     │
│  │  (Auth)     │  │    (Path)   │  │    (Engine)      │     │
│  │             │  │             │  │                  │     │
│  │ - Users     │  │ - Paths     │  │ - Tasks          │     │
│  │ - Roles     │  │ - Cohorts   │  │ - Decisions      │     │
│  │ - Perms     │  │ - Classes   │  │ - Events         │     │
│  │ - JWT       │  │ - Progress  │  │ - Transitions    │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
│                                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐     │
│  │  AI Engine  │  │  Compliance │  │   Timesheets    │     │
│  │             │  │  (Swiss)    │  │                  │     │
│  │ - OpenAI    │  │             │  │ - Hours          │     │
│  │ - Anthropic │  │ - ORP       │  │ - Absences       │     │
│  │ - Analysis  │  │ - LACI/RI   │  │ - Reports        │     │
│  │ - Generation│  │ - Labor Law │  │ - Validation     │     │
│  └─────────────┘  └─────────────┘  └──────────────────┘     │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Implementation Structure

```
src/domains/
├── identity/                    # Auth & User Management
│   ├── core/
│   │   ├── user.types.ts
│   │   ├── role.types.ts
│   │   ├── permission.types.ts
│   │   ├── user-repository.ts
│   │   ├── role-repository.ts
│   │   └── auth-service.ts
│   ├── application/
│   │   ├── create-user.ts
│   │   ├── assign-role.ts
│   │   └── validate-token.ts
│   └── index.ts
│
├── learning/                    # Learning Paths & Curriculum
│   ├── core/
│   │   ├── learning-path.types.ts
│   │   ├── cohort.types.ts
│   │   ├── competency.types.ts
│   │   ├── learning-path-repository.ts
│   │   └── curriculum-service.ts
│   ├── application/
│   │   ├── create-learning-path.ts
│   │   ├── enroll-student.ts
│   │   └── track-progress.ts
│   └── index.ts
│
├── workflow/                    # Generic Workflow Engine
│   ├── core/
│   │   ├── workflow.types.ts
│   │   ├── step.types.ts
│   │   ├── transition.types.ts
│   │   ├── workflow-repository.ts
│   │   └── workflow-engine.ts
│   ├── application/
│   │   ├── create-workflow.ts
│   │   ├── execute-step.ts
│   │   └── handle-decision.ts
│   └── index.ts
│
├── ai/                          # AI Integration
│   ├── core/
│   │   ├── ai-provider.types.ts
│   │   ├── openai-adapter.ts
│   │   ├── anthropic-adapter.ts
│   │   └── ai-service.ts
│   ├── application/
│   │   ├── analyze-document.ts
│   │   └── generate-feedback.ts
│   └── index.ts
│
├── compliance/                  # Swiss Compliance
│   ├── core/
│   │   ├── orp.types.ts
│   │   ├── laci-validator.ts
│   │   ├── labor-law-validator.ts
│   │   └── compliance-service.ts
│   ├── application/
│   │   ├── validate-work-hours.ts
│   │   └── generate-compliance-report.ts
│   └── index.ts
│
└── timesheets/                  # Timesheet Management
    ├── core/
    │   ├── timesheet.types.ts
    │   ├── timesheet-repository.ts
    │   └── timesheet-service.ts
    ├── application/
    │   ├── log-hours.ts
    │   ├── record-absence.ts
    │   └── validate-hours.ts
    └── index.ts

src/shared/                      # Cross-domain Shared Code
├── types/
│   ├── base-entity.types.ts
│   ├── translation.types.ts
│   └── pagination.types.ts
├── utils/
│   ├── guid.ts
│   ├── sequence.ts
│   └── error-handling.ts
├── decorators/
│   ├── audit.decorator.ts
│   ├── permission-check.decorator.ts
│   └── rate-limit.decorator.ts
├── middleware/
│   ├── auth-middleware.ts
│   ├── tenant-middleware.ts
│   └── error-middleware.ts
└── index.ts
```

### DDD Layers (Onion Architecture)

```
┌─────────────────────────────────────────┐
│    API/HTTP Controllers (Presentation)   │
├─────────────────────────────────────────┤
│    Application Services (Use Cases)      │
├─────────────────────────────────────────┤
│    Domain Services (Business Logic)      │
├─────────────────────────────────────────┤
│    Domain Entities & Value Objects       │
├─────────────────────────────────────────┤
│    Infrastructure (DB, Cache, APIs)      │
└─────────────────────────────────────────┘
```

---

## 2. Repository Pattern - Data Access

**Purpose**: Abstract data access, support multiple persistence backends  
**Modules**: All domains

### Implementation

```typescript
// src/domains/identity/core/user-repository.ts
export interface IUserRepository {
  findById(tenantId: string, userId: string): Promise<User | null>;
  findByEmail(tenantId: string, email: string): Promise<User | null>;
  create(tenantId: string, user: CreateUserInput): Promise<User>;
  update(tenantId: string, userId: string, updates: Partial<User>): Promise<User>;
  delete(tenantId: string, userId: string): Promise<void>;
  findByRole(tenantId: string, roleKey: string): Promise<User[]>;
  // Pagination
  findPaginated(tenantId: string, query: PaginationQuery): Promise<PaginatedResult<User>>;
}

export const UserRepository = function(db: Database): IUserRepository {
  const findById = async (tenantId: string, userId: string): Promise<User | null> => {
    return db.queryOne<User>(
      'SELECT * FROM users WHERE id = $1 AND tenant_id = $2',
      [userId, tenantId],
    );
  };

  const create = async (tenantId: string, user: CreateUserInput): Promise<User> => {
    const id = generateGuid();
    return db.queryOne<User>(
      `INSERT INTO users (id, tenant_id, first_name, last_name, email, user_type, status, created_at, updated_at, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $8)
       RETURNING *`,
      [id, tenantId, user.firstName, user.lastName, user.email, user.userType, 'ACTIVE', id],
    );
  };

  return { findById, create, update, delete, findByRole, findPaginated };
};
```

**Benefits**:
- Swap PostgreSQL for MongoDB without changing business logic
- Easy mocking for tests
- Consistent query interface across domains

---

## 3. Factory Pattern - Complex Object Creation

**Purpose**: Encapsulate creation of complex entities  
**Modules**: Identity, Learning, Workflow

### Implementation

```typescript
// src/domains/identity/core/create-user.ts
export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'STUDENT' | 'EDUCATOR' | 'ADMIN';
  dateOfBirth?: string;
  preferredLanguage?: string;
}

export const CreateUserFactory = function(
  userRepository: IUserRepository,
  profileRepository: IProfileRepository,
) {
  const execute = async (
    tenantId: string,
    input: CreateUserInput,
    createdBy: string,
  ): Promise<User> => {
    // Validate
    if (!input.email.includes('@')) throw new Error('Invalid email');
    
    const existingUser = await userRepository.findByEmail(tenantId, input.email);
    if (existingUser) throw new Error('User already exists');

    // Create User
    const user = await userRepository.create(tenantId, {
      ...input,
      status: 'ACTIVE',
      createdBy,
    });

    // Create type-specific profile
    if (input.userType === 'STUDENT') {
      await profileRepository.createStudentProfile(tenantId, user.id);
    } else if (input.userType === 'EDUCATOR') {
      await profileRepository.createEducatorProfile(tenantId, user.id);
    }

    // Assign base role
    const baseRole = input.userType === 'STUDENT' ? 'STUDENT' : 'EDUCATOR';
    // Assign role logic...

    return user;
  };

  return { execute };
};
```

**Benefits**:
- Encapsulates complex creation logic
- Ensures invariants (every User gets profile + role)
- Easy to test

---

## 4. Strategy Pattern - Pluggable Implementations

**Purpose**: Multiple algorithms interchangeable at runtime  
**Modules**: AI, Compliance, Workflow

### AI Provider Example

```typescript
// src/domains/ai/core/ai-provider.types.ts
export interface IAIProvider {
  name: string;
  analyzeDocument(document: string, context: AnalysisContext): Promise<Analysis>;
  generateFeedback(progress: StudentProgress): Promise<string>;
  isAvailable(): Promise<boolean>;
}

// src/domains/ai/core/openai-adapter.ts
export const OpenAIAdapter = function(apiKey: string): IAIProvider {
  const analyzeDocument = async (
    document: string,
    context: AnalysisContext,
  ): Promise<Analysis> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: document }],
      }),
    });
    // Parse and return analysis
  };

  const generateFeedback = async (progress: StudentProgress): Promise<string> => {
    // OpenAI-specific implementation
  };

  return {
    name: 'OpenAI',
    analyzeDocument,
    generateFeedback,
    isAvailable: async () => true,
  };
};

// src/domains/ai/core/anthropic-adapter.ts
export const AnthropicAdapter = function(apiKey: string): IAIProvider {
  const analyzeDocument = async (
    document: string,
    context: AnalysisContext,
  ): Promise<Analysis> => {
    // Anthropic-specific implementation
  };

  return {
    name: 'Anthropic',
    analyzeDocument,
    generateFeedback,
    isAvailable,
  };
};

// src/domains/ai/core/ai-service.ts
export const AIService = function(providers: IAIProvider[]): IAIService {
  const analyze = async (
    document: string,
    context: AnalysisContext,
    preferredProvider?: string,
  ): Promise<Analysis> => {
    let provider: IAIProvider | undefined;

    if (preferredProvider) {
      provider = providers.find(p => p.name === preferredProvider);
    } else {
      provider = providers.find(p => p.isAvailable());
    }

    if (!provider) throw new Error('No AI provider available');
    return provider.analyzeDocument(document, context);
  };

  return { analyze };
};
```

**Benefits**:
- Add new AI providers without modifying existing code
- Switch providers at runtime
- Comply with GDPR (can route to EU-only providers)

---

## 5. Observer/Event Pattern - Decoupled Communication

**Purpose**: Decouple domains via events (Auth → Learning, Workflow → AI)  
**Modules**: All domains

### Implementation

```typescript
// src/shared/events/event-emitter.ts
export type EventHandler<T = any> = (event: T) => Promise<void> | void;

export interface IEventEmitter {
  on<T>(eventType: string, handler: EventHandler<T>): void;
  emit<T>(eventType: string, event: T): Promise<void>;
  off<T>(eventType: string, handler: EventHandler<T>): void;
}

export const EventEmitter = function(): IEventEmitter {
  const handlers: Map<string, EventHandler[]> = new Map();

  const on = function<T>(eventType: string, handler: EventHandler<T>): void {
    if (!handlers.has(eventType)) {
      handlers.set(eventType, []);
    }
    handlers.get(eventType)!.push(handler as EventHandler);
  };

  const emit = async function<T>(eventType: string, event: T): Promise<void> {
    const eventHandlers = handlers.get(eventType) || [];
    await Promise.all(eventHandlers.map(h => h(event)));
  };

  const off = function<T>(eventType: string, handler: EventHandler<T>): void {
    const eventHandlers = handlers.get(eventType) || [];
    const index = eventHandlers.indexOf(handler as EventHandler);
    if (index > -1) eventHandlers.splice(index, 1);
  };

  return { on, emit, off };
};

// Event types
export const UserEvents = {
  CREATED: 'user:created',
  UPDATED: 'user:updated',
  DELETED: 'user:deleted',
  ROLE_ASSIGNED: 'user:role-assigned',
} as const;

export type UserCreatedEvent = {
  userId: string;
  email: string;
  userType: 'STUDENT' | 'EDUCATOR' | 'ADMIN';
  createdAt: string;
};

// In Identity Domain - emit event
export const CreateUserFactory = function(
  userRepository: IUserRepository,
  eventEmitter: IEventEmitter,
) {
  const execute = async (tenantId: string, input: CreateUserInput): Promise<User> => {
    const user = await userRepository.create(tenantId, input);

    // Emit event (Learning domain listens)
    await eventEmitter.emit<UserCreatedEvent>(UserEvents.CREATED, {
      userId: user.id,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt,
    });

    return user;
  };

  return { execute };
};

// In Learning Domain - listen to event
export const OnUserCreated = function(
  learningPathRepository: ILearningPathRepository,
) {
  const handle = async (event: UserCreatedEvent): Promise<void> => {
    if (event.userType === 'STUDENT') {
      // Initialize student learning profile
      // Don't call identity service - listen to event instead!
    }
  };

  return { handle };
};
```

**Benefits**:
- Zero coupling between domains
- User domain doesn't know about Learning
- Easy to add new domain listeners
- Async processing support

---

## 6. Decorator Pattern - Cross-Cutting Concerns

**Purpose**: Add behavior (audit, permissions, rate-limiting) without modifying core logic  
**Modules**: All domains

### Implementation

```typescript
// src/shared/decorators/audit.decorator.ts
export interface AuditLog {
  entityId: string;
  entityType: string;
  action: string;
  userId: string;
  timestamp: string;
  changes: Record<string, any>;
  ipAddress?: string;
}

export const Auditable = function(
  auditRepository: IAuditRepository,
) {
  return function<T extends Function>(target: T, propertyKey: string): T {
    return (async (...args: any[]) => {
      const userId = args[args.length - 2]; // context arg
      const originalData = args[0];

      const result = await target(...args);

      // Log audit
      const auditLog: AuditLog = {
        entityId: result.id,
        entityType: 'User',
        action: propertyKey,
        userId,
        timestamp: new Date().toISOString(),
        changes: {
          before: originalData,
          after: result,
        },
      };

      await auditRepository.create(auditLog);
      return result;
    }) as unknown as T;
  };
};

// Usage
export const CreateUserFactory = function(
  userRepository: IUserRepository,
  auditRepository: IAuditRepository,
) {
  const auditableCreate = Auditable(auditRepository)(async (input, context) => {
    return userRepository.create(input);
  });

  const execute = async (input: CreateUserInput, context: Context) => {
    return auditableCreate(input, context);
  };

  return { execute };
};

// src/shared/decorators/permission-check.decorator.ts
export const RequiresPermission = function(
  permissionKey: string,
  roleService: IRoleService,
) {
  return function<T extends Function>(target: T): T {
    return (async (...args: any[]) => {
      const context = args[args.length - 1] as Context;

      const hasPermission = await roleService.checkPermission(
        context.userId,
        context.tenantId,
        permissionKey,
      );

      if (!hasPermission) {
        throw new Error(`Permission denied: ${permissionKey}`);
      }

      return target(...args);
    }) as unknown as T;
  };
};
```

**Benefits**:
- Separate concerns (audit, permissions, rate-limiting)
- Reusable across all domains
- Doesn't pollute business logic

---

## 7. Command Pattern - Audit Trail & Undo

**Purpose**: Encapsulate requests as objects for audit history  
**Modules**: Workflow, Timesheets, Learning

### Implementation

```typescript
// src/shared/commands/command.types.ts
export interface ICommand<T = any> {
  execute(): Promise<T>;
  undo(): Promise<void>;
  getDescription(): string;
}

// src/domains/workflow/core/execute-workflow-step.ts
export interface ExecuteStepCommand extends ICommand {
  stepId: string;
  workflowId: string;
  context: WorkflowContext;
}

export const ExecuteWorkflowStep = function(
  workflowRepository: IWorkflowRepository,
  commandHistory: ICommandHistory,
): ExecuteStepCommand {
  const execute = async (): Promise<StepResult> => {
    const workflow = await workflowRepository.findById(workflowId);
    const step = workflow.steps.find(s => s.id === stepId);

    if (!step) throw new Error('Step not found');

    const result = await executeStep(step, context);

    // Record in history for undo/replay
    await commandHistory.record({
      id: generateGuid(),
      workflowId,
      stepId,
      command: 'EXECUTE_STEP',
      timestamp: new Date().toISOString(),
      result,
    });

    return result;
  };

  const undo = async (): Promise<void> => {
    // Revert workflow to previous state
    await workflowRepository.update(workflowId, {
      currentStepIndex: currentStepIndex - 1,
    });
  };

  const getDescription = (): string => {
    return `Execute workflow ${workflowId} step ${stepId}`;
  };

  return { execute, undo, getDescription };
};
```

**Benefits**:
- Complete audit trail of all state changes
- Ability to undo operations
- Replay workflows for debugging
- GDPR compliance (track all data changes)

---

## 8. Adapter Pattern - External Service Integration

**Purpose**: Integrate with external services (Mailing, SMS, Payment)  
**Modules**: Infrastructure, Learning, Compliance

### Implementation

```typescript
// src/shared/adapters/email-service.types.ts
export interface IEmailAdapter {
  send(to: string, subject: string, body: string): Promise<void>;
  sendTemplate(to: string, templateId: string, variables: Record<string, any>): Promise<void>;
}

// src/shared/adapters/smtp-adapter.ts
export const SMTPAdapter = function(config: SMTPConfig): IEmailAdapter {
  const send = async (to: string, subject: string, body: string): Promise<void> => {
    // SMTP implementation
  };

  const sendTemplate = async (
    to: string,
    templateId: string,
    variables: Record<string, any>,
  ): Promise<void> => {
    // Template rendering + sending
  };

  return { send, sendTemplate };
};

// src/shared/adapters/sendgrid-adapter.ts
export const SendGridAdapter = function(apiKey: string): IEmailAdapter {
  const send = async (to: string, subject: string, body: string): Promise<void> => {
    // SendGrid API implementation
  };

  return { send, sendTemplate };
};

// src/domains/learning/core/student-enrollment-service.ts
export const StudentEnrollmentService = function(
  enrollmentRepository: IEnrollmentRepository,
  emailAdapter: IEmailAdapter,
) {
  const enrollStudent = async (
    studentId: string,
    learningPathId: string,
  ): Promise<Enrollment> => {
    const enrollment = await enrollmentRepository.create({
      studentId,
      learningPathId,
      status: 'ENROLLED',
    });

    // Send welcome email via any adapter
    await emailAdapter.sendTemplate(student.email, 'WELCOME_STUDENT', {
      studentName: student.firstName,
      programName: learningPath.name,
    });

    return enrollment;
  };

  return { enrollStudent };
};
```

**Benefits**:
- Switch email/SMS providers without code changes
- Easy to test with mock adapters
- Decouples from vendor-specific APIs

---

## 9. Chain of Responsibility - Permission Checking

**Purpose**: Check permissions through multiple validation steps  
**Modules**: Identity, All domains

### Implementation

```typescript
// src/shared/permissions/permission-chain.ts
export interface IPermissionValidator {
  validate(context: PermissionContext): Promise<boolean>;
  setNext(validator: IPermissionValidator): void;
}

export const TenantValidator = function(): IPermissionValidator {
  let next: IPermissionValidator | null = null;

  const validate = async (context: PermissionContext): Promise<boolean> => {
    // Check if user belongs to tenant
    if (context.userTenantId !== context.resourceTenantId) {
      return false;
    }
    return next ? next.validate(context) : true;
  };

  const setNext = (validator: IPermissionValidator): void => {
    next = validator;
  };

  return { validate, setNext };
};

export const RoleValidator = function(
  roleRepository: IRoleRepository,
): IPermissionValidator {
  let next: IPermissionValidator | null = null;

  const validate = async (context: PermissionContext): Promise<boolean> => {
    const userRoles = await roleRepository.findByUserId(context.userId);
    const hasRole = userRoles.some(r => r.roleKey === context.requiredRole);

    if (!hasRole) return false;
    return next ? next.validate(context) : true;
  };

  const setNext = (validator: IPermissionValidator): void => {
    next = validator;
  };

  return { validate, setNext };
};

export const ScopeValidator = function(
  roleRepository: IRoleRepository,
): IPermissionValidator {
  let next: IPermissionValidator | null = null;

  const validate = async (context: PermissionContext): Promise<boolean> => {
    const userRole = await roleRepository.findUserRoleInScope(
      context.userId,
      context.requiredRole,
      context.scopeType,
      context.scopeId,
    );

    if (!userRole) return false;
    return next ? next.validate(context) : true;
  };

  const setNext = (validator: IPermissionValidator): void => {
    next = validator;
  };

  return { validate, setNext };
};

// Usage
export const CheckPermission = function(
  roleRepository: IRoleRepository,
): (context: PermissionContext) => Promise<boolean> => {
  const tenantValidator = TenantValidator();
  const roleValidator = RoleValidator(roleRepository);
  const scopeValidator = ScopeValidator(roleRepository);

  // Chain: Tenant → Role → Scope
  tenantValidator.setNext(roleValidator);
  roleValidator.setNext(scopeValidator);

  return (context: PermissionContext) => tenantValidator.validate(context);
};
```

**Benefits**:
- Multiple validation layers
- Easy to add new validators
- Each validator independent

---

## 10. Template Method Pattern - Workflow Steps

**Purpose**: Define algorithm skeleton, let subclasses fill in details  
**Modules**: Workflow, Learning, Compliance

### Implementation

```typescript
// src/domains/workflow/core/workflow-step-template.ts
export abstract interface IWorkflowStepTemplate {
  execute(context: WorkflowContext): Promise<StepResult>;
  validate(context: WorkflowContext): Promise<boolean>;
  onSuccess(result: StepResult, context: WorkflowContext): Promise<void>;
  onFailure(error: Error, context: WorkflowContext): Promise<void>;
}

export const WorkflowStepTemplate = function(): IWorkflowStepTemplate {
  const executeStep = async (context: WorkflowContext): Promise<StepResult> => {
    // Template method - orchestrates the flow
    const isValid = await validate(context);
    if (!isValid) throw new Error('Validation failed');

    try {
      const result = await execute(context);
      await onSuccess(result, context);
      return result;
    } catch (error) {
      await onFailure(error as Error, context);
      throw error;
    }
  };

  const validate = async (context: WorkflowContext): Promise<boolean> => {
    return true; // Default - override in subclass
  };

  const execute = async (context: WorkflowContext): Promise<StepResult> => {
    throw new Error('Must implement execute()');
  };

  const onSuccess = async (result: StepResult, context: WorkflowContext): Promise<void> => {
    // Default - override if needed
  };

  const onFailure = async (error: Error, context: WorkflowContext): Promise<void> => {
    // Default - override for custom error handling
  };

  return { executeStep, validate, execute, onSuccess, onFailure };
};

// Concrete implementations
export const DocumentAnalysisStep = function(
  aiService: IAIService,
  workflowRepository: IWorkflowRepository,
): IWorkflowStepTemplate {
  const base = WorkflowStepTemplate();

  const validate = async (context: WorkflowContext): Promise<boolean> => {
    // Validate document exists
    return !!context.documentId;
  };

  const execute = async (context: WorkflowContext): Promise<StepResult> => {
    const document = await documentRepository.findById(context.documentId);
    const analysis = await aiService.analyzeDocument(document.content);
    return { type: 'ANALYSIS', data: analysis };
  };

  const onSuccess = async (result: StepResult): Promise<void> => {
    // Send notification to teacher
    await notificationService.send('analysis_complete', result);
  };

  return {
    executeStep: base.executeStep,
    validate,
    execute,
    onSuccess,
    onFailure: base.onFailure,
  };
};

export const FeedbackGenerationStep = function(
  aiService: IAIService,
): IWorkflowStepTemplate {
  const base = WorkflowStepTemplate();

  const validate = async (context: WorkflowContext): Promise<boolean> => {
    // Validate analysis exists
    return !!context.analysisId;
  };

  const execute = async (context: WorkflowContext): Promise<StepResult> => {
    const analysis = await analysisRepository.findById(context.analysisId);
    const feedback = await aiService.generateFeedback(analysis);
    return { type: 'FEEDBACK', data: feedback };
  };

  return {
    executeStep: base.executeStep,
    validate,
    execute,
    onSuccess: base.onSuccess,
    onFailure: base.onFailure,
  };
};
```

**Benefits**:
- Consistent workflow execution
- Easy to add new step types
- Shared behavior (validation, error handling)

---

## 11. CQRS (Command Query Responsibility Segregation)

**Purpose**: Separate read and write models for complex queries  
**Modules**: Learning (progress reports), Compliance (audit reports)

### Implementation

```typescript
// src/domains/learning/core/student-progress.cqrs.ts

// COMMAND - Write operation
export interface UpdateProgressCommand {
  studentId: string;
  competencyId: string;
  level: number;
  evidence: string;
}

export const UpdateStudentProgressCommand = function(
  progressRepository: IProgressRepository,
  eventEmitter: IEventEmitter,
) {
  const execute = async (command: UpdateProgressCommand): Promise<void> => {
    const progress = await progressRepository.update({
      studentId: command.studentId,
      competencyId: command.competencyId,
      level: command.level,
      evidence: command.evidence,
      updatedAt: new Date().toISOString(),
    });

    // Emit event for read model to consume
    await eventEmitter.emit('StudentProgressUpdated', progress);
  };

  return { execute };
};

// QUERY - Read operation from denormalized view
export interface GetStudentProgressQuery {
  studentId: string;
  competencyId?: string;
  includeMetrics?: boolean;
}

export interface StudentProgressView {
  studentId: string;
  competencies: {
    id: string;
    name: string;
    level: number;
    progress: number; // percentage
    completedDate?: string;
  }[];
  overallProgress: number;
  estimatedCompletionDate: string;
}

export const GetStudentProgressQuery = function(
  progressViewRepository: IProgressViewRepository,
) {
  const execute = async (query: GetStudentProgressQuery): Promise<StudentProgressView> => {
    // Query pre-computed denormalized view
    // Much faster than joining all competencies
    return progressViewRepository.findStudentProgress(
      query.studentId,
      query.competencyId,
    );
  };

  return { execute };
};

// Materialized View Updater
export const StudentProgressViewUpdater = function(
  progressRepository: IProgressRepository,
  progressViewRepository: IProgressViewRepository,
  eventEmitter: IEventEmitter,
) {
  const onProgressUpdated = async (event: StudentProgressUpdatedEvent): Promise<void> => {
    // Recalculate denormalized view
    const allProgress = await progressRepository.findByStudent(event.studentId);

    const view: StudentProgressView = {
      studentId: event.studentId,
      competencies: allProgress.map(p => ({
        id: p.competencyId,
        name: p.competencyName,
        level: p.level,
        progress: (p.level / 5) * 100,
        completedDate: p.completedDate,
      })),
      overallProgress: calculateOverallProgress(allProgress),
      estimatedCompletionDate: estimateCompletion(allProgress),
    };

    // Store optimized view
    await progressViewRepository.upsert(view);
  };

  // Subscribe to events
  eventEmitter.on('StudentProgressUpdated', onProgressUpdated);

  return { onProgressUpdated };
};
```

**Benefits**:
- Fast reads via pre-computed views
- Optimized query performance
- Clear separation of concerns
- Supports complex reporting

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Setup DDD folder structure (domains/)
- [ ] Create shared utilities (GUID, error handling)
- [ ] Implement base Repository pattern
- [ ] Setup event emitter

### Phase 2: Identity Domain
- [ ] User factory with validation
- [ ] Role assignment with permissions
- [ ] Permission checking via chain of responsibility
- [ ] Audit decorator for all mutations

### Phase 3: Learning Domain
- [ ] Repository pattern for learning paths
- [ ] Event listener for user creation
- [ ] Strategy pattern for curriculum
- [ ] CQRS for progress queries

### Phase 4: Workflow Domain
- [ ] Workflow engine with template method
- [ ] Step execution with command pattern
- [ ] Event emission for step completion
- [ ] AI integration via strategy pattern

### Phase 5: Cross-Domain
- [ ] Compliance validators
- [ ] Adapter for external services
- [ ] Decorator for cross-cutting concerns
- [ ] Event-driven communication

---

## Modular Benefits Achieved

| Pattern | Benefit |
|---------|---------|
| **DDD** | Clear domain boundaries, independent scaling |
| **Repository** | Swap databases, easy testing, isolation |
| **Factory** | Complex object creation, validation, invariants |
| **Strategy** | Plugin AI providers, compliance validators |
| **Observer** | Zero coupling between domains |
| **Decorator** | Audit, permissions, rate-limiting without touching core |
| **Command** | Audit trails, undo, replay capabilities |
| **Adapter** | External service integration, vendor independence |
| **Chain** | Multi-step permission validation |
| **Template Method** | Consistent step execution, reusable patterns |
| **CQRS** | Optimized reads, complex reporting |

---

## Anti-Patterns to AVOID

❌ **Monolithic Service** - No! Each domain has its own service  
❌ **Direct Service Calls** - No! Use events instead  
❌ **Shared Database** - No! Each domain owns its schema  
❌ **Circular Dependencies** - No! Use dependency injection  
❌ **God Objects** - No! Keep entities focused  
❌ **SQL Queries in Services** - No! Use repositories  

---

## Testing Strategy by Pattern

```
Repository Pattern
├── Mock database
├── Test CRUD operations
└── Verify query correctness

Factory Pattern
├── Test valid inputs
├── Test invalid inputs (validation)
├── Test invariants (profile creation)
└── Test side effects (event emission)

Strategy Pattern
├── Test each strategy independently
├── Test provider switching
└── Test fallback logic

Observer Pattern
├── Test event emission
├── Test listener handling
├── Test async processing
└── Test error handling

Decorator Pattern
├── Test audit logging
├── Test permission checks
└── Test middleware chain

CQRS Pattern
├── Test command execution
├── Test query performance
├── Test view synchronization
└── Test eventual consistency
```

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: March 17, 2026
