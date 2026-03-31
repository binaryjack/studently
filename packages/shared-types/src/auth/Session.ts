/**
 * Session
 * Represents an active user session with device and location tracking
 * FK: User.id
 */

import { BaseEntity } from "../common/base-entity";

export interface Session extends BaseEntity {
  /** FK: Reference to User */
  userId: string;

  /** Hashed access token (for revocation checking) */
  token: string;

  /** Hashed refresh token (for revocation checking) */
  refreshToken: string;

  /** Device identifier (from client) */
  deviceId: string;

  /** IP address of session origin */
  ipAddress: string;

  /** User agent string from client */
  userAgent: string;

  /** ISO8601 timestamp of last activity */
  lastActivityAt: string;

  /** ISO8601 timestamp when session expires */
  expiresAt: string;

  /** ISO8601 timestamp when session was revoked (null = active) */
  revokedAt: string | null;
}
