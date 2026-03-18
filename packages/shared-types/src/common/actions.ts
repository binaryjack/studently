/**
 * Common CRUD/Action Types
 * Generic action types used across domains for permissions, workflows, etc.
 */

/**
 * Standard CRUD operations + execute
 * Used in permission system, workflow actions, audit logs
 */
export type CRUDAction = "view" | "create" | "update" | "delete" | "execute";

/**
 * Workflow-specific action types
 * Used in workflow step definitions
 */
export type WorkflowAction = "decision" | "task" | "notification" | "webhook";

/**
 * Assessment/evaluation methods
 * Used for competency and learning objective assessment
 */
export type AssessmentMethod = "quiz" | "project" | "presentation" | "practical" | "portfolio";

/**
 * Work/activity types for time tracking
 * Used in timesheets and activity logs
 */
export type ActivityType = "theoretical" | "practical" | "project" | "break";
