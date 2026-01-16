import { redirect } from 'next/navigation';

/**
 * Event Levels Page
 *
 * Redirects to settings route
 */
export default function EventLevelsPage() {
    redirect('/settings/event/level');
}
