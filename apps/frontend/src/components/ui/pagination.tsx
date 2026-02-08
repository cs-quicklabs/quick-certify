'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Total count of items (optional, for display) */
  totalCount?: number;
  /** Items per page (optional, for display) */
  pageSize?: number;
  /** Variant of pagination styling */
  variant?: 'default' | 'compact';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pagination Component
 *
 * A reusable pagination component with page numbers and prev/next buttons.
 * Supports compact and default variants.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  totalCount,
  pageSize,
  variant = 'default',
  className = '',
}: PaginationProps) {
  // Don't render if only one page
  if (totalPages <= 1) return null;

  const pageSafe = Math.min(Math.max(1, currentPage), totalPages);

  // Generate page numbers to display (show max 5 pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (pageSafe <= 3) {
        // Near start: show 1, 2, 3, 4, ..., last
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (pageSafe >= totalPages - 2) {
        // Near end: show 1, ..., last-3, last-2, last-1, last
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push(1, '...', pageSafe - 1, pageSafe, pageSafe + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page !== pageSafe && !isLoading && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Compact variant - simple prev/next with page info
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        {totalCount !== undefined && pageSize !== undefined && (
          <div className="text-sm text-gray-700">
            Showing {((pageSafe - 1) * pageSize) + 1} to {Math.min(pageSafe * pageSize, totalCount)} of {totalCount} entries
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(pageSafe - 1)}
            disabled={pageSafe === 1 || isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="text-sm text-gray-700 px-2">
            Page {pageSafe} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(pageSafe + 1)}
            disabled={pageSafe === totalPages || isLoading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Default variant - full pagination with page numbers
  return (
    <nav aria-label="Page navigation" className={className}>
      <ul className="flex -space-x-px text-sm">
        {/* Previous Button */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(pageSafe - 1)}
            disabled={pageSafe === 1 || isLoading}
            className="flex items-center justify-center px-3 h-9 text-sm font-medium bg-neutral-secondary-medium border border-default-medium rounded-s-base hover:bg-neutral-tertiary-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>
        </li>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <li key={`${page}-${index}`}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-9 h-9 text-sm border border-default-medium text-gray-500">
                ...
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handlePageChange(page as number)}
                disabled={isLoading}
                aria-current={pageSafe === page ? 'page' : undefined}
                className={`flex items-center justify-center w-9 h-9 text-sm border border-default-medium transition-colors ${
                  pageSafe === page
                    ? 'font-medium text-fg-brand bg-neutral-tertiary-medium'
                    : 'hover:bg-neutral-tertiary-medium'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            type="button"
            onClick={() => handlePageChange(pageSafe + 1)}
            disabled={pageSafe === totalPages || isLoading}
            className="flex items-center justify-center px-3 h-9 text-sm font-medium bg-neutral-secondary-medium border border-default-medium rounded-e-base hover:bg-neutral-tertiary-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Simple pagination info display
 */
export interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalCount,
  className = '',
}: PaginationInfoProps) {
  const start = ((currentPage - 1) * pageSize) + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  return (
    <span className={`text-sm text-gray-500 ${className}`}>
      Showing {start} to {end} of {totalCount} entries
    </span>
  );
}
