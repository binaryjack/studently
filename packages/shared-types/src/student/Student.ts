/**
 * Student
 * Student enrollment record linking to User and LearningPath
 * FKs: User.id, LearningPath.id, Company.id, User.id (instructor), User.id (mentor)
 */

import { BaseEntity } from "../common/base-entity";
import { StudentStatus } from "./types";

export interface Student extends BaseEntity {
  /** FK: Reference to User */
  userId: string;

  /** Student number (unique, immutable) */
  studentNumber: string;

  /** FK: Reference to LearningPath */
  learningPathId: string;

  /** Student enrollment status */
  status: StudentStatus;

  /** ISO8601 date of enrollment */
  enrollmentDate: string;

  /** ISO8601 expected graduation date */
  expectedGraduationDate: string;

  /** ISO8601 actual graduation date (null if not graduated) */
  actualGraduationDate: string | null;

  /** FK: Reference to User (Instructor) - optional */
  instructorId: string | null;

  /** FK: Reference to User (Mentor) - optional */
  mentorId: string | null;

  /** FK: Reference to Company (employer) - optional */
  companyId: string | null;
}
