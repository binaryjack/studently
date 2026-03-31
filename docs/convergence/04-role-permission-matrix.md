# Role Permission Matrix

Status: DRAFT  
Date: 2026-03-31  
Source: Dataverse security matrix + `docs/implementation/09-user-roles-hierarchy.md`  
Blocks: API middleware implementation, portal API response shaping

---

## Roles

```typescript
export type UserType =
  | 'CANDIDATE'    // External — portal only — sees own data only
  | 'COACH'        // Internal — backoffice — sees assigned files only
  | 'MANAGER'      // Internal — backoffice — sees all files in tenant
  | 'ADMIN'        // Internal — backoffice — full tenant access + config
  | 'SYSTEM';      // Internal — automated processes only
```

### Role Descriptions

| Role | App | Scope | Trust Level |
|------|-----|-------|-------------|
| `CANDIDATE` | portal | Own Person + own CoachingFile | LOW — external |
| `COACH` | backoffice | Assigned CoachingFiles | MEDIUM — internal |
| `MANAGER` | backoffice | All CoachingFiles in tenant | HIGH — internal |
| `ADMIN` | backoffice | Full tenant + settings | HIGHEST — internal |
| `SYSTEM` | none (API internal) | All data | SYSTEM — no UI |

---

## Permission Notation

```
C = Create
R = Read
U = Update
D = Delete (soft)
X = No access
P = Portal-visible fields only (filtered response)
```

---

## 1. Tenant

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read own tenant settings | X | X | R | R |
| Manage tenant settings | X | X | X | CRU |
| Provision tenant | X | X | X | X (SYSTEM only) |

---

## 2. User

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read own user record | R | R | R | R |
| Update own profile | U | U | U | U |
| Update own password | U | U | U | U |
| Read other users | X | X | R | R |
| Create users | X | X | C (candidates) | C |
| Suspend / archive users | X | X | X | U |
| Assign roles | X | X | X | CRU |

---

## 3. Person

### 3a. Person core record

| Field Group | CANDIDATE | COACH | MANAGER | ADMIN |
|-------------|:---------:|:-----:|:-------:|:-----:|
| Own record — identity fields | R + U | R | R | R + U |
| Other records | X | R (assigned) | R | R |
| Create person | X | C | C | C |
| Update person | Own only | Assigned only | Any | Any |
| Delete (soft) | X | X | X | D |
| `administrativeNotes` | X (never) | R + U | R + U | R + U |
| `candidateStatus` | X | X | R + U | R + U |

### 3b. ContactInfo / Address / PersonLanguage

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read own | R | — | — | — |
| Read assigned/any | — | R | R | R |
| Create / Update own | C + U | — | — | — |
| Create / Update for person | — | C + U | C + U | C + U |

### 3c. SwissCompliance

| Field | CANDIDATE | COACH | MANAGER | ADMIN |
|-------|:---------:|:-----:|:-------:|:-----:|
| `avsNumber` | R (masked) | X | R (masked) | R (unmasked) |
| `workPermit`, `workPermitExpiryDate` | R | R | R + U | R + U |
| `employmentStatus` | R | R + U | R + U | R + U |
| `orpNumber`, `laciReferenceNumber` | R | R | R + U | R + U |
| `unemploymentIndemnityChf` | X | X | R | R + U |

> **AVS masking rule**: AVS displayed as `756.XXXX.XXXX.XX` for all roles except ADMIN. Full value only in ADMIN view + access logged.

### 3d. ConsentRecord

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read own consents | R | — | — | — |
| Read any consent | — | X | R | R |
| Grant consent (own) | C | — | — | — |
| Revoke consent (own) | C | — | — | — |
| Record consent on behalf | — | X | C | C |

---

## 4. CoachProfile

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read coach name/specialties (visible) | R (limited) | R | R | R |
| Read own coach profile | — | R + U | R | R |
| Read other coach profiles | X | X | R | R |
| Manage coach profiles | X | X | C + U | C + U + D |
| `internalNotes` | X | Own only | R | R + U |
| `currentCaseload`, `maxCaseload` | X | R (own) | R | R + U |

---

## 5. Organization

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read organizations | X | R | R | R |
| Create / Update | X | X | C + U | C + U + D |
| Read PersonAffiliation (own) | R | — | — | — |
| Read PersonAffiliation (assigned) | — | R | R | R |
| Manage affiliations | X | C + U (assigned) | C + U | C + U + D |

---

## 6. CoachingFile

### 6a. Core record

| Field Group | CANDIDATE | COACH | MANAGER | ADMIN |
|-------------|:---------:|:-----:|:-------:|:-----:|
| `fileNumber`, `phase`, `status`, `progressScore` | R (own, `portalVisible=true`) | R (assigned) | R | R |
| `registrationDate`, `openingDate`, `closingDate` | R (own) | R (assigned) | R | R |
| `coachingType`, `generalObjective`, `finalSynthesis` | R (own, portal) | R + U (assigned) | R + U | R + U |
| `initialSummary` | R (own) | R + U | R + U | R + U |
| `intermediateSynthesis` | X (never) | R + U | R + U | R + U |
| `internalComment` | X (never) | R + U | R + U | R + U |
| `priority`, `urgencyLevel` | X | R + U | R + U | R + U |
| `coachId` (who is coach) | R (name only) | R | R + U | R + U |
| `managerId` | X | X | R | R + U |
| Create CoachingFile | X | C | C | C |
| Soft-close file | X | X | D | D |

### 6b. Portal visibility of CoachingFile fields

Fields visible to CANDIDATE via portal (when `portalVisible = true`):

```
fileNumber, phase, status, progressScore,
registrationDate, openingDate, closingDate,
coachingType, generalObjective, finalSynthesis,
initialSummary, lastContactDate, nextAppointmentDate,
plannedSessionCount, completedSessionCount,
coach name (display only — not ID)
```

Fields NEVER visible to CANDIDATE:
```
intermediateSynthesis, internalComment,
managerId, priority, urgencyLevel,
entrySource, closingReason (internal label),
administrativeNotes (Person)
```

---

## 7. Session

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read sessions (own file, `portalVisible=true`) | R (P) | R (assigned) | R | R |
| Read `coachNotes` | X (never) | R + U | R + U | R + U |
| Read `candidateSummary`, `nextSteps` | R (own) | R + U | R + U | R + U |
| Create / Update session | X | C + U (assigned) | C + U | C + U |
| Record presence | X | U | U | U |
| Cancel session | X | U | U | U |

Portal-visible fields to CANDIDATE:
```
label, startDateTime, endDateTime, durationMinutes,
type, mode, location, meetingUrl,
status, candidateSummary, nextSteps,
portalPublishedAt
```

Never visible to CANDIDATE: `coachNotes`, `candidatePresence`, `coachPresence`

---

## 8. Objective

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read (`portalVisible=true`) | R (own, P) | R + U (assigned) | R + U | R + U |
| Read `coachComment` | X (never) | R + U | R + U | R + U |
| Create / Update | X | C + U (assigned) | C + U | C + U |
| Mark achieved | X | U | U | U |

---

## 9. Action

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read (`portalVisible=true`) | R (own, P) | R + U (assigned) | R + U | R + U |
| Update `candidateResponse` | U (own) | X | X | X |
| Update action status | X | U | U | U |
| Read `coachComment` | X (never) | R + U | R + U | R + U |
| Read `isBlocking` flag | X | R | R | R + U |
| Create / Update action | X | C + U (assigned) | C + U | C + U |

Portal-visible fields to CANDIDATE:
```
label, description, type, assignedTo,
deadline, status, priority, isBlocking,
expectedProof, nextSteps, portalVisible,
candidateResponse (own — read + write)
```

Never visible to CANDIDATE: `coachComment`, `reminderSent`, `businessCreationDate`

---

## 10. Document

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read (`portalVisible=true`) | R (own, P) | R (assigned) | R | R |
| Upload document | C (own file) | C (assigned) | C | C |
| Validate / reject document | X | U | U | U |
| Delete document | X | X | D | D |
| Read `validationStatus` | R (own) | R + U | R + U | R + U |

Portal-visible fields to CANDIDATE:
```
label, documentType, category, validationStatus,
uploadDate, publishedAt, fileName,
logicalVersion, comment
```

Never visible: `fileUrl` (accessed via secure download endpoint only, not raw URL)

---

## 11. Message

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read (`portalVisible=true`) | R (own thread, P) | R + U (assigned) | R | R |
| Send message | C (own thread) | C (assigned) | C | C |
| Mark as read | U (own) | U (own) | X | X |
| Delete message | X | X | D | D |

---

## 12. CoachingHistory

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read (`portalVisible=true`) | R (own, P) | R (assigned) | R | R |
| Read `portalVisible=false` events | X | R | R | R |
| Create history record | X | X | X | X (SYSTEM only) |

History is **immutable** — no UPDATE or DELETE for any role including ADMIN.

---

## 13. JobDescription & AI Entities

| Operation | CANDIDATE | COACH | MANAGER | ADMIN |
|-----------|:---------:|:-----:|:-------:|:-----:|
| Read job descriptions | X | R | R | R + U |
| Create / update job descriptions | X | C + U | C + U | C + U + D |
| Trigger AI job matching | X | C (own files) | C | C |
| Read AI recommendations | X | R (own files) | R | R |
| Review AI recommendation | X | U (own files) | U | U |
| Override AI recommendation | X | C (own) | C | C |

---

## API Enforcement Rules

### 1. Tenant scoping
Every repository method appends `WHERE tenant_id = :currentTenantId`. No bypass.

### 2. Coach scope
Every coach query appends `WHERE coach_id = :currentUserId OR manager_id = :currentUserId`.

### 3. Candidate scope
Every candidate query filters by `person.userId = :currentUserId`.

### 4. Portal response shaping
Portal API routes strip fields where:
- `portalVisible = false` on the record
- Field is in the NEVER_VISIBLE list (hardcoded, not configurable)

```typescript
// packages/shared-api-client/src/portal/portal-response-filter.types.ts

export const NEVER_VISIBLE_FIELDS: Record<string, string[]> = {
  CoachingFile: ['intermediateSynthesis', 'internalComment', 'managerId', 'priority', 'urgencyLevel'],
  Session: ['coachNotes', 'candidatePresence', 'coachPresence'],
  Objective: ['coachComment'],
  Action: ['coachComment', 'reminderSent'],
  Person: ['administrativeNotes', 'candidateStatus'],
  SwissCompliance: ['avsNumber', 'unemploymentIndemnityChf'],
};
```

### 5. AVS masking middleware
```typescript
// Applied in backoffice API layer — not portal (AVS never shown on portal)
// ADMIN role: full value + audit log entry written
// All other internal roles: masked value 756.XXXX.XXXX.XX
```

### 6. Immutability enforcement
`CoachingHistory` table: INSERT only. No UPDATE/DELETE at database level (trigger-enforced + application-level).

---

## Portal Security Summary

```
CANDIDATE on portal can:
  ✓ Read own Person (identity, contact — NO internal fields)
  ✓ Read own CoachingFile (portal-visible fields only)
  ✓ Read own Sessions (portal-visible + portalVisible=true)
  ✓ Read own Objectives (portalVisible=true)
  ✓ Read own Actions (portalVisible=true), update candidateResponse
  ✓ Read own Documents (portalVisible=true), upload new documents
  ✓ Read own Messages (portalVisible=true), send messages, mark read
  ✓ Read own History (portalVisible=true events only)
  ✓ Update own personal data (firstName, lastName, contact, address, language prefs)
  ✓ Manage own consents

CANDIDATE on portal can NEVER:
  ✗ See other candidates
  ✗ See internal coach notes (any entity)
  ✗ See administrative flags or internal statuses
  ✗ See AVS number
  ✗ See AI recommendations
  ✗ Access backoffice routes
  ✗ Change coaching status, phase, assignment
  ✗ Delete any record
```
