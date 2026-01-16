"use client";

import { useState } from "react";
import { designs as designsList } from "../../app/(designs)/design.data";
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
      <div className="flex justify-between mb-6 ">

        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-700 font-medium">
            Show records only for:
          </span>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="designFilter"
              value="Certificate"
              checked={filter === "Certificate"}
              onChange={() => setFilter("Certificate")}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-gray-900">Certificates</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="designFilter"
              value="Badge"
              checked={filter === "Badge"}
              onChange={() => setFilter("Badge")}
              className="h-4 w-4 accent-blue-600"
            />
            <span className="text-gray-900">Badges</span>
          </label>

          <button
            type="button"
            onClick={() => setFilter("All")}
            className="text-blue-600 hover:underline font-medium"
          >
            Show All
          </button>
        </div>


        <div className=" items-center text-sm opacity-50">
          <input
            type="text"
            placeholder="Search designs…"
            className="border border-stone-400 rounded px-2 py-1 mr-auto w-72 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Design Action */}
      <div className="hidden sm:grid grid-cols-[1fr_auto] my-4 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-600 uppercase">
          Design
        </span>
        <span className="text-sm font-semibold text-gray-600 uppercase text-right">
          Actions
        </span>
      </div>

      {filtered.map((design) => (
        <DesignCard key={design.id} design={design} />
      ))}
    </>
  );
}
