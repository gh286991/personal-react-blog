import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express from 'express';
import type { ViteDevServer } from 'vite';

import type { AppProps } from '../shared/types.js';
import { createFeedController, createRobotsController, createSitemapController, createSSRController } from './controllers/pageController.js';

const ROOT = process.cwd();
const POSTS_DIR = path.resolve(ROOT, 'posts');

export interface CreateAppOptions {
  isProd: boolean;
}

export async function createApp({ isProd }: CreateAppOptions) {
  const app = express();

  app.disable('x-powered-by');
  app.disable('etag');
  app.set('trust proxy', false);
  app.set('view cache', false);

  let vite: ViteDevServer | undefined;
  let template = '';
  let serverRender: ((props: AppProps) => Promise<{ html: string }>) | undefined;

  // 提供圖片靜態資源（開發和生產模式都需要）
  app.use(
    '/images',
    express.static(resolve('public/images'), {
      maxAge: isProd ? '1y' : '0',
      etag: !isProd,
      lastModified: !isProd,
      index: false,
    }),
  );

  // 提供 favicon 靜態資源（開發和生產模式都需要）
  app.use(
    '/favicon',
    express.static(resolve('public/favicon'), {
      maxAge: isProd ? '1y' : '0',
      etag: !isProd,
      lastModified: !isProd,
      index: false,
    }),
  );

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const viteConfigPath = path.resolve(ROOT, 'vite.config.ts');
    vite = await createViteServer({
      configFile: viteConfigPath,
      server: { 
        middlewareMode: true,
        // 在 middleware mode 下，Vite 不會啟動獨立的 HTTP server
        // HMR WebSocket 會通過 Express server 工作
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    setupMarkdownHMR(vite);
  } else {
    template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
    const entryServerPath = path.resolve(ROOT, 'dist/server/entry-server.mjs');
    if (!fs.existsSync(entryServerPath)) {
      throw new Error(`Entry server file not found: ${entryServerPath}`);
    }
    // Import ES module from CommonJS
    // TypeScript compiles dynamic import() to require() in CommonJS mode,
    // so we need to use Function constructor to preserve dynamic import
    const entryServerUrl = pathToFileURL(entryServerPath).href;
    // Use Function to prevent TypeScript from converting to require()
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const entryModule = await dynamicImport(entryServerUrl);
    serverRender = entryModule.render;

    app.use(
      '/assets',
      express.static(resolve('dist/client/assets'), {
        maxAge: '1y',
        etag: false,
        lastModified: false,
        index: false,
      }),
    );
    app.use(
      express.static(resolve('dist/client'), {
        index: false,
        etag: false,
        lastModified: false,
      }),
    );
    // 確保 favicon 在生產模式下可訪問
    app.use(
      '/favicon',
      express.static(resolve('dist/client/favicon'), {
        maxAge: '1y',
        etag: false,
        lastModified: false,
        index: false,
      }),
    );
  }

  app.get('/feed.xml', createFeedController());
  app.get('/sitemap.xml', createSitemapController());
  app.get('/robots.txt', createRobotsController());
  app.get(
    /^\/(?!feed\.xml|sitemap\.xml|robots\.txt).*/,
    createSSRController({ vite, template, serverRender }),
  );

  return app;
}

function resolve(p: string) {
  return path.resolve(ROOT, p);
}

function setupMarkdownHMR(vite: ViteDevServer) {
  const watchEvents: Array<'add' | 'change' | 'unlink'> = [
    'add',
    'change',
    'unlink',
  ];
  try {
    vite.watcher.add(POSTS_DIR);
  } catch (error) {
    console.warn('[dev] Unable to watch posts directory for HMR:', error);
  }

  let reloadTimer: NodeJS.Timeout | null = null;

  const triggerReload = () => {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
    }
    reloadTimer = setTimeout(() => {
      vite.ws.send({ type: 'full-reload', path: '*' });
      reloadTimer = null;
    }, 150);
  };

  const handleChange = (file: string) => {
    if (!file || !file.startsWith(POSTS_DIR)) {
      return;
    }
    triggerReload();
  };

  watchEvents.forEach((event) => {
    vite.watcher.on(event, handleChange);
  });
}
