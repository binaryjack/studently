/**
 * WorkflowInstance
 * Runtime instance of workflow execution
 * FK: Workflow.id, User.id (triggeredBy)
 */

import { BaseEntity } from "../common/base-entity";
import { WorkflowStepInstance } from "./workflow-step-instance";
import { WorkflowExecutionStatus } from "./workflow-execution-status";

export interface WorkflowInstance extends BaseEntity {
  /** FK: Reference to Workflow definition */
  workflowId: string;

  /** FK: Reference to User who triggered workflow */
  triggeredBy: string;

  /** Context data for workflow execution */
  contextData: Record<string, any>;

  /** Current step number (0-indexed) */
  currentStep: number;

  /** Overall workflow status */
  status: WorkflowExecutionStatus;

  /** ISO8601 timestamp when workflow started */
  startedAt: string;

  /** ISO8601 timestamp when workflow completed - optional */
  completedAt: string | null;

  /** Execution history of each step */
  steps: WorkflowStepInstance[];
}
