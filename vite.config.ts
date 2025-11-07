import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  root: process.cwd(),
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    emptyOutDir: !isSsrBuild,
    manifest: !isSsrBuild,
    rollupOptions: isSsrBuild
      ? undefined
      : {
          input: path.resolve(process.cwd(), 'index.html'),
        },
  },
  appType: 'custom',
}));
