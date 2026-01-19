"use client";

import { useState } from "react";
import { designs as designsList } from "../design.data";
import DesignCard from "./DesignCard";

export default function DesignsList() {
  const [filter, setFilter] = useState<"All" | "Certificate" | "Badge">("All");
  const [search, setSearch] = useState("");

  const filtered = designsList.filter((d) => {
    const matchFilter = filter === "All" || d.type === filter;
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <>
      {/*  */}
      <div className="flex justify-between px-6 py-5 items-center border-b border-gray-200 shadow-sm">

        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-700 text-xs font-extrabold">
            Show records only for:
          </span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="designFilter"
              value="Certificate"
              checked={filter === "Certificate"}
              onChange={() => setFilter("Certificate")}
              className="h-4 w-4 accent-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-xs font-extrabold text-gray-700">Certificates</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="designFilter"
              value="Badge"
              checked={filter === "Badge"}
              onChange={() => setFilter("Badge")}
              className="h-4 w-4 accent-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-offset-0"

            />
            <span className="text-xs font-extrabold text-gray-700">Badges</span>
          </label>

          <button
            type="button"
            onClick={() => setFilter("All")}
            className="text-xs font-bold text-blue-600 underline hover:text-blue-700"
          >
            Show All
          </button>
        </div>


        <div className=" items-center text-sm text-gray-200 border-gray-400">
          <input
            type="text"
            placeholder="Search designs…"
            className="border border-gray-300  text-gray-600 rounded px-2 py-1 mr-auto w-72 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 hover:ring-1 hover:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Design Action */}
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm flex items-center justify-between py-3 px-2">
        <span className="text-xs font-extrabold text-gray-600 uppercase">
          Design
        </span>

        <span className="text-xs font-extrabold text-gray-600 uppercase">
          Actions
        </span>
      </div>


      {filtered.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </>
  );
}
