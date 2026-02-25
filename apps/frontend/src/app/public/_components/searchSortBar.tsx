'use client';

import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface SortOption {
  label: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

interface SearchSortBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  activeSortLabel?: string;
  showSortDropdown: boolean;
  onSortToggle: () => void;
  onSortSelect: (option: SortOption) => void; // ← uses base SortOption
  activeSortBy?: string;
  activeSortOrder?: string;
}

export function SearchSortBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  sortOptions = [],
  activeSortLabel = 'Sort By',
  showSortDropdown,
  onSortToggle,
  onSortSelect,
  activeSortBy,
  activeSortOrder,
}: SearchSortBarProps) {
  const sortRef = useClickOutside<HTMLDivElement>(() => {
    if (showSortDropdown) onSortToggle();
  });
  return (
    <div className="flex items-center gap-4 pr-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={onSearchChange}
          className="block w-full pl-9 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Sort By Dropdown */}
      {sortOptions.length > 0 && (
        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={onSortToggle}
            className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            {activeSortLabel}
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                showSortDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 z-10 mt-1 w-44 rounded-sm border border-gray-200 bg-white shadow-md">
              {sortOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => onSortSelect(option)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    option.sortBy === activeSortBy && option.sortOrder === activeSortOrder
                      ? 'text-primary-700 font-medium bg-primary-50'
                      : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
