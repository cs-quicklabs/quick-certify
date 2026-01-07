/**
 * Validation Utilities
 *
 * Helper functions for validating data with Zod schemas.
 */

import { z } from 'zod';

// Generic validation function
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });

  return { success: false, errors };
}

// Validate and throw error if invalid
export function validateOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

// Format Zod errors for display
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (path) {
      formatted[path] = err.message;
    }
  });

  return formatted;
}

// Validate API response
export async function validateApiResponse<T extends z.ZodTypeAny>(
  response: Response,
  schema: T,
): Promise<z.infer<T>> {
  const data = await response.json();
  return validateOrThrow(schema, data);
}

// Example usage in fetch:
//
// const fetchUser = async (userId: string) => {
//   const response = await fetch(`/api/users/${userId}`);
//   return validateApiResponse(response, userSchema);
// };
