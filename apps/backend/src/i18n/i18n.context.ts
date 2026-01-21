import { AsyncLocalStorage } from 'node:async_hooks';
import type { Locale } from './i18n.config';

type I18nStore = {
  locale: Locale;
};

const storage = new AsyncLocalStorage<I18nStore>();

export function runWithLocale<T>(locale: Locale, fn: () => T): T {
  return storage.run({ locale }, fn);
}

export function getCurrentLocale(): Locale | undefined {
  return storage.getStore()?.locale;
}

