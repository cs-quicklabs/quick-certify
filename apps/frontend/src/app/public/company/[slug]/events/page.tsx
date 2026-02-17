'use client';

import Link from 'next/link';
import EventCard from '@/app/public/_components/eventCard';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

export default function EventPage() {
  const events = [
    {
      id: '1',
      imageUrl: '/credential/image_720.png',
      title: 'Understanding Clean Coding Practices',
      createdOn: 'June 12, 2024',
      href: '/quick-certify/public/event/1',
    },
    {
      id: '2',
      imageUrl: '/credential/image_720.png',
      title: 'Advanced React Patterns',
      createdOn: 'May 25, 2024',
      href: '/quick-certify/public/event/2',
    },
    {
      id: '3',
      imageUrl: '/credential/image_720.png',
      title: 'Node + Nest API Deep Dive',
      createdOn: 'May 03, 2024',
      href: '/quick-certify/public/event/3',
    },
  ];

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

      {/* Search, Sort & Events Grid */}
      <div className="max-w-7xl mx-auto mt-4 p-4 rounded-sm border border-gray-200 bg-white">
        {/* Search & Sort Bar */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search event by name"
              className="block w-full pl-9 pr-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Sort By Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            Sort By
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Events Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              id={ev.id}
              imageUrl={ev.imageUrl}
              title={ev.title}
              createdOn={ev.createdOn}
              href={ev.href}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="max-w-7xl mx-auto mt-8 bg-white border border-gray-200 rounded-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <span className="text-sm text-gray-500">
            Showing <strong>1–{events.length}</strong> of <strong>1000</strong>
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
