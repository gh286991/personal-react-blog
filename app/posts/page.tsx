import { getAllPosts } from '@/lib/content';
import { PostArchive } from '@/app/components/PostArchive';

export const metadata = {
  title: '文章列表 | 湯編驛',
  description: '此處記錄了所有的開發筆記、技術文章與想法。',
};

export default async function PostsPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PostArchive posts={posts} />
    </div>
  );
}
