import { redirect } from 'next/navigation';

/**
 * Settings Index Page
 *
 * Redirects to profile settings by default
 */
export default function SettingsPage() {
  redirect('/settings/profile');
}

