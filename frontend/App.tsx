import type { AppProps } from '../shared/types.js';
import { Layout } from './page/Layout.js';
import { PostList } from './page/PostList.js';
import { PostPage } from './page/PostPage.js';
import { AboutPage } from './page/AboutPage.js';

export function App({ page, posts, post }: AppProps) {
  const isList = page === 'list';
  const isAbout = page === 'about';
  
  let pageTitle: string;
  let description: string;
  
  if (isList) {
    pageTitle = '日編驛';
    description = '日常編譯開發筆記，記錄程式碼與想法的編譯過程';
  } else if (isAbout) {
    pageTitle = '關於我';
    description = '日常編譯開發筆記，記錄程式碼與想法的編譯過程';
  } else {
    pageTitle = post?.title ?? '文章未找到';
    description = post?.summary ?? '找不到文章內容';
  }

  return (
    <Layout title={pageTitle} description={description} variant={isList ? 'hero' : 'minimal'}>
      {isList && <PostList posts={posts} />}
      {isAbout && <AboutPage />}
      {!isList && !isAbout && post && <PostPage post={post} />}
      {!isList && !isAbout && !post && <p>找不到文章，請回到首頁。</p>}
    </Layout>
  );
}

export default App;
