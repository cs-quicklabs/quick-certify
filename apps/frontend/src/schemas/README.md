# Zod Validation Guide

Zod is a TypeScript-first schema validation library with static type inference.

## Quick Start

### 1. Define a Schema

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

// Infer TypeScript type
type User = z.infer<typeof userSchema>;
```

### 2. Validate Data

```typescript
// Safe parse (returns success/error)
const result = userSchema.safeParse(data);
if (result.success) {
  console.log(result.data); // Typed data
} else {
  console.log(result.error); // Validation errors
}

// Parse (throws on error)
const validData = userSchema.parse(data);
```

### 3. Form Validation

```typescript
import { loginSchema } from '@/schemas/user.schema';

const handleSubmit = (formData: unknown) => {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    // Show errors
    console.log(result.error.errors);
    return;
  }
  // Submit valid data
  submitForm(result.data);
};
```

## Common Patterns

### String Validation

```typescript
z.string()
  .min(5, 'Too short')
  .max(100, 'Too long')
  .email('Invalid email')
  .url('Invalid URL')
  .regex(/^[A-Z]/, 'Must start with uppercase')
  .optional()
  .nullable()
  .default('default value');
```

### Number Validation

```typescript
z.number().min(0).max(100).int('Must be integer').positive().negative().finite();
```

### Object Validation

```typescript
z.object({
  name: z.string(),
  age: z.number(),
})
  .partial() // Make all fields optional
  .pick({ name: true }) // Only include name
  .omit({ age: true }) // Exclude age
  .extend({ email: z.string() }); // Add field
```

### Array Validation

```typescript
z.array(z.string())
  .min(1, 'At least one item required')
  .max(10, 'Too many items')
  .nonempty('Array cannot be empty');
```

### Enum Validation

```typescript
z.enum(['admin', 'user', 'guest']);
```

### Custom Refinements

```typescript
z.string().refine((val) => val.length >= 8, { message: 'Password too short' });

// With async validation
z.string().refine(
  async (email) => {
    const exists = await checkEmailExists(email);
    return !exists;
  },
  { message: 'Email already taken' },
);
```

### Cross-field Validation

```typescript
z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

## API Response Validation

```typescript
import { validateApiResponse } from '@/lib/validation';
import { userSchema } from '@/schemas/user.schema';

const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  return validateApiResponse(response, userSchema);
};
```

## Environment Variables

```typescript
// schemas/env.schema.ts
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
```

## Error Handling

```typescript
import { formatZodErrors } from '@/lib/validation';

const result = schema.safeParse(data);
if (!result.success) {
  const errors = formatZodErrors(result.error);
  // { email: 'Invalid email', password: 'Too short' }
}
```

## Best Practices

1. **Define schemas once, use everywhere** - Create reusable schemas
2. **Use type inference** - Let Zod generate TypeScript types
3. **Validate at boundaries** - API responses, form inputs, env vars
4. **Use safeParse in production** - Don't let validation errors crash your app
5. **Keep schemas close to usage** - Organize by domain (user, post, etc.)

## Examples in this project

- [user.schema.ts](./user.schema.ts) - User and auth schemas
- [api.schema.ts](./api.schema.ts) - API response schemas
- [form.schema.ts](./form.schema.ts) - Common form schemas
- [env.schema.ts](./env.schema.ts) - Environment validation
- [../lib/validation.ts](../lib/validation.ts) - Validation utilities
- [../components/FormExample.tsx](../components/FormExample.tsx) - Form validation example
