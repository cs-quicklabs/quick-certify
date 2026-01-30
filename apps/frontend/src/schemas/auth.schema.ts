/**
 * Auth Form Schemas
 *
 * Validation schemas for authentication forms using Zod.
 * Uses shared schemas for consistent validation across the app.
 */

import { z } from 'zod';
import {
  passwordSchema,
  strictPasswordSchema,
  emailSchema,
  urlSchema,
  PASSWORD_MESSAGES,
  requiredFirstNameSchema,
  requiredLastNameSchema,
} from './shared.schema';

/**
 * Login Form Schema
 *
 * Note: Login uses a simpler password check (min 6 chars) since
 * we're validating against existing passwords, not creating new ones.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register Form Schema
 */
export const registerSchema = z
  .object({
    firstName: requiredFirstNameSchema,
    lastName: requiredLastNameSchema,
    email: emailSchema,
    companyName: z
      .string()
      .min(1, 'Company name is required')
      .min(2, 'Company name must be at least 2 characters'),
    websiteUrl: urlSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, PASSWORD_MESSAGES.CONFIRM_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: PASSWORD_MESSAGES.MISMATCH,
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot Password Form Schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Form Schema
 */
export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, PASSWORD_MESSAGES.CONFIRM_REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: PASSWORD_MESSAGES.MISMATCH,
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Accept Invitation Form Schema
 *
 * Uses strict password schema (requires special character) for
 * invited users to ensure strong initial passwords.
 */
export const acceptInvitationSchema = z
  .object({
    password: strictPasswordSchema,
    confirmPassword: z.string().min(1, PASSWORD_MESSAGES.CONFIRM_REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: PASSWORD_MESSAGES.MISMATCH,
    path: ['confirmPassword'],
  });

export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

/**
 * Google Signup Complete Schema
 * For completing registration after Google OAuth signup.
 */

export const googleSignupCompleteSchema = z.object({
  firstName: requiredFirstNameSchema,
  lastName: requiredLastNameSchema,
  companyName: z
    .string()
    .min(1, 'Issuer name is required')
    .min(2, 'Issuer name must be at least 2 characters'),
  websiteUrl: urlSchema,
});

export type GoogleSignupCompleteFormData = z.infer<typeof googleSignupCompleteSchema>;
