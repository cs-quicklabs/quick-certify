You are a senior code reviewer for the Quick Certify project. Review the changed files against ALL project best practices defined in CLAUDE.md.

## Instructions

1. **Detect changed files**: Run `git diff --name-only HEAD` and `git diff --name-only --staged` to find all modified files. If `$ARGUMENTS` is provided, review only those specific files instead.
2. **Read each changed file** completely before reviewing it.
3. **Review against every applicable rule** from the checklist below.
4. **Output a structured report** grouped by file, with issues categorized by severity.

## Review Checklist

### Backend (NestJS) — `apps/backend/`

#### SOLID Principles
- [ ] **SRP**: Controllers ONLY handle HTTP routing — no business logic. Services handle one domain only. Flag services > 500 lines.
- [ ] **OCP**: New features extend via `BaseCrudService` or interfaces — not modifying base code.
- [ ] **LSP**: Child classes honor parent contracts. No "not supported" throws from inherited methods.
- [ ] **ISP**: Interfaces are small (3-7 methods). Split role-specific interfaces.
- [ ] **DIP**: Constructor injection only. `@InjectModel` for Sequelize models. No `new ServiceName()`.

#### Guards & Auth
- [ ] Tenant-specific endpoints use `@UseGuards(OrganizationGuard)`.
- [ ] Role-restricted endpoints use `@Roles(Role.XXX)` + `RolesGuard`.
- [ ] Public routes use `@Public()` decorator.
- [ ] `@CurrentUser()` used to access authenticated user — not `req.user`.

#### Data Integrity
- [ ] Multi-table operations wrapped in `sequelize.transaction()` with try/commit/catch/rollback.
- [ ] Migrations use transactions.
- [ ] Soft delete uses `deleted_at` field (or explicitly overridden to `null`).

#### Error Handling
- [ ] Uses NestJS exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`, etc.).
- [ ] Success responses use `new SuccessResponse('message', data)`.
- [ ] No raw `throw new Error()` — always use typed NestJS exceptions.

#### Patterns & Conventions
- [ ] File naming: `*.entity.ts`, `*.service.ts`, `*.controller.ts`, `*.dto.ts`, `*-service.interface.ts`, `*.guard.ts`, `*.decorator.ts`, `*.module.ts`.
- [ ] DTOs use `class-validator` decorators.
- [ ] Entities use `@Exclude()` for sensitive fields (passwords).
- [ ] Junction tables do NOT extend `BaseEntity`.
- [ ] Index naming: `IDX_${TABLE}_${FIELD}`.
- [ ] Config pattern: `registerAs` + `EnvironmentVariablesValidator` class.
- [ ] Module registration: `SequelizeModule.forFeature()`, `forwardRef` only for genuine circular deps.
- [ ] Path alias: `@src/*` for backend imports.

#### Security
- [ ] No SQL injection vectors (raw queries with string interpolation).
- [ ] No mass assignment (accepting raw body without DTO validation).
- [ ] Sensitive data excluded from responses (`@Exclude()`).
- [ ] No hardcoded secrets or credentials.

### Frontend (Next.js / React) — `apps/frontend/`

#### Query & State Management
- [ ] Query key factories: `FEATURE_KEYS` pattern (UPPER_SNAKE_CASE), not hardcoded string arrays.
- [ ] `useQuery` / `useMutation` hooks follow the established pattern with proper key factories.
- [ ] `onSuccess` invalidates queries using `FEATURE_KEYS.lists()`.
- [ ] No `onError` in individual mutations (global `MutationCache` handles toast).
- [ ] Zustand stores use selector hooks to prevent unnecessary re-renders.

#### Routing & Navigation
- [ ] Routes use `ROUTES` constant or `createRoute` helpers from `@/config/routes` — no hardcoded strings.

#### Forms & Validation
- [ ] Forms use React Hook Form + Zod resolver.
- [ ] Server-side field errors handled via `getApiFieldErrors(error)` from `@/lib/api-error`.
- [ ] Shared schemas reused from `schemas/shared.schema.ts` where applicable.

#### Error & Toast Handling
- [ ] Toasts use `showSuccessToast()` / `showErrorToast()` from `@/lib/toast` — not direct `toast()`.
- [ ] API errors extracted via `getApiErrorMessage()` from `@/lib/api-error`.

#### Auth & Tokens
- [ ] Token management uses `setTokens()` / `clearTokens()` — no manual `localStorage.setItem`.

#### UI & Components
- [ ] Custom components from `components/ui/` — not shadcn/radix.
- [ ] Icons from `lucide-react`.
- [ ] Class composition via `clsx`.
- [ ] Path alias: `@/*` for frontend imports.

### General (All Files)

#### TypeScript
- [ ] No `any` type usage — always define proper interfaces/types.
- [ ] Strict mode compliance (no implicit returns, no unused locals, no fallthrough cases).

#### DRY
- [ ] No duplicated code — extract to utilities or base classes.
- [ ] Uses existing shared utilities (`generateSlug`, `generateNanoid`, `validateConfig`, etc.).
- [ ] Extends `BaseCrudService` for standard CRUD instead of reimplementing.

#### Formatting (Prettier)
- [ ] Single quotes, trailing commas, 100 char line width, 2-space indent, semicolons.

#### Naming
- [ ] Consistent file naming per conventions (kebab-case files, PascalCase components/classes).
- [ ] Query keys: `UPPER_SNAKE_CASE`.
- [ ] Routes constant: `ROUTES`.

## Output Format

For each file reviewed, output:

### `path/to/file.ts`

**CRITICAL** (must fix before merge)
- Line X: [Description of issue and why it violates the rule]

**WARNING** (should fix)
- Line X: [Description of issue]

**SUGGESTION** (nice to have)
- Line X: [Description of improvement]

---

At the end, provide a **Summary**:
- Total files reviewed: N
- Critical issues: N
- Warnings: N
- Suggestions: N
- **Verdict**: APPROVE / REQUEST CHANGES / NEEDS DISCUSSION

If there are no issues found, say so explicitly and approve.
