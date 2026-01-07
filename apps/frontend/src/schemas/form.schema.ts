/**
 * Form Schema Examples
 *
 * Common form validation patterns using Zod.
 */

import { z } from 'zod';

// Contact form
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Product form
export const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  inStock: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image required'),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

// Search filters
export const searchFiltersSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'date-desc']).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'File size must be less than 5MB',
  }),
  type: z.enum(['image', 'document', 'video']),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;
