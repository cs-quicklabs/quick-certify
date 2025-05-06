# Docker Setup for Quick Certify

This directory contains Docker configurations for running the Quick Certify application in different environments. The setup includes containerized versions of the frontend (Next.js), backend (NestJS), and PostgreSQL database.

## Environment Structure

The Docker configuration is organized into three environments:

- **Local**: For local development, typically just the database is containerized
- **Development (Dev)**: For testing in a development environment with all services containerized
- **Production (Prod)**: For production deployment with optimized settings and security features

## How to Use

### Local Environment

For local development, typically you'll just need the database running in a container while you run the frontend and backend locally:

```bash
# From the project root
docker-compose up -d
```

This will start only the PostgreSQL database and expose it on port 5432.

### Development Environment

Use this when you want to run the entire application stack in containers for testing or integration:

```bash
# From the project root
docker-compose -f docker/dev/docker-compose.dev.yml up -d
```

This will build and start all services with development-specific configurations.

### Production Environment

For production deployment with proper resource limits and optimizations:

```bash
# Create a .env file with the required environment variables first
# Example:
# DB_PASSWORD=secure_password_here
# API_URL=https://api.your-domain.com

# From the project root
docker-compose -f docker/prod/docker-compose.prod.yml up -d
```

## Environment Variables

### Development Environment

All values are hardcoded in the docker-compose.dev.yml file.

### Production Environment

Create a .env file in the project root with the following variables:

- `DB_PASSWORD`: Secure password for the database
- `API_URL`: URL for the backend API

## Service Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

## Notes

- The production setup includes resource limits and replica configuration
- For security, sensitive information like passwords should be provided via environment variables in production
- In local development, only the database is containerized by default
