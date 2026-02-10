'use client';

import Link from 'next/link';

export default function EventPage() {
  return (
    <div className="bg-gray-50 p-4 min-h-screen">
      {/* Header / Breadcrumb */}
      <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white">
        {/* Mobile Back */}
        <nav className="sm:hidden" aria-label="Back">
          <Link
            href="/quick-certify/public/company"
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            ← Back
          </Link>
        </nav>

        {/* Desktop Breadcrumb */}
        <nav className="hidden sm:flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link
                href="/quick-certify/public/company"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
              >
                Issuer Profile
              </Link>
            </li>
            <li className="text-gray-400">›</li>
            <li>
              <Link
                href="/quick-certify/public/event"
                className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
              >
                Events
              </Link>
            </li>
          </ol>
        </nav>

        <div className="mt-2">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Events</h2>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search event by name"
            className="w-full md:w-1/2 rounded-sm border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
          />

          <button className="inline-flex items-center rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-100">
            Sort By
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="max-w-sm bg-white border border-gray-200 rounded-sm shadow-sm">
            <img src="/credential/image_720.png" alt="Event" className="rounded-t-sm" />

            <div className="p-5">
              <h5 className="mb-2 text-xl font-bold text-gray-900">
                Understanding Clean Coding Practices
              </h5>
              <p className="text-sm text-gray-700">Created on June 12, 2024</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="max-w-7xl mx-auto mt-8 bg-white border border-gray-200 rounded-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span className="text-sm text-gray-500">
            Showing <strong>1–10</strong> of <strong>1000</strong>
          </span>

          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button className="px-3 py-2 text-sm hover:bg-gray-100">Previous</button>
            <button className="px-3 py-2 text-sm bg-blue-50 text-blue-600">1</button>
            <button className="px-3 py-2 text-sm hover:bg-gray-100">2</button>
            <button className="px-3 py-2 text-sm hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
