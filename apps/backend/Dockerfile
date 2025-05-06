# Build stage
FROM node:lts-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and related files
COPY package.json package-lock.json* ./

# Copy nx workspace files
COPY nx.json tsconfig.base.json jest.preset.js eslint.config.cjs ./

# Install ALL dependencies including dev dependencies needed for the build
RUN npm ci

# Copy the entire project for nx to work properly
COPY . .

# Build the app
RUN npx nx run backend:build

# Production stage
FROM node:lts-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built application from build stage
COPY --from=build /app/dist/apps/backend ./dist

# Create a non-root user to run the application
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs \
  && chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Start the application
CMD ["node", "dist/main.js"]
