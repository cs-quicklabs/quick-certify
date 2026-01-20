import { DesignType } from "../design.data";
import Link from "next/link";

export default function DesignCard({ design }: { design: DesignType }) {
  return (
    <div className="flex items-center justify-between px-6 bg-white py-5 border-b border-gray-200 rounded shadow ">

      {/* Certificate Display */}
      <div className="flex items-center gap-2">
        <img
          src={design.thumbnail}
          className="w-20 h-14 object-cover rounded"
          alt={design.title}
        />

        <div>
          <h3 className="font-semibold text-sm">{design.title}</h3>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1">
              <span className="inline-flex text-gray-500 text-xs font-medium">
                Created On: {design.createdOn}
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


      {/* Actions  */}
      <div className="flex gap-2 text-sm font-bold">
        <Link href={`/designs/preview/${design.id}`}
          className="px-3 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
          Preview
        </Link>

        <Link
          href={`/designs/edit/${design.id}`}
          className="px-3 py-1 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
          Edit
        </Link>

        <button className="px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50">
          Delete
        </button>
      </div>
    </div>
  );
}
