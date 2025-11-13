import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  root: projectRoot,
  build: {
    outDir: path.resolve(projectRoot, isSsrBuild ? 'dist/server' : 'dist/client'),
    emptyOutDir: !isSsrBuild,
    manifest: !isSsrBuild,
    rollupOptions: isSsrBuild
      ? {
          input: path.resolve(projectRoot, 'frontend/entry-server.tsx'),
          output: {
            format: 'es',
            entryFileNames: 'entry-server.mjs',
            preserveModules: false,
          },
        }
      : {
          input: path.resolve(projectRoot, 'index.html'),
        },
  },
  resolve: {
    alias: {
      '@frontend': path.resolve(projectRoot, 'frontend'),
      '@server': path.resolve(projectRoot, 'server'),
      '@shared': path.resolve(projectRoot, 'shared'),
    },
    // 確保在 pnpm workspace 中正確解析依賴
    dedupe: ['react', 'react-dom'],
    // 在 pnpm workspace 中，需要明確解析 node_modules
    preserveSymlinks: false,
  },
  // 優化依賴處理（開發模式）
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  appType: 'custom',
}));
