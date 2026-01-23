export const getInitials = (firstName?: string, lastName?: string, fallback = 'U'): string => {
  if (!firstName && !lastName) return fallback;
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

export function capitalizeFirst(str: string | null | undefined): string {
  if (!str) return '';

  return str
    .trim()
    .split(/\s+/) // handles multiple spaces
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
