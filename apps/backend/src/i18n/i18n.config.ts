import en from './en';
import { getCurrentLocale } from './i18n.context';

export const SUPPORTED_LOCALES = ['en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export type I18nParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Parses `accept-language` and returns the best supported locale.
 * Falls back to `DEFAULT_LOCALE` if none match.
 *
 * Examples:
 * - "en-US,en;q=0.9" -> "en"
 * - "fr-CA,fr;q=0.9" -> "en" (until "fr" is added)
 */
export function resolveLocaleFromAcceptLanguage(
  acceptLanguageHeader: string | string[] | undefined,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (!acceptLanguageHeader) return fallback;

  const header = Array.isArray(acceptLanguageHeader)
    ? acceptLanguageHeader.join(',')
    : acceptLanguageHeader;

  const firstRange = header
    .split(',')
    .map((s) => s.trim())
    .find(Boolean);

  const langTag = firstRange?.split(';')[0]?.trim().toLowerCase();
  const primary = langTag?.split('-')[0];

  if (!primary) return fallback;

  // Minimal for now: we only support 'en'. Later you can extend SUPPORTED_LOCALES.
  return (SUPPORTED_LOCALES as readonly string[]).includes(primary) ? (primary as Locale) : fallback;
}

function getByDotPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
      continue;
    }
    return undefined;
  }

  return current;
}

function interpolate(template: string, params?: I18nParams): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = params[key];
    return value === undefined ? `{{${key}}}` : String(value);
  });
}

/**
 * Translate a key using dot-path lookup.
 *
 * If `locale` is not provided, it is resolved from the current request context
 * (set via middleware using the `accept-language` header) and falls back to `en`.
 */
export function t(key: string, params?: I18nParams, locale?: Locale): string {
  // Only `en` exists right now, but we still resolve locale to keep the API stable.
  locale ??= getCurrentLocale() ?? DEFAULT_LOCALE;
  const dict = en;
  const value = getByDotPath(dict, key);
  const template = typeof value === 'string' ? value : key;
  return interpolate(template, params);
}

