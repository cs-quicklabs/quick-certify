import Link from "next/link";
import { Design } from "@/services/api/design.service";

export default function DesignCard({ design, onDelete }: { design: Design, onDelete: () => void }) {
  return (

    <div className="flex items-center justify-between px-6 bg-white py-5 border-b border-gray-200 shadow">

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
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.5 12S6.5 5 12 5s9.5 7 9.5 7-4 7-9.5 7-9.5-7-9.5-7z" />
          </svg>
          <span>Preview</span>
        </Link>

        <Link
          href={`/designs/edit/${design.id}`}
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
          </svg>
          <span>Edit</span>
        </Link>

        <Link
          href={`/designs/delete/${design.id}`} // Or your specific delete route
          className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-xs bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 7h12M9 7V4h6v3M10 11v6M14 11v6M5 7l1 13h12l1-13" />
          </svg>
          <span>Delete</span>
        </Link>
      </div>
    </div>
  );
}
