FROM node:20-alpine AS builder
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy package files for dependency installation (layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc* ./
COPY frontend/package.json frontend/package.json
COPY server/package.json server/package.json

# Install all dependencies (including devDependencies for build)
# Use --shamefully-hoist to ensure React is available for Vite build
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy configuration files needed for build
COPY postcss.config.js tailwind.config.js vite.config.ts ./
COPY tsconfig.json tsconfig.server.json ./
COPY index.html ./

# Copy source code and assets
COPY scripts/ ./scripts/
COPY frontend/ ./frontend/
COPY server/ ./server/
COPY shared/ ./shared/
COPY posts/ ./posts/
COPY public/ ./public/

# Build the application
ENV NODE_ENV=production
RUN pnpm run build && \
    test -f /app/dist/server/entry-server.mjs || (echo "ERROR: entry-server.mjs not found" && exit 1)

# Prepare production node_modules with all runtime dependencies
# entry-server.mjs needs React and React-DOM from frontend dependencies
RUN mkdir -p /app/deploy && \
    printf '{"dependencies":{"express":"^5.1.0","gray-matter":"^4.0.3","marked":"^16.4.2","sanitize-html":"^2.17.0","react":"^19.2.0","react-dom":"^19.2.0","lucide-react":"^0.553.0"}}\n' > /app/deploy/package.json && \
    cd /app/deploy && \
    npm install --production --legacy-peer-deps && \
    rm package.json

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    CONTENT_BASE=/app/dist \
    PORT=3000 \
    LOW_MEMORY_MODE=true

# Copy built artifacts and production dependencies only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/deploy/node_modules ./node_modules

EXPOSE 3000

# Start the server directly (no need for run-server.mjs in Docker)
CMD ["node", "--max-old-space-size=48", "dist/server/server.js"]
