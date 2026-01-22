import { customAlphabet } from 'nanoid';

/**
 * Custom nanoid generator with URL-safe characters
 * Generates IDs of length 21 by default (similar to UUID v4 length)
 * Uses: A-Za-z0-9_- characters (URL-safe)
 */
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-',
  21,
);

/**
 * Generate a unique nanoid
 * @returns A unique nanoid string (21 characters)
 */
export function generateNanoid(): string {
  return nanoid();
}
