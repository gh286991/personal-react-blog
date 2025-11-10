import type { AppProps } from '../shared/types.js';
import { Layout } from './page/Layout.js';
import { PostList } from './page/PostList.js';
import { PostPage } from './page/PostPage.js';
import { AboutPage } from './page/AboutPage.js';

export function App({ page, posts, post }: AppProps) {
  const isList = page === 'list';
  const isAbout = page === 'about';
  const isArchive = page === 'archive';
  
  let pageTitle: string;
  let description: string;
  
  if (isList) {
    pageTitle = '湯編驛';
    description = '日常編譯開發筆記，記錄程式碼與想法的編譯過程';
  } else if (isArchive) {
    pageTitle = '文章列表';
    description = '瀏覽全部文章與標籤，快速找到想看的內容';
  } else if (isAbout) {
    pageTitle = '關於我';
    description = '日常編譯開發筆記，記錄程式碼與想法的編譯過程';
  } else {
    pageTitle = post?.title ?? '文章未找到';
    description = post?.summary ?? '找不到文章內容';
  }

  return (
    <Layout title={pageTitle} description={description} variant={isList ? 'hero' : 'minimal'}>
      {(isList || isArchive) && <PostList posts={posts} />}
      {isAbout && <AboutPage />}
      {!isList && !isArchive && !isAbout && post && <PostPage post={post} />}
      {!isList && !isArchive && !isAbout && !post && <p>找不到文章，請回到首頁。</p>}
    </Layout>
  );
}

export default App;
