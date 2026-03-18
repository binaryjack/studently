/**
 * BaseEntity
 * Abstract base type for all domain entities
 * Provides common fields: id, timestamps, and soft delete support
 */

export interface BaseEntity {
  /** Unique identifier (UUID) */
  id: string;

  /** ISO8601 timestamp of entity creation */
  createdAt: string;

  /** ISO8601 timestamp of last update */
  updatedAt: string;

  /** ISO8601 timestamp of soft delete (null = not deleted) */
  deletedAt: string | null;
}
