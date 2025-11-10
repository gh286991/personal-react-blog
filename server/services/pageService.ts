import type { AppProps, RouteMatch } from '../../shared/types.js';
import type { PostSummary } from '../../shared/types.js';
import { loadPost, loadPostSummaries } from '../../shared/content.js';

export interface RouteDataResult {
  props: AppProps;
  status: number;
}

export async function buildRouteData(route: RouteMatch): Promise<RouteDataResult> {
  if (route.kind === 'list' || route.kind === 'archive') {
    const posts = await loadPostSummaries();
    return {
      status: 200,
      props: { route, posts, post: null },
    };
  }

  if (route.kind === 'detail') {
    if (!route.slug) {
      return {
        status: 404,
        props: { route: { kind: 'not-found' }, posts: [], post: null },
      };
    }
    const post = await loadPost(route.slug);
    if (!post) {
      return {
        status: 404,
        props: { route: { kind: 'not-found' }, posts: [], post: null },
      };
    }
    return {
      status: 200,
      props: { route, posts: [], post },
    };
  }

  if (route.kind === 'static') {
    return {
      status: 200,
      props: { route, posts: [], post: null },
    };
  }

  return {
    status: 404,
    props: { route: { kind: 'not-found' }, posts: [], post: null },
  };
}

export function resolveMeta(props: AppProps) {
  const page = props.route.kind;
  if (page === 'detail' && props.post) {
    return {
      title: props.post.title,
      description:
        props.post.summary ??
        "tomslab.dev｜湯編驛 (Tom's lab) - 日常編譯開發筆記",
    };
  }

  if (page === 'static') {
    if (props.route.staticPage === 'about') {
      return {
        title: "關於我 - tomslab.dev｜湯編驛 (Tom's lab)",
        description:
          '關於 Tom - 日常編譯開發筆記，記錄程式碼與想法的編譯過程',
      };
    }
    return {
      title: "靜態頁面 - tomslab.dev｜湯編驛 (Tom's lab)",
      description: '靜態內容頁面',
    };
  }

  if (page === 'archive') {
    return {
      title: "文章列表 - tomslab.dev｜湯編驛 (Tom's lab)",
      description: '瀏覽全部文章與標籤，快速找到想看的內容',
    };
  }

  return {
    title: "tomslab.dev｜湯編驛 (Tom's lab) - 日常編譯開發筆記",
    description: '日常編譯開發筆記，記錄程式碼與想法的編譯過程',
  };
}

export async function buildFeedXml(baseUrl: string): Promise<string> {
  const posts = await loadPostSummaries();
  return generateRSSFeed(posts, baseUrl);
}

function generateRSSFeed(posts: PostSummary[], baseUrl: string): string {
  const siteTitle = "tomslab.dev｜湯編驛 (Tom's lab)";
  const siteDescription = '日常編譯開發筆記，記錄程式碼與想法的編譯過程';
  const feedUrl = `${baseUrl}/feed.xml`;
  const siteUrl = baseUrl;
  const lastBuildDate = formatRSSDate(new Date());

  const items = posts
    .map((post) => {
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
    })
    .join('\n');

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

function formatRSSDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = days[date.getUTCDay()];
  const dayNum = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${day}, ${dayNum} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
