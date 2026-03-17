/**
 * Timesheet
 * Weekly timesheet aggregating work hours
 * FK: Student.id, User.id (approvedBy)
 */

import { BaseEntity } from "../common/BaseEntity";

export interface Timesheet extends BaseEntity {
  /** FK: Reference to Student */
  studentId: string;

  /** ISO8601 date of week start (immutable) */
  weekStartDate: string;

  /** ISO8601 date of week end (immutable) */
  weekEndDate: string;

  /** Total hours worked in week */
  totalHours: number;

  /** Timesheet approval status */
  status: "draft" | "submitted" | "approved" | "rejected";

  /** FK: Reference to User who approved - optional */
  approvedBy: string | null;

  /** ISO8601 timestamp of approval - optional */
  approvedAt: string | null;

  /** Reason for rejection - optional */
  rejectionReason: string | null;

  /** Array of TimesheetEntry IDs for this week */
  entries: string[];
}
