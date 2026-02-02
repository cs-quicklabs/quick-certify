import Link from 'next/link';
import { Eye, Pen, Trash2 } from 'lucide-react';
import { Design } from '@/services/api/design.service';

export default function DesignCard({ design, onDelete }: { design: Design; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 bg-white py-5 border-b border-gray-200 shadow">
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
      <div className="flex justify-end gap-1 text-sm font-medium">
        <Link
          href={`/designs/preview/${design.id}`}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <Eye className="w-4 h-4 stroke-0.25" />
          <span>Preview</span>
        </Link>

        <Link
          href={`/designs/edit/${design.id}`}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Pen className="w-4 h-4 stroke-0.25" />
          <span>Edit</span>
        </Link>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4 stroke-0.25" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
