export type PageKind = 'list' | 'detail' | 'about' | 'not-found';

export interface PostSummary {
  slug: string;
  title: string;
  date: Date;
  lastUpdated: Date;
  summary: string | null;
  category: string | null;
  tags: string[];
  readingMinutes: number | null;
}

export interface Post extends PostSummary {
  contentHtml: string;
}

export interface AppProps {
  page: PageKind;
  posts: PostSummary[];
  post?: Post | null;
}
