/**
 * AbsenceType
 * Type/category of absence (sick leave, vacation, personal, etc.)
 */

import { BaseEntity } from "../common/base-entity";

export interface AbsenceType extends BaseEntity {
  /** Absence type name (unique, e.g., "sick-leave", "vacation") */
  name: string;

  /** Unique code (immutable) */
  code: string;

  /** Whether supervisor approval is required */
  requiresApproval: boolean;

  /** Whether medical certificate or documentation is required */
  requiresDocumentation: boolean;

  /** Maximum days per year (null = unlimited) */
  maxDaysPerYear: number | null;

  /** Whether absence counts as paid leave */
  paidLeave: boolean;
}
