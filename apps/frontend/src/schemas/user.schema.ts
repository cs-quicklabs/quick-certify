/**
 * User Schema Examples
 *
 * This file demonstrates Zod schemas for user-related data validation.
 */

import { z } from 'zod';

// Basic user schema
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  age: z.number().int().min(18, 'Must be 18 or older').optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

// Infer TypeScript type from schema
export type User = z.infer<typeof userSchema>;

// Registration form schema
export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Login form schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Profile update schema (partial user)
export const updateProfileSchema = userSchema.partial().omit({ id: true });

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
