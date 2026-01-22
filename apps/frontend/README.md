# Frontend - Next.js Boilerplate

A modern Next.js frontend application with TypeScript, Tailwind CSS, TanStack Query, Zustand, and Zod validation.

## 🚀 Features

- ⚡ **Next.js 16** with App Router
- 🎨 **Tailwind CSS** for utility-first styling
- 📦 **SCSS** support for custom styles
- 🔄 **TanStack Query** for server state management
- 🗃️ **Zustand** for client state management
- ✅ **Zod** for schema validation
- 🧪 **Jest** for unit testing
- 📱 **Responsive** design ready
- 🔍 **TypeScript** for type safety
- 🎯 **ESLint** for code quality

---

## 📁 Project Structure

```
apps/frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── providers.tsx      # Global providers
│   │   └── global.css         # Global styles
│   ├── components/            # React components
│   │   ├── FormExample.tsx
│   │   ├── TailwindExample.tsx
│   │   └── ZustandExample.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── queries.example.ts # TanStack Query examples
│   ├── lib/                   # Utility libraries
│   │   └── validation.ts     # Validation utilities
│   ├── schemas/               # Zod schemas
│   │   ├── api.schema.ts
│   │   ├── env.schema.ts
│   │   ├── form.schema.ts
│   │   └── user.schema.ts
│   └── store/                 # Zustand stores
│       └── example.store.ts
├── public/                    # Static assets
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── package.json
```

---

## 🛠️ Setup

### 1. Prerequisites

- Node.js 18+
- npm or yarn

### 2. Environment Configuration

Create `.env.local` file in `apps/frontend/`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: Other environment variables
# NEXT_PUBLIC_APP_NAME=My App
```

### 3. Install Dependencies

From the workspace root:

```bash
npm install
```

### 4. Run the Application

```bash
# Development mode
npx nx dev frontend

# Production build
npx nx build frontend
npx nx start frontend
```

### 5. Access the Application

- **Frontend**: `http://localhost:3000`

---

## 🎨 Styling

### Tailwind CSS

This project uses Tailwind CSS for styling. See [TAILWIND.md](./TAILWIND.md) for detailed documentation.

**Quick Example:**

```tsx
export function Button() {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Click Me</button>
  );
}
```

### SCSS Support

You can also use SCSS files for component-specific styles:

```tsx
import styles from './MyComponent.module.scss';

export function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

---

## 🔄 State Management

### TanStack Query (Server State)

For API calls and server state:

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return <div>{data.name}</div>;
}
```

See [hooks/queries.example.ts](./src/hooks/queries.example.ts) for more examples.

### Zustand (Client State)

For client-side state management:

```tsx
import { useStore } from '@/store/example.store';

function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

See [store/example.store.ts](./src/store/example.store.ts) for store examples.

---

## ✅ Validation with Zod

Zod schemas are available in the `schemas/` directory:

```tsx
import { z } from 'zod';
import { userSchema } from '@/schemas/user.schema';

// Validate form data
const result = userSchema.safeParse(formData);

if (result.success) {
  // Data is valid
  console.log(result.data);
} else {
  // Handle validation errors
  console.error(result.error.errors);
}
```

See [schemas/README.md](./src/schemas/README.md) for schema documentation.

---

## 📦 Components

### Creating a Component

```tsx
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string;
  children: React.ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {children}
    </div>
  );
}
```

### Using Components

```tsx
import { MyComponent } from '@/components/MyComponent';

export default function Page() {
  return (
    <MyComponent title="Hello">
      <p>Content here</p>
    </MyComponent>
  );
}
```

---

## 🔌 API Integration

### API Client Setup

Create an API client utility:

```tsx
// src/lib/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Using with TanStack Query

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Query
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiClient.get('/users'),
});

// Mutation
const mutation = useMutation({
  mutationFn: (userData) => apiClient.post('/users', userData),
  onSuccess: () => {
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run tests
npx nx test frontend

# Watch mode
npx nx test frontend --watch
```

### Example Test

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test">Content</MyComponent>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## 🎯 TypeScript

This project uses TypeScript for type safety. Key practices:

- Define interfaces for props and data structures
- Use type inference where possible
- Leverage Zod schemas for runtime validation
- Use TypeScript strict mode

### Example

```tsx
interface User {
  id: string;
  name: string;
  email: string;
}

function UserCard({ user }: { user: User }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

---

## 📱 Responsive Design

Tailwind CSS makes responsive design easy:

```tsx
<div
  className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
"
>
  {/* Responsive grid */}
</div>
```

Breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🚀 Deployment

### Build for Production

```bash
npx nx build frontend
```

### Environment Variables

Set production environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.example.com/api
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Deploy to Other Platforms

Next.js can be deployed to:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker
- Any Node.js hosting

---

## 🔧 Available Commands

```bash
# Development
npx nx dev frontend              # Start dev server

# Build
npx nx build frontend            # Production build

# Testing
npx nx test frontend             # Run tests
npx nx test frontend --watch     # Watch mode

# Linting
npx nx lint frontend             # Run ESLint

# Type checking
npx nx typecheck frontend        # TypeScript check
```

---

## 📚 Documentation

| Topic        | Location                                         |
| ------------ | ------------------------------------------------ |
| Tailwind CSS | [TAILWIND.md](./TAILWIND.md)                     |
| Schemas      | [src/schemas/README.md](./src/schemas/README.md) |
| Store        | [src/store/README.md](./src/store/README.md)     |

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [SCSS](https://sass-lang.com/) - CSS preprocessor
- [TanStack Query](https://tanstack.com/query) - Server state
- [Zustand](https://zustand-demo.pmnd.rs/) - Client state
- [Zod](https://zod.dev/) - Schema validation
- [Axios](https://axios-http.com/) - HTTP client
- [Jest](https://jestjs.io/) - Testing framework

---

## 📝 Best Practices

1. **Component Organization**: Keep components small and focused
2. **State Management**: Use TanStack Query for server state, Zustand for client state
3. **Styling**: Prefer Tailwind classes, use SCSS for complex styles
4. **Validation**: Use Zod schemas for form and API validation
5. **Type Safety**: Define interfaces for all data structures
6. **Error Handling**: Handle errors gracefully with error boundaries
7. **Performance**: Use Next.js Image component, lazy loading, and code splitting

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zod Documentation](https://zod.dev/)

---

## 📄 License

MIT
