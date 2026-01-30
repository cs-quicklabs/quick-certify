/**
 * Shared Validation Schemas
 *
 * Reusable Zod schemas for common validation patterns.
 * Import these into feature-specific schemas to maintain consistency.
 */

import { z } from 'zod';

/**
 * Password Configuration
 */
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false, // Set to true for stricter requirements
} as const;

/**
 * Password Validation Messages
 */
export const PASSWORD_MESSAGES = {
  REQUIRED: 'Password is required',
  MIN_LENGTH: `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
  UPPERCASE: 'Password must contain at least one uppercase letter',
  LOWERCASE: 'Password must contain at least one lowercase letter',
  NUMBER: 'Password must contain at least one number',
  SPECIAL_CHAR: 'Password must contain at least one special character (@$!%*?&)',
  MISMATCH: "Passwords don't match",
  CONFIRM_REQUIRED: 'Please confirm your password',
} as const;

/**
 * Standard Password Schema
 *
 * Validates:
 * - Minimum length (8 characters)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @example
 * ```ts
 * import { passwordSchema } from '@/schemas/shared.schema';
 *
 * const mySchema = z.object({
 *   password: passwordSchema,
 * });
 * ```
 */
export const passwordSchema = z
  .string()
  .min(1, PASSWORD_MESSAGES.REQUIRED)
  .min(PASSWORD_CONFIG.MIN_LENGTH, PASSWORD_MESSAGES.MIN_LENGTH)
  .regex(/[A-Z]/, PASSWORD_MESSAGES.UPPERCASE)
  .regex(/[a-z]/, PASSWORD_MESSAGES.LOWERCASE)
  .regex(/[0-9]/, PASSWORD_MESSAGES.NUMBER);

/**
 * Strict Password Schema (with special character)
 *
 * Same as standard but also requires a special character.
 * Use for high-security forms like admin registration.
 *
 * @example
 * ```ts
 * import { strictPasswordSchema } from '@/schemas/shared.schema';
 *
 * const adminSchema = z.object({
 *   password: strictPasswordSchema,
 * });
 * ```
 */
export const strictPasswordSchema = passwordSchema.regex(
  /[@$!%*?&]/,
  PASSWORD_MESSAGES.SPECIAL_CHAR,
);

/**
 * Create password with confirmation schema
 *
 * Use this factory to create schemas with password confirmation.
 * Handles the refinement for password matching.
 *
 * @param useStrict - Whether to use strict password validation (includes special char)
 *
 * @example
 * ```ts
 * const registerSchema = z.object({
 *   email: z.string().email(),
 *   ...createPasswordWithConfirmSchema(),
 * });
 * ```
 */
export function createPasswordWithConfirmSchema(useStrict = false) {
  const basePassword = useStrict ? strictPasswordSchema : passwordSchema;

  return z
    .object({
      password: basePassword,
      confirmPassword: z.string().min(1, PASSWORD_MESSAGES.CONFIRM_REQUIRED),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: PASSWORD_MESSAGES.MISMATCH,
      path: ['confirmPassword'],
    });
}

/**
 * Email Schema
 *
 * Standard email validation with helpful error messages.
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

/**
 * Name Schema (required)
 *
 * For fields like firstName that must not be empty.
 */
export const requiredNameSchema = z
  .string()
  .min(1, 'This field is required')
  .min(2, 'Must be at least 2 characters')
  .regex(/\S/, 'Must not be only spaces');

/**
 * Name Schema (optional)
 *
 * For fields like lastName that are optional.
 */
export const optionalNameSchema = z.string().optional();

/**
 * URL Schema
 *
 * Validates URLs with helpful error message.
 */
export const urlSchema = z.string().min(1, 'URL is required').url('Please enter a valid URL');

/**
 * Optional URL Schema
 */
export const optionalUrlSchema = z
  .union([z.string().url('Please enter a valid URL'), z.literal('')])
  .optional();

