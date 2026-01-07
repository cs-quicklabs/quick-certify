# Zustand Store Guide

This directory contains Zustand stores for global state management.

## Quick Start

### 1. Create a Store

```typescript
// src/store/myStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyState {
  data: string;
  setData: (data: string) => void;
}

export const useMyStore = create<MyState>()(
  devtools(
    (set) => ({
      data: '',
      setData: (data) => set({ data }),
    }),
    { name: 'MyStore' },
  ),
);
```

### 2. Use in a Component

```tsx
'use client';

import { useMyStore } from '@/store/myStore';

export function MyComponent() {
  const { data, setData } = useMyStore();

  return (
    <div>
      <p>{data}</p>
      <button onClick={() => setData('Hello')}>Set Data</button>
    </div>
  );
}
```

## Features

### DevTools Integration

The `devtools` middleware enables Redux DevTools support for debugging:

- Time-travel debugging
- State inspection
- Action tracking

### Persistence

Use the `persist` middleware to save state to localStorage:

```typescript
import { persist } from 'zustand/middleware';

export const useStore = create()(
  devtools(
    persist(
      (set) => ({
        /* ... */
      }),
      { name: 'my-storage-key' },
    ),
    { name: 'MyStore' },
  ),
);
```

### Selectors

Optimize re-renders by selecting only the state you need:

```typescript
// Select specific fields
const data = useMyStore((state) => state.data);

// Use computed selectors
const selectExpensiveComputation = (state: MyState) => {
  return state.items.filter(/* ... */);
};

const filteredItems = useMyStore(selectExpensiveComputation);
```

### Async Actions

Handle async operations directly in your store:

```typescript
fetchData: async () => {
  set({ isLoading: true });
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    set({ data, isLoading: false });
  } catch (error) {
    set({ error, isLoading: false });
  }
};
```

## Best Practices

1. **Keep stores focused** - Create separate stores for different domains
2. **Use TypeScript** - Define interfaces for type safety
3. **Use selectors** - Prevent unnecessary re-renders
4. **Enable devtools** - Easier debugging during development
5. **Atomic updates** - Update multiple state fields in a single `set` call

## Examples

See `example.store.ts` for complete examples of:

- Simple counter store
- Async data fetching
- Persisted settings
- Computed values with selectors
