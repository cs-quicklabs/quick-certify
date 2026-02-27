'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useGlobalSearch } from '@/hooks/useSearch';
import { createRoute } from '@/config/routes';
import { SearchCategory, SearchResultItem, RecentSearchItem } from '@/types';
import { capitalizeFirst } from '@/utils';
import { addRecentSearch, getRecentSearches, clearRecentSearches } from '@/lib/recent-search';

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  [SearchCategory.EVENTS]: 'Events',
  [SearchCategory.PATHWAYS]: 'Pathways',
  [SearchCategory.DESIGNS]: 'Designs',
  [SearchCategory.TEAM_MEMBERS]: 'Team Members',
};

const CATEGORY_ORDER: SearchCategory[] = [
  SearchCategory.EVENTS,
  SearchCategory.PATHWAYS,
  SearchCategory.DESIGNS,
  SearchCategory.TEAM_MEMBERS,
];

function getRouteForResult(item: SearchResultItem): string {
  switch (item.category) {
    case SearchCategory.EVENTS:
      return createRoute.eventEdit(item.uuid);
    case SearchCategory.PATHWAYS:
      return createRoute.pathwayDetail(item.uuid);
    case SearchCategory.DESIGNS:
      return createRoute.designPreview(item.uuid);
    case SearchCategory.TEAM_MEMBERS:
      return createRoute.teamMember(item.uuid);
  }
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const debouncedQuery = useDebounce(query, 500);
  const { data: results, isLoading } = useGlobalSearch(debouncedQuery, isOpen);

  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const handleResultClick = useCallback(
    (item: SearchResultItem) => {
      const route = getRouteForResult(item);
      addRecentSearch({ name: item.name, category: item.category, route });
      setIsOpen(false);
      setQuery('');
      router.push(route);
    },
    [router],
  );

  const handleRecentClick = useCallback(
    (item: RecentSearchItem) => {
      setIsOpen(false);
      setQuery('');
      router.push(item.route);
    },
    [router],
  );

  const handleClearHistory = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleFocus = useCallback(() => {
    setIsOpen(true);
    setRecentSearches(getRecentSearches());
  }, []);

  const showRecentSearches = isOpen && !query.trim() && recentSearches.length > 0;
  const showResults = isOpen && debouncedQuery.trim().length > 0;

  const categories = useMemo(() => {
    if (!results) return [];
    const categoryMap: Record<SearchCategory, SearchResultItem[]> = {
      [SearchCategory.EVENTS]: results.events,
      [SearchCategory.PATHWAYS]: results.pathways,
      [SearchCategory.DESIGNS]: results.designs,
      [SearchCategory.TEAM_MEMBERS]: results.team_members,
    };
    return CATEGORY_ORDER.map((key) => ({ key, items: categoryMap[key] })).filter(
      (c) => c.items.length > 0,
    );
  }, [results]);

  // Group recent searches by category
  const recentByCategory = useMemo(() => {
    const grouped = new Map<SearchCategory, RecentSearchItem[]>();
    for (const item of recentSearches) {
      const list = grouped.get(item.category) || [];
      list.push(item);
      grouped.set(item.category, list);
    }
    return CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => ({
      key: cat,
      items: grouped.get(cat)!,
    }));
  }, [recentSearches]);

  return (
    <div className="flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
      <div className="relative w-full max-w-lg lg:max-w-xs" ref={containerRef}>
        <label htmlFor="global-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            className="block w-full rounded-md border border-transparent bg-gray-700 py-1.5 pl-10 pr-3 leading-5 text-gray-300 placeholder-gray-400 focus:border-white focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-white sm:text-sm"
            placeholder="Search Events, Pathways, Designs..."
            type="search"
            autoComplete="off"
          />
        </div>

        {/* Dropdown */}
        {(showRecentSearches || showResults) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
            {/* Recent Searches */}
            {showRecentSearches && (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Recent search</span>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear History
                  </button>
                </div>
                {recentByCategory.map(({ key, items }) => (
                  <div key={key}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                      {CATEGORY_LABELS[key]}
                    </div>
                    {items.map((item, idx) => (
                      <button
                        key={`${item.route}-${idx}`}
                        onClick={() => handleRecentClick(item)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-700 truncate">{capitalizeFirst(item.name)}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </>
            )}

            {/* Search Results */}
            {showResults && (
              <>
                {isLoading && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">Searching...</div>
                )}
                {!isLoading && categories.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                )}
                {!isLoading &&
                  categories.map(({ key, items }) => (
                    <div key={key}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                        {CATEGORY_LABELS[key]}
                      </div>
                      {items.map((item) => (
                        <button
                          key={item.uuid}
                          onClick={() => handleResultClick(item)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex flex-col cursor-pointer"
                        >
                          <span className="text-sm text-gray-900 truncate">
                            {capitalizeFirst(item.name)}
                          </span>
                          {item.subtitle && (
                            <span className="text-xs text-gray-500 truncate">
                              {capitalizeFirst(item.subtitle)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
