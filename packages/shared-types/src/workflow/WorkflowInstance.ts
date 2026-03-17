/**
 * WorkflowInstance
 * Runtime instance of workflow execution
 * FK: Workflow.id, User.id (triggeredBy)
 */

import { BaseEntity } from "../common/BaseEntity";

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
  status: "pending" | "in-progress" | "completed" | "failed" | "cancelled";

  /** ISO8601 timestamp when workflow started */
  startedAt: string;

  /** ISO8601 timestamp when workflow completed - optional */
  completedAt: string | null;

  /** Execution history of each step */
  steps: WorkflowStepInstance[];
}

/**
 * WorkflowStepInstance
 * Execution state of a single workflow step
 */
export interface WorkflowStepInstance {
  /** Step ID from workflow definition */
  stepId: string;

  /** Step sequence number */
  sequence: number;

  /** Step execution status */
  status: "pending" | "in-progress" | "completed" | "failed" | "skipped";

  /** Assigned user/role who executed step */
  assignedTo: string;

  /** ISO8601 timestamp when step started - optional */
  startedAt: string | null;

  /** ISO8601 timestamp when step completed - optional */
  completedAt: string | null;

  /** Result/output from step execution */
  result: any;

  /** Error message if step failed - optional */
  error: string | null;
}
