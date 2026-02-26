/**
 * Formats a date string into a human-readable format.
 * Used for rendering dates onto certificate templates.
 *
 * @param dateStr - ISO date string or null
 * @param nullFallback - value to return when dateStr is null/empty (defaults to 'N/A')
 */
export function formatDate(dateStr: string | null, nullFallback = 'N/A'): string {
  if (!dateStr) return nullFallback;
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
