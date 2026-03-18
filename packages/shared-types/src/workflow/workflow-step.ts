/**
 * WorkflowStep
 * Single step within a workflow
 * FK: Workflow.id, User.id/Role.id (assignedTo)
 */

import { BaseEntity } from "../common/BaseEntity";
import { WorkflowActionType } from "./WorkflowActionType";

export interface WorkflowStep extends BaseEntity {
  /** FK: Reference to Workflow */
  workflowId: string;

  /** Step order in workflow (1-indexed) */
  sequence: number;

  /** Step name */
  name: string;

  /** Step description */
  description: string;

  /** Type of action performed at this step */
  actionType: WorkflowActionType;

  /** Array of User or Role IDs assigned to this step */
  assignedTo: string[];

  /** Conditional expression to determine if step executes - optional */
  condition: string | null;

  /** Timeout in seconds (null = no timeout) */
  timeout: number | null;

  /** Action to take on timeout - optional */
  onTimeoutAction: string | null;
}
