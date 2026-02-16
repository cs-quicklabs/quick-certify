import { showSuccessToast } from '@/lib/toast';
import { publicService } from '@/services/api/public.service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { success } from 'zod';

export function usePublicOrganization(slug?: string) {
  return useQuery({
    queryKey: ['public-organization', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Missing organization slug');

      const response = await publicService.getPublicOrganization(slug);

      if (!response) {
        throw new Error('Organization not found');
      }

      return response;
    },
    enabled: !!slug,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function usePublicSendEmail(slug: string) {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; message: string }) => {
      return await publicService.sendContactEmail(slug, data);
    },
    onSuccess: () => {
      showSuccessToast('Message sent successfully');
    },
    onError: (error: Error) => {
      // Optional: Add error handling
      console.error('Failed to send email:', error);
    },
  });
}
