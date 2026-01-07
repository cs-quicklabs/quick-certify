/**
 * Zustand Store Examples
 *
 * This file contains example patterns for using Zustand.
 * Copy and modify these patterns for your own state management needs.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Example 1: Simple Counter Store
interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }),
    { name: 'CounterStore' },
  ),
);

// Example 2: User Store with Async Actions
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  fetchUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, error: null }),
      clearUser: () => set({ user: null, error: null }),
      fetchUser: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (!response.ok) throw new Error('Failed to fetch user');
          const user = await response.json();
          set({ user, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
    }),
    { name: 'UserStore' },
  ),
);

// Example 3: Store with Persistence (saves to localStorage)
interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'light',
        language: 'en',
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
      }),
      {
        name: 'settings-storage', // localStorage key
      },
    ),
    { name: 'SettingsStore' },
  ),
);

// Example 4: Computed Values (Selectors)
interface TodoState {
  todos: Array<{ id: string; text: string; completed: boolean }>;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>()(
  devtools(
    (set) => ({
      todos: [],
      addTodo: (text) =>
        set((state) => ({
          todos: [...state.todos, { id: Date.now().toString(), text, completed: false }],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        })),
      removeTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
    }),
    { name: 'TodoStore' },
  ),
);

// Selectors for computed values
export const selectCompletedTodos = (state: TodoState) =>
  state.todos.filter((todo) => todo.completed);

export const selectActiveTodos = (state: TodoState) =>
  state.todos.filter((todo) => !todo.completed);
