# Build stage
FROM node:lts-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY nx.json tsconfig.base.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npx nx build frontend

# Production stage
FROM node:lts-alpine AS runner

# Get the environment from the build argument
ARG NODE_ENV=production

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3000

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "apps/frontend/server.js"]
