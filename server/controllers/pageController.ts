import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import type { ViteDevServer } from 'vite';

import { clearContentCaches, isLowMemoryMode } from '../content.js';
import type { AppProps } from '../../shared/types.js';
import { matchRoute } from '../../frontend/router.js';
import { buildFeedXml } from '../services/feedService.js';
import { buildRobotsTxt, buildSitemapXml } from '../services/sitemapService.js';
import { buildRouteData } from '../services/routeDataService.js';
import { buildArticleJsonLd, resolveMeta } from '../services/metaService.js';

const ROOT = process.cwd();

export interface RenderContext {
  vite?: ViteDevServer;
  template: string;
  serverRender?: (props: AppProps) => Promise<{ html: string }>;
}

export function createFeedController() {
  return async (req: Request, res: Response) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      const rssXml = await buildFeedXml(baseUrl);
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(rssXml);
    } catch (error) {
      console.error('[server] RSS feed generation failed', error);
      res.status(500).send('Internal Server Error');
    }
  };
}

export function createSitemapController() {
  return async (req: Request, res: Response) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      const sitemap = await buildSitemapXml(baseUrl);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.send(sitemap);
    } catch (error) {
      console.error('[server] Sitemap generation failed', error);
      res.status(500).send('Internal Server Error');
    }
  };
}

export function createRobotsController() {
  return async (req: Request, res: Response) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;
      const robots = buildRobotsTxt(baseUrl);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(robots);
    } catch (error) {
      console.error('[server] Robots.txt generation failed', error);
      res.status(500).send('Internal Server Error');
    }
  };
}

export function createSSRController(context: RenderContext) {
  return async (req: Request, res: Response) => {
    const route = matchRoute(req.path);
    const { props, status } = await buildRouteData(route);
    await renderPage(req, res, status, props, context);
  };
}

async function renderPage(
  req: Request,
  res: Response,
  status: number,
  props: AppProps,
  context: RenderContext,
) {
  const shouldClearCaches = isLowMemoryMode;
  const protocol = req.protocol;
  const host = req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  try {
    let htmlTemplate: string;
    let render: (props: AppProps) => Promise<{ html: string }>;

    if (context.vite) {
      const rawTemplate = fs.readFileSync(resolvePath('index.html'), 'utf-8');
      htmlTemplate = await context.vite.transformIndexHtml(
        req.originalUrl,
        rawTemplate,
      );
      render = (await context.vite.ssrLoadModule('/frontend/entry-server.tsx'))
        .render;
    } else {
      htmlTemplate = context.template;
      render = context.serverRender!;
    }

    const { html } = await render(props);
    const shouldIncludePosts =
      props.route.kind === 'list' || props.route.kind === 'archive';
    const clientProps: AppProps = shouldIncludePosts
      ? props
      : { route: props.route, posts: [], post: props.post };

    const { title, description, keywords } = resolveMeta(props);
    const structuredData =
      props.route.kind === 'detail' && props.post
        ? buildArticleJsonLd(props.post, baseUrl)
        : null;
    const escapedTitle = escapeAttr(title);
    const escapedDescription = escapeAttr(description);
    const escapedKeywords = escapeAttr(keywords);
    const payload = JSON.stringify(clientProps).replace(/</g, '\\u003c');

    // 生成 Google Analytics 腳本（如果環境變數存在）
    const gaId = process.env.GA_ID;
    const gaScript = gaId
      ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(gaId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(gaId)});
    </script>`
      : '';

    // 優化：一次性替換所有模板變數，減少字串操作
    const response = htmlTemplate
      .replace('%APP_TITLE%', escapedTitle)
      .replace('%APP_DESCRIPTION%', escapedDescription)
      .replace('%APP_KEYWORDS%', escapedKeywords)
      .replace('%GA_SCRIPT%', gaScript)
      .replace('<!--app-html-->', html)
      .replace('<!--app-data-->', payload);

    const finalResponse =
      structuredData && response.includes('</head>')
        ? response.replace(
            '</head>',
            `<script type="application/ld+json">${structuredData}</script></head>`,
          )
        : response;

    res.status(status).setHeader('Content-Type', 'text/html').send(finalResponse);
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

function resolvePath(p: string) {
  return path.resolve(ROOT, p);
}

function escapeAttr(value: string) {
  return value.replace(/"/g, '&quot;');
}
