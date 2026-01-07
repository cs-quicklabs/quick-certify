# Quick Certify

<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="60" alt="NestJS" /></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://nextjs.org/" target="_blank"><img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png" width="60" alt="Next.js" /></a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://nx.dev" target="_blank"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="60" alt="Nx" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node Version" />
  <img src="https://img.shields.io/badge/npm-%3E%3D9.0.0-red.svg" alt="NPM Version" />
  <img src="https://img.shields.io/badge/typescript-5.9-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/nestjs-11.0-red.svg" alt="NestJS" />
  <img src="https://img.shields.io/badge/next.js-16.0-black.svg" alt="Next.js" />
</p>

<p align="center">
  <strong>A production-ready monorepo boilerplate with NestJS backend, Next.js frontend, and reusable packages.</strong>
</p>

<p align="center">
  Built with ❤️ by <a href="https://crownstack.com" target="_blank">CrownStack</a>
</p>

## ✨ Features

### Backend (NestJS)

- 🔐 **JWT Authentication** with access/refresh tokens
- 👥 **Role-Based Access Control** (RBAC)
- 🏢 **Multi-Tenant Architecture** (organization-based)
- 📧 **Email Service** with dev preview mode
- 📱 **SMS Service** (Twilio) with dev preview mode
- 🗄️ **PostgreSQL** with Sequelize ORM
- 📚 **Swagger/OpenAPI** documentation
- ✅ **Validation** with class-validator
- 🔄 **Soft Delete** support
- 🗃️ **Database Migrations** with Sequelize

### Frontend (Next.js)

- ⚡ **Next.js 16** with App Router
- 🎨 **Tailwind CSS** for styling
- 📦 **SCSS** support
- 🔄 **TanStack Query** for server state
- 🗃️ **Zustand** for client state
- ✅ **Zod** for schema validation
- 🧪 **Jest** testing
- 📱 **Responsive** design ready

### Packages (Reusable)

- 📧 `@crownstack/mailer` - Email sending with Nodemailer
- 📱 `@crownstack/sms` - SMS sending with Twilio

### Developer Experience

- 🎨 **Prettier** for code formatting
- 📝 **EditorConfig** for consistent coding styles
- 🔍 **ESLint** for code quality
- 🧪 **Jest** for testing
- 🎭 **Playwright** for E2E testing

---

## 📁 Project Structure

```
├── apps/
│   ├── backend/              # NestJS API server
│   ├── backend-e2e/          # Backend E2E tests
│   ├── frontend/             # Next.js web app
│   └── frontend-e2e/         # Frontend E2E tests (Playwright)
│
├── packages/
│   ├── mailer/               # @crownstack/mailer
│   └── sms/                  # @crownstack/sms
│
├── nx.json                   # Nx configuration
├── package.json              # Root dependencies
├── tsconfig.base.json        # Base TypeScript config
├── .prettierrc               # Prettier configuration
├── .editorconfig             # EditorConfig settings
└── .vscode/                  # VS Code settings
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd boilerplate-nest-next

# Install dependencies
npm install

# Setup backend environment
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your configuration

# Setup frontend environment (if needed)
# Create apps/frontend/.env.local with your variables

# Create database
createdb boilerplate_db

# Run migrations
cd apps/backend
npm run migration:run
npm run seed:run
```

### Running the Applications

```bash
# Start backend (development)
npx nx serve backend

# Start frontend (development)
npx nx dev frontend

# Start both
npx nx run-many --target=serve --projects=backend,frontend
```

### Access Points

| Service      | URL                            |
| ------------ | ------------------------------ |
| Backend API  | http://localhost:3001/api      |
| Swagger Docs | http://localhost:3001/api/docs |
| Frontend     | http://localhost:3000          |

---

## 📦 Packages

### @crownstack/mailer

Lightweight email service with Nodemailer.

```typescript
import { MailerService } from '@crownstack/mailer';

await mailerService.sendMail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<h1>Welcome!</h1>',
});
```

[📖 Full Documentation](./packages/mailer/README.md)

### @crownstack/sms

SMS service with Twilio integration.

```typescript
import { SmsService } from '@crownstack/sms';

await smsService.sendSms({
  to: '+1234567890',
  body: 'Your code is: 123456',
});
```

[📖 Full Documentation](./packages/sms/README.md)

---

## 🔧 Available Commands

### Development

```bash
# Serve applications
npx nx serve backend           # Start backend
npx nx dev frontend            # Start frontend

# Build applications
npx nx build backend           # Build backend
npx nx build frontend          # Build frontend

# Run all builds
npx nx run-many --target=build --all
```

### Database Migrations (Backend)

```bash
cd apps/backend

# Run pending migrations
npm run migration:run

# Rollback last migration
npm run migration:rollback

# Check migration status
npm run migration:status

# Run seeders
npm run seed:run

# Fresh migration (⚠️ drops all tables)
npm run migration:fresh
```

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting (CI/CD)
npm run format:check

# Fix formatting issues
npm run format:fix
```

### Testing

```bash
# Unit tests
npx nx test backend
npx nx test frontend

# E2E tests
npx nx e2e backend-e2e
npx nx e2e frontend-e2e
```

### Code Quality

```bash
# Lint
npx nx lint backend
npx nx lint frontend

# Type checking
npx nx typecheck backend
npx nx typecheck frontend
```

### Utilities

```bash
# View project graph
npx nx graph

# List all projects
npx nx show projects

# See affected projects
npx nx affected:graph
```

---

## 🔐 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │     │  Backend │     │    DB    │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │  POST /login   │                │
     │───────────────>│                │
     │                │  Store Session │
     │                │───────────────>│
     │  Access Token  │                │
     │  Refresh Token │                │
     │<───────────────│                │
     │                │                │
     │  API Request   │                │
     │  (Bearer Token)│                │
     │───────────────>│                │
     │                │  Validate      │
     │                │───────────────>│
     │     200 OK     │                │
     │<───────────────│                │
```

---

## 👥 User Roles

| Role        | Code          | Access                              |
| ----------- | ------------- | ----------------------------------- |
| Super Admin | `SUPER_ADMIN` | All organizations, all resources    |
| Admin       | `ADMIN`       | Own organization, all resources     |
| User        | `USER`        | Own organization, limited resources |

---

## 🏢 Multi-Tenant Architecture

- Each user belongs to an **Organization**
- Data is isolated by `organization_id`
- Guards prevent cross-organization access
- Super Admins can access all organizations

---

## 📧 Email & SMS Dev Preview

In development mode, emails and SMS are not sent. Instead:

- **Email**: Opens in browser via Ethereal Email
- **SMS**: Shows HTML preview in browser

Set in `.env`:

```env
MAIL_PREVIEW=true
TWILIO_PREVIEW_MODE=true
```

---

## 📚 Documentation

| Topic          | Location                                                                             |
| -------------- | ------------------------------------------------------------------------------------ |
| Backend        | [apps/backend/README.md](./apps/backend/README.md)                                   |
| Frontend       | [apps/frontend/README.md](./apps/frontend/README.md)                                 |
| Auth Module    | [apps/backend/src/modules/auth/README.md](./apps/backend/src/modules/auth/README.md) |
| Base CRUD      | [apps/backend/src/commons/base/README.md](./apps/backend/src/commons/base/README.md) |
| Database       | [apps/backend/src/database/README.md](./apps/backend/src/database/README.md)         |
| Mailer Package | [packages/mailer/README.md](./packages/mailer/README.md)                             |
| SMS Package    | [packages/sms/README.md](./packages/sms/README.md)                                   |

---

## 🛠️ Tech Stack

### Backend

- [NestJS](https://nestjs.com/) - Node.js framework
- [Sequelize](https://sequelize.org/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Swagger](https://swagger.io/) - API documentation
- [Nodemailer](https://nodemailer.com/) - Email sending
- [Twilio](https://www.twilio.com/) - SMS sending

### Frontend

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TanStack Query](https://tanstack.com/query) - Server state management
- [Zustand](https://zustand-demo.pmnd.rs/) - Client state management
- [Zod](https://zod.dev/) - Schema validation
- [SCSS](https://sass-lang.com/) - CSS preprocessor

### Tooling

- [Nx](https://nx.dev/) - Monorepo management
- [Prettier](https://prettier.io/) - Code formatter
- [EditorConfig](https://editorconfig.org/) - Consistent coding styles
- [Jest](https://jestjs.io/) - Testing
- [Playwright](https://playwright.dev/) - E2E testing
- [ESLint](https://eslint.org/) - Linting

---

## 📝 Environment Variables

### Backend

```env
# Application
ENV=dev
APP_PORT=3001
FRONTEND_DOMAIN=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=boilerplate_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key

# Email
MAIL_PREVIEW=true

# SMS
TWILIO_PREVIEW_MODE=true
```

### Frontend

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🎨 Code Style

This project uses:

- **Prettier** for automatic code formatting
- **EditorConfig** for consistent editor settings
- **ESLint** for code quality

Format your code before committing:

```bash
npm run format
```

VS Code users: Format on save is enabled automatically.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests, linting, and formatting
5. Submit a pull request

---

## 📄 License

MIT

---

## 🔗 Useful Links

- [Nx Documentation](https://nx.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
