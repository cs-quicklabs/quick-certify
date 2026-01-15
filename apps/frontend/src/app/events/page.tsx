import { redirect } from 'next/navigation';

/**
 * Events Default Page
 *
 * Redirects to Event Types settings page as the default
 */
export default function EventsPage() {
    redirect('/settings/event/type');
}

