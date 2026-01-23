'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { designService, Design } from '@/services/api';
import { PaginatedResponse } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { DesignFormData } from '@/schemas/design.schema';

type Params = {
  page: number;
  limit: number;
  search?: string;
};

//List & Delete
export function useDesigns({ page, limit, search }: Params) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [meta, setMeta] =
    useState<PaginatedResponse<Design>['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent stale fetch overwrites
  const requestIdRef = useRef(0);

  const fetchDesigns = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await designService.getDesigns({
        page,
        limit,
        search,
      });

      // Ignore outdated responses
      if (requestId !== requestIdRef.current) return;

      setDesigns(res.data);
      setMeta(res.meta);
      setError(null);
    } catch (err: unknown) {
      if (requestId !== requestIdRef.current) return;
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch designs');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  /* -------- Optimistic delete (SAFE) -------- */
  const deleteDesign = async (id: string) => {
    let snapshot: Design[] = [];

    setDesigns((prev) => {
      snapshot = prev;
      return prev.filter((d) => d.id !== id);
    });

    try {
      await designService.deleteDesign(id);
    } catch {
      // rollback
      setDesigns(snapshot);
      throw new Error('Delete failed');
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

// get single design
export function useDesignById(id?: string) {
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);

    designService
      .getDesignById(id)
      .then((res) => mounted && setDesign(res))
      .catch(() => mounted && setError('Failed to load design'))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  return { design, loading, error };
}

// create design
export function useCreateDesign(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (data: DesignFormData) =>
      designService.createDesign({
        name: data.name,
        designType: data.type,
        designUrl: data.url,
      }),
    onSuccess,
  });
}

export function useUpdateDesign() {
  return useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      designType: 'certificate' | 'badge';
      designUrl: string;
    }) =>
      designService.updateDesign(data.id, {
        name: data.name,
        designType: data.designType,
        designUrl: data.designUrl,
      }),
  });
}

