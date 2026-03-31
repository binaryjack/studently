/**
 * Role
 * Role definition for RBAC (Role-Based Access Control)
 * Links to multiple Permissions
 */

import { BaseEntity } from "../common/base-entity";
import { RoleType } from "./types";

export interface Role extends BaseEntity {
  /** Role name (unique, e.g., "Student", "Instructor", "Admin") */
  name: string;

  /** Role description */
  description: string;

  /** Array of Permission IDs assigned to this role */
  permissions: string[];

  /** System vs custom role */
  type: RoleType;

  /** Whether role is active and assignable */
  isActive: boolean;
}
