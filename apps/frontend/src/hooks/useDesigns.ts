'use client';

import { designService } from '@/services/api';
import { PaginatedResponse } from '@/types';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { DesignFormData } from '@/schemas/design.schema';
import { Design } from '@/types';

type Params = {
  page: number;
  limit: number;
  search?: string;
};

export function useDesignList({ page, limit, search }: Params) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['designs', page, limit, search],
    queryFn: () =>
      designService.getDesigns({
        page,
        limit,
        search,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => designService.deleteDesign(id),

    // optimistic delete
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['designs'] });

      const previous = queryClient.getQueryData<PaginatedResponse<Design>>([
        'designs',
        page,
        limit,
        search,
      ]);

      if (previous) {
        queryClient.setQueryData(['designs', page, limit, search], {
          ...previous,
          data: previous.data.filter((d) => d.id !== id),
        });
      }

      return { previous };
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['designs', page, limit, search], ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
    },
  });

  return {
    designs: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    deleteDesign: deleteMutation.mutateAsync,
    refetch: query.refetch,
  };
}

// get single design
export function useDesignById(id?: string) {
  return useQuery({
    queryKey: ['design', id],
    queryFn: () => {
      if (!id) throw new Error('Missing design id');
      return designService.getDesignById(id);
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

// create design
export function useCreateDesign(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DesignFormData) =>
      designService.createDesign({
        name: data.name,
        designType: data.type,
        designUrl: data.url,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      onSuccess?.();
    },
  });
}

export function useUpdateDesign() {
  const queryClient = useQueryClient();

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

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({
        queryKey: ['design', variables.id],
      });
    },
  });
}
