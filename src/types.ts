import type { Post, PostSummary } from './content';

export type PageKind = 'list' | 'detail' | 'not-found';

export interface AppProps {
  page: PageKind;
  posts: PostSummary[];
  post?: Post | null;
}
