import type { Post, PostSummary } from './content';
import { Layout } from './components/Layout';
import { PostList } from './components/PostList';
import { PostPage } from './components/PostPage';

export type PageKind = 'list' | 'detail' | 'not-found';

export interface AppProps {
  page: PageKind;
  posts: PostSummary[];
  post?: Post | null;
}

export function App({ page, posts, post }: AppProps) {
  const isList = page === 'list';
  const pageTitle = isList ? '我的極簡 React 部落格' : post?.title ?? '文章未找到';
  const description = isList
    ? '用 React + Express 打造的 Markdown SSR 部落格ㄒfddfdf'
    : post?.summary ?? '找不到文章內容';

  return (
    <Layout title={pageTitle} description={description}>
      {isList && <PostList posts={posts} />}
      {!isList && post && <PostPage post={post} />}
      {!isList && !post && <p>找不到文章，請回到首頁。</p>}
    </Layout>
  );
}

export default App;
