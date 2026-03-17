/**
 * StudentStatus
 * History of student status changes with audit trail
 * FK: Student.id, User.id (changedBy)
 */

import { BaseEntity } from "../common/BaseEntity";

export interface StudentStatus extends BaseEntity {
  /** FK: Reference to Student */
  studentId: string;

  /** Current status */
  status: "active" | "on-leave" | "suspended" | "completed" | "withdrawn";

  /** Reason for status change */
  reason: string | null;

  /** ISO8601 timestamp of status change */
  changedAt: string;

  /** FK: Reference to User who made the change */
  changedBy: string;

  /** ISO8601 timestamp when status is valid until (null = indefinite) */
  validUntil: string | null;

  /** Additional notes */
  notes: string | null;
}
