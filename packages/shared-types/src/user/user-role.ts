/**
 * UserRole
 * Junction table linking User to Role(s)
 * Many-to-many relationship with additional metadata
 * FKs: User.id, Role.id
 */

import { BaseEntity } from "../common/base-entity";

export interface UserRole extends BaseEntity {
  /** FK: Reference to User */
  userId: string;

  /** FK: Reference to Role */
  roleId: string;

  /** ISO8601 timestamp when role was assigned */
  assignedAt: string;

  /** FK: Reference to User who assigned this role */
  assignedBy: string;

  /** ISO8601 timestamp when role was revoked (null = active) */
  revokedAt: string | null;

  /** ISO8601 timestamp when role assignment expires (null = no expiration) */
  expiresAt: string | null;

  /** Additional metadata (e.g., department, team, scope) */
  metadata: Record<string, any>;
}
