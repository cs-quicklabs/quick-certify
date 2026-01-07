/**
 * TanStack Query Example Hooks
 *
 * This file contains example patterns for using TanStack Query.
 * Copy and modify these patterns for your own API calls.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Example: Query Hook (GET request)
export function useGetData() {
  return useQuery({
    queryKey: ['data'], // Unique key for this query
    queryFn: async () => {
      const response = await fetch('/api/your-endpoint');
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    // Optional configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

// Example: Mutation Hook (POST/PUT/DELETE request)
export function useCreateData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData: any) => {
      const response = await fetch('/api/your-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch queries after successful mutation
      queryClient.invalidateQueries({ queryKey: ['data'] });
    },
  });
}
