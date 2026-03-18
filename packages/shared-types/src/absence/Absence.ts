/**
 * Absence
 * Record of a single absence day
 * FK: Student.id, AbsenceType.id, User.id (approvedBy)
 */

import { BaseEntity } from "../common/BaseEntity";
import { AbsenceDuration, AbsenceStatus } from "./types";

export interface Absence extends BaseEntity {
  /** FK: Reference to Student */
  studentId: string;

  /** ISO8601 date of absence (immutable) */
  date: string;

  /** FK: Reference to AbsenceType */
  type: string;

  /** Duration of absence */
  duration: AbsenceDuration;

  /** Absence approval status */
  status: AbsenceStatus;

  /** Reason for absence */
  reason: string | null;

  /** FK: Reference to User who approved - optional */
  approvedBy: string | null;

  /** ISO8601 timestamp of approval - optional */
  approvedAt: string | null;

  /** URLs to supporting documents */
  attachments: string[];
}
