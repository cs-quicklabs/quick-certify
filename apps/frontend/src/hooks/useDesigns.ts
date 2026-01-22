'use client';

import { useEffect, useState, useCallback } from 'react';
import { designService, Design } from '@/services/api/design.service';
import { PaginatedResponse } from '@/types';

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export function useDesigns({ page, limit, search }: Params) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [meta, setMeta] =
    useState<PaginatedResponse<Design>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = useCallback(() => {
    setLoading(true);
    designService
      .getDesigns({ page, limit, search })
      .then((res) => {
        setDesigns(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message ?? 'Failed to fetch designs');
      })
      .finally(() => setLoading(false));
  }, [page, limit, search]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Optimistic delete
  const deleteDesign = async (id: string) => {
    const prev = designs;
    setDesigns((d) => d.filter((x) => x.id !== id));

    try {
      await designService.deleteDesign(id);
    } catch {
      // rollback on failure
      setDesigns(prev);
    }
  };

  return {
    designs,
    meta,
    loading,
    error,
    deleteDesign,
    refetch: fetchDesigns,
  };
}
export function useDesignById(id: string) {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    designService
      .getDesignById(id)
      .then(setDesign)
      .catch(() => setError('Failed to load design'))
      .finally(() => setLoading(false));
  }, [id]);

  return { design, loading, error };
}
