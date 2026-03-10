'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DesignsList from './_components/DesignsList';
import { Design } from '@/types';
import { useDesignList } from '@/hooks/useDesigns';
import { ROUTES } from '@/config/routes';
import { ChevronDown, BadgeCheck, Layers } from 'lucide-react';
import { ConfirmationDialog, ModulePermissionError, Pagination } from '@/components';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import { getApiErrorMessage } from '@/lib/api-error';

const SEARCH_DEBOUNCE_MS = 1000;
const DESIGN_CARD_ITEM_LIMIT = 6;

type Filter = 'All' | 'Certificate' | 'Badge';

export default function DesignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const searchFromUrl = searchParams.get('search') ?? '';
  const typeFromUrl = searchParams.get('type') as Filter | null;

  const [search, setSearch] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const [filter, setFilter] = useState<Filter>(typeFromUrl ?? 'All');
  const [open, setOpen] = useState(false);

  /* ---------------- Delete dialog state ---------------- */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const apiType = filter === 'All' ? undefined : (filter.toLowerCase() as 'certificate' | 'badge');

  const { designs, meta, loading, deleteDesign, error } = useDesignList({
    page,
    limit: DESIGN_CARD_ITEM_LIMIT,
    search: debouncedSearch,
    type: apiType,
    sortBy: 'updated_at',
    sortOrder: 'DESC',
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;
  const prevDebouncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (prevDebouncedSearch.current === debouncedSearch) return;
    prevDebouncedSearch.current = debouncedSearch;

    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.set('page', '1');

    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');

    router.replace(`${ROUTES.DESIGNS}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router]);

  // Handlers
  const handleDeleteClick = (design: Design) => {
    setSelectedDesign(design);
    setIsDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setSelectedDesign(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDesign) return;

    try {
      setIsDeleting(true);
      await deleteDesign(selectedDesign.uuid);
      showSuccessToast('Design deleted successfully');
    } catch (error) {
      showErrorToast(getApiErrorMessage(error, 'Failed to delete design'));
    } finally {
      setIsDeleting(false);
      handleCancelDelete();
    }
  };

  const handleFilterChange = (value: Filter) => {
    setFilter(value);

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (value === 'All') params.delete('type');
    else params.set('type', value.toLowerCase());

    router.push(`${ROUTES.DESIGNS}?${params.toString()}`, { scroll: false });
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`${ROUTES.DESIGNS}?${params.toString()}`, { scroll: false });
  };

  if (loading) return <div className="p-4">Loading designs…</div>;
  if (error?.includes('403')) {
    return <ModulePermissionError />;
  }
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-y-3 p-4 py-2 pr-8 sm:flex-row sm:items-center sm:justify-between shadow bg-white">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Designs Library</h1>
          <p className="text-sm text-gray-500">Manage certificate and badge designs</p>
        </div>

        {/* Add New Design */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center rounded-sm bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-900"
          >
            Add New Design
            <ChevronDown
              className={`ml-1.5 h-4 w-4 stroke-[1.5] transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg">
              <ul className="p-2 text-sm font-medium text-gray-700">
                <li>
                  <Link
                    href={`${ROUTES.DESIGNS}/add?type=certificate`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                  >
                    <Layers className="h-5 w-5 stroke-[1.5]" />
                    Certificate
                  </Link>
                </li>
                <li>
                  <Link
                    href={`${ROUTES.DESIGNS}/add?type=badge`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-100"
                  >
                    <BadgeCheck className="h-5 w-5 stroke-[1.5]" />
                    Badge
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* List */}
      <DesignsList
        designs={designs}
        meta={meta}
        search={search}
        filter={filter}
        onSearchChange={setSearch}
        onFilterChange={handleFilterChange}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      {meta && (
        <div className="flex justify-end mt-6 px-4">
          <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={goToPage} />
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDialogOpen}
        title="Delete design?"
        message={
          <>
            Are you sure you want to delete{' '}
            <span className="font-medium">{selectedDesign?.name}</span>?<br />
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
