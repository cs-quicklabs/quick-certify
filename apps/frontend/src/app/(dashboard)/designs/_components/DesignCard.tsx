import Link from 'next/link';
import { Eye, Pen, Trash2 } from 'lucide-react';
import { Design } from '@/types';

export default function DesignCard({ design, onDelete }: { design: Design; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 bg-white py-4 border-b border-gray-200 shadow-md">
      {/* Certificate Display */}
      <div className="flex items-center gap-2">
        <img src={design.url} className="w-20 h-14 object-cover rounded" alt={design.name} />
        <div>
          <h3 className="font-medium text-sm">{design.name}</h3>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1">
              <span className="inline-flex text-gray-500 text-xs font-medium">
                Created On: {new Date(design.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="inline-flex capitalize bg-blue-50 border border-blue-400/50 text-primary-800 px-1.5 py-0.5 rounded-md text-xs font-medium">
                {design.type}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex justify-end items-center gap-3 text-sm">
        <Link
          href={`/designs/preview/${design.uuid}`}
          className="action-item action-item-blue inline-flex items-center gap-2 px-3 py-1 rounded-md"
        >
          <Eye className="w-4 h-4 stroke-[1.5]" />
          <span className="whitespace-nowrap">Preview</span>
        </Link>

        <Link
          href={`/designs/edit/${design.uuid}`}
          className="action-item action-item-gray inline-flex items-center gap-2 px-3 py-1 rounded-md"
        >
          <Pen className="w-4 h-4 stroke-[1.5]" />
          <span className="whitespace-nowrap">Edit</span>
        </Link>

        <button
          onClick={onDelete}
          className="action-item action-item-red inline-flex items-center gap-2 px-3 py-1 rounded-md"
        >
          <Trash2 className="w-4 h-4 stroke-[1.5]" />
          <span className="whitespace-nowrap">Delete</span>
        </button>
      </div>
    </div>
  );
}
