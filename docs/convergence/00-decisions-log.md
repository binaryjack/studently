# Decisions Log

Status: LOCKED  
Date: 2026-03-31  
Sources: `docs/implementation/` (architecture) + `docs/private/2026-03-25 - Person/` (business specs)

---

## D-01 — Technology Stack

**Decision**: Use the implementation docs stack. Reject Power Platform / Dataverse as target platform.

**Stack locked**:

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend | Node.js / Fastify | Already specified in implementation docs, TypeScript-native |
| ORM | Drizzle or Prisma (TBD) | PostgreSQL-first, type-safe |
| Database | PostgreSQL + pgvector | Relational + vector search for AI |
| Frontend | React + Vite | Existing implementation docs architecture |
| State | Redux (feature slices) | Defined in doc 21 |
| Auth | RS256 JWT + MFA | Defined in doc 03 |
| Cache | Redis | Token blacklist, rate limiting |
| CI/CD | GitHub Actions + Docker | Existing monorepo setup |
| Monitoring | Prometheus + Grafana + Sentry | Defined in business specs, aligned |

**Rejected**: Power Platform, Power Automate, Dataverse, SharePoint as target runtime.  
**Retained from business specs**: Domain model, field dictionary, lifecycle definitions, security matrix, choice lists.

---

## D-02 — Multi-Tenant Architecture

**Decision**: Multi-tenant from day one. Single tenant for initial testing/deployment.

**Implementation**:
- Every database table includes `tenant_id: uuid` (mandatory, non-nullable)
- Every query scoped by `tenant_id` — enforced at repository layer
- Tenant provisioning flow required before any feature work
- Row-level security (RLS) in PostgreSQL as secondary enforcement layer
- No cross-tenant data leakage possible by design

**Initial deployment**: Single tenant (`tenant_id` = fixed UUID in config), expandable without schema change.

---

## D-03 — Monorepo App Structure

**Decision**: Three apps in monorepo, shared packages.

```
apps/
├── backoffice/     ← coaches, managers, admins (internal, high trust)
├── portal/         ← candidates (external, low trust, restricted view)
└── showcase/       ← public marketing site (no auth)

packages/
├── shared-types/   ← ALL domain TypeScript types (already exists)
├── shared-ui/      ← atomic design system (components, tokens)
├── shared-api-client/  ← typed API client generated from OpenAPI spec
├── shared-auth/    ← JWT validation, role guards, permission hooks
├── shared-ai/      ← AI tooling layer (matching, assessment, search)
└── shared-config/  ← env schema, constants, i18n, feature flags
```

**Portal vs Backoffice contract**:
- Same domain entities, different field visibility (controlled by `portalVisible` flag)
- Same design system components, different layout shells
- Separate auth flows: backoffice = internal SSO, portal = email/password + MFA optional
- Separate API response shapes: portal responses strip `internalOnly` fields at API layer

---

## D-04 — Organizations Entity In Scope

**Decision**: `Organization` entity is in scope as a first-class domain entity.

**Organization types**:
- `EMPLOYER` — current or prospective employer
- `ORP` — Office Régional de Placement (Swiss unemployment office)
- `UNEMPLOYMENT_FUND` — caisse de chômage (UNIA, etc.)
- `TRAINING_PROVIDER` — school, course provider
- `AI_INSURANCE` — assurance-invalidité body
- `OTHER`

**Relationships**:
- `Person` ↔ `Organization` via `PersonAffiliation` (N:N with role + dates)
- `CoachingFile` ↔ `Organization` (ORP referral, unemployment fund link)

---

## D-05 — AI Integration Scope

**Decision**: AI is a first-class feature, not an afterthought.

**AI tools locked in scope**:

| Tool | Input | Output |
|------|-------|--------|
| `job-matcher` | CandidateProfile + JobDescription | Match score + reasoning |
| `profile-assessor` | CandidateProfile + competency framework | Gap analysis report |
| `semantic-search` | Natural language query | Ranked entity results |
| `coach-advisor` | CoachingFile context | Recommended actions/resources |
| `report-generator` | CoachingFile + template | Structured coaching report |
| `comparison` | N candidates or N jobs | Side-by-side comparison matrix |

**AI constraints**:
- AI surfaces scores and recommendations — coach validates ALL outputs
- No autonomous decisions
- All AI outputs stored with `aiGeneratedAt` timestamp and `aiModelVersion`
- Coach can override or dismiss any AI recommendation with mandatory reason

**AI package**: `packages/shared-ai/` — shared across backoffice only (portal has no AI access).

**Vector store**: pgvector (co-located with PostgreSQL) for MVP. Pinecone as migration target if scale requires.

---

## D-06 — Swiss Compliance Mandatory

**Decision**: Swiss regulatory requirements are mandatory, not optional.

**Locked requirements**:

| Requirement | Regulation | Implementation |
|------------|------------|----------------|
| AVS/AHV number | Federal law (LAVS) | Encrypted column, access audit log |
| Work permit types B/C/G/L/N/S | AEI / LEI | Enum field + expiry date tracking |
| Unemployment status (LACI/RI/AI) | LACI / LAI | SwissEmploymentStatus enum (from doc 08) |
| ORP number | LACI | String field on Person |
| nLPD compliance | Federal nLPD (2023) | Consent tracking, right to erasure workflow |
| Data residency | Client requirement | CH-hosted deployment (Exoscale or Hetzner CH) |
| Multilingual | Swiss culture | FR / EN / DE / IT — all 4 mandatory |
| Canton of residence | Administrative | SwissCanton enum (26 cantons, from doc 08) |

**Consent model**: Every Person entity tracks:
- `consentDataProcessing: boolean` + `consentDataProcessingDate`
- `consentCommunications: boolean`
- `consentVersion: string` (text version accepted)
- Right to erasure: soft-delete + anonymization workflow, NOT hard delete

---

## D-07 — Domain Language

**Decision**: Use the Dataverse business dictionary as canonical domain language.

- Entity names are English translations of the French Dataverse names
- Field names follow camelCase TypeScript convention (kebab-case files per architecture rules)
- Choice list values are English translations of French CHOICE_* lists
- The Dataverse `adv_` prefix is stripped — it was a Dataverse namespace artifact

**Mapping reference**: See `01-domain-model.md` for full translation table.

---

## D-08 — Portal Visibility Model

**Decision**: `portalVisible: boolean` flag exists on Session, Objective, Action, Document, Message, History.

- Backoffice controls what the candidate sees
- API layer enforces visibility — portal API responses filter `portalVisible = false` records
- Candidates can NEVER see internal coach notes, administrative flags, or AI analysis
- Default values defined per entity type (see `04-role-permission-matrix.md`)

---

## D-09 — Automation Events (not Power Automate)

**Decision**: 9 business automation flows from Power Automate specs become domain events in the application stack.

| Original Flow | Domain Event | Handler |
|--------------|-------------|---------|
| Inscription auto-assignment | `CoachingFileCreated` | assign-coach.handler |
| Dormant file alert | `CoachingFileInactive` | dormancy-check.scheduler |
| Session reminder | `SessionReminderDue` | session-reminder.scheduler |
| Document validation request | `DocumentSubmitted` | document-review.handler |
| Phase change notification | `CoachingFilePhaseChanged` | phase-notification.handler |
| Action deadline alert | `ActionDeadlineApproaching` | action-deadline.scheduler |
| Completion report generation | `CoachingFileCompleted` | report-generation.handler |
| Portal access grant | `CandidatePortalActivated` | portal-access.handler |
| Coach load rebalancing | `CoachOverloaded` | coach-load.handler |

Implementation: Domain events via in-process event bus (MVP), upgradeable to message queue (BullMQ/Redis).

---

## D-10 — Testing Standards

**Decision**: 95% minimum test coverage per architecture rules. No exceptions.

- Business logic: unit tests mandatory
- Domain events: integration tests mandatory
- API endpoints: contract tests mandatory
- AI tools: deterministic mock tests + evaluation harness (LLM outputs are non-deterministic)

---

## Open Decisions (not yet resolved)

| ID | Question | Blocking | Target |
|----|----------|----------|--------|
| O-01 | Document storage: S3-compatible vs local vs hybrid? | Phase 2 | TBD |
| O-02 | Portal real-time messages: WebSocket vs polling? | Phase 2 | TBD |
| O-03 | PDF report generation: Puppeteer vs PDFKit vs external service? | Phase 2 | TBD |
| O-04 | ORP integration: direct API or manual CSV import? | Phase 3 | TBD |
| O-05 | Calendar sync (Teams / Google) for session scheduling? | Phase 3 | TBD |
| O-06 | Backend language: Node/Fastify confirmed or Python/FastAPI? | P0 | **PENDING — human decision required** |

> **Note on O-06** — BLOCKED PENDING DECISION:  
> Business specs proposed Python/FastAPI. Implementation docs use Node/Fastify. The existing codebase is TypeScript monorepo.  
> **No API code should be written until this is resolved.**  
> Options:  
> - A) Node.js + Fastify + TypeScript (aligns with existing monorepo, shared types, one language)  
> - B) Python + FastAPI (aligns with original business spec proposal, different language boundary)  
> - C) Node.js + NestJS (heavier but more opinionated structure)  
> Decision owner: project lead. Record decision here and update `D-01` accordingly.
