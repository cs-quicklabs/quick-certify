# Quick Certify - ChatGPT Instructions

> Use this as system prompt or initial context for ChatGPT conversations about this project.

## Project Overview

**Quick Certify** is a credential management platform:
- **Backend**: NestJS + Sequelize ORM + PostgreSQL
- **Frontend**: Next.js 16 + React 19 + TanStack Query + Zustand + Zod + Tailwind
- **Structure**: Nx monorepo with apps/backend, apps/frontend, packages/*

## Mandatory Coding Rules

When generating code for this project, ALWAYS follow these rules:

### SOLID Principles

| Principle | Rule |
|-----------|------|
| **SRP** | One service = one domain. Split services > 500 lines. Controllers only route requests. |
| **OCP** | Define interfaces in `interfaces/` folder. Use BaseCrudService for extension. |
| **LSP** | Child classes must implement ALL parent methods. No "not supported" exceptions. |
| **ISP** | Interfaces max 3-7 methods. Split large interfaces. |
| **DIP** | Always inject dependencies. Use @InjectModel. Never `new Service()`. |

### DRY (Don't Repeat Yourself)

```typescript
// ✅ GOOD: Extend base service
export class SkillService extends BaseCrudService<SkillEntity, CreateSkillDto, UpdateSkillDto> { }

// ✅ GOOD: Shared utilities
import { generateSlug } from '@src/commons/utils';

// ✅ GOOD: Query key factories
export const keys = { all: ['settings'], detail: (id: string) => [...keys.all, id] };

// ❌ BAD: Copy-paste CRUD logic
// ❌ BAD: Duplicate slug generation in multiple files
```

### ACID for Database

```typescript
// ✅ ALWAYS use transactions for multi-table operations
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

### CAP Theorem (Consistency Priority)

- Prefer consistency over availability
- Use transactions, not eventual consistency for critical data
- Invalidate cache on mutations
- Single active session policy

## Code Templates

### Backend Service Template

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IFeatureService } from './interfaces';
import { FeatureEntity } from '@src/entities';
import { CreateFeatureDto, UpdateFeatureDto } from './dtos';

@Injectable()
export class FeatureService implements IFeatureService {
  constructor(
    @InjectModel(FeatureEntity)
    private featureModel: typeof FeatureEntity,
  ) {}

  async create(dto: CreateFeatureDto): Promise<FeatureEntity> {
    // Validate uniqueness
    const existing = await this.featureModel.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Feature already exists');
    }
    return this.featureModel.create(dto);
  }

  async findOne(id: string): Promise<FeatureEntity> {
    const entity = await this.featureModel.findByPk(id);
    if (!entity) {
      throw new NotFoundException('Feature not found');
    }
    return entity;
  }
}
```

### Backend Controller Template

```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { RolesGuard } from '@src/modules/auth/guards';
import { Roles, CurrentUser } from '@src/modules/auth/decorators';

@ApiTags('Features')
@ApiBearerAuth()
@Controller({ path: 'features', version: '1' })
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create feature' })
  async create(@Body() dto: CreateFeatureDto) {
    const feature = await this.featureService.create(dto);
    return new SuccessResponse('Feature created', feature);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const feature = await this.featureService.findOne(id);
    return new SuccessResponse('Feature retrieved', feature);
  }
}
```

### Frontend Hook Template

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/services/api/api-client';

interface Feature {
  id: string;
  name: string;
}

// Query Keys
export const featureKeys = {
  all: ['features'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  detail: (id: string) => [...featureKeys.all, 'detail', id] as const,
};

// API Functions
async function fetchFeatures(): Promise<Feature[]> {
  const response = await apiClient.get<ApiResponse<Feature[]>>('/features');
  return response.data.data;
}

// Hooks
export function useFeatures() {
  return useQuery({
    queryKey: featureKeys.lists(),
    queryFn: fetchFeatures,
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeatureDto) => 
      apiClient.post<ApiResponse<Feature>>('/features', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.all });
    },
  });
}
```

### Zod Schema Template

```typescript
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long'),
  description: z.string().optional(),
});

export type CreateFeatureFormData = z.infer<typeof createFeatureSchema>;
```

## Directory Structure

```
apps/backend/src/modules/[feature]/
├── dtos/
│   ├── index.ts
│   ├── create-[feature].dto.ts
│   └── update-[feature].dto.ts
├── interfaces/
│   ├── index.ts
│   └── [feature]-service.interface.ts
├── [feature].controller.ts
├── [feature].service.ts
├── [feature].module.ts
└── index.ts
```

## Naming Rules

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `*.entity.ts` | `user.entity.ts` |
| Service | `*.service.ts` | `user.service.ts` |
| Controller | `*.controller.ts` | `user.controller.ts` |
| DTO | `create-*.dto.ts` | `create-user.dto.ts` |
| Interface | `*-service.interface.ts` | `user-service.interface.ts` |
| React Component | `PascalCase.tsx` | `UserForm.tsx` |
| Hook | `use*.ts` | `useUser.ts` |
| Schema | `*.schema.ts` | `user.schema.ts` |
| Store | `*.store.ts` | `auth.store.ts` |

## Error Handling

```typescript
// Backend Exceptions
throw new NotFoundException('Resource not found');
throw new ConflictException('Resource already exists');
throw new UnauthorizedException('Invalid credentials');
throw new BadRequestException('Invalid input');
throw new ForbiddenException('Access denied');
```

## Common Anti-Patterns to REJECT

1. ❌ Business logic in controllers
2. ❌ Services with multiple responsibilities
3. ❌ Multi-table operations without transactions
4. ❌ Using `any` instead of proper types
5. ❌ Hardcoded query keys
6. ❌ Duplicate code (should use base classes/utilities)
7. ❌ Raw SQL queries (use Sequelize methods)
8. ❌ Optimistic updates for critical data
