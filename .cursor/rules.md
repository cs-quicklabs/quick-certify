# Quick Certify - AI Coding Assistant Rules

> **Applies to:** Cursor, Claude, ChatGPT, and other LLM-based coding assistants
> **Project:** Full-stack NestJS + Next.js monorepo with multi-tenancy

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [SOLID Principles](#2-solid-principles)
3. [DRY (Don't Repeat Yourself)](#3-dry-dont-repeat-yourself)
4. [CAP Theorem Considerations](#4-cap-theorem-considerations)
5. [ACID Properties](#5-acid-properties)
6. [Design Patterns](#6-design-patterns)
7. [Backend Architecture Rules](#7-backend-architecture-rules)
8. [Frontend Architecture Rules](#8-frontend-architecture-rules)
9. [Database & Migrations](#9-database--migrations)
10. [Error Handling](#10-error-handling)
11. [Security Best Practices](#11-security-best-practices)
12. [Code Style & Naming Conventions](#12-code-style--naming-conventions)

---

## 1. Project Overview

This is an Nx monorepo containing:

- **Backend**: NestJS API with Sequelize ORM, PostgreSQL, JWT authentication
- **Frontend**: Next.js 16 with TanStack Query, Zustand, Zod validation, Tailwind CSS
- **Packages**: Shared mailer and SMS modules

### Tech Stack

- **Backend**: NestJS, Sequelize, PostgreSQL, JWT, class-validator
- **Frontend**: Next.js (App Router), React 19, TanStack Query, Zustand, Zod, Tailwind CSS
- **Shared**: TypeScript, Nx workspace

---

## 2. SOLID Principles

### 2.1 Single Responsibility Principle (SRP)

**Rule**: Each class/module should have only ONE reason to change.

**Backend Examples:**

```typescript
// ✅ GOOD: AuthService orchestrates, delegates to specialized services
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly passwordService: PasswordService, // Password operations only
    private readonly tokenService: TokenService, // JWT operations only
    private readonly sessionService: SessionService, // Session management only
    private readonly emailService: EmailService, // Email notifications only
    private readonly googleOAuthService: GoogleOAuthService, // Google OAuth only
  ) {}
}

// ❌ BAD: One service doing everything
@Injectable()
export class AuthService {
  async hashPassword() {
    /* ... */
  }
  async generateToken() {
    /* ... */
  }
  async sendEmail() {
    /* ... */
  }
  async validateGoogleToken() {
    /* ... */
  }
  // Too many responsibilities!
}
```

**Frontend Examples:**

```typescript
// ✅ GOOD: Separate hooks for different concerns
export function useOrganizationSettings() {
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
}

export function useUpdateBranding() {
  return useMutation({ mutationFn: updateBranding });
}

// ❌ BAD: One hook doing everything
export function useEverything() {
  const settings = useQuery(...);
  const updateBranding = useMutation(...);
  const updateSocial = useMutation(...);
  // Too many responsibilities!
}
```

**Enforcement:**

- Services should be named after their domain: `OrganizationService`, `UserService`, `PasswordService`
- Each service file should be < 500 lines (refactor if larger)
- Use separate files for DTOs, interfaces, and utilities

### 2.2 Open/Closed Principle (OCP)

**Rule**: Classes should be open for extension but closed for modification.

**Backend Examples:**

```typescript
// ✅ GOOD: Define interface, implement in service
// interfaces/organization-service.interface.ts
export interface IOrganizationService {
  findAll(options?: FindAllOptions): Promise<PaginatedResult<OrganizationEntity>>;
  findOne(id: string): Promise<OrganizationEntity | null>;
  create(dto: CreateOrganizationDto): Promise<OrganizationEntity>;
}

// organization.service.ts - implements interface
@Injectable()
export class OrganizationService implements IOrganizationService {
  // Implementation can change without changing interface consumers
}

// ✅ GOOD: Use base class for common CRUD operations
export abstract class BaseCrudService<T, CreateDto, UpdateDto> {
  abstract readonly model: ModelStatic<T>;

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<T>> {
    // Common implementation
  }

  // Child classes can override specific methods
}
```

**Frontend Examples:**

```typescript
// ✅ GOOD: Extensible component with props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// New variants can be added without modifying existing code
```

**Enforcement:**

- Always define interfaces for services in `interfaces/` directory
- Use abstract base classes for common functionality
- Extend via composition or inheritance, not modification

### 2.3 Liskov Substitution Principle (LSP)

**Rule**: Derived classes must be substitutable for their base classes.

```typescript
// ✅ GOOD: Child class fulfills parent contract
export class SkillService extends BaseCrudService<SkillEntity, CreateSkillDto, UpdateSkillDto> {
  protected readonly model = SkillEntity;
  protected readonly entityName = 'Skill';

  // Can add new methods, but must honor base class contract
  async findByOrganization(orgId: string) {
    /* ... */
  }
}

// ❌ BAD: Child class breaks parent expectations
export class BadService extends BaseCrudService {
  async findAll() {
    throw new Error('Not supported'); // Violates LSP!
  }
}
```

**Enforcement:**

- Child classes MUST implement all abstract methods
- Child classes MUST NOT throw exceptions for base class methods
- Override methods MUST maintain same return types

### 2.4 Interface Segregation Principle (ISP)

**Rule**: No client should be forced to depend on interfaces it doesn't use.

```typescript
// ✅ GOOD: Small, focused interfaces
export interface IOrganizationService {
  findAll(options?: FindAllOptions): Promise<PaginatedResult<OrganizationEntity>>;
  findOne(id: string): Promise<OrganizationEntity | null>;
  create(dto: CreateOrganizationDto): Promise<OrganizationEntity>;
}

// Separate interface for settings operations
export interface IOrganizationSettingsService {
  updateGeneralInfo(id: string, dto: UpdateGeneralInfoDto): Promise<OrganizationEntity>;
  updateBranding(id: string, dto: UpdateBrandingDto): Promise<OrganizationEntity>;
}

// ❌ BAD: One giant interface
export interface IGodService {
  // 50+ methods that not all implementations need
}
```

**Enforcement:**

- Interfaces should have 3-7 methods maximum
- Split large interfaces into role-specific interfaces
- Use composition to combine interfaces when needed

### 2.5 Dependency Inversion Principle (DIP)

**Rule**: Depend on abstractions, not concretions.

```typescript
// ✅ GOOD: Inject interfaces, not concrete implementations
@Injectable()
export class AuthService {
  constructor(
    @Inject(ORGANIZATION_SERVICE)
    private readonly organizationService: IOrganizationService,
  ) {}
}

// ✅ GOOD: Use NestJS DI with @InjectModel
constructor(
  @InjectModel(UserEntity)
  private readonly userModel: typeof UserEntity,
) {}

// ❌ BAD: Direct instantiation
const service = new ConcreteService(); // Tight coupling!
```

**Enforcement:**

- Use NestJS dependency injection for all services
- Define service tokens for interface injection
- Never use `new` for services inside other services

---

## 3. DRY (Don't Repeat Yourself)

### 3.1 Backend DRY Rules

**Use Base Classes:**

```typescript
// ✅ GOOD: Extend BaseCrudService for common CRUD operations
@Injectable()
export class EventTypeService extends BaseCrudService<
  EventTypeEntity,
  CreateEventTypeDto,
  UpdateEventTypeDto,
  string
> {
  protected readonly model: ModelStatic<EventTypeEntity>;
  protected readonly entityName = 'EventType';
}

// ❌ BAD: Copy-paste CRUD logic in every service
```

**Use Shared DTOs:**

```typescript
// ✅ GOOD: Reuse pagination DTO
// commons/base/dtos/pagination.dto.ts
export class PaginationDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) limit?: number;
  @IsOptional() sortBy?: string;
  @IsOptional() sortOrder?: 'ASC' | 'DESC';
  @IsOptional() search?: string;
}

// Use in controllers
async findAll(@Query() pagination: PaginationDto) { }
```

**Use Utility Functions:**

```typescript
// ✅ GOOD: Centralized utilities
// commons/utils/string.util.ts
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ❌ BAD: Duplicating slug generation in multiple services
```

**Use Shared Response Classes:**

```typescript
// ✅ GOOD: Standard success response
return new SuccessResponse('Organization created successfully', organization);

// ❌ BAD: Different response formats in each endpoint
return { status: 'ok', result: organization };
return { success: true, data: organization };
```

### 3.2 Frontend DRY Rules

**Use Custom Hooks:**

```typescript
// ✅ GOOD: Reusable mutation pattern
export function useUpdateGeneralInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGeneralInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}
```

**Use Query Key Factories:**

```typescript
// ✅ GOOD: Centralized query keys
export const accountSettingsKeys = {
  all: ['accountSettings'] as const,
  settings: () => [...accountSettingsKeys.all, 'settings'] as const,
};

// ❌ BAD: Hardcoded query keys everywhere
useQuery({ queryKey: ['accountSettings', 'settings'] }); // In one file
useQuery({ queryKey: ['settings'] }); // Inconsistent in another file
```

**Use Shared Schemas:**

```typescript
// ✅ GOOD: Centralized validation schemas
// schemas/auth.schema.ts
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number');

// Reuse in multiple schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword);
```

**Use Shared Components:**

```typescript
// ✅ GOOD: Reusable UI components
<Button variant="primary" size="md">Submit</Button>
<Input label="Email" error={errors.email?.message} {...register('email')} />

// ❌ BAD: Inline styling everywhere
<button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">Submit</button>
```

---

## 4. CAP Theorem Considerations

The CAP theorem states that a distributed system can only provide two of three guarantees: **Consistency**, **Availability**, **Partition Tolerance**.

### 4.1 Our Strategy: CP (Consistency + Partition Tolerance)

For this application, we prioritize **Consistency** over Availability:

**Database Operations:**

```typescript
// ✅ GOOD: Use transactions for multi-table operations
async createOrganizationWithUser(dto: RegisterDto): Promise<void> {
  const transaction = await this.sequelize.transaction();
  try {
    const organization = await this.organizationModel.create({...}, { transaction });
    const user = await this.userModel.create({...}, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// ❌ BAD: Separate operations without transaction (risk of partial state)
const organization = await this.organizationModel.create({...});
const user = await this.userModel.create({...}); // If this fails, orphan org exists
```

**Session Management:**

```typescript
// ✅ GOOD: Single active session policy for consistency
async createSessionAndTokens(user: UserEntity): Promise<JwtTokens> {
  // Revoke ALL existing sessions first (consistency)
  await this.sessionService.revokeAllForUser(user.id);
  // Then create new session
  const session = await this.sessionService.create({...});
  return this.tokenService.generateTokens({...});
}
```

**Cache Invalidation:**

```typescript
// ✅ GOOD: Invalidate cache on mutation (prefer consistency)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
},

// ❌ BAD: Optimistic updates without proper rollback
onMutate: async (newData) => {
  queryClient.setQueryData(['settings'], newData); // May show stale data on error
},
```

### 4.2 Eventual Consistency Scenarios

For non-critical operations, eventual consistency is acceptable:

```typescript
// ✅ OK: Email sending can be eventually consistent (fire and forget)
this.emailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error); // Don't block registration on email failure

// ✅ OK: Analytics/logging can be async
this.analyticsService.trackEvent('user_registered', { userId: user.id }).catch(() => {}); // Non-critical
```

---

## 5. ACID Properties

### 5.1 Atomicity

**Rule**: All operations in a transaction succeed or all fail.

```typescript
// ✅ GOOD: Wrap related operations in transaction
async register(dto: RegisterDto): Promise<JwtTokens> {
  const transaction = await this.sequelize.transaction();

  try {
    // 1. Create organization
    const organization = await this.organizationModel.create({
      name: dto.companyName,
      slug: this.generateSlug(dto.companyName),
    }, { transaction });

    // 2. Create user
    const user = await this.userModel.create({
      email: dto.email.toLowerCase(),
      organization_id: organization.id,
    }, { transaction });

    // 3. Commit both or neither
    await transaction.commit();
    return this.createSessionAndTokens(user);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 5.2 Consistency

**Rule**: Database must move from one valid state to another.

```typescript
// ✅ GOOD: Validate constraints before operations
async create(dto: CreateOrganizationDto): Promise<OrganizationEntity> {
  // Check uniqueness constraints
  const existingSlug = await this.organizationModel.findOne({ where: { slug } });
  if (existingSlug) {
    throw new ConflictException('Organization with this slug already exists');
  }

  const existingName = await this.organizationModel.findOne({ where: { name: dto.name } });
  if (existingName) {
    throw new ConflictException('Organization with this name already exists');
  }

  // Only then create
  return this.organizationModel.create({...});
}
```

**Use Database Constraints:**

```typescript
// ✅ GOOD: Entity-level unique constraints
@Index({ name: 'IDX_USER_EMAIL', unique: true })
@Column({ type: DataType.STRING(255), allowNull: false })
declare email: string;

// ✅ GOOD: Foreign key constraints
@ForeignKey(() => OrganizationEntity)
@Column({ type: DataType.STRING(21), allowNull: false })
declare organization_id: string;
```

### 5.3 Isolation

**Rule**: Concurrent transactions should not interfere with each other.

```typescript
// ✅ GOOD: Use row-level locking for critical updates
async updateWithLock(id: string, dto: UpdateDto): Promise<Entity> {
  const transaction = await this.sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  });

  try {
    const entity = await this.model.findByPk(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });

    await entity.update(dto, { transaction });
    await transaction.commit();
    return entity;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 5.4 Durability

**Rule**: Committed transactions persist even after system failure.

```typescript
// ✅ GOOD: Use PostgreSQL (WAL ensures durability)
// Configuration in database/config/database.config.ts ensures:
// - synchronous_commit = on (default)
// - fsync = on (default)

// ✅ GOOD: Confirm critical operations completed
async resetPassword(dto: ResetPasswordDto): Promise<SuccessResponse> {
  // Update password
  await this.userModel.update(
    { password_hash: hashedPassword },
    { where: { id: passwordReset.user_id } },
  );

  // Mark token as used (AFTER password is updated)
  await passwordReset.update({ is_used: true, used_at: new Date() });

  // Invalidate all sessions (AFTER password change is confirmed)
  await this.sessionService.revokeAllForUser(passwordReset.user_id);

  return { success: true, message: 'Password reset successfully' };
}
```

---

## 6. Design Patterns

### 6.1 Repository Pattern

We use Sequelize models as repositories.

```typescript
// ✅ GOOD: Inject model, use repository-style methods
@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { email: email.toLowerCase() } });
  }
}
```

### 6.2 Service Layer Pattern

Business logic lives in services, not controllers.

```typescript
// ✅ GOOD: Controller delegates to service
@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    const organization = await this.organizationService.create(dto);
    return new SuccessResponse('Organization created successfully', organization);
  }
}

// ❌ BAD: Business logic in controller
@Controller('organizations')
export class OrganizationController {
  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-'); // Logic should be in service!
    const org = await this.orgModel.create({ ...dto, slug });
    return org;
  }
}
```

### 6.3 DTO Pattern (Data Transfer Object)

Use DTOs to validate and transform input data.

```typescript
// ✅ GOOD: Separate DTOs for create and update
// dtos/create-organization.dto.ts
export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

// dtos/update-organization.dto.ts
export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;
}
```

### 6.4 Factory Pattern

Use factories for complex object creation.

```typescript
// ✅ GOOD: TokenService as factory for JWT tokens
@Injectable()
export class TokenService {
  generateTokens(payload: TokenPayload): JwtTokens {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + this.accessTokenExpiresIn * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + this.refreshTokenExpiresIn * 1000),
    };
  }
}
```

### 6.5 Strategy Pattern

Use strategy for varying algorithms/behaviors.

```typescript
// ✅ GOOD: Different auth strategies
// Auth provider can be 'email', 'google', or 'both'
interface AuthStrategy {
  authenticate(credentials: unknown): Promise<User>;
}

class EmailAuthStrategy implements AuthStrategy {
  async authenticate(credentials: { email: string; password: string }) {}
}

class GoogleAuthStrategy implements AuthStrategy {
  async authenticate(credentials: { idToken: string }) {}
}
```

### 6.6 Decorator Pattern

Use NestJS decorators for cross-cutting concerns.

```typescript
// ✅ GOOD: Custom decorators for auth
// decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);

// Usage
@Get('profile')
async getProfile(@CurrentUser() user: CurrentUserType) { }

// ✅ GOOD: Role-based access decorator
@Get()
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
async getSettings() { }
```

### 6.7 Observer Pattern (Frontend)

Use TanStack Query for reactive data fetching.

```typescript
// ✅ GOOD: Query automatically re-fetches when cache is invalidated
export function useOrganizationSettings() {
  return useQuery({
    queryKey: accountSettingsKeys.settings(),
    queryFn: fetchOrganizationSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutations invalidate queries, triggering re-fetch
export function useUpdateBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBranding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountSettingsKeys.settings() });
    },
  });
}
```

---

## 7. Backend Architecture Rules

### 7.1 Module Structure

```
modules/
└── organization/
    ├── dtos/
    │   ├── index.ts
    │   ├── create-organization.dto.ts
    │   └── update-organization.dto.ts
    ├── interfaces/
    │   ├── index.ts
    │   └── organization-service.interface.ts
    ├── index.ts
    ├── organization.controller.ts
    ├── organization.module.ts
    └── organization.service.ts
```

### 7.2 Controller Rules

- Controllers handle HTTP concerns ONLY (routing, request/response)
- Always use DTO validation with `class-validator`
- Always return `SuccessResponse` wrapper
- Use proper HTTP status codes via decorators
- Document with Swagger decorators

```typescript
@ApiTags('Organizations')
@ApiBearerAuth()
@Controller({ path: 'organizations', version: '1' })
export class OrganizationController {
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiResponse({ status: 200, description: 'Organizations list' })
  async findAll(@Query() pagination: PaginationDto) {
    const result = await this.organizationService.findAll(pagination);
    return new SuccessResponse('Organizations retrieved successfully', result);
  }
}
```

### 7.3 Service Rules

- Services contain ALL business logic
- Services should be injectable and testable
- Use proper exception classes (`NotFoundException`, `ConflictException`, etc.)
- Document complex methods with JSDoc

```typescript
/**
 * Organization Service Implementation
 * SRP: Handles all organization-related operations
 */
@Injectable()
export class OrganizationService implements IOrganizationService {
  /**
   * Validate if a website domain is already in use
   * @throws BadRequestException if URL is invalid
   * @throws ConflictException if domain is taken
   */
  async validateWebsiteDomain(orgId: string | null, websiteUrl: string): Promise<void> {
    // Implementation
  }
}
```

### 7.4 Entity Rules

- Use `BaseNanoidEntity` for all entities (auto-generates nanoid)
- Use proper TypeScript `declare` for Sequelize columns
- Define relationships with decorators
- Use `@Index` for frequently queried fields

```typescript
@Table({ tableName: 'user' })
export class UserEntity extends BaseNanoidEntity {
  @ForeignKey(() => OrganizationEntity)
  @Column({ type: DataType.STRING(21), allowNull: false })
  declare organization_id: string;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @Index({ name: 'IDX_USER_EMAIL', unique: true })
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare email: string;
}
```

---

## 8. Frontend Architecture Rules

### 8.1 Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth layout group
│   ├── (dashboard)/       # Dashboard layout group
│   └── settings/          # Settings pages
├── components/
│   ├── ui/                # Reusable UI primitives
│   └── [feature]/         # Feature-specific components
├── hooks/                  # Custom hooks (data fetching, state)
├── services/
│   └── api/               # API client and service functions
├── schemas/               # Zod validation schemas
├── store/                 # Zustand stores
├── types/                 # TypeScript type definitions
└── config/                # App configuration
```

### 8.2 API Integration Rules

- Use `apiClient` from `services/api/api-client.ts` for ALL API calls
- Define typed API functions in `services/api/`
- Create custom hooks in `hooks/` for data fetching
- Use query key factories for cache management

```typescript
// ✅ GOOD: Typed API function
async function fetchOrganizationSettings(): Promise<OrganizationSettings> {
  const response =
    await apiClient.get<ApiResponse<OrganizationSettings>>('/organizations/settings');
  return response.data.data;
}

// ✅ GOOD: Custom hook with proper typing
export function useOrganizationSettings() {
  return useQuery({
    queryKey: accountSettingsKeys.settings(),
    queryFn: fetchOrganizationSettings,
  });
}
```

### 8.3 State Management Rules

- **Server State**: Use TanStack Query (useQuery, useMutation)
- **Client State**: Use Zustand stores
- Keep stores minimal - don't duplicate server state

```typescript
// ✅ GOOD: Auth store for client-only state
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      logout: async () => {
        /* ... */
      },
    }),
    { name: 'auth-storage' },
  ),
);

// ✅ GOOD: Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
```

### 8.4 Form Validation Rules

- Use Zod schemas for form validation
- Keep schemas in `schemas/` directory
- Export inferred types from schemas

```typescript
// ✅ GOOD: Schema with inferred type
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Min 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Usage with react-hook-form
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
});
```

### 8.5 Component Rules

- Use TypeScript interfaces for props
- Use composition over inheritance
- Keep components focused (< 200 lines)
- Extract complex logic to custom hooks

```typescript
// ✅ GOOD: Well-typed component with extracted hook
interface SettingsFormProps {
  initialData?: OrganizationSettings;
  onSuccess?: () => void;
}

export function SettingsForm({ initialData, onSuccess }: SettingsFormProps) {
  const { mutate, isPending } = useUpdateGeneralInfo();

  const handleSubmit = (data: FormData) => {
    mutate(data, { onSuccess });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 9. Database & Migrations

### 9.1 Migration Rules

- NEVER modify existing migrations
- Always create new migrations for schema changes
- Use timestamps in migration names: `YYYYMMDDHHMMSS-description.ts`
- Test migrations with `up` and `down` methods

```typescript
// ✅ GOOD: Reversible migration
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('organization', 'website', {
    type: DataTypes.STRING(500),
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('organization', 'website');
}
```

### 9.2 Query Rules

- Use Sequelize query methods, not raw SQL
- Always handle `null` returns from `findOne`
- Use proper typing for query results
- Use `include` for eager loading relationships

```typescript
// ✅ GOOD: Proper query with includes
const user = await this.userModel.findOne({
  where: { email: email.toLowerCase() },
  include: [RoleEntity, OrganizationEntity],
});

if (!user) {
  throw new UnauthorizedException('Invalid credentials');
}
```

---

## 10. Error Handling

### 10.1 Backend Error Handling

- Use NestJS built-in exceptions
- Create custom exceptions when needed
- Let global exception filter handle formatting

```typescript
// ✅ GOOD: Use appropriate exception types
if (!user) {
  throw new NotFoundException('User not found');
}

if (existingEmail) {
  throw new ConflictException('Email already registered');
}

if (!isPasswordValid) {
  throw new UnauthorizedException('Invalid email or password');
}

if (!dto.name) {
  throw new BadRequestException('Name is required');
}
```

### 10.2 Frontend Error Handling

- Use `try-catch` for async operations
- Display user-friendly error messages
- Log errors for debugging

```typescript
// ✅ GOOD: Error handling in mutations
const { mutate } = useMutation({
  mutationFn: updateSettings,
  onError: (error: AxiosError<ApiError>) => {
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);
  },
});
```

---

## 11. Security Best Practices

### 11.1 Authentication

- Use JWT with short-lived access tokens (15 min)
- Use refresh tokens with session binding
- Revoke all sessions on password change
- Validate token type (`access` vs `refresh`)

### 11.2 Authorization

- Use RolesGuard for role-based access
- Always check organization scope for multi-tenant data
- Validate user owns resource before modification

```typescript
// ✅ GOOD: Check organization ownership
async updateByOrganization(id: string, orgId: string, dto: UpdateDto) {
  const entity = await this.findOneByOrganizationOrFail(id, orgId);
  return entity.update(dto);
}
```

### 11.3 Input Validation

- Always validate with DTOs on backend
- Always validate with Zod on frontend
- Sanitize user input (trim, lowercase emails)
- Use parameterized queries (Sequelize handles this)

---

## 12. Code Style & Naming Conventions

### 12.1 File Naming

```
Backend:
- Entities: *.entity.ts (user.entity.ts)
- Services: *.service.ts (user.service.ts)
- Controllers: *.controller.ts (user.controller.ts)
- DTOs: *.dto.ts (create-user.dto.ts)
- Interfaces: *.interface.ts (user-service.interface.ts)

Frontend:
- Components: PascalCase.tsx (SettingsForm.tsx)
- Hooks: use*.ts (useSettings.ts)
- Stores: *.store.ts (auth.store.ts)
- Schemas: *.schema.ts (auth.schema.ts)
- Utils: *.util.ts or camelCase.ts (helpers.ts)
```

### 12.2 Variable Naming

```typescript
// ✅ GOOD: Descriptive names
const existingUser = await this.userModel.findOne({ where: { email } });
const isPasswordValid = await this.passwordService.compare(dto.password, user.password_hash);
const hasNextPage = safePage < totalPages;

// ❌ BAD: Abbreviated/unclear names
const u = await this.userModel.findOne({ where: { email } });
const valid = await this.passwordService.compare(dto.password, user.password_hash);
const flag = safePage < totalPages;
```

### 12.3 TypeScript Rules

- Always define types/interfaces for function params and returns
- Use `unknown` instead of `any` when type is unknown
- Use strict null checks
- Export types alongside implementations

```typescript
// ✅ GOOD: Full typing
interface CreateUserParams {
  email: string;
  password: string;
  organizationId: string;
}

async createUser(params: CreateUserParams): Promise<UserEntity> {
  // Implementation
}

// ❌ BAD: Missing types
async createUser(params: any) {
  // No return type
}
```

---

## Quick Reference Checklist

Before submitting code, verify:

- [ ] **SRP**: Does each class have a single responsibility?
- [ ] **OCP**: Can this be extended without modification?
- [ ] **LSP**: Do child classes honor parent contracts?
- [ ] **ISP**: Are interfaces small and focused?
- [ ] **DIP**: Are dependencies injected via abstractions?
- [ ] **DRY**: Is there any duplicated code that should be extracted?
- [ ] **ACID**: Are multi-table operations wrapped in transactions?
- [ ] **Validation**: Are inputs validated on both frontend and backend?
- [ ] **Error Handling**: Are errors handled gracefully with user-friendly messages?
- [ ] **Types**: Are all functions and variables properly typed?
- [ ] **Tests**: Are new features covered by tests?

---

_Last Updated: January 2026_
_Maintainer: Quick Certify Team_
