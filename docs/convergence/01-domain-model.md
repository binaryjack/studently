# Domain Model — Unified Entity Specification

Status: DRAFT  
Date: 2026-03-31  
Sources: `docs/implementation/04-entities.md`, `docs/implementation/09-user-roles-hierarchy.md`, `docs/implementation/08-swiss-requirements.md`, Dataverse field dictionary (v2)

All entities extend `BaseEntity`. TypeScript types live in `packages/shared-types/src/`.  
File naming: kebab-case. One export per file. Types in `*.types.ts`.

---

## Entity Map

```
Tenant
└── User (identity)
    ├── CandidateProfile    (if role = CANDIDATE)
    └── CoachProfile        (if role = COACH)

Person (physical person, not necessarily a system user)
├── ContactInfo[]           (email, phone — normalized)
├── Address[]               (residential, billing — normalized)
├── PersonAffiliation[]     (links to Organizations)
├── SwissCompliance         (AVS, permit, employment status)
├── PersonLanguage[]        (spoken languages + levels)
└── ConsentRecord[]         (nLPD consent tracking)

Organization
└── PersonAffiliation[]     (N:N with Person)

CoachingFile                (pivot entity — heart of the domain)
├── Session[]
├── Objective[]
│   └── Action[]            (linked to Objective or Session)
├── Document[]
├── Message[]
└── CoachingHistory[]       (immutable audit trail)

JobDescription              (for AI matching)
└── linked to Organization (employer)

Assessment                  (AI-assisted competency analysis)
└── linked to Person

AIRecommendation            (coach advisor output)
└── linked to CoachingFile
```

---

## 1. Tenant

```typescript
// packages/shared-types/src/tenant/tenant.types.ts

export interface Tenant extends BaseEntity {
  name: string;
  slug: string;                          // URL-safe identifier
  status: TenantStatus;
  locale: SupportedLocale;               // default locale for tenant
  timezone: string;                      // IANA timezone
  contactEmail: string;
  settings: TenantSettings;
}

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'PROVISIONING' | 'ARCHIVED';
export type SupportedLocale = 'fr' | 'en' | 'de' | 'it';
```

---

## 2. User (Identity)

Source: `docs/implementation/09-user-roles-hierarchy.md`

```typescript
// packages/shared-types/src/user/user.types.ts

export interface User extends BaseEntity, FlaggedEntity {
  tenantId: string;                      // FK Tenant — ALL queries scoped by this
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  status: UserStatus;
  lastLoginAt?: string;                  // ISO 8601
  preferredLanguage: SupportedLocale;
  timezone: string;
  mfaEnabled: boolean;
}

export type UserType = 'CANDIDATE' | 'COACH' | 'MANAGER' | 'ADMIN' | 'SYSTEM';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED' | 'PENDING_ACTIVATION';
```

---

## 3. Person (Physical Person)

Source: Dataverse `contact` table + `docs/implementation/04-entities.md`  
Note: A `Person` may or may not have a linked `User` account.

```typescript
// packages/shared-types/src/person/person.types.ts

export interface Person extends BaseEntity, FlaggedEntity {
  tenantId: string;
  userId?: string;                        // FK User — null if no portal account yet

  // Core identity
  firstName: string;
  lastName: string;
  dateOfBirth?: string;                   // ISO 8601 date
  gender?: Gender;

  // Business identifier
  candidateNumber?: string;               // adv_numerocandidat — human-readable ID, auto-generated

  // Status
  candidateStatus: CandidateStatus;
  isActiveCandidate: boolean;             // quick filter flag

  // Registration
  registrationSource: RegistrationSource;
  preferredLanguage?: SupportedLocale;
  preferredChannel?: CommunicationChannel;
  availabilityNotes?: string;             // free text V1

  // Current situation
  currentSituation?: CurrentSituation;   // employment/life situation at intake
  mainObjective?: string;                 // stated objective at registration

  // Consent (nLPD)
  consentDataProcessing: boolean;
  consentDataProcessingDate?: string;
  consentVersion?: string;               // version of consent text accepted
  consentCommunications: boolean;

  // Internal flags
  profileCompleted: boolean;             // minimal portal profile complete?
  administrativeNotes?: string;          // INTERNAL ONLY — never portal-visible

  // Swiss compliance (see SwissCompliance entity)
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type CandidateStatus = 'ACTIVE' | 'INACTIVE' | 'TO_VERIFY' | 'BLOCKED';

export type RegistrationSource = 'WEB_PORTAL' | 'IMPORT' | 'INTERNAL' | 'PARTNER' | 'OTHER';

export type CommunicationChannel = 'EMAIL' | 'PHONE' | 'SMS' | 'TEAMS' | 'POST';

export type CurrentSituation =
  | 'UNEMPLOYED_LACI'
  | 'UNEMPLOYED_RI'
  | 'UNEMPLOYED_AI'
  | 'EMPLOYED_SEEKING'
  | 'EMPLOYED_NOT_SEEKING'
  | 'STUDENT'
  | 'OTHER';
```

### 3.1 ContactInfo (Normalized)

```typescript
export interface ContactInfo extends BaseEntity {
  personId: string;
  tenantId: string;
  type: ContactInfoType;
  value: string;
  isPreferred: boolean;
  isVerified: boolean;
  verifiedAt?: string;
}

export type ContactInfoType = 'EMAIL' | 'PHONE_MOBILE' | 'PHONE_HOME' | 'PHONE_WORK' | 'LINKEDIN' | 'OTHER';
```

### 3.2 Address (Normalized)

```typescript
export interface Address extends BaseEntity {
  personId: string;
  tenantId: string;
  type: AddressType;
  street: string;
  streetComplement?: string;
  postalCode: string;
  city: string;
  canton?: SwissCanton;
  country: string;                        // ISO 3166-1 alpha-2
  isPreferred: boolean;
}

export type AddressType = 'RESIDENTIAL' | 'CORRESPONDENCE' | 'WORK';
```

### 3.3 SwissCompliance

Source: `docs/implementation/08-swiss-requirements.md`

```typescript
export interface SwissCompliance extends BaseEntity {
  personId: string;
  tenantId: string;

  // Social security
  avsNumber?: string;                     // AVS/AHV — 756.XXXX.XXXX.XX — ENCRYPTED
  orpNumber?: string;                     // ORP assigned number
  employmentStatus: SwissEmploymentStatus;
  laciReferenceNumber?: string;
  riCaseNumber?: string;
  aiReferenceNumber?: string;

  // Work permit (non-Swiss nationals)
  workPermit?: WorkPermit;
  workPermitExpiryDate?: string;

  // Benefits
  canton: SwissCanton;
  unemploymentIndemnityChf?: number;
  unemploymentBenefitsStartDate?: string;
  unemploymentBenefitsEndDate?: string;
}

export type SwissEmploymentStatus = 'LACI' | 'RI' | 'AI' | 'EMPLOYED' | 'UNEMPLOYED' | 'STUDENT' | 'OTHER';

export type WorkPermit = 'B' | 'C' | 'G' | 'L' | 'N' | 'S' | 'NONE';

export type SwissCanton =
  | 'AG' | 'AI' | 'AR' | 'BE' | 'BL' | 'BS' | 'FR' | 'GE' | 'GL'
  | 'GR' | 'JU' | 'LU' | 'NE' | 'NW' | 'OW' | 'SG' | 'SH' | 'SO'
  | 'SZ' | 'TG' | 'TI' | 'UR' | 'VD' | 'VS' | 'ZG' | 'ZH';
```

### 3.4 PersonLanguage

```typescript
export interface PersonLanguage extends BaseEntity {
  personId: string;
  tenantId: string;
  language: SupportedLocale | string;    // ISO 639-1
  level: LanguageLevel;
  isNative: boolean;
}

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'NATIVE';
```

### 3.5 ConsentRecord (nLPD audit trail)

```typescript
export interface ConsentRecord extends BaseEntity {
  personId: string;
  tenantId: string;
  consentType: ConsentType;
  granted: boolean;
  consentVersion: string;
  ipAddress?: string;
  userAgent?: string;
  revokedAt?: string;
}

export type ConsentType = 'DATA_PROCESSING' | 'COMMUNICATIONS' | 'AI_ANALYSIS' | 'THIRD_PARTY_SHARING';
```

---

## 4. CoachProfile

Source: Dataverse `adv_coach`

```typescript
// packages/shared-types/src/coach/coach-profile.types.ts

export interface CoachProfile extends BaseEntity {
  tenantId: string;
  userId: string;                         // FK User (mandatory — coach must have account)
  displayName: string;
  professionalEmail?: string;
  professionalPhone?: string;
  status: CoachStatus;
  specialties?: string;                   // free text V1, N:N table in V2
  maxCaseload: number;                    // max simultaneous coaching files
  currentCaseload: number;               // computed / maintained by event handler
  visibleForAssignment: boolean;         // can be proposed for new files?
  internalNotes?: string;                // INTERNAL ONLY
}

export type CoachStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'ARCHIVED';
```

---

## 5. Organization

Source: `docs/private/Réflexions...txt` + `docs/implementation/04-entities.md`

```typescript
// packages/shared-types/src/organization/organization.types.ts

export interface Organization extends BaseEntity, FlaggedEntity {
  tenantId: string;
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  address?: string;                       // simplified V1
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

export type OrganizationType =
  | 'EMPLOYER'
  | 'ORP'
  | 'UNEMPLOYMENT_FUND'
  | 'TRAINING_PROVIDER'
  | 'AI_INSURANCE'
  | 'OTHER';

export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
```

### 5.1 PersonAffiliation (N:N — Person ↔ Organization)

```typescript
export interface PersonAffiliation extends BaseEntity {
  tenantId: string;
  personId: string;
  organizationId: string;
  role: AffiliationRole;
  startDate?: string;
  endDate?: string;
  isPrimary: boolean;
  notes?: string;
}

export type AffiliationRole =
  | 'EMPLOYEE'
  | 'FORMER_EMPLOYEE'
  | 'REGISTERED_UNEMPLOYED'        // at ORP
  | 'BENEFIT_RECIPIENT'            // at unemployment fund or AI insurance
  | 'TRAINEE'
  | 'OTHER';
```

---

## 6. CoachingFile (Pivot Entity)

Source: Dataverse `adv_dossiercoaching` — most complete business spec

```typescript
// packages/shared-types/src/coaching/coaching-file.types.ts

export interface CoachingFile extends BaseEntity, FlaggedEntity {
  tenantId: string;

  // Label
  fileNumber: string;                     // adv_name — e.g. DOS-2026-000123

  // Relationships
  personId: string;                       // FK Person (candidate)
  coachId?: string;                       // FK CoachProfile
  managerId?: string;                     // FK User (supervisor/manager)

  // Type & source
  coachingType: CoachingType;
  entrySource?: EntrySource;

  // Dates
  registrationDate: string;              // ISO 8601 datetime
  openingDate?: string;                  // effective start of coaching
  closingDate?: string;

  // Lifecycle (see 03-coaching-lifecycle.md)
  phase: CoachingPhase;
  status: CoachingStatus;
  closingReason?: ClosingReason;
  isActive: boolean;                     // logical active flag

  // Priority
  priority: Priority;
  urgencyLevel?: UrgencyLevel;

  // Progress
  progressScore?: number;                // 0-100
  lastContactDate?: string;
  nextAppointmentDate?: string;
  plannedSessionCount?: number;
  completedSessionCount?: number;        // maintained by event handler

  // Content (coach-authored)
  initialSummary?: string;              // adv_resumeinitial
  generalObjective?: string;            // adv_objectifgeneral
  intermediateSynthesis?: string;       // INTERNAL ONLY
  finalSynthesis?: string;
  internalComment?: string;             // INTERNAL ONLY

  // Portal
  portalVisible: boolean;               // default: true for active file
}

export type CoachingType =
  | 'CAREER_COACHING'
  | 'OUTPLACEMENT'
  | 'PROFESSIONAL_DEVELOPMENT'
  | 'REINTEGRATION'
  | 'OTHER';

export type EntrySource =
  | 'ORP_REFERRAL'
  | 'DIRECT'
  | 'EMPLOYER'
  | 'INTERNAL'
  | 'PARTNER'
  | 'OTHER';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type UrgencyLevel = 'NONE' | 'MODERATE' | 'HIGH' | 'CRITICAL';

// CoachingPhase and CoachingStatus defined in 03-coaching-lifecycle.md
export type ClosingReason =
  | 'GOAL_ACHIEVED'
  | 'EMPLOYMENT_FOUND'
  | 'CANDIDATE_DROPOUT'
  | 'NO_SHOW'
  | 'TRANSFER'
  | 'ADMINISTRATIVE'
  | 'OTHER';
```

---

## 7. Session

Source: Dataverse `adv_seance`

```typescript
// packages/shared-types/src/coaching/session.types.ts

export interface Session extends BaseEntity {
  tenantId: string;
  coachingFileId: string;
  personId: string;                       // denormalized for query convenience
  coachId?: string;

  label: string;                          // e.g. "Session 1 — Diagnostic"
  startDateTime: string;                  // ISO 8601
  endDateTime?: string;
  durationMinutes?: number;

  type: SessionType;
  mode: SessionMode;
  location?: string;                      // if in-person
  meetingUrl?: string;                    // if virtual

  status: SessionStatus;
  candidatePresence?: Presence;
  coachPresence?: Presence;

  // Internal
  coachNotes?: string;                    // INTERNAL ONLY

  // Portal-visible content
  candidateSummary?: string;             // shared summary for candidate
  nextSteps?: string;                    // next steps visible to candidate

  // Portal
  portalVisible: boolean;               // default: true
  portalPublishedAt?: string;
}

export type SessionType =
  | 'DIAGNOSTIC'
  | 'FOLLOW_UP'
  | 'ACTION_REVIEW'
  | 'ASSESSMENT'
  | 'MOCK_INTERVIEW'
  | 'NETWORK_PREP'
  | 'CLOSING'
  | 'OTHER';

export type SessionMode = 'IN_PERSON' | 'VIDEO' | 'PHONE' | 'ASYNC';

export type SessionStatus =
  | 'PLANNED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type Presence = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNKNOWN';
```

---

## 8. Objective

Source: Dataverse `adv_objectif`

```typescript
// packages/shared-types/src/coaching/objective.types.ts

export interface Objective extends BaseEntity {
  tenantId: string;
  coachingFileId: string;
  personId?: string;
  coachId?: string;

  label: string;
  description?: string;
  category?: ObjectiveCategory;
  priority: Priority;

  startDate?: string;
  targetDate?: string;
  status: ObjectiveStatus;
  successIndicator?: string;

  displayOrder?: number;
  coachComment?: string;                 // INTERNAL ONLY
  portalVisible: boolean;               // default: true
}

export type ObjectiveCategory =
  | 'JOB_SEARCH'
  | 'SKILLS_DEVELOPMENT'
  | 'NETWORK'
  | 'CV_COVER_LETTER'
  | 'INTERVIEW_PREP'
  | 'PERSONAL_DEVELOPMENT'
  | 'ADMINISTRATIVE'
  | 'OTHER';

export type ObjectiveStatus =
  | 'TO_START'
  | 'IN_PROGRESS'
  | 'ACHIEVED'
  | 'ABANDONED'
  | 'DEFERRED';
```

---

## 9. Action

Source: Dataverse `adv_action`

```typescript
// packages/shared-types/src/coaching/action.types.ts

export interface Action extends BaseEntity {
  tenantId: string;
  coachingFileId: string;
  sessionId?: string;
  objectiveId?: string;
  personId?: string;
  coachId?: string;

  label: string;
  description?: string;
  type?: ActionType;
  assignedTo: ActionAssignee;

  businessCreationDate: string;          // adv_datecreationmetier
  deadline?: string;
  status: ActionStatus;
  priority: Priority;

  isBlocking: boolean;                   // blocks next step if not done — adv_bloquante
  reminderSent: boolean;

  // Evidence
  expectedProof?: string;               // e.g. "CV PDF, certificate"
  candidateResponse?: string;           // candidate's reply/update

  // Internal
  coachComment?: string;               // INTERNAL ONLY
  completedAt?: string;

  portalVisible: boolean;              // default: true
}

export type ActionType =
  | 'DOCUMENT_TO_PREPARE'
  | 'APPLICATION_TO_SEND'
  | 'RESEARCH'
  | 'CONTACT_TO_MAKE'
  | 'TRAINING'
  | 'READING'
  | 'REFLECTION'
  | 'ADMINISTRATIVE'
  | 'OTHER';

export type ActionAssignee = 'CANDIDATE' | 'COACH' | 'BOTH' | 'THIRD_PARTY';

export type ActionStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | 'OVERDUE';
```

---

## 10. Document

Source: Dataverse `adv_document`

```typescript
// packages/shared-types/src/document/coaching-document.types.ts

export interface CoachingDocument extends BaseEntity {
  tenantId: string;
  coachingFileId: string;
  personId?: string;
  sessionId?: string;
  objectiveId?: string;

  label: string;
  documentType: CoachingDocumentType;
  category?: DocumentCategory;
  validationStatus: DocumentValidationStatus;
  uploadedBy: UploadedBy;

  uploadDate: string;
  publishedAt?: string;

  // Storage (one of two)
  fileName?: string;
  fileUrl?: string;                      // S3 / object storage URL
  fileSizeBytes?: number;

  logicalVersion: string;               // default: "1.0"
  comment?: string;
  portalVisible: boolean;              // default: true
}

export type CoachingDocumentType =
  | 'CV'
  | 'COVER_LETTER'
  | 'CERTIFICATE'
  | 'DIPLOMA'
  | 'WORK_PERMIT'
  | 'IDENTITY'
  | 'ORP_FORM'
  | 'COACHING_REPORT'
  | 'SESSION_SUMMARY'
  | 'CONVENTION'
  | 'OTHER';

export type DocumentCategory = 'CANDIDATE_PRODUCED' | 'COACH_PRODUCED' | 'ADMINISTRATIVE' | 'REFERENCE';

export type DocumentValidationStatus = 'SUBMITTED' | 'TO_VERIFY' | 'VALIDATED' | 'REJECTED';

export type UploadedBy = 'CANDIDATE' | 'COACH' | 'ADMIN' | 'SYSTEM';
```

---

## 11. Message

Source: Dataverse `adv_message`

```typescript
// packages/shared-types/src/coaching/message.types.ts

export interface Message extends BaseEntity {
  tenantId: string;
  coachingFileId: string;

  authorType: MessageAuthorType;
  authorPersonId?: string;               // if candidate
  authorCoachId?: string;               // if coach

  subject: string;
  content: string;
  messageType: MessageType;
  sentAt: string;

  documentId?: string;                   // attached document

  readByCandidate: boolean;
  readByCoach: boolean;
  portalVisible: boolean;              // default: true
}

export type MessageAuthorType = 'COACH' | 'CANDIDATE' | 'MANAGER' | 'SYSTEM';

export type MessageType =
  | 'INFORMATION'
  | 'ACTION_REQUEST'
  | 'DOCUMENT_REQUEST'
  | 'REMINDER'
  | 'FEEDBACK'
  | 'SYSTEM_NOTIFICATION';
```

---

## 12. CoachingHistory (Immutable Audit Trail)

Source: Dataverse `adv_historique`

```typescript
// packages/shared-types/src/coaching/coaching-history.types.ts

export interface CoachingHistory extends BaseEntity {
  tenantId: string;
  coachingFileId: string;

  eventLabel: string;
  eventDateTime: string;
  eventType: CoachingEventType;

  // State transitions
  statusBefore?: CoachingStatus;
  statusAfter?: CoachingStatus;
  phaseBefore?: CoachingPhase;
  phaseAfter?: CoachingPhase;

  // Actor
  triggeredByType: TriggeredByType;
  triggeredByPersonId?: string;
  triggeredByCoachId?: string;

  comment?: string;
  portalVisible: boolean;              // default: false (internal audit only, exceptions possible)
}

export type CoachingEventType =
  | 'FILE_CREATED'
  | 'PHASE_CHANGED'
  | 'STATUS_CHANGED'
  | 'COACH_ASSIGNED'
  | 'SESSION_COMPLETED'
  | 'DOCUMENT_VALIDATED'
  | 'ACTION_COMPLETED'
  | 'PORTAL_ACTIVATED'
  | 'FILE_CLOSED'
  | 'SYSTEM_EVENT';

export type TriggeredByType = 'CANDIDATE' | 'COACH' | 'MANAGER' | 'ADMIN' | 'SYSTEM';
```

---

## 13. JobDescription (AI Domain)

New entity — not in Dataverse specs, required for AI matching (D-05).

```typescript
// packages/shared-types/src/ai/job-description.types.ts

export interface JobDescription extends BaseEntity {
  tenantId: string;
  organizationId?: string;              // FK Organization (employer)

  title: string;
  description: string;
  requirements: string;
  niceToHave?: string;
  contractType: ContractType;
  workload?: string;                    // e.g. "80-100%"
  location?: string;
  salaryRange?: string;
  activeFrom?: string;
  activeTo?: string;
  status: JobDescriptionStatus;

  // AI
  embeddingVector?: number[];           // pgvector — populated by AI worker
  embeddingGeneratedAt?: string;
}

export type ContractType = 'PERMANENT' | 'FIXED_TERM' | 'INTERNSHIP' | 'FREELANCE' | 'APPRENTICESHIP' | 'OTHER';
export type JobDescriptionStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
```

---

## 14. AIRecommendation

New entity — stores AI outputs for audit and coach review.

```typescript
// packages/shared-types/src/ai/ai-recommendation.types.ts

export interface AIRecommendation extends BaseEntity {
  tenantId: string;
  coachingFileId: string;

  tool: AITool;
  inputSummary: string;                 // brief description of what was analyzed
  output: string;                       // JSON or text output from AI

  aiModelVersion: string;
  aiGeneratedAt: string;
  confidenceScore?: number;            // 0-1 if tool provides it

  // Coach review
  reviewedByCoachId?: string;
  reviewedAt?: string;
  coachDecision?: AIDecision;
  coachOverrideReason?: string;        // mandatory if DISMISSED
}

export type AITool =
  | 'JOB_MATCHER'
  | 'PROFILE_ASSESSOR'
  | 'SEMANTIC_SEARCH'
  | 'COACH_ADVISOR'
  | 'REPORT_GENERATOR'
  | 'COMPARISON';

export type AIDecision = 'ACCEPTED' | 'PARTIALLY_ACCEPTED' | 'DISMISSED';
```

---

## Dataverse → TypeScript Type Mapping Reference

| Dataverse Type | TypeScript Type |
|---------------|----------------|
| Single line of text | `string` |
| Multiple lines of text | `string` |
| Choice | `union type` |
| Two options | `boolean` |
| Whole number | `number` |
| Date and time | `string` (ISO 8601) |
| Date only | `string` (ISO 8601 date) |
| Lookup | `string` (FK id) |
| URL | `string` |
| File | `string` (storage URL) |

## Choice Lists (CHOICE_* → TypeScript Unions)

| CHOICE_* Reference | TypeScript Type | Values |
|-------------------|----------------|--------|
| CHOICE_CONTACT_STATUT | `CandidateStatus` | ACTIVE, INACTIVE, TO_VERIFY, BLOCKED |
| CHOICE_SOURCE_INSCRIPTION | `RegistrationSource` | WEB_PORTAL, IMPORT, INTERNAL, PARTNER, OTHER |
| CHOICE_LANGUE | `SupportedLocale` | fr, en, de, it |
| CHOICE_COACH_STATUT | `CoachStatus` | ACTIVE, INACTIVE, ON_LEAVE, ARCHIVED |
| CHOICE_TYPE_COACHING | `CoachingType` | (see CoachingFile) |
| CHOICE_DOSSIER_STATUT | `CoachingStatus` | (see 03-coaching-lifecycle.md) |
| CHOICE_DOSSIER_PHASE | `CoachingPhase` | (see 03-coaching-lifecycle.md) |
| CHOICE_PRIORITE | `Priority` | LOW, NORMAL, HIGH, URGENT |
| CHOICE_NIVEAU_URGENCE | `UrgencyLevel` | NONE, MODERATE, HIGH, CRITICAL |
| CHOICE_TYPE_SEANCE | `SessionType` | (see Session) |
| CHOICE_MODE_SEANCE | `SessionMode` | IN_PERSON, VIDEO, PHONE, ASYNC |
| CHOICE_STATUT_SEANCE | `SessionStatus` | (see Session) |
| CHOICE_PRESENCE | `Presence` | PRESENT, ABSENT, LATE, EXCUSED, UNKNOWN |
| CHOICE_CATEGORIE_OBJECTIF | `ObjectiveCategory` | (see Objective) |
| CHOICE_STATUT_OBJECTIF | `ObjectiveStatus` | TO_START, IN_PROGRESS, ACHIEVED, ABANDONED, DEFERRED |
| CHOICE_TYPE_ACTION | `ActionType` | (see Action) |
| CHOICE_ASSIGNEE_A | `ActionAssignee` | CANDIDATE, COACH, BOTH, THIRD_PARTY |
| CHOICE_STATUT_ACTION | `ActionStatus` | TO_DO, IN_PROGRESS, DONE, CANCELLED, OVERDUE |
| CHOICE_TYPE_DOCUMENT | `CoachingDocumentType` | (see Document) |
| CHOICE_STATUT_VALIDATION_DOCUMENT | `DocumentValidationStatus` | SUBMITTED, TO_VERIFY, VALIDATED, REJECTED |
| CHOICE_TYPE_MESSAGE | `MessageType` | (see Message) |
| CHOICE_AUTEUR_TYPE | `MessageAuthorType` | COACH, CANDIDATE, MANAGER, SYSTEM |
| CHOICE_TYPE_EVENEMENT | `CoachingEventType` | (see CoachingHistory) |
| CHOICE_MOTIF_CLOTURE | `ClosingReason` | (see CoachingFile) |
| CHOICE_SITUATION_ACTUELLE | `CurrentSituation` | (see Person) |
