/**
 * MFAChallenge
 * Multi-factor authentication challenge (TOTP, SMS, Email)
 * FK: User.id
 */

import { BaseEntity } from "../common/base-entity";

export interface MFAChallenge extends BaseEntity {
  /** FK: Reference to User */
  userId: string;

  /** MFA method type */
  method: "totp" | "sms" | "email";

  /** Encrypted challenge data (e.g., QR code, OTP) */
  challenge: string;

  /** Verification code provided by user (null until verified) */
  verificationCode: string | null;

  /** Number of failed verification attempts */
  attempts: number;

  /** Maximum allowed verification attempts */
  maxAttempts: 3;

  /** ISO8601 timestamp when challenge expires */
  expiresAt: string;

  /** ISO8601 timestamp when challenge was verified (null = not verified) */
  verifiedAt: string | null;
}
