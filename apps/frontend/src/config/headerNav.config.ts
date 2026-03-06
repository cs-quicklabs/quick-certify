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

export const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.DASHBOARD.HOME, label: 'Dashboard' },
  { href: ROUTES.DESIGNS, label: 'Designs' },
  { href: ROUTES.EVENTS, label: 'Events' },
  { href: ROUTES.CREDENTIALS, label: 'Credentials' },
  { href: ROUTES.PATHWAYS, label: 'Pathways' },
  // { href: ROUTES.EMAILS, label: 'Emails' }
  // { href: ROUTES.ANALYTICS, label: 'Analytics' },
  // { href: ROUTES.INTEGRATIONS, label: 'Integrations' },
];

export const SYSTEM_ADMIN_NAV: NavItem[] = [
  { href: ROUTES.ADMIN.ORGANIZATIONS, label: 'Organizations' },
];

export function getDropdownItems(isAdmin: boolean): NavItem[] {
  const items: NavItem[] = [{ href: ROUTES.SETTINGS.PROFILE.GENERAL, label: 'Profile Settings' }];
  if (isAdmin) {
    items.push(
      { href: ROUTES.SETTINGS.ACCOUNT.GENERAL, label: 'Account Settings' },
      { href: ROUTES.SETTINGS.EVENT.TYPE, label: 'Event Settings' },
      { href: ROUTES.SETTINGS.TEAM, label: 'Team' },
      { href: ROUTES.SETTINGS.ARCHIVED, label: 'Archived' },
    );
  }
  return items;
}
