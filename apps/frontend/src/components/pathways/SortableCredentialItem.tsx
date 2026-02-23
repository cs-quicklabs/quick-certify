'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SelectedCredential {
  uuid: string;
  name: string;
  isFinal: boolean;
}

interface SortableCredentialItemProps {
  credential: SelectedCredential;
  index: number;
  onToggleFinal: () => void;
  onRemove: () => void;
}

export function SortableCredentialItem({
  credential,
  index,
  onToggleFinal,
  onRemove,
}: SortableCredentialItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: credential.uuid,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
        credential.isFinal
          ? 'ring-1 ring-inset ring-green-200 bg-green-50 hover:bg-green-50 dark:bg-green-900/20'
          : ''
      }`}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600 touch-none"
        {...attributes}
        {...listeners}
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </span>

      {/* Order number */}
      <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {index + 1}
      </span>

      {/* Credential name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
          {credential.name}
        </span>
      </div>

      {/* Mark as final */}
      <button
        type="button"
        className={`shrink-0 text-xs px-2 py-1 rounded-sm border cursor-pointer transition-opacity ${
          credential.isFinal
            ? 'opacity-100 bg-green-100 text-green-800 border-green-300 dark:bg-green-800 dark:text-green-200 dark:border-green-600'
            : 'opacity-0 group-hover:opacity-100 bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-600'
        }`}
        onClick={onToggleFinal}
      >
        {credential.isFinal ? 'Final' : 'Mark Final'}
      </button>

      {/* Delete */}
      <button
        type="button"
        className="shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
        onClick={onRemove}
        aria-label="Remove credential"
      >
        <svg
          className="w-4 h-4 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>
    </li>
  );
}
