import { redirect } from 'next/navigation';

/**
 * Account Settings Index
 *
 * Redirects to the General Information page.
 */
export default function AccountSettingsPage() {
  redirect('/settings/account/general-information');
}

