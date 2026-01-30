'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DesignsList from '@/app/designs/_components/DesignsList'
import { useDesignList } from '@/hooks/useDesigns';

const SEARCH_DEBOUNCE_MS = 1000;

export default function DesignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const searchFromUrl = searchParams.get('search') ?? '';

  const [search, setSearch] = useState(searchFromUrl);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { designs, meta, loading, error, deleteDesign } = useDesignList({
    page,
    limit: 10,
    search: searchFromUrl,
  });

  /* -------- Debounced search → URL -------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');

      if (search) params.set('search', search);
      else params.delete('search');

      router.replace(`/designs?${params.toString()}`, { scroll: false });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [search]);

  /* Confirm Delete*/
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this design? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await deleteDesign(id);
    } catch {
      alert('Failed to delete design');
    }
  };

  if (loading) return <div className="p-4">Loading designs…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white">
        <div>
          <h1 className="text-lg font-bold">Designs Library</h1>
          <p className="text-sm text-gray-500">
            Manage certificate and badge designs
          </p>
        </div>

        {/* Add New Design Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="
    inline-flex items-center justify-center
    rounded-md
    bg-blue-700 px-4 py-2
    text-sm font-medium text-white
    hover:bg-blue-800
    focus:outline-none focus:ring-2 focus:ring-blue-300
    transition-colors
  "
          >
            Add New Design
            <svg
              className={`w-4 h-4 ms-1.5 -me-0.5 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white shadow">
              <ul className="p-2 text-sm font-medium text-gray-700">

                {/* Certificate */}
                <li>
                  <Link
                    href="/designs/add?type=certificate"
                    onClick={() => setOpen(false)}
                    className="
            inline-flex w-full items-center gap-3
            rounded-md p-2
            hover:bg-gray-100 hover:text-gray-900
          "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
                      />
                    </svg>
                    Certificate
                  </Link>
                </li>

                {/* Badge */}
                <li>
                  <Link
                    href="/designs/add?type=badge"
                    onClick={() => setOpen(false)}
                    className="
            inline-flex w-full items-center gap-3
            rounded-md p-2
            hover:bg-gray-100 hover:text-gray-900
          "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.746 3.746 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.746 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                      />
                    </svg>
                    Badge
                  </Link>
                </li>
              </ul>
            </div>
          )}


        </div>

      </div>

      <DesignsList
        designs={designs}
        meta={meta!}
        onDelete={handleDelete}
        search={search}
        setSearch={setSearch}
        page={page}
      />
    </div>
  );
}
