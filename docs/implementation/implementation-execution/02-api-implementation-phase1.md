# AGENT-2: API Implementation - Phase 1 (Scaffolding)

## SYSTEM INSTRUCTIONS
Read: `.github/copilot-instructions.md` → TypeScript strict, error handling, authentication, authorization.

## SPECIFICATION
Read: `docs/implementation/18-complete-api-specification.md` → All 150+ endpoints, request/response schemas, auth flows.

## TASKS

### Task 1: API Project Setup
**Output**: `backend/` folder structure
- Initialize Node.js + Express 4.18+ / Fastify 4+
- TypeScript 5+ with strict mode
- Folder structure per spec
- ESLint + Prettier configured
- .env.example with all required keys

**Structure**:
```
backend/
├── src/
│   ├── main.ts (Express app entry)
│   ├── config/ (env, db, auth)
│   ├── middleware/ (auth, error, logging)
│   ├── routes/ (organized by domain)
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── students.routes.ts
│   │   └── ...
│   ├── controllers/ (business logic)
│   ├── services/ (database queries)
│   ├── types/ (interfaces)
│   ├── utils/ (helpers)
│   └── tests/
├── package.json
├── tsconfig.json
└── .eslintrc.json
```

### Task 2: Authentication Endpoints (15)
**Output**: `backend/src/routes/auth.routes.ts` + `backend/src/controllers/auth.controller.ts`
- POST /auth/register
- POST /auth/login
- POST /auth/mfa-verify
- POST /auth/mfa-setup
- POST /auth/mfa-verify-setup
- POST /auth/refresh
- POST /auth/logout
- POST /auth/logout-all
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/change-password
- GET /auth/me
- PATCH /auth/profile
- POST /auth/verify-email
- GET /auth/sessions
- DELETE /auth/sessions/:sessionId

**Implementation**:
- Zod validation on all inputs
- JWT (RS256) token generation
- MFA (TOTP) integration
- Password hashing (bcrypt)
- Token blacklist on logout
- Email service integration (nodemailer)

### Task 3: User Management Endpoints (18)
**Output**: `backend/src/routes/users.routes.ts` + `backend/src/controllers/users.controller.ts`
- GET /users (with filtering, sorting, pagination)
- POST /users
- GET /users/:id
- PATCH /users/:id
- DELETE /users/:id
- POST /users/:id/deactivate
- POST /users/:id/reactivate
- GET /users/:id/roles
- POST /users/:id/roles
- DELETE /users/:id/roles/:roleId
- GET /users/:id/permissions
- POST /users/import
- GET /users/import/:jobId
- POST /users/:id/send-invitation
- GET /users/:id/activity-log

**Implementation**:
- Role-based access control (middleware)
- Bulk operations (import, bulk approve)
- Pagination (cursor-based)
- Audit logging (all changes)

### Task 4: Middleware & Utilities
**Output**: `backend/src/middleware/` + `backend/src/utils/`
- Auth middleware (JWT validation, MFA check)
- Error middleware (standardized error responses)
- Logging middleware (morgan or custom)
- Rate limiting (express-rate-limit)
- CORS configuration
- Request validation (Zod pipe)
- API response formatter (consistent response shape)

### Task 5: Database Integration
**Output**: `backend/src/services/`
- Database connection (PostgreSQL with node-postgres or knex)
- Connection pooling (5-20 connections)
- Query builders (type-safe queries)
- Transaction support (for multi-step operations)
- Soft delete handling (filters deleted_at)

### Task 6: Error Handling
**Output**: `backend/src/utils/errors.ts` + error middleware
- Custom error classes (ValidationError, NotFoundError, UnauthorizedError, ForbiddenError)
- Standardized error response (error.code, error.message, error.statusCode, error.details)
- Error logging (to file + console)
- Error recovery (retry logic for transient failures)

### Task 7: Configuration
**Output**: `backend/.env.example` + `backend/src/config/`
- Environment variables (DB_URL, JWT_SECRET, MFA_ISSUER, etc.)
- Config object (typed, loaded from env)
- Secrets management (use dotenv, no hardcoding)

## TESTS

### Unit Tests
**File**: `backend/__tests__/auth.test.ts`, `backend/__tests__/users.test.ts`
- Validation (invalid email, weak password, missing fields)
- JWT generation (correct claims, expiration)
- MFA flow (TOTP verification)
- Password hashing (bcrypt rounds)
- Role-based access (correct permissions returned)

**Target**: ≥85% coverage (core logic)

### Integration Tests
**File**: `backend/__tests__/integration/auth.integration.ts`, `backend/__tests__/integration/users.integration.ts`
- Register → Login → Get profile flow
- MFA setup → Verify → Login with MFA flow
- Token refresh (access token expired, refresh token valid)
- Logout → Token blacklist (subsequent request with token fails)
- Create user → Assign role → Verify permissions
- Multi-tenant isolation (User A cannot see User B's data)

**Target**: ≥80% coverage (end-to-end flows)

### E2E Tests
**File**: `backend/__tests__/e2e/auth.e2e.ts`, `backend/__tests__/e2e/users.e2e.ts`
- Full auth flow: Register → Login → Setup MFA → Verify MFA
- Full user management: Create → Edit → Assign role → Deactivate → Reactivate
- Import users (CSV upload → background job → success report)
- Activity log (all actions logged with timestamp + IP)
- Session management (logout all sessions, verify all revoked)

**Target**: ≥80% coverage (all user-facing flows)

## REPORTING

```
[AGENT-2-PHASE1] API IMPLEMENTATION - PHASE 1
Status: [COMPLETED|IN-PROGRESS|FAILED]
Tasks: [n/7] completed
  ✓ API Project Setup
  ✓ Auth Endpoints (15/15)
  ✓ User Endpoints (18/18)
  ✓ Middleware & Utilities
  ✓ Database Integration
  ✓ Error Handling
  ✓ Configuration

Tests: unit=X/X | integration=Y/Y | e2e=Z/Z
Code: backend/src/
Files Created:
  - src/routes/ (auth, users)
  - src/controllers/ (auth, users)
  - src/middleware/ (auth, error, logging, validation)
  - src/utils/ (error classes, API formatter)
  - src/config/ (config object)
  - __tests__/ (unit + integration + e2e)

Issues: [0|list]
Next: [Ready for Agent-5 (API Phase 2) after Agent-1 DB ready]
```

## SUCCESS CRITERIA

- [ ] Express/Fastify server starts without errors
- [ ] All 33 endpoints respond with correct status codes
- [ ] Authentication flows work (login, MFA, refresh, logout)
- [ ] User management endpoints work (CRUD, bulk import)
- [ ] Unit tests: ≥85% pass rate
- [ ] Integration tests: ≥80% pass rate
- [ ] E2E tests: ≥80% pass rate
- [ ] Error handling returns standardized format
- [ ] Rate limiting configured
- [ ] CORS configured
- [ ] Zero blocking issues

---

**Agent-2-Phase1 Version**: 1.0  
**Estimated Duration**: 3-4 days  
**Start When**: Anytime (no dependencies, Agent-1 DDL desirable for integration tests)
