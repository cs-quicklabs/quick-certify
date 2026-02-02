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

export default function DesignsList({ designs, meta, onDelete, search, setSearch, page }: Props) {
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
      <div className="flex justify-between items-center pt-3 pb-3 px-4 py-5 bg-white border-b border-t sm:flex sm:space-x-4 sm:space-y-0 border-gray-200 shadow-sm">
        {/* Filter Options  */}
        <div className="flex items-center text-gray-900 gap-6 text-sm font-medium">
          <span className="text-gray-900 text-sm font-medium">Show records only for:</span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="designFilter"
              value="Badge"
              checked={filter === 'Badge'}
              onChange={() => setFilter('Badge')}
              className="h-4 w-4 accent-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
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
              className="h-4 w-4 accent-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span>Certificates</span>
          </label>

          <button
            type="button"
            onClick={() => setFilter('All')}
            className="font-bold text-blue-600 underline hover:text-blue-700"
          >
            Show All
          </button>
        </div>

        {/* Search Box */}
        <div className=" items-center text-sm text-gray-200 border-gray-400">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search designs"
            className="border border-gray-300  text-gray-600 rounded px-2 py-1 mr-auto w-72 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:ring-1 hover:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="text-shadow-2xs text-xs text-gray-200 ml-1 p">
            {/* Press <kbd>⌘</kbd> + <kbd>K</kbd> to search */}
          </p>
        </div>
      </div>

      {/* Design Action */}

      <div className="bg-gray-50 border-gray-100 flex shadow-[0_4px_6px_-2px_rgba(0,0,0,0.1)] border-t border-r border-b-0 items-center justify-between py-3 px-2">
        <span className="text-xs font-extrabold text-gray-500 uppercase ml-2">Design</span>

        <span className="text-xs font-extrabold text-gray-500 uppercase mr-2">Actions</span>
      </div>

      {/* Empty list */}
      {filtered.length === 0 && (
        <div className="py-16 text-center text-gray-500 text-medium font-medium">
          no designs found
        </div>
      )}

      {/* List */}
      {filtered.map((designs) => (
        <DesignCard key={designs.id} design={designs} onDelete={() => onDelete(designs.id)} />
      ))}
    </>
  );
}
