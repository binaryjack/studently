/**
 * Workflow
 * Business process definition with triggers and steps
 * FK: User.id (createdBy)
 */

import { BaseEntity } from "../common/base-entity";
import { WorkflowTemplateType } from "./workflow-template-type";

export interface Workflow extends BaseEntity {
  /** Workflow name */
  name: string;

  /** Workflow description */
  description: string;

  /** Unique code (immutable) */
  code: string;

  /** Type of workflow */
  type: WorkflowTemplateType;

  /** Event that triggers workflow (e.g., "timesheet:submitted") */
  trigger: string;

  /** Array of WorkflowStep IDs in sequence */
  steps: string[];

  /** Whether workflow is active */
  isActive: boolean;

  /** FK: Reference to User who created workflow */
  createdBy: string;
}
