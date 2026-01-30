'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DesignsList from './_components/DesignsList';
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

        {/* ADD NEW DESIGN DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
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
