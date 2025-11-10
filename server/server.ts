import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import express from 'express';
import type { ViteDevServer } from 'vite';

import type { AppProps } from '../shared/types.js';
import type { PostSummary } from '../shared/types.js';
import { clearContentCaches, isLowMemoryMode, loadPost, loadPostSummaries } from '../shared/content.js';

const PORT = Number(process.env.PORT ?? 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT = process.cwd();
const POSTS_DIR = path.resolve(ROOT, 'posts');

async function createServer() {
  const app = express();
  
  // 優化 Express 配置：禁用不必要的功能以減少記憶體使用
  app.disable('x-powered-by');
  app.disable('etag');
  app.set('trust proxy', false);
  app.set('view cache', false);
  
  // 優化：禁用 body parser（此應用不需要解析請求體）
  // 這可以減少 Express 的記憶體開銷
  
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
    // 優化靜態文件服務：減少緩衝區大小，禁用索引
    app.use(
      '/assets',
      express.static(resolve('dist/client/assets'), {
        maxAge: '1y',
        etag: false,
        lastModified: false,
        index: false,
      }),
    );
    app.use(express.static(resolve('dist/client'), {
      index: false,
      etag: false,
      lastModified: false,
    }));
  }

  app.get('/', async (req, res) => {
    const posts = await loadPostSummaries();
    const props: AppProps = { page: 'list', posts };
    await renderPage(req, res, 200, props, { vite, template, serverRender });
  });

  app.get('/about', async (req, res) => {
    const props: AppProps = { page: 'about', posts: [], post: null };
    await renderPage(req, res, 200, props, { vite, template, serverRender });
  });

  app.get('/posts', async (req, res) => {
    const posts = await loadPostSummaries();
    const props: AppProps = { page: 'archive', posts, post: null };
    await renderPage(req, res, 200, props, { vite, template, serverRender });
  });

  app.get('/posts/:slug', async (req, res) => {
    const post = await loadPost(req.params.slug);
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

  app.get('/feed.xml', async (req, res) => {
    try {
      const posts = await loadPostSummaries();
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      
      const rssXml = generateRSSFeed(posts, baseUrl);
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(rssXml);
    } catch (error) {
      console.error('[server] RSS feed generation failed', error);
      res.status(500).send('Internal Server Error');
    }
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
  const shouldClearCaches = isLowMemoryMode;
  try {
    let htmlTemplate: string;
    let render: (props: AppProps) => Promise<{ html: string }>;

    if (context.vite) {
      const rawTemplate = fs.readFileSync(resolve('index.html'), 'utf-8');
      htmlTemplate = await context.vite.transformIndexHtml(
        req.originalUrl,
        rawTemplate,
      );
      render = (await context.vite.ssrLoadModule('/server/entry-server.tsx'))
        .render;
    } else {
      htmlTemplate = context.template;
      render = context.serverRender!;
    }

    const { html } = await render(props);
    // 優化：只在列表頁傳遞必要的摘要資料，詳情頁不傳遞 posts 陣列
    const clientProps: AppProps = (props.page === 'list' || props.page === 'archive')
      ? props 
      : { page: props.page, posts: [], post: props.post };
    
    // 優化：使用單次字串操作減少記憶體分配
    const { title, description } = getMeta(props);
    const escapedTitle = escapeAttr(title);
    const escapedDescription = escapeAttr(description);
    const payload = JSON.stringify(clientProps).replace(/</g, '\\u003c');
    
    // 優化：使用單次 replace 操作（雖然需要多次，但比多次字串連接更高效）
    const response = htmlTemplate
      .replace('%APP_TITLE%', escapedTitle)
      .replace('%APP_DESCRIPTION%', escapedDescription)
      .replace('<!--app-html-->', html)
      .replace('<!--app-data-->', payload);

    res.status(status).setHeader('Content-Type', 'text/html').send(response);
  } catch (error) {
    if (context.vite && error instanceof Error) {
      context.vite.ssrFixStacktrace(error);
    }
    console.error('[server] render failed', error);
    res.status(500).send('Internal Server Error');
  } finally {
    if (shouldClearCaches) {
      clearContentCaches();
    }
  }
}

function getMeta(props: AppProps) {
  if (props.page === 'detail' && props.post) {
    return {
      title: props.post.title,
      description: props.post.summary ?? 'tomslab.dev｜湯編驛 (Tom\'s lab) - 日常編譯開發筆記',
    };
  }

  if (props.page === 'about') {
    return {
      title: '關於我 - tomslab.dev｜湯編驛 (Tom\'s lab)',
      description: '關於 Tom - 日常編譯開發筆記，記錄程式碼與想法的編譯過程',
    };
  }

  if (props.page === 'archive') {
    return {
      title: '文章列表 - tomslab.dev｜湯編驛 (Tom\'s lab)',
      description: '瀏覽全部文章與標籤，快速找到想看的內容',
    };
  }

  return {
    title: 'tomslab.dev｜湯編驛 (Tom\'s lab) - 日常編譯開發筆記',
    description: '日常編譯開發筆記，記錄程式碼與想法的編譯過程',
  };
}

function escapeAttr(value: string) {
  return value.replace(/"/g, '&quot;');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRSSDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = days[date.getUTCDay()];
  const dayNum = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

function generateRSSFeed(posts: PostSummary[], baseUrl: string): string {
  const siteTitle = 'tomslab.dev｜湯編驛 (Tom\'s lab)';
  const siteDescription = '日常編譯開發筆記，記錄程式碼與想法的編譯過程';
  const feedUrl = `${baseUrl}/feed.xml`;
  const siteUrl = baseUrl;
  // lastBuildDate 應該反映 feed 最後更新的時間（當前時間），而不是最新文章的日期
  // 這樣 RSS 閱讀器才能正確偵測到 feed 的更新
  const lastBuildDate = formatRSSDate(new Date());

  const items = posts.map((post) => {
    const postUrl = `${baseUrl}/posts/${post.slug}`;
    const pubDate = formatRSSDate(post.date);
    const description = post.summary ? escapeXml(post.summary) : '';
    const title = escapeXml(post.title);

    return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-TW</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}

function resolve(p: string) {
  return path.resolve(ROOT, p);
}

async function start() {
  // 優化記憶體使用：強制垃圾回收（如果可用）
  const gc = (global as { gc?: () => void }).gc;
  if (isLowMemoryMode && gc && typeof gc === 'function') {
    // 定期執行垃圾回收以釋放記憶體（在低記憶體模式下更頻繁）
    setInterval(() => {
      try {
        gc();
      } catch (e) {
        // 忽略錯誤
      }
    }, 10000); // 每 10 秒執行一次（從 20 秒改為 10 秒以保持記憶體低水位）
  } else if (gc && typeof gc === 'function') {
    // 非低記憶體模式下也定期清理，但頻率較低
    setInterval(() => {
      try {
        gc();
      } catch (e) {
        // 忽略錯誤
      }
    }, 60000); // 每 60 秒執行一次
  }
  
  const app = await createServer();
  app.listen(PORT, () => {
    console.log(`✅ React SSR blog running on http://localhost:${PORT}`);
    if (isLowMemoryMode) {
      console.log('💾 Low memory mode enabled');
    }
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
