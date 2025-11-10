### Build stage: use Bun for building (smaller and faster)
FROM oven/bun:1.1.22 AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install all dependencies using Bun (allow migration from npm lockfile)
RUN bun install

# Copy only necessary files for build
COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY frontend server shared scripts posts public ./

# Build the application in production mode
ENV NODE_ENV=production
RUN bun run build

# Debug: List build output
RUN echo "=== Build output ===" && \
    ls -la dist/ && \
    echo "=== Server files ===" && \
    ls -la dist/server/ && \
    echo "=== All JS files ===" && \
    find dist -name "*.js" -o -name "*.mjs" | head -20

# Remove dev dependencies and clean up
RUN bun install --production && \
    rm -rf /tmp/* /var/tmp/*

### Runtime stage: minimal bun slim runtime
FROM oven/bun:1.1.22-slim AS runner
WORKDIR /app
ENV PATH="/app/node_modules/.bin:${PATH}"

ENV NODE_ENV=production \
    CONTENT_BASE=/app/dist \
    PORT=3000

# Copy only production dependencies and built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 使用 --smol 標誌以優化記憶體使用
CMD ["bun", "--smol", "dist/server/server.js"]
