/**
 * Competency
 * Skills/knowledge that students must demonstrate
 * Swiss vocational standards based
 */

import { BaseEntity } from "../common/base-entity";
import { CompetencyLevel } from "./competency-level";

export interface Competency extends BaseEntity {
  /** Competency name */
  name: string;

  /** Detailed description */
  description: string;

  /** Unique code (immutable) */
  code: string;

  /** Category (e.g., "technical", "soft-skills", "language") */
  category: string;

  /** Proficiency level */
  level: CompetencyLevel;

  /** Assessment methods for this competency */
  assessmentMethods: string[];
}
