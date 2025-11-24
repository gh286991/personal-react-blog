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

    // 生成 Google Tag Manager 腳本（如果環境變數存在）
    const gtmId = process.env.GTM_ID;
    const gtmScript = gtmId
      ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});</script>`
      : '';
    const gtmNoscript = gtmId
      ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeAttr(gtmId)}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
      : '';

    // 生成 Google Analytics 腳本（如果環境變數存在）
    // 使用 Consent Mode v2，預設拒絕所有 consent，等待用戶同意
    const gaId = process.env.GA_ID;
    const gaScript = gaId
      ? `<script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      
      // 設定預設的 consent mode（在載入 gtag.js 之前）
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'wait_for_update': 500
      });
      
      // 檢查是否有已儲存的同意設定
      (function() {
        try {
          const savedConsent = localStorage.getItem('ga_consent');
          if (savedConsent) {
            const consent = JSON.parse(savedConsent);
            if (consent.preferences) {
              gtag('consent', 'update', {
                'analytics_storage': consent.preferences.analytics_storage || 'denied',
                'ad_storage': consent.preferences.ad_storage || 'denied',
                'ad_user_data': consent.preferences.ad_user_data || 'denied',
                'ad_personalization': consent.preferences.ad_personalization || 'denied'
              });
            }
          }
        } catch (e) {
          console.warn('Failed to load consent preferences:', e);
        }
      })();
      
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(gaId)});
    </script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(gaId)}"></script>`
      : '';

    // 優化：一次性替換所有模板變數，減少字串操作
    const response = htmlTemplate
      .replace('%APP_TITLE%', escapedTitle)
      .replace('%APP_DESCRIPTION%', escapedDescription)
      .replace('%APP_KEYWORDS%', escapedKeywords)
      .replace('%GTM_SCRIPT%', gtmScript)
      .replace('%GTM_NOSCRIPT%', gtmNoscript)
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
