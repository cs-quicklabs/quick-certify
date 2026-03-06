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

const PROFILE_SETTINGS: NavItem = { href: ROUTES.SETTINGS.PROFILE.GENERAL, label: 'Profile Settings' };

const NAV_ITEMS_MAP: Record<RoleType, NavItem[]> = {
  [RoleType.SystemAdmin]: [
    { href: ROUTES.DASHBOARD.HOME, label: 'Dashboard' },
    { href: ROUTES.DESIGNS, label: 'Designs' },
    { href: ROUTES.EVENTS, label: 'Events' },
    { href: ROUTES.CREDENTIALS, label: 'Credentials' },
    { href: ROUTES.PATHWAYS, label: 'Pathways' },
    { href: ROUTES.ADMIN.ORGANIZATIONS, label: 'Organizations' },
  ],
  [RoleType.SuperAdmin]: [
    { href: ROUTES.DASHBOARD.HOME, label: 'Dashboard' },
    { href: ROUTES.DESIGNS, label: 'Designs' },
    { href: ROUTES.EVENTS, label: 'Events' },
    { href: ROUTES.CREDENTIALS, label: 'Credentials' },
    { href: ROUTES.PATHWAYS, label: 'Pathways' },
  ],
  [RoleType.Admin]: [
    { href: ROUTES.DASHBOARD.HOME, label: 'Dashboard' },
    { href: ROUTES.DESIGNS, label: 'Designs' },
    { href: ROUTES.EVENTS, label: 'Events' },
    { href: ROUTES.CREDENTIALS, label: 'Credentials' },
    { href: ROUTES.PATHWAYS, label: 'Pathways' },
  ],
  [RoleType.Manager]: [
    { href: ROUTES.EVENTS, label: 'Events' },
    { href: ROUTES.CREDENTIALS, label: 'Credentials' },
    { href: ROUTES.PATHWAYS, label: 'Pathways' },
  ],
  [RoleType.Designer]: [
    { href: ROUTES.DESIGNS, label: 'Designs' },
  ],
};

const DROPDOWN_ITEMS_MAP: Record<RoleType, NavItem[]> = {
  [RoleType.SystemAdmin]: [
    PROFILE_SETTINGS,
    { href: ROUTES.SETTINGS.ACCOUNT.GENERAL, label: 'Account Settings' },
    { href: ROUTES.SETTINGS.EVENT.TYPE, label: 'Event Settings' },
    { href: ROUTES.SETTINGS.TEAM, label: 'Team' },
    { href: ROUTES.SETTINGS.ARCHIVED, label: 'Archived' },
  ],
  [RoleType.SuperAdmin]: [
    PROFILE_SETTINGS,
    { href: ROUTES.SETTINGS.ACCOUNT.GENERAL, label: 'Account Settings' },
    { href: ROUTES.SETTINGS.EVENT.TYPE, label: 'Event Settings' },
    { href: ROUTES.SETTINGS.TEAM, label: 'Team' },
    { href: ROUTES.SETTINGS.ARCHIVED, label: 'Archived' },
  ],
  [RoleType.Admin]: [
    PROFILE_SETTINGS,
    { href: ROUTES.SETTINGS.EVENT.TYPE, label: 'Event Settings' },
    { href: ROUTES.SETTINGS.TEAM, label: 'Team' },
  ],
  [RoleType.Manager]: [PROFILE_SETTINGS],
  [RoleType.Designer]: [PROFILE_SETTINGS],
};

export function getNavItems(role: RoleType): NavItem[] {
  return NAV_ITEMS_MAP[role] ?? NAV_ITEMS_MAP[RoleType.Manager];
}

export function getDropdownItems(role: RoleType): NavItem[] {
  return DROPDOWN_ITEMS_MAP[role] ?? [PROFILE_SETTINGS];
}
