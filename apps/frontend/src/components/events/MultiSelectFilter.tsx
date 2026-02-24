'use client';

import { useState, useRef, useEffect } from 'react';
import { ListFilter, Loader2, X } from 'lucide-react';

export interface FilterItem {
  uuid: string;
  name: string;
}

interface MultiSelectFilterProps {
  label: string;
  items: FilterItem[];
  selectedIds: string[];
  onChange: (id: string) => void;
  onClear: () => void;
  isLoading: boolean;
  onOpen?: () => void;
}

export function MultiSelectFilter({
  label,
  items,
  selectedIds,
  onChange,
  onClear,
  isLoading,
  onOpen,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && onOpen) {
      onOpen();
    }
  };

  const hasActive = selectedIds.length > 0;

  function RenderList() {
    if (isLoading) {
      return (
        <div className="py-4 text-center text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin inline mr-2" /> Loading...
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <p className="py-4 text-center text-sm text-gray-500">No {label.toLowerCase()} found</p>
      );
    }

    return (
      <div className="space-y-1">
        {items.map((item) => (
          <label
            key={item.uuid}
            className="flex items-center gap-2 py-2 px-1 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              checked={selectedIds.includes(item.uuid)}
              onChange={() => onChange(item.uuid)}
            />
            <span className="truncate">{item.name}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100"
      >
        <ListFilter size={16} strokeWidth={2} className="mb-0.5" />
        {label}
        {hasActive && (
          <span className="ml-1 bg-blue-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {selectedIds.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3 max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500">Select {label}</p>
            {hasActive && (
              <button
                onClick={onClear}
                className="text-xs text-blue-600  hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <RenderList />
        </div>
      )}
    </div>
  );
}
