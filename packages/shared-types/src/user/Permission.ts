/**
 * Permission
 * Fine-grained permission that can be assigned to roles
 * Format: "{resource}:{action}"
 */

import { BaseEntity } from "../common/base-entity";
import { PermissionAction, PermissionScope } from "./types";

export interface Permission extends BaseEntity {
  /** Permission name (unique, e.g., "student:view", "timesheet:approve") */
  name: string;

  /** Human-readable description */
  description: string;

  /** Resource being acted upon (e.g., "student", "timesheet", "document") */
  resource: string;

  /** Action being performed */
  action: PermissionAction;

  /** Scope of action */
  scope: PermissionScope;
}
