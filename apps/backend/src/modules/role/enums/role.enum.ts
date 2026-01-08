/**
 * User Role Enum
 *
 * Defines all available roles in the system
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  DESIGNER = 'designer',
}

/**
 * Array of all role values for validation and iteration
 */
export const ROLES = Object.values(Role) as string[];

/**
 * System roles that cannot be deleted
 */
export const SYSTEM_ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.DESIGNER] as const;

