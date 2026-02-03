'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DesignsList from '@/app/designs/_components/DesignsList';
import { useDesignList } from '@/hooks/useDesigns';
import { ChevronDown, Award, BadgeCheck } from 'lucide-react';

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
    limit: 4,
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
      'Are you sure you want to delete this design? This action cannot be undone.',
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
  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/designs?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-y-3 p-4 py-2 pr-8 sm:flex-row sm:items-center sm:justify-between shadow sm:gap-y-0 sm:gap-x-4 bg-white">
        {/* Title + Description */}
        <div>
          <h1 className="mr-3 text-lg font-semibold text-gray-900">Designs Library</h1>
          <p className="text-sm text-gray-500">Manage certificate and badge designs</p>
        </div>

        {/* Add New Design Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            type="button"
            className="
        inline-flex items-center
        rounded-sm
        bg-primary-700 px-4 py-2
        text-sm font-medium text-white
        hover:bg-blue-900
        focus:outline-none focus:ring-2 focus:ring-blue-300
        transition-colors
      "
          >
            Add New Design
            <ChevronDown
              className={`ml-1.5 h-4 w-4 transition-transform stroke-[1.5] ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg">
              <ul className="p-2 text-sm font-medium text-gray-700">
                {/* Certificate */}
                <li>
                  <Link
                    href="/designs/add?type=certificate"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Award className="h-5 w-5 shrink-0 stroke-[1.5]" />
                    Certificate
                  </Link>
                </li>

                {/* Badge */}
                <li>
                  <Link
                    href="/designs/add?type=badge"
                    onClick={() => setOpen(false)}
                    className="inline-flex w-full items-center gap-3 rounded-md p-2 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <BadgeCheck className="h-5 w-5 shrink-0 stroke-[1.5]" />
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
      {/*  Pagination Tab*/}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-end mt-6 px-4">
          <nav className="inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <button
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-r border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-3 py-2 text-sm font-medium border-r border-gray-200
              ${page === p ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}

            <button
              disabled={page === meta.totalPages}
              onClick={() => goToPage(page + 1)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
