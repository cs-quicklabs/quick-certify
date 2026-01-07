# Backend - NestJS Boilerplate

A production-ready NestJS backend boilerplate with authentication, authorization, multi-tenant architecture, and more.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Session management stored in database (hash-based)
  - Role-based access control (RBAC)
  - Password reset flow
- **Multi-Tenant Architecture**

  - Organization-based data isolation
  - Users belong to organizations
  - Guards to prevent cross-organization data access

- **Database**

  - PostgreSQL with Sequelize ORM
  - Soft delete support
  - Base entity with timestamps
  - Database migrations with Sequelize
  - Seeders for initial data

- **API Features**

  - Swagger/OpenAPI documentation
  - API versioning (URI-based)
  - Request validation with class-validator
  - Standardized response format
  - Global exception handling

- **Email & SMS**

  - Email sending via `@crownstack/mailer` package
  - SMS sending via `@crownstack/sms` package
  - Dev preview mode (opens in browser)
  - Handlebars email templates

- **SOLID Principles**
  - Single Responsibility Principle (SRP)
  - Dependency Inversion Principle (DIP)
  - Service-based architecture
  - Reusable base classes

---

## 📁 Project Structure

```
apps/backend/
├── src/
│   ├── app/                    # Main app controller & service
│   ├── commons/                # Shared utilities
│   │   ├── base/               # Base CRUD service & DTOs
│   │   ├── constants/          # App constants & enums
│   │   ├── dtos/               # Shared DTOs (Success/Error response)
│   │   ├── filters/            # Exception filters
│   │   ├── interfaces/         # Shared interfaces
│   │   ├── services/           # Shared services (EmailService)
│   │   └── utils/              # Utility functions
│   ├── config/                 # Configuration files
│   ├── database/               # Database config & migrations
│   │   ├── migrations/         # Database migrations
│   │   └── seeders/           # Data seeders
│   ├── entities/               # Sequelize entities/models
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── services/       # PasswordService, TokenService, SessionService
│   │   │   ├── guards/         # JwtAuthGuard, RolesGuard, OrganizationGuard
│   │   │   └── decorators/     # @CurrentUser, @Roles, @Public
│   │   ├── user/               # User management module
│   │   ├── organization/       # Organization module
│   │   └── user-type/          # User types/roles module
│   ├── app.module.ts           # Root module
│   ├── main.ts                 # Application entry point
│   └── swagger.ts              # Swagger configuration
├── templates/                  # Email templates (Handlebars)
├── .sequelizerc                # Sequelize CLI configuration
└── package.json
```

---

## 🛠️ Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 2. Environment Configuration

Create `.env` file in `apps/backend/`:

```env
# Application
ENV=dev
APP_PORT=3001
FRONTEND_DOMAIN=http://localhost:3000

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=boilerplate_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_LOG=false
DATABASE_SYNCHRONIZE=false

# JWT (generate a strong secret)
JWT_SECRET=your_super_secret_key_here
JWT_ACCESS_TOKEN_EXPIRES_IN=900        # 15 minutes (seconds)
JWT_REFRESH_TOKEN_EXPIRES_IN=604800   # 7 days (seconds)
BCRYPT_SALT_ROUNDS=10
PASSWORD_RESET_EXPIRES_IN=3600        # 1 hour (seconds)

# Email (for dev, set MAIL_PREVIEW=true)
MAIL_PREVIEW=true
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your_email@example.com
MAIL_PASS=your_password
MAIL_DEFAULT_FROM=noreply@example.com

# SMS (for dev, set TWILIO_PREVIEW_MODE=true)
TWILIO_PREVIEW_MODE=true
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890
```

### 3. Create Database

```bash
createdb boilerplate_db
```

### 4. Install Dependencies

From the workspace root:

```bash
npm install
```

### 5. Run Migrations

```bash
cd apps/backend

# Run migrations
npm run migration:run

# Run seeders (optional)
npm run seed:run
```

### 6. Run the Application

```bash
# Development mode (with hot reload)
npx nx serve backend

# Production build
npx nx build backend
npx nx serve backend --configuration=prod
```

### 7. Access the API

- **API Base URL**: `http://localhost:3001/api`
- **Swagger Docs**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/api/health`

---

## 🔐 Authentication

### Flow

1. **Register** → Creates user + sends welcome email
2. **Login** → Returns access token + refresh token
3. **Access Token** → Short-lived (15 min), used for API calls
4. **Refresh Token** → Long-lived (7 days), used to get new access token
5. **Sessions** → Stored in database with hash, can be revoked

### Endpoints

| Method | Endpoint                       | Description            | Auth Required |
| ------ | ------------------------------ | ---------------------- | ------------- |
| POST   | `/api/v1/auth/register`        | Register new user      | No            |
| POST   | `/api/v1/auth/login`           | Login                  | No            |
| POST   | `/api/v1/auth/refresh-token`   | Refresh access token   | No            |
| POST   | `/api/v1/auth/logout`          | Logout current session | Yes           |
| POST   | `/api/v1/auth/logout-all`      | Logout all sessions    | Yes           |
| POST   | `/api/v1/auth/forgot-password` | Request password reset | No            |
| POST   | `/api/v1/auth/reset-password`  | Reset password         | No            |
| POST   | `/api/v1/auth/change-password` | Change password        | Yes           |
| GET    | `/api/v1/auth/sessions`        | Get active sessions    | Yes           |
| DELETE | `/api/v1/auth/sessions/:hash`  | Revoke a session       | Yes           |
| GET    | `/api/v1/auth/me`              | Get current user       | Yes           |

### Using Authentication

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 👥 User Roles

The system has three default user types:

| Code          | Name                | Description                       |
| ------------- | ------------------- | --------------------------------- |
| `SUPER_ADMIN` | Super Administrator | Full access to all organizations  |
| `ADMIN`       | Administrator       | Full access to their organization |
| `USER`        | Standard User       | Basic access                      |

### Using Role-Based Access

```typescript
import { Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Get('admin-only')
async adminEndpoint() {
  // Only ADMIN and SUPER_ADMIN can access
}
```

---

## 🏢 Multi-Tenant Architecture

### How It Works

- Each user belongs to an **Organization**
- Data is isolated by `organization_id`
- Guards ensure users only access their organization's data
- `SUPER_ADMIN` can access all organizations

### Using Organization Guard

```typescript
import { OrganizationGuard } from '@src/modules/auth/guards';

@UseGuards(OrganizationGuard)
@Get(':organizationId/data')
async getOrgData(@Param('organizationId') orgId: number) {
  // Guard ensures user can only access their org
}
```

### Multi-Tenant Service Methods

The `BaseCrudService` provides tenant-aware methods:

```typescript
// Get all items for an organization
await this.service.findAllByOrganization(organizationId, options);

// Get one item ensuring organization match
await this.service.findOneByOrganization(id, organizationId);
```

---

## 📧 Email Service

### Configuration

Templates are stored in `/templates` folder using Handlebars.

### Usage

```typescript
import { EmailService } from '@src/commons/services';

@Injectable()
export class MyService {
  constructor(private emailService: EmailService) {}

  async sendWelcome(email: string, name: string) {
    await this.emailService.sendWelcomeEmail(email, {
      name,
    });
  }

  // Or use custom template
  async sendCustom(email: string) {
    await this.emailService.sendTemplatedEmail(
      email,
      'Subject',
      'my-template', // templates/my-template.hbs
      { data: 'value' },
    );
  }
}
```

### Dev Preview Mode

When `MAIL_PREVIEW=true`, emails open in your browser via Ethereal instead of being sent.

---

## 📱 SMS Service

### Usage

```typescript
import { SmsService } from '@crownstack/sms';

@Injectable()
export class MyService {
  constructor(private smsService: SmsService) {}

  async sendOtp(phone: string, code: string) {
    await this.smsService.sendSms({
      to: phone,
      body: `Your code is: ${code}`,
    });
  }
}
```

### Dev Preview Mode

When `TWILIO_PREVIEW_MODE=true`, SMS messages open as HTML preview in your browser.

---

## 🔧 Base CRUD Service

Extend `BaseCrudService` for automatic CRUD operations:

```typescript
import { BaseCrudService } from '@src/commons/base';

@Injectable()
export class MyService extends BaseCrudService<MyEntity, CreateDto, UpdateDto> {
  protected readonly model = MyEntity;
  protected readonly entityName = 'MyEntity';

  constructor(
    @InjectModel(MyEntity)
    private myModel: typeof MyEntity,
  ) {
    super();
  }
}
```

### Available Methods

| Method                             | Description                 |
| ---------------------------------- | --------------------------- |
| `findAll(options)`                 | Paginated list with sorting |
| `findOne(id)`                      | Find by ID                  |
| `findByUuid(uuid)`                 | Find by UUID                |
| `create(dto)`                      | Create new record           |
| `update(id, dto)`                  | Update record               |
| `softDelete(id)`                   | Soft delete                 |
| `restore(id)`                      | Restore soft-deleted        |
| `count(where)`                     | Count records               |
| `exists(id)`                       | Check if exists             |
| `findAllByOrganization(orgId)`     | Multi-tenant find all       |
| `findOneByOrganization(id, orgId)` | Multi-tenant find one       |

---

## 🎨 Response Format

All responses follow a standardized format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": { ... },
  "errorCode": 400
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Items retrieved",
  "data": {
    "data": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## 🗃️ Database Migrations

See [Database README](./src/database/README.md) for detailed migration documentation.

### Quick Commands

```bash
# Run migrations
npm run migration:run

# Check status
npm run migration:status

# Rollback
npm run migration:rollback

# Run seeders
npm run seed:run
```

---

## 🧪 Testing

```bash
# Run unit tests
npx nx test backend

# Run e2e tests
npx nx e2e backend-e2e
```

---

## 📝 Creating a New Module

1. Create the module folder:

```bash
mkdir -p src/modules/my-module/dtos
```

2. Create the entity in `src/entities/`

3. Create DTOs, Service, Controller, and Module

4. Add entity to `src/entities/index.ts`

5. Import module in `app.module.ts`

---

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Configured for frontend domain
- **Rate Limiting** - Can be added per route
- **Input Validation** - Via class-validator
- **Password Hashing** - bcrypt with configurable rounds
- **JWT Tokens** - Signed, with expiration
- **Session Management** - Database-stored, revocable

---

## 📚 API Documentation

Swagger documentation is available at `/api/docs` with:

- All endpoints documented
- Request/Response schemas
- Authentication support (add Bearer token)
- Try-it-out functionality

---

## 🚀 Deployment

### Build for Production

```bash
npx nx build backend --configuration=prod
```

### Environment Variables for Production

```env
ENV=production
DATABASE_SSL_ENABLED=true
MAIL_PREVIEW=false
TWILIO_PREVIEW_MODE=false
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist/apps/backend .
RUN npm ci --only=production
CMD ["node", "main.js"]
```

---

## 📄 License

MIT
