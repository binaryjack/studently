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

// Common types
export type { BaseEntity, PaginationParams, PaginationResponse } from "./common";

// Auth domain
export type { User, LoginCredential, Token, Session, MFAChallenge } from "./auth";

// User domain
export type { UserProfile, Role, Permission, UserRole } from "./user";

// Student domain
export type { Student, StudentProgress, StudentStatus } from "./student";

// Learning domain
export type { LearningPath, LearningModule, LearningObjective, Competency } from "./learning";

// Timesheet domain
export type { Timesheet, TimesheetEntry } from "./timesheet";

// Absence domain
export type { Absence, AbsenceType, AbsenceRequest } from "./absence";

// Document domain
export type { Document, DocumentType, DocumentCategory } from "./document";

// Workflow domain
export type { Workflow, WorkflowStep, WorkflowInstance, WorkflowStepInstance } from "./workflow";

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
