import fs from 'node:fs';
import path from 'node:path';
import type { Request } from 'express';
import type { ViteDevServer } from 'vite';

import { clearContentCaches, isLowMemoryMode } from '../content.js';
import type { AppProps } from '../../shared/types.js';
import { buildArticleJsonLd, resolveMeta } from './metaService.js';
import { escapeAttr } from '../utils/htmlUtils.js';
import {
  buildGaSnippet,
  buildGtmSnippets,
} from './trackingScriptService.js';

const ROOT = process.cwd();

export interface RenderContext {
  vite?: ViteDevServer;
  template: string;
  serverRender?: (props: AppProps) => Promise<{ html: string }>;
}

export interface RenderPageOptions {
  req: Request;
  props: AppProps;
  context: RenderContext;
}

export function getBaseUrl(req: Request) {
  const protocol = req.protocol;
  const host = req.get('host') || 'localhost:3000';
  return `${protocol}://${host}`;
}

export async function renderPageHtml({
  req,
  props,
  context,
}: RenderPageOptions) {
  const shouldClearCaches = isLowMemoryMode;
  const baseUrl = getBaseUrl(req);

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

    const { gtmScript, gtmNoscript } = buildGtmSnippets(process.env.GTM_ID);
    const gaScript = buildGaSnippet(process.env.GA_ID);

    // 定義所有需要替換的模板變數
    const templateReplacements: Record<string, string> = {
      '%APP_TITLE%': escapedTitle,
      '%APP_DESCRIPTION%': escapedDescription,
      '%APP_KEYWORDS%': escapedKeywords,
      '%GTM_SCRIPT%': gtmScript,
      '%GTM_NOSCRIPT%': gtmNoscript,
      '%GA_SCRIPT%': gaScript,
      '<!--app-html-->': html,
      '<!--app-data-->': payload,
    };

    // 一次性替換所有模板變數
    const response = Object.entries(templateReplacements).reduce(
      (acc, [placeholder, value]) => acc.replace(placeholder, value),
      htmlTemplate,
    );

    const finalResponse =
      structuredData && response.includes('</head>')
        ? response.replace(
            '</head>',
            `<script type="application/ld+json">${structuredData}</script></head>`,
          )
        : response;

    return finalResponse;
  } finally {
    if (shouldClearCaches) {
      clearContentCaches();
    }
  }
}

function resolvePath(p: string) {
  return path.resolve(ROOT, p);
}
