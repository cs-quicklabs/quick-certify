# Quick Certify - Claude AI Instructions

> Copy this context when starting a Claude conversation about this project.

## Project Context

This is **Quick Certify** - a full-stack credential management platform built with:

- **Backend**: NestJS + Sequelize + PostgreSQL
- **Frontend**: Next.js 16 (App Router) + React 19 + TanStack Query + Zustand + Zod
- **Monorepo**: Nx workspace with `apps/backend`, `apps/frontend`, `packages/*`

## Core Principles - ALWAYS Apply

### 1. SOLID Principles

**SRP (Single Responsibility)**

- One service = one domain (AuthService handles auth, not emails)
- Services > 500 lines should be split
- Controllers ONLY handle HTTP routing

**OCP (Open/Closed)**

- Define interfaces for all services in `interfaces/` folder
- Extend via `BaseCrudService`, don't modify base code

**LSP (Liskov Substitution)**

- Child classes must honor parent contracts
- Never throw "not supported" from inherited methods

**ISP (Interface Segregation)**

- Keep interfaces small (3-7 methods)
- Split into role-specific interfaces

**DIP (Dependency Inversion)**

- Always use constructor injection
- Use `@InjectModel` for Sequelize models
- Never instantiate services with `new`

### 2. DRY (Don't Repeat Yourself)

```typescript
// ✅ Extend BaseCrudService for CRUD
export class SkillService extends BaseCrudService<SkillEntity, CreateSkillDto, UpdateSkillDto> {}

// ✅ Use shared utilities
import { generateSlug } from '@src/commons/utils';

// ✅ Use query key factories
export const settingsKeys = { all: ['settings'] as const };
```

### 3. ACID Properties

```typescript
// ✅ Transactions for multi-table operations
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
    if (existing) {
      throw new ConflictException('Organization already exists');
    }
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
    const org = await this.organizationService.create(dto);
    return new SuccessResponse('Organization created', org);
  }
}
```

### Frontend Hook

```typescript
export function useOrganizationSettings() {
  return useQuery({
    queryKey: accountSettingsKeys.settings(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Settings>>('/organizations/settings');
      return response.data.data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}
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
└── commons/base/base-crud.service.ts

apps/frontend/src/
├── app/                 # Next.js pages
├── components/ui/       # Reusable components
├── hooks/              # Custom hooks (data fetching)
├── services/api/       # API client
├── schemas/            # Zod schemas
└── store/              # Zustand stores
```

## Error Handling

```typescript
// Backend - Use NestJS exceptions
throw new NotFoundException('User not found');
throw new ConflictException('Email exists');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Invalid input');
```

## Naming Conventions

- Entities: `user.entity.ts`
- Services: `user.service.ts`
- Controllers: `user.controller.ts`
- DTOs: `create-user.dto.ts`
- Hooks: `useSettings.ts`
- Schemas: `auth.schema.ts`
- Stores: `auth.store.ts`

## What to AVOID

1. ❌ Business logic in controllers
2. ❌ God services with multiple responsibilities
3. ❌ Operations without transactions when modifying multiple tables
4. ❌ Using `any` type - always define interfaces
5. ❌ Hardcoded query keys - use factories
6. ❌ Duplicating code - extract to utilities/base classes
