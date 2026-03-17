/**
 * LearningModule
 * A module within a learning path containing multiple objectives
 * FK: LearningPath.id, User.id (instructor)
 */

import { BaseEntity } from "../common/BaseEntity";

export interface LearningModule extends BaseEntity {
  /** FK: Reference to LearningPath */
  learningPathId: string;

  /** Module name */
  name: string;

  /** Module description */
  description: string;

  /** Sequence number in learning path (1-indexed) */
  sequence: number;

  /** Expected duration in hours */
  duration: number;

  /** Array of LearningObjective IDs */
  objectives: string[];

  /** Assessment criteria */
  assessmentCriteria: string[];

  /** FK: Reference to User (Instructor) - optional */
  instructorId: string | null;
}
