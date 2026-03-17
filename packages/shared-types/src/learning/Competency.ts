/**
 * Competency
 * Skills/knowledge that students must demonstrate
 * Swiss vocational standards based
 */

import { BaseEntity } from "../common/BaseEntity";

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
  level: "foundation" | "intermediate" | "advanced" | "expert";

  /** Assessment methods for this competency */
  assessmentMethods: string[];
}
