import { redirect } from 'next/navigation';

/**
 * Home Page
 *
 * Redirects to login page for now.
 * In the future, this could be a landing page.
 */
export default function HomePage() {
  redirect('/login');
}
