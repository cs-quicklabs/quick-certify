import { useState, useCallback } from 'react';

type FilterState = Record<string, string[]>;

interface UseMultiSelectFiltersReturn {
  selected: FilterState;
  toggle: (key: string, id: string) => void;
  clear: (key?: string) => void;
  hasActive: boolean;
}

export function useMultiSelectFilters(keys: string[]): UseMultiSelectFiltersReturn {
  const [selected, setSelected] = useState<FilterState>(() =>
    Object.fromEntries(keys.map((k) => [k, []])),
  );

  const toggle = useCallback((key: string, id: string) => {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key]?.includes(id) ? prev[key].filter((v) => v !== id) : [...(prev[key] ?? []), id],
    }));
  }, []);

  const clear = useCallback(
    (key?: string) => {
      if (key) {
        setSelected((prev) => ({ ...prev, [key]: [] }));
      } else {
        setSelected(Object.fromEntries(keys.map((k) => [k, []])));
      }
    },
    [keys],
  );

  const hasActive = keys.some((k) => (selected[k]?.length ?? 0) > 0);

  return { selected, toggle, clear, hasActive };
}
