export const getInitials = (
  firstName?: string,
  lastName?: string,
  fallback = 'U'
): string => {
  if (!firstName && !lastName) return fallback;
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};
