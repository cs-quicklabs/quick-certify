import { PaginatedResult } from '../base';

/**
 * Sanitized pagination parameters
 */
export interface SanitizedPagination {
  safeLimit: number;
  safePage: number;
  offset: number;
}

/**
 * Sanitize page/limit inputs and compute offset.
 * Clamps limit between 1 and maxLimit, page to >= 1.
 *
 * @param page - Requested page number (defaults to 1)
 * @param limit - Requested page size (defaults to 10)
 * @param maxLimit - Upper bound for limit (defaults to 100)
 * @returns Sanitized pagination parameters with computed offset
 */
export function sanitizePagination(page = 1, limit = 10, maxLimit = 100): SanitizedPagination {
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;
  return { safeLimit, safePage, offset };
}

/**
 * Build a standard PaginatedResult from data array and total count.
 *
 * @param data - Array of result items
 * @param count - Total number of matching records
 * @param pagination - Sanitized pagination parameters from sanitizePagination()
 * @returns Standardized paginated result with meta information
 */
export function buildPaginatedResult<T>(
  data: T[],
  count: number,
  pagination: SanitizedPagination,
): PaginatedResult<T> {
  const totalPages = Math.ceil(count / pagination.safeLimit);
  return {
    data,
    meta: {
      total: count,
      page: pagination.safePage,
      limit: pagination.safeLimit,
      totalPages,
      hasNextPage: pagination.safePage < totalPages,
      hasPrevPage: pagination.safePage > 1,
    },
  };
}
