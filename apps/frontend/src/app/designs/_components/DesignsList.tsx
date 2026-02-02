// "use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { Design } from '@/services/api/design.service';
import DesignCard from './DesignCard';
import { PaginatedResponse } from '@/types';

type Props = {
  designs: Design[];
  meta: PaginatedResponse<Design>['meta'];
  onDelete: (id: string) => void;
  search: string;
  setSearch: (v: string) => void;
  page: number;
};

type Filter = 'All' | 'Certificate' | 'Badge';

export default function DesignsList({ designs, meta, onDelete, search, setSearch }: Props) {
  const [filter, setFilter] = useState<Filter>('All');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtered = useMemo(() => {
    return designs.filter((d) => {
      const matchFilter =
        filter === 'All' ||
        (filter === 'Certificate' && d.type === 'certificate') ||
        (filter === 'Badge' && d.type === 'badge');

      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [designs, filter, search]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [designs.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd + K (Mac) or Ctrl + K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Optional: "/" to focus search (GitHub-style)
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
              name="designFilter"
              value="Badge"
              checked={filter === 'Badge'}
              onChange={() => setFilter('Badge')}
              className="h-4 w-4 accent-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span>Badges</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="designFilter"
              value="Certificate"
              checked={filter === 'Certificate'}
              onChange={() => setFilter('Certificate')}
              className="h-4 w-4 accent-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span>Certificates</span>
          </label>

          <button
            type="button"
            onClick={() => setFilter('All')}
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 px-3 py-2 text-sm text-gray-800 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </div>

      {/* Empty list */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-500 text-medium font-medium">
          no designs found
        </div>
      )}

      {/* List */}
      {filtered.map((designs) => (
        <DesignCard key={designs.uuid} design={designs} onDelete={() => onDelete(designs.uuid)} />
      ))}
    </>
  );
}
