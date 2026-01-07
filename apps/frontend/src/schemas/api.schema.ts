/**
 * API Response Schema Examples
 *
 * Use these schemas to validate API responses for type safety.
 */

import { z } from 'zod';

// Generic API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
  });

// Paginated response
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

// Example: Post schema
export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  published: z.boolean(),
});

export type Post = z.infer<typeof postSchema>;

// Example: Using with API response
export const postResponseSchema = apiResponseSchema(postSchema);
export const postsListResponseSchema = apiResponseSchema(z.array(postSchema));
export const paginatedPostsSchema = paginatedResponseSchema(postSchema);

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(
    z.object({
      field: z.string().optional(),
      message: z.string(),
    }),
  ),
  statusCode: z.number(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
