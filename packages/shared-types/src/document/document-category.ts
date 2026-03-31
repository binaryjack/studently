/**
 * DocumentCategory
 * Category/tag for grouping documents
 */

import { BaseEntity } from "../common/base-entity";

export interface DocumentCategory extends BaseEntity {
  /** Category name (unique) */
  name: string;

  /** Unique code (immutable) */
  code: string;

  /** Category description */
  description: string;

  /** Icon identifier or emoji */
  icon: string | null;

  /** Color hex code for UI display */
  color: string | null;
}
