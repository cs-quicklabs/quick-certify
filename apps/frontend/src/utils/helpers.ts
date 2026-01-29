import { Role } from '@/services';
import { Roles } from '@/types';

export const getInitials = (firstName?: string, lastName?: string, fallback = 'U'): string => {
  if (!firstName && !lastName) return fallback;
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return '';

  return str
    .trim()
    .split(/\s+/) // handles multiple spaces
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function filterAndSortRoles(roles: Role[] | undefined): Roles[] {
  if (!roles || roles.length === 0) return [];

  const filteredRoles = roles.filter((role) => role.role !== 'super_admin');
  const sortedRole = filteredRoles.sort((a, b) => a.role.localeCompare(b.role));
  const rl = sortedRole.map((role) => ({ label: capitalizeFirst(role.role), value: role.id }));
  return rl;
}
