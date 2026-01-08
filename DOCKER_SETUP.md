# Docker Setup Guide for Quick Certify

This guide will help you set up PostgreSQL using Docker for the Quick Certify backend.

## Prerequisites

- Docker Desktop installed and running
- Node.js and npm installed

## Step 1: Start PostgreSQL with Docker

Run the following command from the project root:

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL 16 Alpine image (if not already present)
- Create a container named `quick-certify-postgres`
- Start PostgreSQL on port 5432
- Create a database named `quick_certify`
- Set up persistent storage for the database

## Step 2: Verify PostgreSQL is Running

Check if the container is running:

```bash
docker-compose ps
```

You should see the `quick-certify-postgres` container with status "Up".

## Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp apps/backend/.env.example apps/backend/.env
```

2. The default database configuration in `.env.example` matches the Docker setup:
   - Host: `localhost`
   - Port: `5432`
   - Database: `quick_certify`
   - Username: `postgres`
   - Password: `postgres`

3. Update `JWT_SECRET` and `JWT_REFRESH_SECRET` with secure random strings for production.

## Step 4: Run Database Migrations

After starting the database, run migrations:

```bash
cd apps/backend
npm run migration:run
```

Or if using Nx:

```bash
npx nx migration:run backend
```

## Step 5: Seed the Database (Optional)

Seed initial data (roles, etc.):

```bash
cd apps/backend
npm run seed:run
```

Or if using Nx:

```bash
npx nx seed:run backend
```

## Step 6: Start the Backend Server

```bash
cd apps/backend
npm run start:dev
```

Or if using Nx:

```bash
npx nx serve backend
```

## Useful Docker Commands

### Stop PostgreSQL
```bash
docker-compose down
```

### Stop and Remove Data (⚠️ This will delete all data)
```bash
docker-compose down -v
```

### View PostgreSQL Logs
```bash
docker-compose logs -f postgres
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d quick_certify
```

### Restart PostgreSQL
```bash
docker-compose restart postgres
```

## Troubleshooting

### Port 5432 Already in Use

If port 5432 is already in use, you can change it in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Change 5433 to any available port
```

Then update your `.env` file:
```
DATABASE_PORT=5433
```

### Connection Refused Error

1. Make sure Docker Desktop is running
2. Verify the container is up: `docker-compose ps`
3. Check container logs: `docker-compose logs postgres`
4. Ensure the database is healthy: `docker-compose ps` should show "healthy"

### Reset Database

To completely reset the database:

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d

# Run migrations again
cd apps/backend
npm run migration:run
npm run seed:run
```

## Production Considerations

For production, you should:

1. Change the default PostgreSQL password
2. Use environment variables for sensitive data
3. Set up proper backup strategies
4. Use a managed database service (AWS RDS, Google Cloud SQL, etc.)
5. Enable SSL connections
6. Set `DATABASE_SYNCHRONIZE=false` (already set in example)

## Environment Variables Reference

See `apps/backend/.env.example` for all available environment variables and their descriptions.

