/**
 * @studently/shared-types
 * Shared TypeScript interfaces and types for all Studently packages and applications
 *
 * Import organization:
 * - Common types: import { BaseEntity, PaginationParams } from '@studently/shared-types/common'
 * - Auth types: import { User, Token } from '@studently/shared-types/auth'
 * - User types: import { UserProfile, Role } from '@studently/shared-types/user'
 * - Student types: import { Student, StudentProgress } from '@studently/shared-types/student'
 * - Learning types: import { LearningPath, Competency } from '@studently/shared-types/learning'
 * - Timesheet types: import { Timesheet } from '@studently/shared-types/timesheet'
 * - Absence types: import { Absence, AbsenceType } from '@studently/shared-types/absence'
 * - Document types: import { Document, DocumentType } from '@studently/shared-types/document'
 * - Workflow types: import { Workflow, WorkflowInstance } from '@studently/shared-types/workflow'
 * - Error types: import { AppError, ValidationError } from '@studently/shared-types'
 */

// Common types & enums (universally reusable - one per file)
export type { BaseEntity, PaginationParams, PaginationResponse } from "./common";
export type { DayOfWeek } from "./common/day-of-week";
export type { ProficiencyLevel } from "./common/proficiency-level";
export type { OrganizationalScope } from "./common/organizational-scope";
export type { VisibilityLevel } from "./common/visibility-level";
export type { ApprovalStatus } from "./common/approval-status";
export type { ProcessingStatus } from "./common/processing-status";
export type { Language } from "./common/language";
export type { SortOrder } from "./common/sort-order";
export type { CRUDAction } from "./common/crud-action";
export type { WorkflowAction } from "./common/workflow-action";
export type { ActivityType } from "./common/activity-type";
export type { AssessmentMethod as CommonAssessmentMethod } from "./common/common-assessment-method";

// Auth domain
export type { User, LoginCredential, Token, Session, MFAChallenge } from "./auth";
export type { UserStatus } from "./auth/types";

// User domain
export type { UserProfile, Role, Permission, UserRole } from "./user";
export type { PreferredLanguage } from "./user/preferred-language";
export type { RoleType } from "./user/role-type";
export type { PermissionAction } from "./user/permission-action";
export type { PermissionScope } from "./user/permission-scope";

// Student domain
export type { Student, StudentProgress } from "./student";
export type { StudentEnrollmentStatus } from "./student/student-enrollment-status";
export type { ProgressLevel } from "./student/progress-level";
export type { StudentStatusState } from "./student/student-status-state";

// Learning domain
export type { LearningPath, LearningModule, LearningObjective, Competency } from "./learning";
export type { LearningLevel } from "./learning/learning-level";
export type { BloomLevel } from "./learning/bloom-level";
export type { LearningAssessmentMethod } from "./learning/learning-assessment-method";
export type { CompetencyLevel } from "./learning/competency-level";

// Timesheet domain
export type { Timesheet, TimesheetEntry } from "./timesheet";
export type { TimesheetDayOfWeek } from "./timesheet/timesheet-day-of-week";
export type { WorkType } from "./timesheet/work-type";
export type { TimesheetSubmissionStatus } from "./timesheet/timesheet-submission-status";

// Absence domain
export type { Absence, AbsenceType, AbsenceRequest } from "./absence";
export type { AbsenceDuration } from "./absence/absence-duration";
export type { AbsenceApprovalStatus } from "./absence/absence-approval-status";

// Document domain
export type { Document, DocumentType, DocumentCategory } from "./document";
export type { DocumentVisibility } from "./document/document-visibility";

// Workflow domain
export type { Workflow, WorkflowStep, WorkflowInstance, WorkflowStepInstance } from "./workflow";
export type { WorkflowTemplateType } from "./workflow/workflow-template-type";
export type { WorkflowActionType } from "./workflow/workflow-action-type";
export type { WorkflowExecutionStatus } from "./workflow/workflow-execution-status";
export type { WorkflowStepExecutionStatus } from "./workflow/workflow-step-execution-status";

// Error types
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
} from "./errors";
