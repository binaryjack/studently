/**
 * LoginCredential
 * Stores user login attempts, password history, and account lockout state
 * FK: User.id
 */

import { BaseEntity } from "../common/base-entity";

export interface LoginCredential extends BaseEntity {
  /** FK: Reference to User */
  userId: string;

  /** Hashed password */
  hashedPassword: string;

  /** ISO8601 timestamp of last password change */
  passwordChangedAt: string;

  /** Current number of consecutive failed login attempts */
  loginAttempts: number;

  /** ISO8601 timestamp of last successful login */
  lastLoginAt: string | null;

  /** ISO8601 timestamp until which account is locked (null = not locked) */
  lockedUntil: string | null;

  /** Whether password change is required on next login */
  requiresPasswordChange: boolean;
}
