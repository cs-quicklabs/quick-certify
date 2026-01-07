/**
 * Zustand Usage Examples
 *
 * This component demonstrates how to use Zustand stores in your components.
 * These are just examples - delete or modify as needed.
 */

'use client';

import {
  useCounterStore,
  useSettingsStore,
  useTodoStore,
  selectCompletedTodos,
  selectActiveTodos,
} from '../store/example.store';

export function ZustandExample() {
  // Example 1: Using the counter store
  const { count, increment, decrement, reset } = useCounterStore();

  // Example 2: Using the settings store (persisted)
  const { theme, setTheme } = useSettingsStore();

  // Example 4: Using selectors for computed values
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const completedTodos = useTodoStore(selectCompletedTodos);
  const activeTodos = useTodoStore(selectActiveTodos);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Zustand Examples</h2>

      {/* Counter Example */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Counter Store</h3>
        <p>Count: {count}</p>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement} style={{ marginLeft: '10px' }}>
          Decrement
        </button>
        <button onClick={reset} style={{ marginLeft: '10px' }}>
          Reset
        </button>
      </section>

      {/* Settings Example */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Settings Store (Persisted)</h3>
        <p>Current theme: {theme}</p>
        <button onClick={() => setTheme('light')}>Light</button>
        <button onClick={() => setTheme('dark')} style={{ marginLeft: '10px' }}>
          Dark
        </button>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Theme is saved to localStorage and persists across page refreshes
        </p>
      </section>

      {/* Todo Example */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd' }}>
        <h3>Todo Store with Selectors</h3>
        <button
          onClick={() => {
            const text = prompt('Enter todo text:');
            if (text) addTodo(text);
          }}
        >
          Add Todo
        </button>
        <div>
          <p>
            Total: {todos.length} | Active: {activeTodos.length} | Completed:{' '}
            {completedTodos.length}
          </p>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                  {todo.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
