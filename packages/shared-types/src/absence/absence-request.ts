/**
 * AbsenceRequest
 * Request for future absence/leave (multi-day absence request)
 * FK: Student.id, AbsenceType.id, User.id (decidedBy)
 */

import { BaseEntity } from "../common/base-entity";

export interface AbsenceRequest extends BaseEntity {
  /** FK: Reference to Student */
  studentId: string;

  /** FK: Reference to AbsenceType */
  typeId: string;

  /** ISO8601 start date of requested absence */
  startDate: string;

  /** ISO8601 end date of requested absence */
  endDate: string;

  /** Reason for absence request */
  reason: string;

  /** Request status */
  status: "pending" | "approved" | "rejected" | "cancelled";

  /** ISO8601 timestamp when request was made */
  requestedAt: string;

  /** ISO8601 timestamp when decision was made - optional */
  decidedAt: string | null;

  /** FK: Reference to User who decided - optional */
  decidedBy: string | null;

  /** Reason for approval/rejection - optional */
  decisionReason: string | null;
}
