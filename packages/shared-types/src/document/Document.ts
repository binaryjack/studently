/**
 * Document
 * Uploaded file with metadata and access control
 * FK: DocumentType.id, DocumentCategory.id, User.id (uploadedBy), Student/User.id (ownerId)
 */

import { BaseEntity } from "../common/base-entity";
import { DocumentVisibility } from "./types";

export interface Document extends BaseEntity {
  /** Document title */
  title: string;

  /** Document description - optional */
  description: string | null;

  /** URL to file in storage (S3, Azure Blob, etc.) */
  fileUrl: string;

  /** MIME type of file (e.g., "application/pdf") */
  fileMimeType: string;

  /** File size in bytes */
  fileSize: number;

  /** SHA256 hash of file for integrity checking */
  fileHash: string;

  /** FK: Reference to DocumentType */
  type: string;

  /** FK: Reference to DocumentCategory - optional */
  category: string | null;

  /** FK: Reference to User who uploaded document */
  uploadedBy: string;

  /** FK: Reference to Student or User who owns document */
  ownerId: string;

  /** Access visibility level */
  visibility: DocumentVisibility;

  /** ISO8601 timestamp when document expires - optional */
  expiresAt: string | null;

  /** Whether document is archived */
  isArchived: boolean;

  /** Search tags */
  tags: string[];
}
