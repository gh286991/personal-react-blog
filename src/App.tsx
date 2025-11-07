import type { Post } from './content';
import type { AppProps } from './types';
import { Layout } from './components/Layout';
import { PostList } from './components/PostList';
import { PostPage } from './components/PostPage';

export function App({ page, posts, post }: AppProps) {
  const isList = page === 'list';
  const pageTitle = isList ? '技術思考與實踐分享' : post?.title ?? '文章未找到';
  const description = isList
    ? '分享前端架構、效能優化與開發實踐的深度思考'
    : post?.summary ?? '找不到文章內容';

  return (
    <Layout title={pageTitle} description={description} variant={isList ? 'hero' : 'minimal'}>
      {isList && <PostList posts={posts} />}
      {!isList && post && <PostPage post={post} />}
      {!isList && !post && <p>找不到文章，請回到首頁。</p>}
    </Layout>
  );
}

export default App;
