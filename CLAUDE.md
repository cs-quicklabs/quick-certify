# Quick Certify - Claude AI Instructions

> Copy this context when starting a Claude conversation about this project.

## Project Context

This is **Quick Certify** - a full-stack credential management platform built with:

- **Backend**: NestJS 11 + Sequelize + PostgreSQL (URI-versioned API: `/api/v1/...`)
- **Frontend**: Next.js 16 (App Router) + React 19 + TailwindCSS 4.1 + TanStack Query 5 + Zustand 5 + Zod 4.2
- **Monorepo**: Nx 22.4 workspace with `apps/backend`, `apps/frontend`, `packages/*`
- **Language**: TypeScript 5.9 (strict, no `any`)
- **Packages**: `@crownstack/mailer` (Nodemailer), `@crownstack/sms` (Twilio, disabled)

## Core Principles - ALWAYS Apply

### 1. SOLID Principles

**SRP** - One service = one domain. Controllers ONLY handle HTTP routing. Services > 500 lines should be split.

**OCP** - Define interfaces in `interfaces/` folder. Extend via `BaseCrudService`, don't modify base code.

**LSP** - Child classes must honor parent contracts. Never throw "not supported" from inherited methods.

**ISP** - Keep interfaces small (3-7 methods). Split into role-specific interfaces.

**DIP** - Always use constructor injection. Use `@InjectModel` for Sequelize models. Never instantiate services with `new`.

### 2. DRY (Don't Repeat Yourself)

```typescript
// ✅ Extend BaseCrudService for CRUD
export class SkillService extends BaseCrudService<SkillEntity, CreateSkillDto, UpdateSkillDto> {}

// ✅ Use shared utilities
import { generateSlug, generateNanoid } from '@src/commons/utils';

// ✅ Use query key factories
export const CREDENTIAL_KEYS = { all: ['credentials'] as const, lists: () => [...CREDENTIAL_KEYS.all, 'list'] as const };
```

### 3. ACID Properties

```typescript
// ✅ Transactions for multi-table operations (also used in migrations)
const transaction = await this.sequelize.transaction();
try {
  await this.orgModel.create({...}, { transaction });
  await this.userModel.create({...}, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### 4. CAP Theorem (We prefer Consistency)

- Use transactions for data integrity
- Single active session per user
- Invalidate cache on mutations
- Only fire-and-forget for non-critical ops (emails)

## Authentication & Guards

### Decorators

- `@Public()` - Bypass JWT auth for public routes (login, signup)
- `@Disabled()` - Mark routes as disabled, throws `ForbiddenException`
- `@CurrentUser()` - Inject authenticated user: `@CurrentUser() user` or `@CurrentUser('email') email`
- `@Roles(Role.ADMIN)` - Restrict to specific roles

### Guards

- `JwtAuthGuard` - **Global** (APP_GUARD). Validates token, session, user status. Attaches `CurrentUser` to request.
- `RolesGuard` - Validates user role matches `@Roles()` decorator
- `OrganizationGuard` - Multi-tenant isolation. Ensures `user.organizationId === params.organizationId`. System admins bypass.

### Roles

```typescript
enum Role { SYSTEM_ADMIN = 'system_admin', SUPER_ADMIN = 'super_admin', ADMIN = 'admin', MANAGER = 'manager', DESIGNER = 'designer' }
```

### CurrentUser Interface

```typescript
interface CurrentUser {
  id: number; uuid: string; email: string; firstName: string; lastName: string;
  organizationId: number; organizationUuid: string; roleId: number; roleUuid: string;
  role: string; sessionHash: string;
}
```

## Code Patterns

### Backend Service

```typescript
@Injectable()
export class OrganizationService implements IOrganizationService {
  constructor(
    @InjectModel(OrganizationEntity)
    private organizationModel: typeof OrganizationEntity,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<OrganizationEntity> {
    const existing = await this.organizationModel.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException('Organization already exists');
    return this.organizationModel.create(dto);
  }
}
```

### Backend Controller

```typescript
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async create(@Body() dto: CreateOrganizationDto) {
    return new SuccessResponse('Organization created', await this.organizationService.create(dto));
  }
}
```

### Multi-Tenant Service Methods (from BaseCrudService)

```typescript
// These methods auto-filter by organization
await this.findAllByOrganization(organizationId, options);
await this.findOneByOrganization(id, organizationId);
await this.findOneByOrganizationOrFail(id, organizationId);
```

### Soft Delete

```typescript
// Default: uses deleted_at column
protected override readonly softDeleteField: string | null = 'deleted_at';
// Override to disable (e.g., UserService uses status field instead)
protected override readonly softDeleteField: string | null = null;
```

### Paginated Response Shape

```typescript
{ success: true, message: "Items retrieved",
  data: { data: [...], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } } }
```

### Backend Config Pattern

```typescript
// apps/backend/src/config/auth.config.ts
class EnvironmentVariablesValidator {
  @IsString() @IsNotEmpty() JWT_SECRET = '';
  @IsNumber() @IsOptional() BCRYPT_SALT_ROUNDS?: number;
}
export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return { jwtSecret: process.env.JWT_SECRET, /* ... */ };
});
```

### Entity Patterns

```typescript
// BaseEntity: auto-generates nanoid UUID via @BeforeValidate hook
// Use @Exclude() from class-transformer for sensitive fields (password)
// Virtual columns: @Column({ type: DataType.VIRTUAL }) get full_name() { return ...; }
// Junction tables (e.g., EventSkillEntity) do NOT extend BaseEntity
// Index naming: IDX_${TABLE}_${FIELD}
```

### Module Registration

```typescript
@Module({
  imports: [
    SequelizeModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule), // Use forwardRef for circular dependencies
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export for cross-module injection
})
export class UserModule {}
```

### Migration Pattern

```typescript
// apps/backend/src/database/migrations/YYYYMMDDHHMMSS-description.ts
module.exports = {
  async up(queryInterface: QueryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    try { /* operations */ await transaction.commit(); }
    catch (error) { await transaction.rollback(); throw error; }
  },
  async down(queryInterface: QueryInterface) { /* rollback */ }
};
```

## Frontend Patterns

### UI Components

- Custom components in `components/ui/` (NOT shadcn/radix)
- Icons: `lucide-react`
- Class composition: `clsx`
- Button variants: `primary | secondary | outline | ghost | danger`, sizes: `sm | md | lg`

### Frontend Hook Pattern (Query Key Factory)

```typescript
export const CREDENTIAL_KEYS = {
  all: ['credentials'] as const,
  lists: () => [...CREDENTIAL_KEYS.all, 'list'] as const,
  list: (filters?: Filters) => [...CREDENTIAL_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CREDENTIAL_KEYS.all, 'detail', id] as const,
};

export function useCredentials(filters?: Filters) {
  return useQuery({ queryKey: CREDENTIAL_KEYS.list(filters), queryFn: () => credentialService.getCredentials(filters) });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCredentialRequest) => credentialService.createCredential(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: CREDENTIAL_KEYS.lists() }); },
  });
}
```

Global `MutationCache` auto-shows toast on mutation errors - no need for `onError` in individual mutations.

### Forms: React Hook Form + Zod

```typescript
const formMethods = useForm<LoginFormInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
// Server-side field errors: use getApiFieldErrors(error) from lib/api-error.ts
// Shared schemas in schemas/shared.schema.ts: passwordSchema, emailSchema, requiredFirstNameSchema
```

### API Client (Axios with Interceptors)

- **Request interceptor**: Auto-injects `Bearer` token from localStorage
- **Response interceptor**: Auto-refreshes on 401 (uses `_retry` flag to prevent loops)
- Token storage: `setTokens()` / `clearTokens()` in localStorage + cookie
- Location: `apps/frontend/src/services/api/api-client.ts`

### Zustand Store

```typescript
// Persist middleware: only persists `user` via partialize
// Selector hooks to prevent re-renders:
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
```

### Routes Configuration

```typescript
// apps/frontend/src/config/routes.ts - ALWAYS use these, never hardcode route strings
import { ROUTES, createRoute } from '@/config/routes';
router.push(ROUTES.AUTH.LOGIN);
router.push(createRoute.eventDetail('123'));
```

### Toast & Error Utilities

```typescript
import { showSuccessToast, showErrorToast } from '@/lib/toast';           // Toast notifications
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/api-error';  // Error extraction
```

### Zod Schema

```typescript
export const createOrgSchema = z.object({
  name: z.string().min(1, 'Required').max(150),
  slug: z.string().optional(),
});
export type CreateOrgFormData = z.infer<typeof createOrgSchema>;
```

## File Structure

```
apps/backend/src/
├── modules/[feature]/
│   ├── dtos/create-[feature].dto.ts
│   ├── interfaces/[feature]-service.interface.ts
│   ├── [feature].controller.ts
│   ├── [feature].service.ts
│   └── [feature].module.ts
├── entities/[feature].entity.ts
├── commons/
│   ├── base/base-crud.service.ts
│   ├── constants/                  # Enums (EnvironmentEnum, AuthProvider)
│   ├── dtos/                       # SuccessResponse, ErrorResponse
│   ├── filters/                    # ExceptionResponseFilter (global)
│   ├── services/                   # EmailService
│   ├── utils/                      # generateNanoid, generateSlug, validateConfig
│   └── validators/                 # Custom validators (@IsLinkedInUrl, etc.)
├── config/                         # auth, database, mailer, sms, storage configs
├── database/migrations/            # Sequelize migrations (always use transactions)
└── templates/                      # Handlebars email templates

apps/frontend/src/
├── app/                            # Next.js App Router pages
│   ├── (auth)/                     # Public auth routes (login, signup, etc.)
│   ├── (dashboard)/                # Protected dashboard routes
│   ├── settings/                   # Nested settings pages
│   └── public/                     # Publicly shareable pages
├── components/
│   ├── ui/                         # Custom UI primitives (button, input, table, etc.)
│   ├── auth/, credentials/, designs/, events/, forms/, layout/
│   └── ErrorBoundary.tsx
├── hooks/                          # TanStack Query hooks (useCredentials, useEvents, etc.)
├── services/api/                   # Axios client + domain services
├── schemas/                        # Zod validation schemas
├── store/                          # Zustand stores (auth.store.ts)
├── config/                         # routes.ts, env.ts, apiClient.ts
├── lib/                            # api-error.ts, toast.ts, validation.ts, query-client.ts
├── types/                          # TypeScript type definitions
└── utils/                          # helpers.ts (getInitials, capitalizeFirst, role checks)
```

## Error Handling

```typescript
// Backend - Use NestJS exceptions
throw new NotFoundException('User not found');
throw new ConflictException('Email exists');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Invalid input');

// Backend - SuccessResponse & ErrorResponse implement ResponseInterface
return new SuccessResponse('Created', data);  // { success: true, message, data }
// Errors auto-converted by ExceptionResponseFilter: { success: false, message, error, errorCode }
```

## Naming Conventions

- Entities: `user.entity.ts`
- Services: `user.service.ts`
- Controllers: `user.controller.ts`
- DTOs: `create-user.dto.ts`
- Interfaces: `user-service.interface.ts`
- Guards: `organization.guard.ts`
- Decorators: `public.decorator.ts`
- Migrations: `YYYYMMDDHHMMSS-description.ts`
- Hooks: `useSettings.ts`
- Schemas: `auth.schema.ts`
- Stores: `auth.store.ts`
- Query Keys: `CREDENTIAL_KEYS` (UPPER_SNAKE_CASE)
- Routes: `ROUTES` constant + `createRoute` helpers

## What to AVOID

1. Business logic in controllers
2. God services with multiple responsibilities
3. Operations without transactions when modifying multiple tables
4. Using `any` type - always define interfaces
5. Hardcoded query keys - use key factories (`FEATURE_KEYS`)
6. Duplicating code - extract to utilities/base classes
7. Hardcoded route strings - use `ROUTES` constant from `config/routes.ts`
8. Manual token management - use `setTokens()` / `clearTokens()`
9. Direct `toast()` calls - use `showSuccessToast()` / `showErrorToast()`
10. Skipping `OrganizationGuard` on tenant-specific endpoints
11. Junction tables extending `BaseEntity` - keep them minimal
12. Using `forwardRef` unless there's a genuine circular dependency
