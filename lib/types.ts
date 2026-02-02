/**
 * 文章分類，限制為以下幾種
 */
export type PostCategory = 'Blog' | 'Tech' | 'Note' | 'Project' | 'Tutorial' | 'Lab';

export const VALID_CATEGORIES: readonly PostCategory[] = ['Blog', 'Tech', 'Note', 'Project', 'Tutorial', 'Lab'] as const;

export interface PostSummary {
  slug: string;
  title: string;
  date: Date;
  lastUpdated: Date;
  summary: string | null;
  category: PostCategory | null;
  tags: string[];
  readingMinutes: number | null;
  readingTime?: string;
  image: string | null;
  featured?: boolean;
}

export interface Post extends PostSummary {
  contentHtml: string;
}

export interface SiteConfig {
  showFilters?: boolean;
}
