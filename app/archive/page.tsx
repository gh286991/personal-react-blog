import { getAllPosts } from '@/lib/content';
import { PostList } from '@/app/components/PostList';

export default async function ArchivePage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
       <header className="mb-12 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">文章列表</h1>
        <p className="text-gray-600 dark:text-gray-400">
          瀏覽全部 {posts.length} 篇文章
        </p>
      </header>
      
      <main>
        <PostList posts={posts} />
      </main>
    </div>
  );
}
