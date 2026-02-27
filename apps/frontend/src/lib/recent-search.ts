import { RecentSearchItem, SearchCategory } from '@/types';

const STORAGE_KEY = 'qc_recent_searches';
const MAX_ITEMS = 8;

const VALID_CATEGORIES = new Set<string>(Object.values(SearchCategory));

function isValidRecentSearch(item: unknown): item is RecentSearchItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as RecentSearchItem).name === 'string' &&
    typeof (item as RecentSearchItem).route === 'string' &&
    VALID_CATEGORIES.has((item as RecentSearchItem).category)
  );
}

export function getRecentSearches(): RecentSearchItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidRecentSearch);
  } catch {
    return [];
  }
}

export function addRecentSearch(item: RecentSearchItem): void {
  const existing = getRecentSearches().filter(
    (s) => !(s.route === item.route && s.name === item.name),
  );
  const updated = [item, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearRecentSearches(): void {
  localStorage.removeItem(STORAGE_KEY);
}
