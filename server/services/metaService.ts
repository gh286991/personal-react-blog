import type { AppProps, Post } from '../../shared/types.js';
import { toAbsoluteUrl } from './seoUtils.js';

const BASE_META_KEYWORDS = [
  'tomslab.dev',
  '湯編驛',
  "Tom's lab",
  '開發筆記',
  '工程師日記',
  'React SSR Blog',
];

export interface MetaInfo {
  title: string;
  description: string;
  keywords: string;
}

export function resolveMeta(props: AppProps): MetaInfo {
  const page = props.route.kind;
  const buildKeywords = (extra: Array<string | null | undefined> = []) => {
    const normalized = [...BASE_META_KEYWORDS, ...extra]
      .map((keyword) => (keyword ?? '').trim())
      .filter((keyword) => keyword.length > 0);
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const keyword of normalized) {
      const key = keyword.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(keyword);
      }
    }
    return unique.join(', ');
  };

  if (page === 'detail' && props.post) {
    const description =
      props.post.summary ??
      `${props.post.title} - tomslab.dev｜湯編驛 (Tom's lab)`;
    const keywords = buildKeywords([
      props.post.title,
      props.post.category,
      ...props.post.tags,
    ]);
    return {
      title: props.post.title,
      description,
      keywords,
    };
  }

  if (page === 'static') {
    if (props.route.staticPage === 'about') {
      return {
        title: "關於我 - tomslab.dev｜湯編驛 (Tom's lab)",
        description:
          '關於 Tom - 開發筆記，記錄程式碼與想法的實踐過程',
        keywords: buildKeywords(['關於我', 'Tom', '關於 湯編驛']),
      };
    }
    if (props.route.staticPage === 'works') {
      return {
        title: "項目＆Lab - tomslab.dev｜湯編驛 (Tom's lab)",
        description:
          '把會上線的項目與湯編驛實驗室的原型分開記錄，快速掌握每個點子的進度',
        keywords: buildKeywords(['作品', 'Project', 'Lab', 'Side Project']),
      };
    }
    return {
      title: "靜態頁面 - tomslab.dev｜湯編驛 (Tom's lab)",
      description: '靜態內容頁面',
      keywords: buildKeywords(),
    };
  }

  if (page === 'archive') {
    return {
      title: "文章列表 - tomslab.dev｜湯編驛 (Tom's lab)",
      description: '瀏覽全部文章與標籤，快速找到想看的內容',
      keywords: buildKeywords(['文章列表', '開發文章', '技術筆記']),
    };
  }

  return {
    title: "tomslab.dev｜湯編驛 (Tom's lab) - 開發筆記",
    description: '開發筆記，記錄程式碼與想法的實踐過程',
    keywords: buildKeywords(['React', '前端', '後端', 'TypeScript']),
  };
}

export function buildArticleJsonLd(post: Post, baseUrl: string): string {
  const url = `${baseUrl}/posts/${post.slug}`;
  const description =
    post.summary ?? `${post.title} - tomslab.dev｜湯編驛 (Tom's lab)`;
  const imageUrl = toAbsoluteUrl(baseUrl, post.image);
  const logoUrl = `${baseUrl}/favicon.svg`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: post.date.toISOString(),
    dateModified: post.lastUpdated.toISOString(),
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: 'Tom',
      url: `${baseUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: '湯編驛 (Tom\'s lab)',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
