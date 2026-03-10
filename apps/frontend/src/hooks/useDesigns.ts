'use client';

import { designService } from '@/services/api';
import { DesignType, DesignLayout, PaginatedResponse, Design } from '@/types';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { DesignFormData } from '@/schemas/design.schema';
import { showSuccessToast } from '@/lib/toast';

type Params = {
  page: number;
  limit: number;
  search?: string;
  type?: DesignType;
  enabled?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

export function useDesignList({
  page,
  limit,
  search,
  type,
  enabled = true,
  sortBy,
  sortOrder,
}: Params) {
  const queryClient = useQueryClient();

  const queryKey = [
    'designs',
    page,
    limit,
    search ?? '',
    type ?? 'all',
    sortBy ?? '',
    sortOrder ?? '',
  ];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      designService.getDesigns({
        page,
        limit,
        search,
        type,
        sortBy,
        sortOrder,
      }),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (uuid: string) => designService.deleteDesign(uuid),

    // optimistic delete
    onMutate: async (uuid) => {
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<PaginatedResponse<Design>>(queryKey);

      if (previous) {
        queryClient.setQueryData(queryKey, {
          ...previous,
          data: previous.data.filter((d) => d.uuid !== uuid),
        });
      }

      return { previous };
    },

    onError: (_err, _uuid, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKey, ctx.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    designs: query.data?.data ?? [],
    meta: query.data?.meta ?? {
      page: 1,
      limit,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false,
      totalPages: 0,
    },
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
    mutationFn: (data: DesignFormData & { layout?: DesignLayout }) =>
      designService.createDesign({
        name: data.name,
        designType: data.type,
        designUrl: data.url,
        layout: data.layout,
      }),

    onSuccess: () => {
      showSuccessToast('Design created successfully');
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
      layout?: DesignLayout;
    }) =>
      designService.updateDesign(data.id, {
        name: data.name,
        designType: data.designType,
        designUrl: data.designUrl,
        layout: data.layout,
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      queryClient.invalidateQueries({
        queryKey: ['design', variables.id],
      });
      showSuccessToast('Design edited successfully');
    },
  });
}
