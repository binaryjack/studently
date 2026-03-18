/**
 * TimesheetEntry
 * Daily time entry within a timesheet
 * FK: Timesheet.id, User.id (validatedBy)
 */

import { BaseEntity } from "../common/BaseEntity";
import { DayOfWeek, WorkType } from "./types";

export interface TimesheetEntry extends BaseEntity {
  /** FK: Reference to Timesheet */
  timesheetId: string;

  /** ISO8601 date of entry (immutable) */
  date: string;

  /** Day of week */
  dayOfWeek: DayOfWeek;

  /** ISO8601 clock-in time */
  clockInTime: string;

  /** ISO8601 clock-out time */
  clockOutTime: string;

  /** Break duration in minutes */
  breakDuration: number;

  /** Calculated total hours (clockOutTime - clockInTime - break) */
  totalHours: number;

  /** Type of work performed */
  workType: WorkType;

  /** Description of work performed - optional */
  description: string | null;

  /** Whether entry has been validated */
  validated: boolean;

  /** ISO8601 timestamp of validation - optional */
  validatedAt: string | null;

  /** FK: Reference to User who validated - optional */
  validatedBy: string | null;
}
