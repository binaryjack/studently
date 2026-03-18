/**
 * Auth Domain Type Definitions
 */

import { ProcessingStatus } from "../common/enums";

/**
 * User account status - uses ProcessingStatus pattern
 * - active: Account is active and can be used
 * - inactive: Account exists but is disabled
 * - suspended: Account is temporarily suspended
 * - deleted: Account is marked for deletion (soft delete)
 * 
 * Note: Uses custom values but follows ProcessingStatus semantic pattern
 */
export type UserStatus = "active" | "inactive" | "suspended" | "deleted";
