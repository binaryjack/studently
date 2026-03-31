# Coaching Lifecycle — Phases, Statuses & Transitions

Status: DRAFT  
Date: 2026-03-31  
Source: Dataverse `CHOICE_DOSSIER_PHASE`, `CHOICE_DOSSIER_STATUT` + business specs  
Blocks: All coaching feature implementation, workflow engine configuration

---

## Overview

A `CoachingFile` progresses through **8 phases** and has a **10-value status** at any moment.  
Phase and status are independent axes:
- **Phase** = where in the coaching journey (sequential, forward-only except SUSPENDED)
- **Status** = operational state of the file (can change within a phase)

---

## Phases

```typescript
export type CoachingPhase =
  | 'REGISTRATION'           // 1. Inscription — file created, candidate registered
  | 'INTAKE'                 // 2. Accueil — initial diagnostic session
  | 'DIAGNOSIS'              // 3. Diagnostic — situation analysis, objective setting
  | 'ACTION_PLAN'            // 4. Plan d'action — concrete steps defined
  | 'ACTIVE_COACHING'        // 5. Coaching actif — sessions, actions, follow-up
  | 'CONSOLIDATION'          // 6. Consolidation — results solidified, near end
  | 'CLOSING'                // 7. Clôture — file wrapping up
  | 'CLOSED';                // 8. Fermé — file archived
```

### Phase Descriptions

| Phase | Label (FR) | Description | Key Events |
|-------|-----------|-------------|-----------|
| `REGISTRATION` | Inscription | Candidate registered, file created, no coach yet | File created, portal activation |
| `INTAKE` | Accueil | First contact, admin checks, coach assignment | Coach assigned, first session planned |
| `DIAGNOSIS` | Diagnostic | Situation analysis, competency assessment, objective framing | Diagnosis session completed, objectives defined |
| `ACTION_PLAN` | Plan d'action | Concrete action plan validated with candidate | Action plan signed off |
| `ACTIVE_COACHING` | Coaching actif | Regular sessions, action tracking, document reviews | Sessions completed, actions progressing |
| `CONSOLIDATION` | Consolidation | Results reinforced, near-final synthesis | Intermediate synthesis written |
| `CLOSING` | Clôture | Final session, report generation, administrative closure | Final synthesis, closing report |
| `CLOSED` | Fermé | File archived, statistics captured | File archived |

---

## Statuses

```typescript
export type CoachingStatus =
  | 'IN_PROGRESS'            // En cours — active, normal progress
  | 'WAITING_CANDIDATE'      // En attente candidat — awaiting candidate action
  | 'WAITING_DOCUMENT'       // En attente document — document requested, pending
  | 'WAITING_ASSIGNMENT'     // En attente affectation — no coach yet
  | 'APPOINTMENT_SCHEDULED'  // RDV planifié — next session scheduled
  | 'DORMANT'                // Dormant — no activity for N days (configurable threshold)
  | 'SUSPENDED'              // Suspendu — intentionally paused (medical, personal)
  | 'TO_CLOSE'               // À clôturer — ready for administrative closure
  | 'CLOSED_SUCCESS'         // Clôturé — successful outcome
  | 'CLOSED_DROPOUT';        // Abandonné — candidate dropped out or file administratively closed
```

### Status Descriptions

| Status | Trigger | Expected Action |
|--------|---------|----------------|
| `IN_PROGRESS` | Default active state | Coach follows up per plan |
| `WAITING_CANDIDATE` | Action assigned to candidate, not done | Monitor action deadline |
| `WAITING_DOCUMENT` | Document requested, not submitted | Remind via portal/email |
| `WAITING_ASSIGNMENT` | File created, no coach yet | Manager assigns coach |
| `APPOINTMENT_SCHEDULED` | Next session booked | Attend session |
| `DORMANT` | No activity for threshold days | Coach/manager alert — `CoachingFileInactive` event |
| `SUSPENDED` | Coach or manager explicitly suspends | Set resume date |
| `TO_CLOSE` | Coaching complete, admin steps pending | Generate final report |
| `CLOSED_SUCCESS` | Goal achieved or employment found | Archive |
| `CLOSED_DROPOUT` | Candidate dropout, no-show, administrative | Archive with reason |

---

## Phase × Status Validity Matrix

| Status | REGISTRATION | INTAKE | DIAGNOSIS | ACTION_PLAN | ACTIVE_COACHING | CONSOLIDATION | CLOSING | CLOSED |
|--------|:-----------:|:------:|:---------:|:-----------:|:---------------:|:-------------:|:-------:|:------:|
| IN_PROGRESS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| WAITING_CANDIDATE | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| WAITING_DOCUMENT | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| WAITING_ASSIGNMENT | ✓ | — | — | — | — | — | — | — |
| APPOINTMENT_SCHEDULED | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| DORMANT | — | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| SUSPENDED | — | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |
| TO_CLOSE | — | — | — | — | — | ✓ | ✓ | — |
| CLOSED_SUCCESS | — | — | — | — | — | — | — | ✓ |
| CLOSED_DROPOUT | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Phase Transition Rules

Phases are sequential. Forward transitions only (exception: SUSPENDED can occur at any phase and resume to previous phase).

```
REGISTRATION → INTAKE
  Guard: coach assigned OR first appointment created

INTAKE → DIAGNOSIS
  Guard: intake session completed (SessionStatus = COMPLETED)

DIAGNOSIS → ACTION_PLAN
  Guard: at least 1 Objective defined + diagnosis session completed

ACTION_PLAN → ACTIVE_COACHING
  Guard: at least 1 Action defined + action plan acknowledged by candidate

ACTIVE_COACHING → CONSOLIDATION
  Guard: progressScore >= 60 OR coach manual advancement

CONSOLIDATION → CLOSING
  Guard: intermediateSynthesis written + TO_CLOSE status set

CLOSING → CLOSED
  Guard: finalSynthesis written + closing report generated + closingReason set
  Effect: sets status to CLOSED_SUCCESS or CLOSED_DROPOUT
```

### Suspension Rules

```
ANY_PHASE → SUSPENDED
  Guard: coach or manager explicit action
  Required: suspensionReason, expectedResumeDate

SUSPENDED → previous_phase
  Guard: expected resume date reached OR manual reactivation
  Effect: status reverts to IN_PROGRESS
```

---

## Status Transition Rules

```
WAITING_ASSIGNMENT → IN_PROGRESS
  Trigger: CoachAssigned event

IN_PROGRESS → WAITING_CANDIDATE
  Trigger: Action created with assignedTo = CANDIDATE and no deadline action overdue

IN_PROGRESS → WAITING_DOCUMENT
  Trigger: DocumentRequest created or document status = SUBMITTED awaiting validation

IN_PROGRESS → APPOINTMENT_SCHEDULED
  Trigger: Session created with status = PLANNED or CONFIRMED

APPOINTMENT_SCHEDULED → IN_PROGRESS
  Trigger: Session status = COMPLETED

APPOINTMENT_SCHEDULED → DORMANT
  Trigger: Session date passed + session not completed + N days elapsed (threshold configurable per tenant, default 14)

ANY_STATUS → DORMANT
  Trigger: lastContactDate > dormancyThreshold days (default 30)
  Effect: CoachingFileInactive domain event fired

DORMANT → IN_PROGRESS
  Trigger: Any activity recorded (session, message, action update)

ANY → TO_CLOSE
  Guard: Phase = CONSOLIDATION or CLOSING, manual by coach/manager

TO_CLOSE → CLOSED_SUCCESS
  Guard: finalSynthesis present + closingReason = GOAL_ACHIEVED or EMPLOYMENT_FOUND

TO_CLOSE → CLOSED_DROPOUT
  Guard: closingReason = CANDIDATE_DROPOUT, NO_SHOW, ADMINISTRATIVE, or OTHER
```

---

## Domain Events (from lifecycle transitions)

Source: D-09 from decisions log — these replace Power Automate flows.

| Event | Trigger | Handler |
|-------|---------|---------|
| `CoachingFileCreated` | File created in REGISTRATION | `assign-coach.handler` — notify manager |
| `CoachAssigned` | Coach linked to file | Status → IN_PROGRESS, portal activation if needed |
| `CoachingFilePhaseChanged` | Phase transition | `phase-notification.handler` — notify coach + candidate |
| `SessionCompleted` | Session status → COMPLETED | Increment `completedSessionCount`, update `lastContactDate` |
| `ActionDeadlineApproaching` | Action deadline - 3 days | `action-deadline.scheduler` — portal notification + email |
| `ActionCompleted` | Action status → DONE | If blocking, unblock next step; update progress score |
| `DocumentSubmitted` | Document uploaded by candidate | `document-review.handler` — notify coach |
| `CoachingFileInactive` | lastContactDate > threshold | `dormancy-check.scheduler` — alert coach + manager |
| `CoachingFileCompleted` | Status → CLOSED_SUCCESS | `report-generation.handler` — generate final report |
| `CandidatePortalActivated` | User account created for candidate | Welcome email + portal onboarding |
| `CoachOverloaded` | currentCaseload > maxCaseload | `coach-load.handler` — alert manager |

---

## Progress Score Calculation

`progressScore` is a computed integer 0–100. Updated on each relevant event.

```
progressScore = weighted average of:
  - phase_weight       (current phase ordinal / 8) × 30
  - actions_done       (completedActions / totalActions) × 30
  - sessions_done      (completedSessions / plannedSessions) × 20
  - objectives_done    (achievedObjectives / totalObjectives) × 20
```

Coaches can override manually. AI advisor can suggest recalibration.

---

## Dormancy Configuration

Per-tenant configurable thresholds:

| Setting | Default | Description |
|---------|---------|-------------|
| `dormancyWarningDays` | 14 | Days of inactivity before DORMANT status |
| `dormancyAlertDays` | 30 | Days before manager alert triggered |
| `dormancyEscalationDays` | 60 | Days before director escalation |

---

## TypeScript Transition Guard Functions

```typescript
// packages/shared-types/src/coaching/coaching-transitions.types.ts

export interface PhaseTransitionGuard {
  fromPhase: CoachingPhase;
  toPhase: CoachingPhase;
  requiredConditions: TransitionCondition[];
}

export interface TransitionCondition {
  type: TransitionConditionType;
  description: string;
}

export type TransitionConditionType =
  | 'COACH_ASSIGNED'
  | 'SESSION_COMPLETED'
  | 'OBJECTIVE_DEFINED'
  | 'ACTION_DEFINED'
  | 'SYNTHESIS_WRITTEN'
  | 'REPORT_GENERATED'
  | 'CLOSING_REASON_SET'
  | 'MANUAL_OVERRIDE'
  | 'SCORE_THRESHOLD';
```
