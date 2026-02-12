'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChangeAction: (page: number) => void;
  maxVisiblePages?: number;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChangeAction,
  maxVisiblePages = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, maxVisiblePages);

  return (
    <div className="flex justify-end mt-6 px-4">
      <nav className="inline-flex overflow-hidden">
        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChangeAction(currentPage - 1)}
          className="flex items-center justify-center px-3 h-9 text-sm font-medium
                     border border-gray-200
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100
                   "
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChangeAction(page)}
            className={`flex items-center justify-center w-9 h-9 text-sm
              border-t border-b border-r border-gray-200
              ${
                currentPage === page ? 'bg-gray-100 text-blue-600 font-medium' : 'hover:bg-gray-100'
              }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChangeAction(currentPage + 1)}
          className="flex items-center justify-center px-3 h-9 text-sm font-medium
                     border-t border-b border-r border-gray-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-gray-200"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
