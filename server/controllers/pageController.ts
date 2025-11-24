import type { Request, Response } from 'express';
import { matchRoute } from '../../frontend/router.js';
import { buildFeedXml } from '../services/feedService.js';
import { buildRobotsTxt, buildSitemapXml } from '../services/sitemapService.js';
import { buildRouteData } from '../services/routeDataService.js';
import {
  getBaseUrl,
  renderPageHtml,
  type RenderContext,
} from '../services/pageService.js';

export function createFeedController() {
  return async (req: Request, res: Response) => {
    try {
      const baseUrl = getBaseUrl(req);
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
      const baseUrl = getBaseUrl(req);
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
      const baseUrl = getBaseUrl(req);
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
    try {
      const route = matchRoute(req.path);
      const { props, status } = await buildRouteData(route);
      const html = await renderPageHtml({ req, props, context });
      res.status(status).setHeader('Content-Type', 'text/html').send(html);
    } catch (error) {
      if (context.vite && error instanceof Error) {
        context.vite.ssrFixStacktrace(error);
      }
      console.error('[server] render failed', error);
      res.status(500).send('Internal Server Error');
    }
  };
}
