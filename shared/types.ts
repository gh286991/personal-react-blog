/**
 * App-level route categories. Determines layout variant and data needs.
 * - list: homepage listing
 * - archive: all posts index
 * - detail: single post view (requires slug)
 * - static: static content pages (e.g. About)
 * - not-found: fallback routes
 */
export type RouteCategory = 'list' | 'archive' | 'detail' | 'static' | 'not-found';

export type StaticPageId = 'about';

/**
 * 文章分類，限制為以下幾種
 */
export type PostCategory = 'Blog' | 'Tech' | 'Note' | 'Project' | 'Tutorial';

export interface RouteMatch {
  kind: RouteCategory;
  slug?: string;
  staticPage?: StaticPageId;
}

export interface PostSummary {
  slug: string;
  title: string;
  date: Date;
  lastUpdated: Date;
  summary: string | null;
  category: PostCategory | null;
  tags: string[];
  readingMinutes: number | null;
  featured?: boolean;
}

export interface Post extends PostSummary {
  contentHtml: string;
}

export interface SiteConfig {
  showFilters?: boolean;
}

export interface AppProps {
  route: RouteMatch;
  posts: PostSummary[];
  post?: Post | null;
  config?: SiteConfig;
}
