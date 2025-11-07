import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express from 'express';
import type { ViteDevServer } from 'vite';

import type { AppProps } from './types';
import { loadPost, loadPostSummaries } from './content';

const PORT = Number(process.env.PORT ?? 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT = process.cwd();
const POSTS_DIR = path.resolve(ROOT, 'posts');

async function createServer() {
  const app = express();
  let vite: ViteDevServer | undefined;
  let template: string = '';
  let serverRender:
    | ((props: AppProps) => Promise<{ html: string }>)
    | undefined;

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    setupMarkdownHMR(vite);
  } else {
    template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
    // Use absolute path and convert to file:// URL for ES module import
    const entryServerPath = path.resolve(ROOT, 'dist/server/entry-server.mjs');
    // Verify file exists before importing
    if (!fs.existsSync(entryServerPath)) {
      throw new Error(`Entry server file not found: ${entryServerPath}`);
    }
    // Convert to file:// URL for proper ES module resolution
    const entryServerUrl = pathToFileURL(entryServerPath).href;
    serverRender = (await import(entryServerUrl)).render;
    app.use(
      '/assets',
      express.static(resolve('dist/client/assets'), { maxAge: '1y' }),
    );
    app.use(express.static(resolve('dist/client'), { index: false }));
  }

  app.get('/', async (req, res) => {
    const props: AppProps = { page: 'list', posts: loadPostSummaries() };
    await renderPage(req, res, 200, props, { vite, template, serverRender });
  });

  app.get('/posts/:slug', async (req, res) => {
    const post = loadPost(req.params.slug);
    if (!post) {
      const props: AppProps = {
        page: 'not-found',
        posts: [],
        post: null,
      };
      await renderPage(req, res, 404, props, { vite, template, serverRender });
      return;
    }

    const props: AppProps = { page: 'detail', posts: [], post };
    await renderPage(req, res, 200, props, { vite, template, serverRender });
  });

  app.use(async (req, res) => {
    const props: AppProps = { page: 'not-found', posts: [], post: null };
    await renderPage(req, res, 404, props, { vite, template, serverRender });
  });

  return app;
}

async function renderPage(
  req: express.Request,
  res: express.Response,
  status: number,
  props: AppProps,
  context: {
    vite?: ViteDevServer;
    template: string;
    serverRender?: (props: AppProps) => Promise<{ html: string }>;
  },
) {
  try {
    let htmlTemplate: string;
    let render: (props: AppProps) => Promise<{ html: string }>;

    if (context.vite) {
      const rawTemplate = fs.readFileSync(resolve('index.html'), 'utf-8');
      htmlTemplate = await context.vite.transformIndexHtml(
        req.originalUrl,
        rawTemplate,
      );
      render = (await context.vite.ssrLoadModule('/src/entry-server.tsx'))
        .render;
    } else {
      htmlTemplate = context.template;
      render = context.serverRender!;
    }

    const { html } = await render(props);
    const payload = JSON.stringify(props).replace(/</g, '\\u003c');
    const { title, description } = getMeta(props);
    const response = htmlTemplate
      .replace('%APP_TITLE%', escapeAttr(title))
      .replace('%APP_DESCRIPTION%', escapeAttr(description))
      .replace('<!--app-html-->', html)
      .replace('<!--app-data-->', payload);

    res.status(status).setHeader('Content-Type', 'text/html').send(response);
  } catch (error) {
    if (context.vite && error instanceof Error) {
      context.vite.ssrFixStacktrace(error);
    }
    console.error('[server] render failed', error);
    res.status(500).send('Internal Server Error');
  }
}

function getMeta(props: AppProps) {
  if (props.page === 'detail' && props.post) {
    return {
      title: props.post.title,
      description: props.post.summary ?? 'React SSR Blog',
    };
  }

  return {
    title: '我的極簡 React 部落格',
    description: '用 React + Express 打造的 Markdown SSR 部落格',
  };
}

function escapeAttr(value: string) {
  return value.replace(/"/g, '&quot;');
}

function resolve(p: string) {
  return path.resolve(ROOT, p);
}

async function start() {
  const app = await createServer();
  app.listen(PORT, () => {
    console.log(`✅ React SSR blog running on http://localhost:${PORT}`);
  });
}

start();
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
