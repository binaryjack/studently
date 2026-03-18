/**
 * LearningObjective
 * Specific learning goal within a module (Bloom's Taxonomy based)
 * FK: LearningModule.id
 */

import { BaseEntity } from "../common/base-entity";
import { BloomLevel } from "./bloom-level";
import { LearningAssessmentMethod } from "./learning-assessment-method";

export interface LearningObjective extends BaseEntity {
  /** FK: Reference to LearningModule */
  moduleId: string;

  /** Objective description */
  description: string;

  /** Bloom's Taxonomy level */
  bloomLevel: BloomLevel;

  /** How the objective is assessed */
  assessmentMethod: LearningAssessmentMethod;

  /** Success criteria for this objective */
  successCriteria: string[];
}
