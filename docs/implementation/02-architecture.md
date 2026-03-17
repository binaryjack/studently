# System Architecture

## Overview
Studently is a modern student and institute management platform built as a monorepo with microservices architecture, following ultra-strict TypeScript conventions and Feature Slice Design pattern.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer / CDN                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Optional)                        │
│             Rate Limiting, CORS, Request Logging                 │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴────────────────────┐
          ▼                                        ▼
┌────────────────────────┐              ┌────────────────────────┐
│   Identity Provider    │              │   Main Application     │
│   (Fastify + Redis)    │◄────JWT──────│   (Express + Zod)      │
│   Port: 3001           │              │   Port: 3000           │
└────────────────────────┘              └────────────────────────┘
          │                                        │
          │                                        │
          ▼                                        ▼
┌────────────────────────┐              ┌────────────────────────┐
│   PostgreSQL           │              │   PostgreSQL           │
│   (Auth DB)            │              │   (Application DB)     │
│   + Redis              │              │   + Redis Cache        │
│   (Token Blacklist)    │              │   (Sessions/Cache)     │
└────────────────────────┘              └────────────────────────┘
```

## Technology Stack

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 20+ | JavaScript runtime |
| **Language** | TypeScript 5+ | Type-safe development |
| **Framework (Main)** | Express.js | REST API server |
| **Framework (IDP)** | Fastify | High-performance auth server |
| **Validation** | Zod | Runtime type validation |
| **ORM** | Knex.js | Query builder |
| **Database** | PostgreSQL 15+ | Relational database |
| **Cache** | Redis 7+ | Session storage, token blacklist |
| **JWT** | jose | RS256 JWT verification |
| **Encryption** | bcrypt | Password hashing |
| **Testing** | Vitest | Unit/Integration testing |
| **API Docs** | OpenAPI 3.1 | API documentation |

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18+ | UI library |
| **Language** | TypeScript 5+ | Type-safe development |
| **Build Tool** | Vite | Fast build and HMR |
| **Routing** | React Router v6 | Client-side routing |
| **State** | Zustand | Global state management |
| **Forms** | React Hook Form + Zod | Form validation |
| **UI Components** | Custom (Atomic Design) | Reusable components |
| **Styling** | CSS Modules + Tailwind | Component styling |
| **HTTP Client** | Axios | API communication |
| **Infinite Scroll** | React Infinite Scroll | Cursor pagination |
| **Testing** | Vitest + Testing Library | Component testing |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Monorepo** | pnpm workspaces | Package management |
| **CI/CD** | GitHub Actions | Automated testing/deployment |
| **Containerization** | Docker + Docker Compose | Local development |
| **Hosting** | AWS / Azure / Self-hosted | Production deployment |
| **Monitoring** | (TBD) | Application monitoring |
| **Logging** | Winston / Pino | Structured logging |

## Monorepo Structure

```
studently/
├── packages/
│   ├── backend/                    # Main Express application
│   │   ├── src/
│   │   │   ├── features/          # Feature Slice Design
│   │   │   │   ├── student/
│   │   │   │   ├── learning-path/
│   │   │   │   ├── competency/
│   │   │   │   ├── timesheet/
│   │   │   │   └── workflow/
│   │   │   ├── common/            # Shared utilities
│   │   │   │   ├── middleware/
│   │   │   │   ├── validation/
│   │   │   │   └── crud-controller.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── frontend/                   # React application
│   │   ├── src/
│   │   │   ├── features/          # Feature Slice Design
│   │   │   │   ├── student/
│   │   │   │   ├── learning-path/
│   │   │   │   └── timesheet/
│   │   │   ├── shared/            # Shared UI components
│   │   │   │   ├── ui/
│   │   │   │   ├── hooks/
│   │   │   │   └── utils/
│   │   │   ├── app/               # App-wide setup
│   │   │   └── index.tsx
│   │   └── package.json
│   │
│   ├── identity-provider/         # Authentication microservice
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── services/
│   │   │   │   └── middleware/
│   │   │   ├── routes/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared-types/              # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared-ui/                 # Shared UI components
│   │   ├── src/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   ├── organisms/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── workflow-engine/           # Workflow orchestration
│       ├── src/
│       │   ├── engine/
│       │   ├── actions/
│       │   └── index.ts
│       └── package.json
│
├── apps/                          # Standalone applications
│   └── admin-dashboard/           # Admin interface (optional)
│
├── docs/                          # Documentation
│   ├── api/
│   ├── architecture/
│   └── implementation/
│
├── scripts/                       # Build/deployment scripts
├── docker/                        # Docker configurations
├── .github/                       # GitHub Actions workflows
│   └── ai/                        # AI coding rules
│       └── INDEX.xml
│
├── package.json                   # Root package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Multi-Tenant Architecture

### Tenant Isolation Strategy

```
┌──────────────┐
│   Request    │
│  (Browser)   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│   Identity Provider             │
│   - Verify credentials          │
│   - Generate JWT with tenantId  │
│   - Sign with RS256 private key │
└────────────┬────────────────────┘
             │
             ▼ JWT Token
┌─────────────────────────────────┐
│   Backend Middleware            │
│   - Verify JWT with public key  │
│   - Extract tenantId, userId    │
│   - Set AsyncLocalStorage       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Repository Layer              │
│   - Auto-inject tenantId filter │
│   - ALL queries scoped to tenant│
│   - Row-level security (RLS)    │
└─────────────────────────────────┘
```

### Tenant Context Implementation

```typescript
// packages/backend/src/common/tenant-context.ts

import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: string;
  email: string;
}

// Singleton AsyncLocalStorage instance
export const tenantStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Get current tenant context
 * Throws if called outside tenant context
 */
export const getTenantContext = (): TenantContext => {
  const context = tenantStorage.getStore();
  if (!context) {
    throw new Error('No tenant context available');
  }
  return context;
};

/**
 * Get current tenant ID
 */
export const getTenantId = (): string => {
  return getTenantContext().tenantId;
};

/**
 * Get current user ID
 */
export const getUserId = (): string => {
  return getTenantContext().userId;
};
```

### Database Schema with Tenant Isolation

```sql
-- All tables must include tenant_id
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  sequence SERIAL,
  code VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  -- ... other fields
  
  UNIQUE(tenant_id, code),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Row-Level Security (RLS) for additional protection
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON students
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Index for efficient tenant queries
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_students_sequence ON students(tenant_id, sequence);
```

## API Architecture

### RESTful Endpoint Structure

```
/api/v1/
├── auth/                          # Authentication (proxied to IDP)
│   ├── POST   /login
│   ├── POST   /register
│   ├── POST   /refresh
│   ├── POST   /logout
│   └── GET    /profile
│
├── students/                      # Student management
│   ├── GET    /                   # List with cursor pagination
│   ├── GET    /:id                # Get by ID
│   ├── POST   /                   # Create
│   ├── PATCH  /:id                # Update
│   └── DELETE /:id                # Soft delete
│
├── learning-paths/                # Learning path management
├── competencies/                  # Competency tracking
├── timesheets/                    # Time tracking
├── absences/                      # Absence management
├── documents/                     # Document versioning
├── workflows/                     # Workflow execution
│   ├── GET    /                   # List workflows
│   ├── GET    /:id                # Get workflow state
│   ├── POST   /                   # Start workflow
│   ├── POST   /:id/transition     # Execute transition
│   └── GET    /:id/history        # Audit trail
│
└── translations/                  # Translation management
    ├── GET    /                   # Get translations
    └── POST   /                   # Update translations
```

### Request/Response Flow

```typescript
// Typical API request flow

// 1. Client sends request with JWT
const response = await axios.get('/api/v1/students', {
  headers: {
    'Authorization': 'Bearer <jwt-token>',
    'Accept-Language': 'fr' // Optional language preference
  },
  params: {
    cursor: 100,
    limit: 20
  }
});

// 2. Middleware chain
// - CORS middleware
// - JWT verification middleware (extracts tenantId, userId)
// - Tenant context middleware (sets AsyncLocalStorage)
// - Rate limiting middleware
// - Request logging middleware

// 3. Controller (auto-generated via createCrudController)
// - Validate query params with Zod
// - Call service method

// 4. Service layer
// - Business logic
// - Call repository

// 5. Repository
// - Auto-inject tenantId filter
// - Execute database query
// - Map to entity type

// 6. Response
{
  "items": [...],
  "nextCursor": 120,
  "hasMore": true
}
```

## Database Architecture

### PostgreSQL Schema Design

```sql
-- Tenants table (master)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (across all tenants)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, email)
);

-- Translations table (centralized)
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  entity_type VARCHAR(100) NOT NULL,
  code VARCHAR(255) NOT NULL,
  language VARCHAR(2) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tenant_id, entity_type, code, language)
);

-- Entity tables follow same pattern
-- See 04-entities.md for complete schema
```

### Redis Cache Strategy

```typescript
// Cache keys pattern
const CACHE_KEYS = {
  // Translations cache (1 hour TTL)
  translation: (tenantId: string, entityType: string, code: string, lang: string) =>
    `trans:${tenantId}:${entityType}:${code}:${lang}`,
  
  // Reference data cache (24 hour TTL)
  refData: (tenantId: string, entityType: string) =>
    `ref:${tenantId}:${entityType}`,
  
  // User session (JWT TTL)
  session: (userId: string, sessionId: string) =>
    `sess:${userId}:${sessionId}`,
  
  // Token blacklist (until expiry)
  tokenBlacklist: (jti: string) =>
    `blacklist:${jti}`,
};

// Cache invalidation on updates
const invalidateCache = async (tenantId: string, entityType: string, code: string) => {
  const pattern = `trans:${tenantId}:${entityType}:${code}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};
```

## Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. IDP validates credentials
   ↓
3. IDP generates JWT (RS256)
   - Payload: { tenantId, userId, role, email, exp, iat }
   - Sign with private key
   ↓
4. Return JWT + Refresh Token
   ↓
5. Client stores tokens (httpOnly cookie or localStorage)
   ↓
6. Client includes JWT in Authorization header
   ↓
7. Backend verifies JWT with public key (from JWKS endpoint)
   ↓
8. Backend extracts tenantId, userId from payload
   ↓
9. Backend sets tenant context (AsyncLocalStorage)
   ↓
10. Request processed with tenant isolation
```

### Authorization Model

```typescript
// Role-based access control (RBAC)
export enum Role {
  SUPER_ADMIN = 'super-admin',      // Platform administrator
  TENANT_ADMIN = 'tenant-admin',    // Institute administrator
  INSTRUCTOR = 'instructor',         // Teacher/trainer
  STUDENT = 'student',               // Student
  GUEST = 'guest',                   // Limited read access
}

// Permission matrix
const PERMISSIONS = {
  'student.create': [Role.SUPER_ADMIN, Role.TENANT_ADMIN],
  'student.read': [Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.INSTRUCTOR, Role.STUDENT],
  'student.update': [Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.INSTRUCTOR],
  'student.delete': [Role.SUPER_ADMIN, Role.TENANT_ADMIN],
  'timesheet.approve': [Role.SUPER_ADMIN, Role.TENANT_ADMIN, Role.INSTRUCTOR],
  // ... etc
};

// Authorization middleware
export const requirePermission = (permission: string) => {
  return (req, res, next) => {
    const { role } = getTenantContext();
    
    if (!PERMISSIONS[permission]?.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

## Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: No session state in application servers
- **Load Balancer**: Distribute traffic across multiple instances
- **Database Connection Pooling**: Limit connections per instance
- **Redis Cluster**: Distributed caching for high availability
- **Read Replicas**: Separate read/write database instances

### Performance Optimizations

- **Cursor Pagination**: Efficient infinite scroll without OFFSET
- **Bulk Operations**: Batch inserts/updates for imports
- **Database Indexes**: Strategic indexes on tenant_id, sequence, code
- **Query Optimization**: Select only needed fields, avoid N+1 queries
- **Caching Strategy**: Redis for translations, reference data
- **CDN**: Static assets served from edge locations

### Monitoring & Observability

```typescript
// Structured logging
import { logger } from './common/logger';

logger.info('Student created', {
  tenantId,
  userId,
  studentId,
  duration: Date.now() - startTime,
});

// Metrics collection
import { metrics } from './common/metrics';

metrics.increment('api.request', { endpoint: '/students', method: 'POST' });
metrics.timing('db.query', queryDuration, { table: 'students' });

// Health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: await checkDatabaseConnection(),
    redis: await checkRedisConnection(),
  });
});
```

## Deployment Architecture

### Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: studently
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  identity-provider:
    build:
      context: .
      dockerfile: docker/identity-provider.Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://admin:secret@postgres:5432/studently
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:secret@postgres:5432/studently
      REDIS_URL: redis://redis:6379
      IDP_JWKS_URL: http://identity-provider:3001/.well-known/jwks.json
    depends_on:
      - postgres
      - redis
      - identity-provider

  frontend:
    build:
      context: .
      dockerfile: docker/frontend.Dockerfile
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api/v1
      VITE_IDP_URL: http://localhost:3001

volumes:
  postgres-data:
  redis-data:
```

### Production Deployment (AWS Example)

```
┌──────────────────────────────────────────────────────────┐
│                    CloudFront CDN                         │
│                  (Static Assets)                          │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)             │
│              SSL/TLS Termination                         │
└──────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐
│   ECS/Fargate        │      │   ECS/Fargate        │
│   (IDP Service)      │      │   (Backend Service)  │
│   Auto-scaling       │      │   Auto-scaling       │
└──────────────────────┘      └──────────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          ▼
          ┌───────────────────────────────┐
          │   Amazon RDS (PostgreSQL)     │
          │   Multi-AZ, Read Replicas     │
          └───────────────────────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │   Amazon ElastiCache (Redis)  │
          │   Cluster Mode                │
          └───────────────────────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: March 17, 2026  
**Status**: Final
