import type { PostSummary } from '../../shared/types.js';
import { loadPostSummaries } from '../content.js';
import { escapeXml, formatISODate } from './seoUtils.js';

export async function buildSitemapXml(baseUrl: string): Promise<string> {
  const posts = await loadPostSummaries();
  const staticRoutes: Array<{
    loc: string;
    changefreq?: string;
    priority?: string;
    lastmod?: string;
  }> = [
    { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
    { loc: `${baseUrl}/posts`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${baseUrl}/works`, changefreq: 'monthly', priority: '0.6' },
  ];

  const postRoutes = posts.map((post: PostSummary) => {
    const lastmod = formatISODate(post.lastUpdated ?? post.date);
    return {
      loc: `${baseUrl}/posts/${post.slug}`,
      lastmod,
      changefreq: 'monthly',
      priority: '0.7',
    };
  });

  const urlEntries = [...staticRoutes, ...postRoutes]
    .map((url) => {
      const parts = [
        '  <url>',
        `    <loc>${escapeXml(url.loc)}</loc>`,
        url.lastmod ? `    <lastmod>${url.lastmod}</lastmod>` : null,
        url.changefreq ? `    <changefreq>${url.changefreq}</changefreq>` : null,
        url.priority ? `    <priority>${url.priority}</priority>` : null,
        '  </url>',
      ].filter(Boolean);
      return parts.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
}

export function buildRobotsTxt(baseUrl: string): string {
  const lines = ['User-agent: *', 'Allow: /', `Sitemap: ${baseUrl}/sitemap.xml`];
  return lines.join('\n');
}
