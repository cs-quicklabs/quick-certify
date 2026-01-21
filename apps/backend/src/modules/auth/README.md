# Auth Module

Complete authentication and authorization system with JWT tokens, session management, and role-based access control.

## 🔐 Features

- JWT-based authentication (access + refresh tokens)
- Sessions stored in database (revocable)
- Email verification (link + 6-digit code)
- Password reset flow
- Role-based access control (RBAC)
- Multi-tenant organization guard

## 📁 Structure

```
auth/
├── decorators/
│   ├── current-user.decorator.ts  # Get current user from request
│   ├── public.decorator.ts        # Mark routes as public
│   └── roles.decorator.ts         # Specify required roles
├── dtos/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   ├── verify-email.dto.ts
│   └── change-password.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts          # Validates JWT tokens
│   ├── roles.guard.ts             # Role-based access
│   └── organization.guard.ts      # Multi-tenant guard
├── interfaces/
│   └── jwt-payload.interface.ts   # Token & user interfaces
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

## 🔑 Token Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Client    │       │   Server    │       │  Database   │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │
       │  POST /login        │                     │
       │────────────────────>│                     │
       │                     │  Create Session     │
       │                     │────────────────────>│
       │                     │                     │
       │  { accessToken,     │                     │
       │    refreshToken }   │                     │
       │<────────────────────│                     │
       │                     │                     │
       │  GET /api (Bearer)  │                     │
       │────────────────────>│                     │
       │                     │  Validate Session   │
       │                     │────────────────────>│
       │                     │<────────────────────│
       │        200 OK       │                     │
       │<────────────────────│                     │
       │                     │                     │
       │  Token Expired!     │                     │
       │                     │                     │
       │  POST /refresh      │                     │
       │────────────────────>│                     │
       │                     │  Update Session     │
       │                     │────────────────────>│
       │  { newAccessToken,  │                     │
       │    newRefreshToken }│                     │
       │<────────────────────│                     │
```

## 🛡️ Guards

### JwtAuthGuard (Global)

Validates JWT access tokens on all routes by default.

```typescript
// This route is protected (default)
@Get('protected')
async protectedRoute() { }

// This route is public
@Public()
@Get('public')
async publicRoute() { }
```

### RolesGuard

Restricts access based on user roles.

```typescript
@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Get('admin-only')
async adminRoute() { }
```

### OrganizationGuard

Ensures users can only access their organization's data.

```typescript
@UseGuards(OrganizationGuard)
@Get('organizations/:organizationId/data')
async getOrgData(@Param('organizationId') orgId: number) {
  // Guard checks if user belongs to this organization
}
```

## 🎨 Decorators

### @Public()

Marks a route as publicly accessible (skips authentication).

```typescript
@Public()
@Post('login')
async login() { }
```

### @Roles(...roles)

Specifies which user type codes can access the route.

```typescript
@Roles('ADMIN', 'SUPER_ADMIN')
@Get('users')
async getUsers() { }
```

### @CurrentUser()

Extracts the current user from the request.

```typescript
@Get('profile')
async getProfile(@CurrentUser() user: CurrentUser) {
  return user;
}

// Get specific property
@Get('my-org')
async getMyOrg(@CurrentUser('organizationId') orgId: number) {
  return orgId;
}
```

## 📝 CurrentUser Interface

```typescript
interface CurrentUser {
  id: number; // User ID
  uuid: string; // User UUID
  email: string; // User email
  firstName: string; // First name
  lastName: string; // Last name
  organizationId: number; // Organization ID
  userTypeId: number; // User type ID
  userTypeCode: string; // User type code (e.g., 'ADMIN')
  sessionId: number; // Current session ID
}
```

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| POST   | `/auth/register`        | Register new user         |
| POST   | `/auth/login`           | Login and get tokens      |
| POST   | `/auth/refresh-token`   | Refresh access token      |
| POST   | `/auth/forgot-password` | Request password reset    |
| POST   | `/auth/reset-password`  | Reset password with token |
| POST   | `/auth/verify-email`    | Verify email with token   |

### Protected Endpoints

| Method | Endpoint                    | Description               |
| ------ | --------------------------- | ------------------------- |
| POST   | `/auth/logout`              | Logout current session    |
| POST   | `/auth/logout-all`          | Logout all sessions       |
| POST   | `/auth/change-password`     | Change password           |
| POST   | `/auth/verify-email/code`   | Verify email with code    |
| POST   | `/auth/resend-verification` | Resend verification email |
| GET    | `/auth/sessions`            | Get active sessions       |
| DELETE | `/auth/sessions/:id`        | Revoke a session          |
| GET    | `/auth/me`                  | Get current user info     |

## 🔒 Password Requirements

Passwords must:

- Be at least 8 characters
- Include uppercase letter
- Include lowercase letter
- Include number
- Include special character (@$!%\*?&)

## ⏱️ Token Expiration

Default values (configurable via environment):

| Token              | Expiration |
| ------------------ | ---------- |
| Access Token       | 15 minutes |
| Refresh Token      | 7 days     |
| Password Reset     | 1 hour     |
| Email Verification | 24 hours   |

## 💾 Session Entity

Sessions are stored in the database with:

```typescript
{
  id: number;
  uuid: string;
  user_id: number;
  access_token: string;
  refresh_token: string;
  access_token_expires_at: Date;
  refresh_token_expires_at: Date;
  ip_address: string;
  user_agent: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  is_active: boolean;
  last_activity_at: Date;
  revoked_at: Date | null;
}
```

## 🔧 Configuration

Environment variables:

```env
# JWT Secret (required, make it long and random)
JWT_SECRET=your_super_secret_key

# Token expiration (in seconds)
JWT_ACCESS_TOKEN_EXPIRES_IN=900        # 15 minutes
JWT_REFRESH_TOKEN_EXPIRES_IN=604800    # 7 days

# Reset/Verification expiration (in seconds)
PASSWORD_RESET_EXPIRES_IN=3600         # 1 hour
EMAIL_VERIFICATION_EXPIRES_IN=86400    # 24 hours
```

## 📧 Email Integration

The auth service sends emails for:

- Email verification (on registration)
- Password reset requests
- Resend verification

Uses the `EmailService` from `@src/commons/services`.

## 🚀 Usage Example

```typescript
// In your controller
import { CurrentUser, Roles, Public } from './decorators';
import { RolesGuard, OrganizationGuard } from './guards';
import { CurrentUser as UserType } from './interfaces';

@Controller('items')
export class ItemsController {
  // Public endpoint
  @Public()
  @Get('public')
  async getPublicItems() {}

  // Authenticated users only
  @Get()
  async getItems(@CurrentUser() user: UserType) {
    return this.itemsService.findByOrg(user.organizationId);
  }

  // Admin only
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async createItem(@Body() dto: CreateItemDto) {}

  // Organization-scoped
  @UseGuards(OrganizationGuard)
  @Get('org/:organizationId')
  async getOrgItems(@Param('organizationId') orgId: number) {}
}
```
