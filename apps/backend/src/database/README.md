# Database Migrations

This directory contains database migrations and seeders for the backend application.

## Structure

```
database/
├── config/               # Database configuration
│   ├── database.config.ts
│   └── database-config.type.ts
├── migrations/           # Table creation migrations
│   └── 20231201000001-create-all-tables.ts
├── seeders/              # Initial data seeders
│   └── 20231201000001-seed-initial-data.ts
├── data-source.ts        # Sequelize CLI configuration
├── run-migrations.ts     # Migration runner script
└── sequelize-config.service.ts  # NestJS Sequelize config
```

## Tables Created

The migration creates all tables in the correct order:

| Table            | Description                           |
| ---------------- | ------------------------------------- |
| `user_type`      | User roles (SUPER_ADMIN, ADMIN, USER) |
| `organization`   | Organizations for multi-tenancy       |
| `user`           | User accounts                         |
| `session`        | User authentication sessions          |
| `password_reset` | Password reset tokens                 |

## Initial Data Seeded

The seeder populates:

- **User Types**: SUPER_ADMIN, ADMIN, USER
- **Organization**: Default Organization

## Commands

### Using Nx (Recommended)

```bash
# Run pending migrations
npx nx migration:run backend

# Rollback last migration
npx nx migration:rollback backend

# Show migration status
npx nx migration:status backend

# Run seeders
npx nx seed:run backend

# Fresh migration (⚠️ drops all tables)
npx nx migration:fresh backend
```

### Using npm scripts (from apps/backend directory)

```bash
cd apps/backend

# Run pending migrations
npm run migration:run

# Rollback last migration
npm run migration:rollback

# Show migration status
npm run migration:status

# Run seeders
npm run seed:run

# Fresh migration (⚠️ drops all tables)
npm run migration:fresh
```

## Creating New Migrations

Migration files should follow the naming convention:

```
YYYYMMDDHHMMSS-description.ts
```

Example: `20231201000002-add-email-verified-to-user.ts`

### Migration Template

```typescript
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Add your migration logic here
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Add rollback logic here
}
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=your_database
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_LOG=false
DATABASE_SYNCHRONIZE=false
```

## Notes

- Migrations are executed in alphabetical order (hence the timestamp prefix)
- Always test migrations in a development environment first
- The `fresh` command will destroy all data - use with caution
- Seeders are run manually and are idempotent by design
- The initial migration creates all tables in one file for simplicity
