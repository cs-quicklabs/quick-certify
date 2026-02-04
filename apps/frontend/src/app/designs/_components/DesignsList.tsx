// "use client";

import { useEffect, useRef } from 'react';
import { Design, PaginatedResponse } from '@/types';
import DesignCard from './DesignCard';

type Filter = 'All' | 'Certificate' | 'Badge';

type Props = {
  designs: Design[];
  meta: PaginatedResponse<Design>['meta'];
  search: string;
  filter: Filter;
  onSearchChange: (v: string) => void;
  onFilterChange: (v: Filter) => void;
  onDelete: (id: string) => void;
};

export default function DesignsList({
  designs,
  meta,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onDelete,
}: Props) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* Auto-focus on load / data change */
  useEffect(() => {
    searchInputRef.current?.focus();
  }, [designs.length]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Search and Filter Section */}
      <div className="flex flex-wrap items-center gap-y-3 border-t border-b border-gray-200 px-4 py-2 bg-white">
        {/* Filter Options */}
        <div className="flex flex-wrap items-center gap-x-4 text-sm font-medium text-gray-900">
          <span className="hidden md:block">Show records only for:</span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filter === 'Badge'}
              onChange={() => onFilterChange('Badge')}
              className="h-4 w-4 accent-blue-600"
            />
            <span>Badges</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={filter === 'Certificate'}
              onChange={() => onFilterChange('Certificate')}
              className="h-4 w-4 accent-blue-600"
            />
            <span>Certificates</span>
          </label>

          <button
            type="button"
            onClick={() => onFilterChange('All')}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Show All
          </button>
        </div>

        {/* Search Box */}
        <div className="ml-auto">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 px-3 py-2 text-sm text-gray-800 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </div>

      {/* Empty state */}
      {designs.length === 0 && (
        <div className="py-16 text-center text-gray-500 text-medium font-medium">
          no designs found
        </div>
      )}

      {/* List */}
      {designs.map((design) => (
        <DesignCard key={design.uuid} design={design} onDelete={() => onDelete(design.uuid)} />
      ))}
    </>
  );
}
