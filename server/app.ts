import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express from 'express';
import type { ViteDevServer } from 'vite';

import type { AppProps } from '../shared/types.js';
import { createFeedController, createSSRController } from './controllers/pageController.js';

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

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
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
    const entryServerUrl = pathToFileURL(entryServerPath).href;
    serverRender = (await import(entryServerUrl)).render;

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
  }

  app.get('/feed.xml', createFeedController());
  app.get(
    /^\/(?!feed\.xml).*/,
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
