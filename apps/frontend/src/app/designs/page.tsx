'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import DesignsList from './_components/DesignsList';

export default function DesignsPage() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between p-4 bg-white">
        <div>
          <h1 className="text-lg font-bold">Designs Library</h1>
          <p className="text-sm text-gray-500">
            Manage certificate and badge designs
          </p>
        </div>

        {/* Add New Design Dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="bg-blue-800 text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2"
          >
            Add New Design
            <svg
              className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow z-50">
              <Link
                href="/designs/add?type=certificate"
                className="block px-4 py-3 text-sm hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Certificate
              </Link>
              <Link
                href="/designs/add?type=badge"
                className="block px-4 py-3 text-sm hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Badge
              </Link>
            </div>
          )}
        </div>
      </div>

      <DesignsList />
    </div>
  );
}
