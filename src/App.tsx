import type { Post } from './content';
import type { AppProps } from './types';
import { Layout } from './page/Layout';
import { PostList } from './page/PostList';
import { PostPage } from './page/PostPage';

export function App({ page, posts, post }: AppProps) {
  const isList = page === 'list';
  const pageTitle = isList ? '日編驛' : post?.title ?? '文章未找到';
  const description = isList
    ? '日常編譯開發筆記，記錄程式碼與想法的編譯過程'
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
