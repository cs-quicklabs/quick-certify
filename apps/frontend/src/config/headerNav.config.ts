import { RoleType } from '@/types';
import { ROUTES } from '@/config/routes';

export type NavItem = { href: string; label: string };

export const ROLE_BADGE_STYLES: Record<string, string> = {
  [RoleType.SystemAdmin]: 'bg-purple-100 text-purple-700',
  [RoleType.SuperAdmin]: 'bg-blue-100 text-blue-700',
  [RoleType.Admin]: 'bg-indigo-100 text-indigo-700',
  [RoleType.Manager]: 'bg-amber-100 text-amber-700',
  [RoleType.Designer]: 'bg-emerald-100 text-emerald-700',
};

const ALL_ROLES = Object.values(RoleType);
const ADMIN_ROLES = [RoleType.SystemAdmin, RoleType.SuperAdmin, RoleType.Admin];
const PRIVILEGED_ROLES = [RoleType.SystemAdmin, RoleType.SuperAdmin];

type NavItemDef = NavItem & { roles: RoleType[] };

const NAV_ITEMS: NavItemDef[] = [
  { href: ROUTES.DASHBOARD.HOME, label: 'Dashboard', roles: ADMIN_ROLES },
  { href: ROUTES.DESIGNS, label: 'Designs', roles: [...ADMIN_ROLES, RoleType.Designer] },
  { href: ROUTES.EVENTS, label: 'Events', roles: [...ADMIN_ROLES, RoleType.Manager] },
  { href: ROUTES.CREDENTIALS, label: 'Credentials', roles: [...ADMIN_ROLES, RoleType.Manager] },
  { href: ROUTES.PATHWAYS, label: 'Pathways', roles: [...ADMIN_ROLES, RoleType.Manager] },
  { href: ROUTES.ADMIN.ORGANIZATIONS, label: 'Organizations', roles: [RoleType.SystemAdmin] },
];

const DROPDOWN_ITEMS: NavItemDef[] = [
  { href: ROUTES.SETTINGS.PROFILE.GENERAL, label: 'Profile Settings', roles: ALL_ROLES },
  { href: ROUTES.SETTINGS.ACCOUNT.GENERAL, label: 'Account Settings', roles: PRIVILEGED_ROLES },
  { href: ROUTES.SETTINGS.EVENT.TYPE, label: 'Event Settings', roles: ADMIN_ROLES },
  { href: ROUTES.SETTINGS.TEAM, label: 'Team', roles: ADMIN_ROLES },
  { href: ROUTES.SETTINGS.ARCHIVED, label: 'Archived', roles: PRIVILEGED_ROLES },
];

export function getNavItems(role: RoleType): NavItem[] {
  return NAV_ITEMS.filter(({ roles }) => roles.includes(role));
}

export function getDropdownItems(role: RoleType): NavItem[] {
  return DROPDOWN_ITEMS.filter(({ roles }) => roles.includes(role));
}
