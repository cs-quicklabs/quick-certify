'use client';

import Link from 'next/link';

export default function PublicRecipientsPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header / Breadcrumb */}
      <div className="max-w-7xl mx-auto p-4 rounded-sm border border-gray-200 bg-white">
        <div>
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
                  href="/quick-certify/public/recipients"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Recipients
                </Link>
              </li>
            </ol>
          </nav>
        </div>

        <div className="mt-2">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Recipients</h2>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search person by name"
            className="w-full md:w-1/2 rounded-sm border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
          />

          <button className="inline-flex items-center rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-100">
            Sort By
          </button>
        </div>
      </div>

      {/* Recipients Grid */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Link
            key={i}
            href="/quick-certify/public/event/1/person"
            className="flex items-center gap-3 rounded-sm border border-gray-300 bg-white px-4 py-3 hover:border-gray-400 focus:ring-2 focus:ring-indigo-500"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&q=80"
              alt="Recipient"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">Leslie Alexander</p>
              <p className="truncate text-sm text-gray-500">Co-Founder / CEO</p>
            </div>
          </Link>
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
