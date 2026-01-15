import { redirect } from 'next/navigation';

/**
 * Events Default Page
 *
 * Redirects to Event Types page as the default
 */
export default function EventsPage() {
    redirect('/events/event-types');
}

