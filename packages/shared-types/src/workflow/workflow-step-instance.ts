/**
 * WorkflowStepInstance
 * Execution state of a single workflow step
 */

import { WorkflowStepExecutionStatus } from "./workflow-step-execution-status";

export interface WorkflowStepInstance {
  /** Step ID from workflow definition */
  stepId: string;

  /** Step sequence number */
  sequence: number;

  /** Step execution status */
  status: WorkflowStepExecutionStatus;

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
