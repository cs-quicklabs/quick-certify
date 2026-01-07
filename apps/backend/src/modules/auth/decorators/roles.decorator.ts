import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which user type codes are allowed to access a route
 * @param roles - Array of user type codes (e.g., 'ADMIN', 'USER', 'SUPER_ADMIN')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
