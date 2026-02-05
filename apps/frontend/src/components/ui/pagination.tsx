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
      <nav className="inline-flex rounded-md border border-gray-200 overflow-hidden">
        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChangeAction(currentPage - 1)}
          className="px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>

        {/* Page numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChangeAction(page)}
            className={`px-3 py-2 text-sm transition-colors ${
              currentPage === page ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChangeAction(currentPage + 1)}
          className="px-3 py-2 text-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
