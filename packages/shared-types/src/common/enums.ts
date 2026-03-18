/**
 * Common Enums
 * Universally reusable enum types across all domains
 */

/**
 * Day of the week - universally used for scheduling, timesheets, etc.
 */
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

/**
 * Generic proficiency/mastery levels
 * Used across multiple domains (learning, competencies, student progress)
 */
export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Generic organizational scope levels
 * Used for permissions, visibility, and access control across the system
 */
export type OrganizationalScope = "own" | "team" | "organization" | "global";

/**
 * Generic visibility/access levels for resources
 * Used for documents, records, and any shareable content
 */
export type VisibilityLevel = "private" | "team" | "organization" | "public";

/**
 * Generic approval/workflow status states
 * Used across approval workflows, timesheets, requests, etc.
 */
export type ApprovalStatus = "pending" | "approved" | "rejected";

/**
 * Generic processing/execution status
 * Used for workflow instances, tasks, processes
 */
export type ProcessingStatus = "pending" | "in-progress" | "completed" | "failed";

/**
 * Supported languages for localization
 * Used globally for user preferences, content translation, etc.
 */
export type Language = "de-CH" | "fr-CH" | "it-CH" | "en";

/**
 * Pagination sort order direction
 * Used in all paginated API endpoints
 */
export type SortOrder = "asc" | "desc";
