import type { PostSummary } from '../../shared/types.js';
import { loadPostSummaries } from '../content.js';
import { escapeXml } from './seoUtils.js';

export async function buildFeedXml(baseUrl: string): Promise<string> {
  const posts = await loadPostSummaries();
  return generateRSSFeed(posts, baseUrl);
}

function generateRSSFeed(posts: PostSummary[], baseUrl: string): string {
  const siteTitle = "tomslab.dev｜湯編驛 (Tom's lab)";
  const siteDescription = '開發筆記，記錄程式碼與想法的實踐過程';
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
