import type { AppProps } from '../shared/types.js';
import { Layout } from './page/Layout.js';
import { PostList } from './page/PostList.js';
import { PostPage } from './page/PostPage.js';
import { AboutPage } from './page/AboutPage.js';
import { WorksPage } from './page/WorksPage.js';

export function App({ route, posts, post, config }: AppProps) {
  const page = route.kind;
  const isList = page === 'list';
  const isStatic = page === 'static';
  const staticPage = route.staticPage;
  const isAbout = isStatic && staticPage === 'about';
  const isWorks = isStatic && staticPage === 'works';
  const isArchive = page === 'archive';
  const isDetail = page === 'detail';
  
  let pageTitle: string;
  let description: string;
  
  if (isList) {
    pageTitle = '湯編驛';
    description = '開發筆記，記錄程式碼與想法的實踐過程';
  } else if (isArchive) {
    pageTitle = '文章列表';
    description = '瀏覽全部文章與標籤，快速找到想看的內容';
  } else if (isStatic) {
    if (isAbout) {
      pageTitle = '關於我';
      description = '開發筆記，記錄程式碼與想法的實踐過程';
    } else if (isWorks) {
      pageTitle = '項目 / Lab';
      description = 'MVP 產品與實驗室專案展示';
    } else {
      pageTitle = '靜態頁面';
      description = '網站靜態內容';
    }
  } else {
    pageTitle = post?.title ?? '文章未找到';
    description = post?.summary ?? '找不到文章內容';
  }

  return (
    <Layout 
      title={pageTitle} 
      description={description} 
      variant={isList ? 'hero' : 'minimal'}
      showSidebar={isList}
      showBackLink={isDetail}
    >
      {isList && <PostList posts={posts} showFilters={config?.showFilters ?? false} />}
      {isArchive && <PostList posts={posts} showFilters={true} />}
      {isAbout && <AboutPage />}
      {isWorks && <WorksPage />}
      {isDetail && post && <PostPage post={post} />}
      {isDetail && !post && <p>找不到文章，請回到首頁。</p>}
      {!isList && !isArchive && !isStatic && !isDetail && <p>找不到文章，請回到首頁。</p>}
    </Layout>
  );
}

export default App;
