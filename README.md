# 🎓 Studently

**Government Vocational Training Platform** for institutional offices that works in relation with the Swiss Confederation Employment Office (`Staatssekretariat für Wirtschaft - SECO`)

A comprehensive full-featured platform for managing vocational training programs, student progression, competency tracking, and employer engagement—designed for Swiss labor market compliance.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Implementation Roadmap](#implementation-roadmap)
- [Testing Strategy](#testing-strategy)
- [Contributing](#contributing)

---

## 🎯 Project Overview

**Studently** is a full-featured government platform (not MVP) for vocational training management serving:

- **Users**: Students, instructors, employers, administrators, government officials
- **Domains**: Learning paths, competency tracking, timesheets, absences, documents, workflows, reporting, audit trails
- **Scale**: Multi-tenant, 150+ REST API endpoints, 50+ database tables
- **Compliance**: GDPR, Swiss labor law, accessibility (WCAG 2.1 AA), dark mode government aesthetic

### Key Characteristics

- ✅ **All features available immediately** (not phased)
- ✅ **All user roles supported** (Student, Instructor, Employer, Admin, Official)
- ✅ **150+ REST endpoints** across 13 API categories
- ✅ **8 core domains** (Auth, Users, Students, Learning Paths, Competencies, Timesheets, Absences, Documents, Workflows, Roles, Settings, Reporting, Audit)
- ✅ **Swiss legal compliance** (privacy, DPA, accessibility, labor law)
- ✅ **Dark mode only** (government security & accessibility aesthetic)
- ✅ **Desktop-first design** with mobile-selective feature visibility
- ✅ **Comprehensive audit logging** for government accountability

---

## 🛠️ Technology Stack

### Frontend
- **React** 18+ with TypeScript 5+
- **Redux** + **Redux-Saga** (state management & side effects—not Zustand)
- **Tailwind CSS** (dark mode, responsive design)
- **Zod** (runtime validation, TypeScript integration)
- **Vitest** + **React Testing Library** (unit & integration tests)
- **Playwright** (end-to-end testing)

### Backend
- **Express.js** (REST API)
- **Fastify** (IDP server, authentication)
- **TypeScript 5+** (strict mode)
- **PostgreSQL 15+** (multi-tenant relational database)
- **Redis 7+** (sessions, caching, rate limiting)
- **Jose** (RS256 JWT, OpenID Connect)
- **Jest** (unit & integration tests)

### Showcase Website
- **Next.js** 14 (SSR, SSG, ISR)
- **Tailwind CSS** (design consistency)
- **TypeScript** (type safety)
- **Playwright** (E2E testing)

### DevOps & Infrastructure
- **pnpm** 9+ (monorepo package manager)
- **Docker** (containerization)
- **GitHub Actions** (CI/CD)
- **PostgreSQL** (production database)
- **Redis** (caching, sessions)

---

## 🏗️ Architecture

### Monorepo Structure (pnpm Workspaces)

```
studently/
├── apps/
│   ├── backoffice/          # React + Redux backoffice application
│   │   ├── src/
│   │   │   ├── components/  # Feature-slice design (Feature/components)
│   │   │   ├── features/    # Feature slices (Auth, Students, Learning Paths, etc.)
│   │   │   ├── services/    # API integration
│   │   │   ├── store/       # Redux configuration
│   │   │   └── types/       # TypeScript types
│   │   ├── tests/           # Unit, integration, E2E tests
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                 # Express.js REST API
│   │   ├── src/
│   │   │   ├── routes/      # API endpoints by domain
│   │   │   ├── middleware/  # Auth, error handling, validation
│   │   │   ├── services/    # Business logic
│   │   │   ├── database/    # PostgreSQL queries, migrations
│   │   │   ├── types/       # TypeScript types
│   │   │   └── config/      # Environment configuration
│   │   ├── tests/           # Unit, integration, E2E tests
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── idp/                 # Fastify OAuth2/OpenID Connect Identity Provider
│   │   ├── src/
│   │   │   ├── routes/      # OAuth endpoints
│   │   │   ├── services/    # Token generation, validation
│   │   │   ├── database/    # User credentials, sessions
│   │   │   └── config/
│   │   ├── tests/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── showcase/            # Next.js public website
│       ├── src/
│       │   ├── app/         # Next.js app directory
│       │   ├── components/  # Reusable components
│       │   ├── pages/       # 18 pages (homepage, features, legal, blog)
│       │   ├── styles/      # Tailwind + global styles
│       │   └── lib/         # Utilities, API clients
│       ├── tests/           # Unit, integration, E2E tests
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared-types/        # TypeScript types shared across apps
│   │   ├── src/
│   │   │   ├── api.ts       # API request/response types
│   │   │   ├── domain.ts    # Domain models
│   │   │   ├── user.ts      # User types
│   │   │   └── errors.ts    # Error types
│   │   └── package.json
│   │
│   ├── validation-schemas/  # Zod schemas shared across apps
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── students.ts
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── ui-components/       # Design system (Tailwind components)
│   │   ├── src/
│   │   │   ├── tokens/      # Design tokens (colors, spacing, typography)
│   │   │   ├── atoms/       # Base components (Button, Input, Card, etc.)
│   │   │   ├── molecules/   # Composite components (Form, Modal, etc.)
│   │   │   ├── organisms/   # Complex components (Table, Chart, etc.)
│   │   │   └── styles/      # Global styles, Tailwind config
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── utilities/           # Helper functions, constants
│       ├── src/
│       │   ├── dates.ts
│       │   ├── strings.ts
│       │   ├── validation.ts
│       │   └── ...
│       └── package.json
│
├── docs/
│   ├── implementation/      # Architecture & implementation specs
│   │   ├── 18-complete-api-specification.md     (150+ endpoints)
│   │   ├── 19-showcase-website.md               (18 pages)
│   │   ├── 20-backoffice-implementation.md      (React + Redux)
│   │   ├── 21-design-system-redux-architecture.md
│   │   └── implementation-execution/            (Agent prompts)
│   │       ├── 00-MASTER-SUPERVISOR.md          (Orchestration)
│   │       ├── 01-database-ddl-implementation.md
│   │       ├── 02-api-implementation-phase1.md
│   │       ├── 03-design-system-implementation.md
│   │       ├── 04-redux-setup-implementation.md
│   │       ├── 05-backoffice-phase1.md
│   │       ├── 06-showcase-website-implementation.md
│   │       └── INDEX.md
│   ├── api/                # API documentation (OpenAPI/Swagger)
│   └── guides/             # Developer guides, deployment, troubleshooting
│
├── .github/
│   ├── workflows/          # GitHub Actions CI/CD
│   ├── copilot-instructions.md  # AI assistant instructions
│   ├── ai/
│   │   └── architecture-rules.xml  # Architecture guardrails
│   └── ISSUE_TEMPLATE/
│
├── .env.example            # Environment variables template
├── docker-compose.yml      # Development database & Redis
├── package.json            # Monorepo root (workspaces, scripts)
├── pnpm-workspace.yaml     # pnpm workspace definition
├── tsconfig.base.json      # Shared TypeScript config
├── tsconfig.json           # Root project references
├── .eslintrc.json          # Linting rules
├── .prettierrc              # Code formatting
└── README.md               # This file
```

### Key Design Patterns

1. **Feature Slice Design** (Backoffice)
   ```
   features/
   ├── Auth/
   │   ├── components/     # Feature-specific components
   │   ├── redux/          # Slice, actions, selectors
   │   ├── services/       # API calls
   │   └── types/          # Feature-specific types
   ├── Students/
   │   ├── components/
   │   ├── redux/
   │   ├── services/
   │   └── types/
   ```

2. **Redux + Redux-Saga**
   ```typescript
   store/
   ├── index.ts            // Store configuration
   ├── auth/               // Auth slice + saga
   ├── students/           // Students slice + saga
   ├── notifications/      // Notifications slice
   ├── ui/                 // UI state slice
   └── rootSaga.ts         // Root saga orchestrator
   ```

3. **API Domain Organization**
   ```
   routes/
   ├── auth.ts             // 15 endpoints
   ├── users.ts            // 18 endpoints
   ├── students.ts         // 20 endpoints
   ├── learningPaths.ts    // 22 endpoints
   ├── competencies.ts     // 15 endpoints
   ├── timesheets.ts       // 18 endpoints
   ├── absences.ts         // 15 endpoints
   ├── documents.ts        // 15 endpoints
   ├── workflows.ts        // 16 endpoints
   ├── roles.ts            // 14 endpoints
   ├── settings.ts         // 20 endpoints
   ├── reporting.ts        // 16 endpoints
   ├── audit.ts            // 12 endpoints
   └── public.ts           // 10 endpoints
   ```

---

## ✨ Features

### 1. Authentication & Authorization
- **OAuth2 / OpenID Connect** (Fastify IDP)
- **RS256 JWT** tokens (access + refresh)
- **Multi-factor authentication** (MFA)
- **Role-based access control** (RBAC): Student, Instructor, Employer, Admin, Official
- **Session management** with Redis
- **Account recovery** & password reset

### 2. User Management
- **User registration** & verification
- **Profile management** (avatar, settings, preferences)
- **User enumeration** & search
- **Bulk user import** (CSV)
- **Permission management** by role
- **Audit trail** (who did what, when)

### 3. Student Management
- **Student registration** & onboarding
- **Learning path assignment** & tracking
- **Progress tracking** by competency
- **Grade/assessment recording**
- **Document uploads** (certificates, diplomas, resumes)
- **Status tracking** (active, suspended, graduated, etc.)

### 4. Learning Paths & Competencies
- **Learning path creation** & management
- **Competency framework** (Swiss vocational standards)
- **Learning objectives** & outcomes
- **Assessment criteria** definition
- **Progress visualization** (dashboard)
- **Certification tracking**

### 5. Timesheets & Attendance
- **Digital timesheets** (clock in/out)
- **Absence tracking** (illness, vacation, leave types)
- **Approval workflows** (instructor → admin)
- **Attendance reports**
- **Compliance reporting** (legal minimum hours)
- **Export functionality** (Excel, PDF)

### 6. Document Management
- **Document uploads** & versioning
- **Document categorization** (certificates, transcripts, contracts)
- **Access control** (who can view/download)
- **Expiration dates** (for certifications)
- **Audit trail** (who accessed what, when)

### 7. Workflow Management
- **Workflow builder** (drag-and-drop, desktop-only)
- **Approval chains** (multi-step approvals)
- **Notification rules** (email, in-app)
- **Task assignment** & tracking
- **SLA monitoring**
- **Audit history**

### 8. Reporting & Analytics
- **Pre-built dashboards** (by role)
- **Student progress reports**
- **Competency analytics**
- **Attendance statistics**
- **Compliance reporting** (Swiss labor law)
- **Export to Excel/PDF**
- **Custom report builder**

### 9. Audit & Compliance
- **Complete audit trail** (all changes logged)
- **User action tracking**
- **Data access logging**
- **GDPR compliance** (right to be forgotten, data export)
- **Swiss labor law compliance**
- **Regulatory reports** (for government)

### 10. Showcase Website
- **Homepage** with feature highlights
- **6 Feature pages** (Learning, Timesheets, Documents, Workflows, Analytics, Compliance)
- **Pricing page** with subscription tiers
- **Case studies** & testimonials
- **Blog** with articles
- **7 Legal pages** (Privacy, Terms, DPA, Cookies, Accessibility, Security, Imprint)
- **Contact form** & support
- **Multi-language** (de-CH, fr-CH, it-CH, en)
- **SEO optimized** (metadata, structured data)
- **Dark mode** (government aesthetic)

---

## 📦 Repository Structure Details

### `apps/` Directory
- **backoffice**: React 18 + Redux application for all logged-in features
- **api**: Express.js REST API (150+ endpoints)
- **idp**: Fastify OAuth2/OpenID Connect identity provider
- **showcase**: Next.js 14 public website & marketing

### `packages/` Directory
- **shared-types**: TypeScript interfaces & types used across apps
- **validation-schemas**: Zod runtime schemas for API & form validation
- **ui-components**: Design system component library (Tailwind CSS)
- **utilities**: Shared helper functions & constants

### `docs/` Directory
- **implementation/**: Complete architecture, API, and implementation specifications
- **api/**: OpenAPI/Swagger documentation
- **guides/**: Developer guides, deployment procedures, troubleshooting

---

## 📋 Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **PostgreSQL** 15+ (local or Docker)
- **Redis** 7+ (local or Docker)
- **Docker** & **Docker Compose** (for local development)
- **Git** ≥ 2.40

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/studently/studently.git
cd studently
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies (apps + packages)
pnpm install
```

### 3. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local  # or code .env.local
```

Required environment variables:
```env
# Database
DATABASE_URL=postgresql://studently:password@localhost:5432/studently_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----...
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...

# OAuth
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret

# API
API_PORT=3000
API_HOST=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_IDP_URL=http://localhost:3001

# IDP
IDP_PORT=3001
```

### 4. Start Development Services

```bash
# Start PostgreSQL & Redis with Docker Compose
docker-compose up -d

# Run database migrations
pnpm run db:migrate

# Seed initial data (optional)
pnpm run db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: API server
pnpm --filter @studently/api run dev

# Terminal 2: IDP server
pnpm --filter @studently/idp run dev

# Terminal 3: Backoffice (React + Vite)
pnpm --filter @studently/backoffice run dev

# Terminal 4: Showcase website (Next.js)
pnpm --filter @studently/showcase run dev
```

Access:
- **Backoffice**: http://localhost:5173
- **API**: http://localhost:3000
- **IDP**: http://localhost:3001
- **Showcase**: http://localhost:3000 (conflict → use 3002)

---

## 🛠️ Development Workflow

### Build All Packages & Apps

```bash
# Build everything
pnpm build

# Build specific package/app
pnpm --filter @studently/api build
pnpm --filter @studently/backoffice build
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific app tests
pnpm --filter @studently/api test
pnpm --filter @studently/backoffice test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Linting & Formatting

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Database Migrations

```bash
# Create a new migration
pnpm run db:migrate:create --name=add_user_table

# Run pending migrations
pnpm run db:migrate

# Rollback last migration
pnpm run db:migrate:rollback

# Reset database (development only)
pnpm run db:reset
```

### Type Checking

```bash
# Check TypeScript types across all packages
pnpm type-check

# Strict mode check
pnpm type-check:strict
```

---

## 📅 Implementation Roadmap

### Timeline Overview
- **Start Date**: February 20, 2026
- **Target Go-Live**: May 22, 2026
- **Total Duration**: 13 weeks

### Phase 1: Foundation (February 20 - March 5, 2026) — 2 Weeks
**4 agents working in parallel**

| Agent | Task | Duration | Target |
|-------|------|----------|--------|
| 1 | Database DDL (50+ tables, indexes, audit) | 2-3 days | PostgreSQL schema ready |
| 2 | API Phase 1 (33 endpoints: auth, users, students) | 3-4 days | Core API endpoints responsive |
| 3 | Design System (40+ components, dark mode, tokens) | 3-4 days | Component library ready |
| 4 | Redux + Saga Setup (store, slices, sagas, hooks) | 3-4 days | State management functional |

**Success Criteria**: All Phase 1 agents complete → GO/NO-GO decision

**Deliverables**:
- ✅ PostgreSQL schema with multi-tenant support
- ✅ Auth API (login, logout, MFA, token refresh)
- ✅ User management API (CRUD, permissions)
- ✅ Student management API (CRUD, progress tracking)
- ✅ Design tokens (colors, spacing, typography, shadows)
- ✅ 40+ Tailwind components (buttons, inputs, cards, modals, etc.)
- ✅ Redux store (auth, students, notifications, UI slices)
- ✅ Redux-Saga middleware (auth flows, API integration)

### Phase 2: Core Features (March 5 - March 19, 2026) — 2 Weeks
**2 agents working sequentially (depends on Phase 1 completion)**

| Agent | Task | Duration | Dependencies |
|-------|------|----------|--------------|
| 5 | Backoffice Phase 1 (layouts, dashboards, auth pages, student pages) | 4-5 days | Phase-1 (Design, Redux, API) |
| 6 | Showcase Website (Next.js, 18 pages, SEO, i18n) | 3-4 days | Phase-1 (Design System) |

**Success Criteria**: Both Phase 2 agents complete → GO/NO-GO decision

**Deliverables**:
- ✅ Backoffice app structure (layouts, navigation, protected routes)
- ✅ 6 role-specific dashboards (Student, Instructor, Employer, Admin, Official, Super-Admin)
- ✅ Auth pages (login, MFA, password reset)
- ✅ Student management pages (list, create, update, delete, profile)
- ✅ Learning path management pages
- ✅ Showcase website homepage
- ✅ 6 feature pages (Learning, Timesheets, Documents, Workflows, Analytics, Compliance)
- ✅ 7 legal pages (Privacy, Terms, DPA, Cookies, Accessibility, Security, Imprint)
- ✅ Multi-language support (de-CH, fr-CH, it-CH, en)

### Phase 3: Integration & Testing (March 20 - March 26, 2026) — 1 Week

**Tasks**:
- ✅ API-Database integration testing
- ✅ Backoffice-API integration testing
- ✅ End-to-end user flows (full journey testing)
- ✅ Performance testing (load, stress, capacity)
- ✅ Security testing (penetration, vulnerability scanning)

### Phase 4: End-to-End Testing (March 27 - April 2, 2026) — 1 Week

**Tasks**:
- ✅ Complete E2E test suite (Playwright)
- ✅ Cross-browser testing (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsiveness verification
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Performance optimization

### Phase 5: Polish & Documentation (April 3 - April 16, 2026) — 2 Weeks

**Tasks**:
- ✅ Bug fixes & refinements
- ✅ UX/UI polish (animations, micro-interactions)
- ✅ Complete API documentation (OpenAPI/Swagger)
- ✅ Developer guides (setup, deployment, architecture)
- ✅ User documentation & help pages
- ✅ Admin guides

### Phase 6: Staging & QA (April 17 - April 30, 2026) — 2 Weeks

**Tasks**:
- ✅ Deploy to staging environment
- ✅ Full QA cycle (functional, regression, smoke tests)
- ✅ Performance validation (production-like load)
- ✅ Security hardening
- ✅ User acceptance testing (UAT)

### Phase 7: Production Deployment (May 1 - May 14, 2026) — 2 Weeks

**Tasks**:
- ✅ Infrastructure setup (production database, Redis, CDN)
- ✅ Deployment automation (CI/CD pipelines)
- ✅ Monitoring & alerting setup
- ✅ Disaster recovery procedures
- ✅ Final smoke tests

### Phase 8: Go-Live Support (May 15 - May 22, 2026) — 1 Week

**Tasks**:
- ✅ Go-live coordination
- ✅ Real-time issue monitoring
- ✅ Support hotline (24/7 during go-live)
- ✅ Production incident response

---

## ⏱️ Time Estimation

### By Phase

| Phase | Duration | Key Activities | Status |
|-------|----------|-----------------|--------|
| 1. Foundation | 2 weeks | Database, API, Design System, Redux | PENDING |
| 2. Core Features | 2 weeks | Backoffice, Showcase Website | PENDING |
| 3. Integration | 1 week | API-DB, Backoffice-API, E2E flows | PENDING |
| 4. E2E Testing | 1 week | Full test suite, cross-browser, accessibility | PENDING |
| 5. Polish | 2 weeks | Bug fixes, documentation, UX refinement | PENDING |
| 6. Staging & QA | 2 weeks | Staging deployment, full QA cycle, UAT | PENDING |
| 7. Production Deploy | 2 weeks | Infrastructure, CI/CD, monitoring, backup | PENDING |
| 8. Go-Live Support | 1 week | Launch, monitoring, support | PENDING |
| **TOTAL** | **13 weeks** | Full platform delivery | **IN PROGRESS** |

### By Component

| Component | Estimate | Notes |
|-----------|----------|-------|
| Database DDL | 2-3 days | 50+ tables, indexes, constraints, triggers |
| API Development | 3-4 weeks | 150+ endpoints across 13 domains |
| Design System | 3-4 days | 40+ components, Tailwind dark mode |
| Redux Setup | 3-4 days | Store, slices, sagas, hooks |
| Backoffice UI | 2-3 weeks | Layouts, pages, dashboards, forms |
| Showcase Website | 1-2 weeks | 18 pages, SEO, i18n, analytics |
| Testing Suite | 2 weeks | Unit, integration, E2E coverage ≥85% |
| Deployment & DevOps | 1-2 weeks | Docker, CI/CD, monitoring, backup |
| Documentation | 1 week | API docs, developer guides, user manuals |

### Parallel vs Sequential Work

- **Weeks 1-2**: 4 teams parallel → **2 weeks total** (vs 8 weeks if sequential)
- **Weeks 2-4**: 2 teams sequential (depend on phase 1) → **2 weeks total**
- **Weeks 5+**: Integration, testing, deployment → **7 weeks total**

**Total**: 13 weeks (March 17 - June 15, 2026)

---

## 🧪 Testing Strategy

### Test Coverage Targets

| Test Type | Target Coverage | Tools |
|-----------|-----------------|-------|
| Unit Tests | ≥85% | Vitest (frontend), Jest (backend) |
| Integration Tests | ≥80% | Jest, React Testing Library |
| E2E Tests | ≥70% | Playwright |
| Performance Tests | Baseline established | Lighthouse, k6 |
| Security Tests | Vulnerability scan pass | OWASP ZAP, Snyk |

### Test Structure

```bash
# Unit tests (fast, isolated)
pnpm --filter @studently/api test --unit
pnpm --filter @studently/backoffice test --unit

# Integration tests (slower, with dependencies)
pnpm --filter @studently/api test --integration
pnpm --filter @studently/backoffice test --integration

# E2E tests (slowest, full workflows)
pnpm --filter @studently/api test:e2e
pnpm --filter @studently/showcase test:e2e

# Performance tests
pnpm test:performance

# Security tests
pnpm test:security
```

### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View HTML coverage report
open coverage/index.html
```

---

## 🤝 Contributing

### Development Setup
1. Fork repository
2. Create feature branch: `git checkout -b feature/FEATURE-NAME`
3. Follow code style guidelines (`.eslintrc.json`, `.prettierrc`)
4. Write tests for new features
5. Run `pnpm lint` and `pnpm test` before committing
6. Create pull request with description

### Code Style
- **TypeScript**: Strict mode, explicit types
- **Formatting**: Prettier (2 spaces, no semicolons)
- **Linting**: ESLint + Prettier
- **Imports**: Sort by: external → internal → relative
- **Naming**: camelCase (functions), PascalCase (components/types)

### Commit Guidelines
```
type(scope): brief description

Longer explanation if needed.

Fixes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

---

## 📚 Documentation

### API Documentation
- [Complete API Specification](docs/implementation/18-complete-api-specification.md) (150+ endpoints)
- OpenAPI/Swagger docs: http://localhost:3000/docs

### Architecture & Design
- [Backoffice Implementation](docs/implementation/20-backoffice-implementation.md) (React + Redux)
- [Design System & Redux Architecture](docs/implementation/21-design-system-redux-architecture.md)
- [Showcase Website](docs/implementation/19-showcase-website.md)

### Developer Guides
- [Setup Guide](docs/guides/SETUP.md)
- [Database Guide](docs/guides/DATABASE.md)
- [API Development](docs/guides/API_DEVELOPMENT.md)
- [Frontend Development](docs/guides/FRONTEND_DEVELOPMENT.md)
- [Deployment Guide](docs/guides/DEPLOYMENT.md)
- [Troubleshooting](docs/guides/TROUBLESHOOTING.md)

### Implementation Execution
- [Master Supervisor](docs/implementation/implementation-execution/00-MASTER-SUPERVISOR.md) (Orchestration framework)
- [Agent Prompts](docs/implementation/implementation-execution/) (Database, API, Design, Redux, Backoffice, Showcase)
- [INDEX](docs/implementation/implementation-execution/INDEX.md) (Execution reference)

---

## 🔒 Security & Compliance

- **GDPR Compliance**: Right to be forgotten, data export, consent management
- **Swiss Labor Law**: Compliance reporting, audit trails
- **Accessibility**: WCAG 2.1 Level AA (dark mode, touch targets ≥48px)
- **Authentication**: OAuth2 / OpenID Connect, RS256 JWT, MFA
- **Rate Limiting**: 100 requests/minute per IP
- **CORS**: Restricted to approved origins
- **Audit Logging**: All user actions logged with timestamp, user ID, change details

---

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Contact**: See [Showcase Contact Page](apps/showcase/src/pages/contact.tsx)

---

## 📄 License

[MIT License](LICENSE) — See LICENSE file for details

---

## 🎯 Project Status

**Initiated**: February 20, 2026  
**Target Go-Live**: May 22, 2026  
**Current Phase**: Phase 1 (Foundation) — ACTIVE  
**Status**: Implementation Framework Ready

Last updated: February 20, 2026

---

**For deployment details, see [DEPLOYMENT.md](docs/guides/DEPLOYMENT.md)**  
**For troubleshooting, see [TROUBLESHOOTING.md](docs/guides/TROUBLESHOOTING.md)**
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## Adding a new app

```bash
mkdir -p apps/my-app
cd apps/my-app
pnpm init
```
