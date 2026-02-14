# ============================================================================
# Build Stage
# ============================================================================
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22.22.0-alpine3.23 AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package manifests
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# ============================================================================
# Runtime Stage
# ============================================================================
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:22.22.0-alpine3.23

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package manifests from builder
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod && \
    pnpm prune --prod


# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Copy other necessary files for runtime
COPY .env.example ./

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose default port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/server.js"]
