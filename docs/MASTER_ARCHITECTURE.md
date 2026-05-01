# Master Architecture Document

## 1. Overview

This document serves as the single source of truth for the Studently platform's architecture. It synthesizes information from various source documents to provide a unified and comprehensive architectural blueprint. The architecture is designed to be modular, scalable, secure, and maintainable, leveraging modern best practices and design patterns.

**Guiding Principles:**

- **Domain-Driven Design (DDD):** The system is organized around business domains to ensure a clear separation of concerns.
- **Microservices Architecture:** The platform is composed of independent services that can be developed, deployed, and scaled individually.
- **TypeScript First:** A strict TypeScript-first approach is enforced to ensure type safety and code quality.
- **Security by Design:** Security is a primary consideration at all levels of the architecture.
- **Infrastructure as Code (IaC):** The infrastructure is defined and managed as code to ensure consistency and repeatability.

## 2. High-Level Architecture

The platform follows a microservices-based architecture with a clear separation between the main application and the identity provider.

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

## 3. Technology Stack

### Backend

| Layer                | Technology            | Purpose                      |
| -------------------- | --------------------- | ---------------------------- |
| **Runtime**          | Node.js 20+           | JavaScript runtime           |
| **Language**         | TypeScript 5+         | Type-safe development        |
| **Framework (Main)** | Express.js            | REST API server              |
| **Framework (IDP)**  | Fastify               | High-performance auth server |
| **Validation**       | Zod                   | Runtime type validation      |
| **ORM**              | Knex.js               | Query builder                |
| **Database**         | PostgreSQL 15+        | Relational database          |
| **Cache**            | Redis 7+              | Session storage, token blacklist |
| **Testing**          | Vitest                | Unit/Integration testing     |

### Frontend

| Layer           | Technology              | Purpose                     |
| --------------- | ----------------------- | --------------------------- |
| **Framework**   | React 18+               | UI library                  |
| **Language**    | TypeScript 5+           | Type-safe development       |
| **Build Tool**  | Vite                    | Fast build and HMR          |
| **State**       | Zustand                 | Global state management     |
| **UI Components** | Custom (Atomic Design)  | Reusable components         |

### Infrastructure

| Component          | Technology              | Purpose                     |
| ------------------ | ----------------------- | --------------------------- |
| **Monorepo**       | pnpm workspaces         | Package management          |
| **CI/CD**          | GitHub Actions          | Automated testing/deployment |
| **Containerization** | Docker + Docker Compose | Local development           |
| **Hosting**        | AWS / Azure / Self-hosted | Production deployment       |

## 4. Domain-Driven Design (DDD)

The architecture is fundamentally based on DDD principles. The system is divided into bounded contexts, each representing a distinct business domain.

### Bounded Contexts

- **Identity:** Manages users, roles, permissions, and authentication.
- **Learning:** Manages learning paths, courses, and student progress.
- **Timesheets:** Manages time tracking and absences.
- **Workflow:** Provides a generic engine for orchestrating business processes.
- **Compliance:** Handles Swiss-specific legal and regulatory requirements.
- **AI:** Integrates with AI services for tasks like document analysis and feedback generation.

## 5. Architectural Patterns

Eleven core design patterns are leveraged to ensure a robust and maintainable architecture.

1.  **Domain-Driven Design (DDD):** The core architectural approach.
2.  **Repository Pattern:** Abstracts data access, enabling a clean separation between business logic and data persistence.
3.  **Factory Pattern:** Encapsulates the creation of complex objects, ensuring that entities are created in a valid state.
4.  **Strategy Pattern:** Allows for interchangeable algorithms, used for AI providers and other pluggable components.
5.  **Observer/Event Pattern:** Decouples communication between domains, enabling an event-driven architecture.
6.  **Decorator Pattern:** Adds cross-cutting concerns like auditing and permission checks without modifying core business logic.
7.  **Command Pattern:** Encapsulates requests as objects, providing a foundation for audit trails and undo functionality.
8.  **Adapter Pattern:** Integrates with external services (e.g., email, SMS) through a consistent interface.
9.  **Chain of Responsibility:** Implements complex validation and permission-checking logic in a modular way.
10. **Template Method Pattern:** Defines the skeleton of an algorithm, allowing subclasses to provide specific implementations, particularly useful in the workflow engine.
11. **CQRS (Command Query Responsibility Segregation):** Separates read and write models for performance-critical queries and reporting.

## 6. Security Architecture

### Authentication

Authentication is handled by a dedicated Identity Provider (IDP) service. The flow is as follows:

1.  The user provides credentials to the IDP.
2.  The IDP validates the credentials and generates a JWT (signed with RS256) and a refresh token.
3.  The client stores the tokens securely (e.g., in an httpOnly cookie).
4.  The JWT is included in the `Authorization` header of all subsequent requests to the backend.
5.  The backend verifies the JWT using the IDP's public key (obtained from a JWKS endpoint).

### Authorization

Authorization is based on a Role-Based Access Control (RBAC) model. A permission matrix defines which roles have access to which resources and actions. This is enforced at the API level through middleware.

## 7. Database Architecture

The system uses a PostgreSQL database with a multi-tenant schema. All tables include a `tenant_id` column, and Row-Level Security (RLS) is enforced to ensure strict data isolation between tenants.

## 8. Multi-Tenancy

The platform is designed as a multi-tenant system from the ground up. Tenant isolation is achieved through a combination of:

-   **JWT-based tenant identification:** The `tenantId` is embedded in the JWT.
-   **AsyncLocalStorage:** A tenant context is established for each request.
-   **Automatic query filtering:** The repository layer automatically injects `tenantId` filters into all database queries.
-   **Row-Level Security (RLS):** An additional layer of protection at the database level.

## 9. Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Redux Store (uses shared-types for state & actions)       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
        ┌───────────▼──────────┐  ┌────────▼──────────┐
        │  API (Express.js)    │  │  IDP (Fastify)   │
        └───────────┬──────────┘  └────────┬─────────┘
                    │                      │
        ┌───────────┴──────────────────────┘
        │
        ▼
    ┌──────────────────────────────────┐
    │  PostgreSQL Database             │
    └──────────────────────────────────┘
```
