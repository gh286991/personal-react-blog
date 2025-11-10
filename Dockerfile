### Build stage: use Bun for building (smaller and faster)
FROM oven/bun:1.1.22 AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lock ./

# Install all dependencies using Bun with its native lockfile
RUN bun install --frozen-lockfile

# Copy only necessary files for build
COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY frontend ./frontend
COPY server ./server
COPY shared ./shared
COPY scripts ./scripts
COPY posts ./posts
COPY public ./public

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
    PORT=3000 \
    LOW_MEMORY_MODE=true

# Copy only production dependencies and built files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 使用 --smol 標誌、heap 限制和啟用 GC 以優化記憶體使用（目標 <50MB）
CMD ["bun", "--smol", "--expose-gc", "--max-old-space-size=48", "dist/server/server.js"]
