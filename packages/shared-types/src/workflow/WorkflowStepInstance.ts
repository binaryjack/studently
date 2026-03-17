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
