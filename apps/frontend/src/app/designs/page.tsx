'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DesignsList from './_components/DesignsList';
import { useDesigns } from '@/hooks/useDesigns';

export default function DesignsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const searchFromUrl = searchParams.get('search') ?? '';

  const [search, setSearch] = useState(searchFromUrl);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { designs, meta, loading, error, deleteDesign } = useDesigns({
    page,
    limit: 10,
    search: searchFromUrl,
  });

  // Debounce search → URL
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', '1');

      if (search) params.set('search', search);
      else params.delete('search');

      router.push(`/designs?${params.toString()}`);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  if (loading) return <div className="p-4">Loading designs…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-white">
        <div>
          <h1 className="text-lg font-bold">Designs Library</h1>
          <p className="text-sm text-gray-500">
            Manage certificate and badge designs
          </p>
        </div>

        <Link
          href="/designs/add?type=certificate"
          className="bg-blue-800 text-white px-4 py-2 rounded-sm text-sm"
        >
          Add New Design
        </Link>
      </div>

      <DesignsList
        designs={designs}
        meta={meta!}
        onDelete={deleteDesign}
        search={search}
        setSearch={setSearch}
        page={page}
      />
    </div>
  );
}
