'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { type SelectedCredential } from './SortableCredentialList';

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
      className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-white hover:bg-gray-50 ${
        credential.isFinal ? 'ring-1 ring-inset ring-green-200 bg-green-50 hover:bg-green-50' : ''
      }`}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 cursor-grab text-gray-400 hover:text-gray-600 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </span>

      {/* Order number */}
      <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
        {index + 1}
      </span>

      {/* Credential name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-900 truncate block">{credential.name}</span>
      </div>

      {/* Mark as final */}
      <button
        type="button"
        className={`shrink-0 text-xs px-2 py-1 rounded-sm border cursor-pointer transition-opacity ${
          credential.isFinal
            ? 'opacity-100 bg-green-100 text-green-800 border-green-300'
            : 'opacity-0 group-hover:opacity-100 bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
        }`}
        onClick={onToggleFinal}
      >
        {credential.isFinal ? 'Final' : 'Mark Final'}
      </button>

      {/* Delete */}
      <button
        type="button"
        className="shrink-0 p-1 rounded hover:bg-red-100 cursor-pointer"
        onClick={onRemove}
        aria-label="Remove credential"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </li>
  );
}
