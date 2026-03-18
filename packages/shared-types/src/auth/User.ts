/**
 * User
 * Core user entity representing a person in the system
 * Base for all roles: Student, Instructor, Employer, Admin, Official
 */

import { BaseEntity } from "../common/BaseEntity";
import { UserStatus } from "./types";

export interface User extends BaseEntity {
  /** User email address (unique, immutable) */
  email: string;

  /** First name */
  firstName: string;

  /** Last name */
  lastName: string;

  /** Hashed password (never exposed) */
  passwordHash: string;

  /** User account status */
  status: UserStatus;

  /** Whether email has been verified */
  emailVerified: boolean;
}
