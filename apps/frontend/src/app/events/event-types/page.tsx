import { redirect } from 'next/navigation';

/**
 * Event Types Page
 *
 * Redirects to settings route
 */
export default function EventTypesPage() {
  redirect('/settings/event/type');
}
