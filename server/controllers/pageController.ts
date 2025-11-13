import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import type { ViteDevServer } from 'vite';

import { clearContentCaches, isLowMemoryMode } from '../content.js';
import type { AppProps } from '../../shared/types.js';
import { matchRoute } from '../../frontend/router.js';
import { buildFeedXml, buildRouteData, resolveMeta } from '../services/pageService.js';

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

    const { title, description } = resolveMeta(props);
    const escapedTitle = escapeAttr(title);
    const escapedDescription = escapeAttr(description);
    const payload = JSON.stringify(clientProps).replace(/</g, '\\u003c');

    // 優化：一次性替換所有模板變數，減少字串操作
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

function resolvePath(p: string) {
  return path.resolve(ROOT, p);
}

function escapeAttr(value: string) {
  return value.replace(/"/g, '&quot;');
}
