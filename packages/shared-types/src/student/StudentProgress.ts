/**
 * StudentProgress
 * Tracks student achievement of competencies
 * FKs: Student.id, Competency.id, User.id (assessor)
 */

import { BaseEntity } from "../common/BaseEntity";

export interface StudentProgress extends BaseEntity {
  /** FK: Reference to Student */
  studentId: string;

  /** FK: Reference to Competency */
  competencyId: string;

  /** Achievement level */
  levelAchieved: "beginner" | "intermediate" | "advanced" | "expert";

  /** Progress percentage (0-100) */
  progressPercentage: number;

  /** ISO8601 date of assessment */
  assessmentDate: string;

  /** ISO8601 date of next planned review (null = no planned review) */
  nextReviewDate: string | null;

  /** FK: Reference to User (Assessor) */
  assessorId: string;

  /** Assessment notes */
  notes: string | null;

  /** URL to certificate (if applicable) */
  certificateUrl: string | null;
}
