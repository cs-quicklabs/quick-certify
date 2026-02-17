/**
 * Query Parameters Utility
 *
 * Provides type-safe utilities for building URL query strings.
 * Eliminates duplicated URLSearchParams logic across services.
 */

/**
 * Build query string from filter object
 *
 * Automatically handles:
 * - Undefined/null values (excluded)
 * - Numbers (converted to strings)
 * - Booleans (converted to strings)
 * - Empty strings (excluded)
 *
 * @example
 * ```ts
 * const query = buildQueryParams({ page: 1, limit: 10, search: undefined });
 * // Returns: "?page=1&limit=10"
 *
 * const emptyQuery = buildQueryParams({});
 * // Returns: ""
 * ```
 */
export function buildQueryParams<T extends Record<string, unknown>>(filters?: T): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    // Skip undefined, null, and empty string values
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Convert value to string and append
    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build URL with query parameters
 *
 * @example
 * ```ts
 * const url = buildUrl('/events', { page: 1, limit: 10 });
 * // Returns: "/events?page=1&limit=10"
 * ```
 */
export function buildUrl<T extends Record<string, unknown>>(path: string, filters?: T): string {
  return `${path}${buildQueryParams(filters)}`;
}

/**
 * Parse query string to object
 *
 * @example
 * ```ts
 * const params = parseQueryParams('?page=1&limit=10');
 * // Returns: { page: "1", limit: "10" }
 * ```
 */
export function parseQueryParams(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Merge existing query params with new params
 *
 * @example
 * ```ts
 * const merged = mergeQueryParams('?page=1', { limit: 10 });
 * // Returns: "?page=1&limit=10"
 * ```
 */
export function mergeQueryParams<T extends Record<string, unknown>>(
  existingQuery: string,
  newParams: T,
): string {
  const existing = parseQueryParams(existingQuery);
  const merged = { ...existing, ...newParams };
  return buildQueryParams(merged);
}

/**
 * Standard pagination filters interface
 * Use this as a base for service filter types
 */
export interface BasePaginationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: unknown;
}

/**
 * Standard search filters interface
 * Extends pagination with search capability
 */
export interface BaseSearchFilters extends BasePaginationFilters {
  search?: string;
}
