import { redirect } from 'next/navigation';

/**
 * Event Formats Page
 *
 * Redirects to settings route
 */
export default function EventFormatsPage() {
    redirect('/settings/event/format');
}
