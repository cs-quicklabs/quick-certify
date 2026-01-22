import Link from "next/link";
import { Design } from "@/services/api/design.service";

export default function DesignCard({ design, onDelete }: { design: Design, onDelete: void }) {
  return (
    <div className="flex items-center justify-between px-6 bg-white py-5 border-b border-gray-200 rounded shadow">

      {/* Certificate Display */}
      <div className="flex items-center gap-2">
        <img
          src={design.url}
          className="w-20 h-14 object-cover rounded"
          alt={design.name}
        />

        <div>
          <h3 className="font-semibold text-sm">{design.name}</h3>

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
      <div className="flex justify-end gap-2 text-sm font-medium">
        <Link
          href={`/designs/preview/${design.id}`}
          className="px-3 py-1 flex gap-2 items-center text-blue-600 bg-blue-50 rounded hover:bg-blue-50"
        >
          <span>Preview</span>
        </Link>

        <Link
          href={`/designs/edit/${design.id}`}
          className="px-3 py-1 flex gap-2 items-center text-gray-700 bg-gray-50 rounded hover:bg-gray-100"
        >
          <span>Edit</span>
        </Link>

        <button className="px-3 py-1 flex gap-2 items-center text-red-600 bg-red-50 rounded hover:bg-red-50">
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
