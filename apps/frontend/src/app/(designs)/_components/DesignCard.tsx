import { DesignType } from "../design.data";
import Link from "next/link";

export default function DesignCard({ design }: { design: DesignType }) {
  return (


    <div className="flex items-center justify-between p-4 m-0 bg-white rounded shadow mb-4">

      {/* Certificate Display */}
      <div className="flex items-center gap-2">
        <img
          src={design.thumbnail}
          className="w-20 h-14 object-cover rounded"
          alt={design.title}
        />

        <div>
          <h3 className="font-bold text-sm">{design.title}</h3>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1">
              <span className="inline-flex bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-medium">
                Created On: {design.createdOn}
              </span>
              <span className="h-1 w-1 rounded-full bg-blue-800"></span>
            </div>

            <div className="flex items-center gap-1">
              <span className="inline-flex capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-xs font-medium">
                {design.type}
              </span>
              <span className="h-1 w-1 rounded-full bg-blue-800x"></span>
            </div>
          </div>




        </div>
      </div>


      {/* Actions  */}
      <div className="flex gap-2">
        <button className="px-3 py-1 text-blue-600 border border-blue-200 rounded hover:bg-blue-50">
          Preview
        </button>

        <Link
          href={`/designs/edit/${design.id}`}
          className="px-3 py-1 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
        >
          Edit
        </Link>

        <button className="px-3 py-1 text-red-600 border border-red-200 rounded hover:bg-red-50">
          Delete
        </button>
      </div>
    </div>
  );
}
