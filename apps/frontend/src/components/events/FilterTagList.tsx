'use client';

import { X } from 'lucide-react';

interface FilterTag {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterTagListProps {
  tags: FilterTag[];
  onClearAll: () => void;
}

export function FilterTagList({ tags, onClearAll }: FilterTagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag.key}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-full"
        >
          {tag.label}
          <button onClick={tag.onRemove} className="hover:text-blue-900 cursor-pointer">
            <X size={12} />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
}
