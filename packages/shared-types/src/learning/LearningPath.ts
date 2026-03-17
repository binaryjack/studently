/**
 * LearningPath
 * Curriculum path defining learning journey and competencies
 * One LearningPath contains many LearningModules
 */

import { BaseEntity } from "../common/BaseEntity";

export interface LearningPath extends BaseEntity {
  /** Name of learning path */
  name: string;

  /** Detailed description */
  description: string;

  /** Unique code (immutable) */
  code: string;

  /** Difficulty level */
  level: "foundation" | "intermediate" | "advanced" | "specialized";

  /** Expected duration in weeks */
  duration: number;

  /** Array of LearningModule IDs */
  modules: string[];

  /** Array of Competency IDs required for completion */
  competencies: string[];

  /** Whether path is currently active */
  isActive: boolean;

  /** ISO8601 timestamp when path was published (null = draft) */
  publishedAt: string | null;
}
