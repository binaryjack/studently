/**
 * LearningObjective
 * Specific learning goal within a module (Bloom's Taxonomy based)
 * FK: LearningModule.id
 */

import { BaseEntity } from "../common/BaseEntity";

export interface LearningObjective extends BaseEntity {
  /** FK: Reference to LearningModule */
  moduleId: string;

  /** Objective description */
  description: string;

  /** Bloom's Taxonomy level */
  bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

  /** How the objective is assessed */
  assessmentMethod: "quiz" | "project" | "presentation" | "practical" | "portfolio";

  /** Success criteria for this objective */
  successCriteria: string[];
}
