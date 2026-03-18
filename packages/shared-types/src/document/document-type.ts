/**
 * DocumentType
 * Classification of document (certificate, diploma, transcript, etc.)
 */

import { BaseEntity } from "../common/BaseEntity";

export interface DocumentType extends BaseEntity {
  /** Document type name (unique, e.g., "certificate", "diploma") */
  name: string;

  /** Unique code (immutable) */
  code: string;

  /** Description */
  description: string;

  /** Whether document requires approval before visibility */
  requiresApproval: boolean;

  /** Document retention period in days (null = indefinite) */
  retentionDays: number | null;
}
