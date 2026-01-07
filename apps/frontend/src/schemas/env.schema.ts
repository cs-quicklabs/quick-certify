/**
 * Environment Variables Schema
 *
 * Validate environment variables at runtime for type safety.
 */

import { z } from 'zod';

// Define your environment variables schema
const envSchema = z.object({
  // Next.js public env vars (accessible in browser)
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  // Server-side only env vars
  // DATABASE_URL: z.string().url(),
  // API_SECRET_KEY: z.string().min(32),
});

// Parse and validate environment variables
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  // DATABASE_URL: process.env.DATABASE_URL,
  // API_SECRET_KEY: process.env.API_SECRET_KEY,
});

// TypeScript type for env
export type Env = z.infer<typeof envSchema>;

// Usage:
// import { env } from '@/schemas/env.schema';
// const apiUrl = env.NEXT_PUBLIC_API_URL;
