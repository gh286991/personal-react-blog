import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';

import App, { AppProps } from './App';
import { loadPost, loadPostSummaries } from './content';

const PORT = Number(process.env.PORT ?? 3000);
const CONTENT_BASE = process.env.CONTENT_BASE ?? process.cwd();
const PUBLIC_DIR = path.join(CONTENT_BASE, 'public');
const POSTS_DIR = path.join(CONTENT_BASE, 'posts');
const isDev = process.env.NODE_ENV !== 'production';

const app = express();

app.use(
  '/static',
  express.static(PUBLIC_DIR, {
    maxAge: isDev ? 0 : '1h',
    etag: !isDev,
    lastModified: !isDev,
    setHeaders: isDev
      ? (res) => {
          res.set('Cache-Control', 'no-store');
        }
      : undefined,
  }),
);

if (isDev) {
  setupDevReload(app);
  app.get('/dev/ping', (_req, res) => {
    res.type('text/plain').send('ok');
  });
}

app.get('/', (_req, res) => {
  const props: AppProps = { page: 'list', posts: loadPostSummaries() };
  sendPage(res, props, 200);
});

app.get('/posts/:slug', (req, res) => {
  const post = loadPost(req.params.slug);
  if (!post) {
    sendPage(res, { page: 'not-found', posts: [], post: null }, 404);
    return;
  }

  sendPage(res, { page: 'detail', posts: [], post }, 200);
});

app.use((_req, res) => {
  sendPage(res, { page: 'not-found', posts: [], post: null }, 404);
});

function sendPage(res: express.Response, props: AppProps, status: number) {
  res.status(status).type('html').send(renderDocument(props));
}

function renderDocument(props: AppProps) {
  const appHtml = renderToString(React.createElement(App, props));
  const payload = JSON.stringify(props).replace(/</g, '\\u003c');
  const description =
    props.page === 'detail'
      ? props.post?.summary ?? 'React SSR Blog'
      : '極簡、低記憶體的 React SSR 個人部落格';
  const title =
    props.page === 'detail' && props.post ? props.post.title : 'React SSR Blog';
  const escapeAttr = (value: string) => value.replace(/"/g, '&quot;');

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeAttr(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="stylesheet" href="/static/styles.css" />
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script>window.__INITIAL_DATA__ = ${payload}</script>
    <script src="/static/client.js" defer></script>
  </body>
</html>`;
}

app.listen(PORT, () => {
  console.log(`✅ React SSR blog running on http://localhost:${PORT}`);
});

function setupDevReload(app: express.Express) {
  const clients = new Set<express.Response>();

  const broadcast = (data: string) => {
    for (const client of clients) {
      client.write(`data: ${data}\n\n`);
    }
  };

  app.get('/dev/reload', (req, res) => {
    res.set({
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });
    res.flushHeaders?.();
    res.write('retry: 1000\n\n');

    clients.add(res);
    req.on('close', () => {
      clients.delete(res);
    });
  });

  let reloadTimer: NodeJS.Timeout | null = null;
  type ReloadEvent = 'reload:content' | 'reload:bundle';

  const scheduleReload = (event: ReloadEvent) => {
    if (reloadTimer) {
      clearTimeout(reloadTimer);
    }
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      broadcast(event);
    }, 50);
  };

  const watchers: fs.FSWatcher[] = [];

  type WatchResult =
    | 'reload:content'
    | 'reload:bundle'
    | { kind: 'css'; file: string };

  function watchDirectory(
    dir: string,
    recursive: boolean,
    filter?: (filename: string | null) => WatchResult | null,
  ) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const handler: fs.WatchListener<string> = (_eventType, filename) => {
      if (!filter) {
        scheduleReload('reload:content');
        return;
      }
      const result = filter(filename);
      if (!result) {
        return;
      }
      if (result === 'reload:content' || result === 'reload:bundle') {
        scheduleReload(result);
      } else if (result.kind === 'css') {
        broadcast(`css:${result.file}`);
      }
    };

    try {
      watchers.push(fs.watch(dir, { recursive }, handler));
    } catch {
      if (recursive) {
        try {
          watchers.push(fs.watch(dir, { recursive: false }, handler));
        } catch (error) {
          console.warn(`[dev-reload] 無法監看 ${dir}:`, error);
        }
      } else {
        console.warn(`[dev-reload] 無法監看 ${dir}`);
      }
    }
  }

  watchDirectory(POSTS_DIR, true, (filename) => {
    if (!filename || filename.endsWith('.md')) {
      return 'reload:content';
    }
    return null;
  });

  watchDirectory(PUBLIC_DIR, false, (filename) => {
    if (!filename) {
      return null;
    }

    if (filename.endsWith('.css')) {
      return { kind: 'css', file: filename };
    }

    if (filename === 'client.js') {
      return 'reload:bundle';
    }

    return null;
  });

  process.on('exit', () => {
    watchers.forEach((watcher) => watcher.close());
  });
}
