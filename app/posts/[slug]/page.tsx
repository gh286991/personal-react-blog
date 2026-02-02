import { getPostBySlug, getAllPosts } from '@/lib/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { BuyMeACoffee } from '@/app/components/BuyMeACoffee';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 pt-6 sm:pt-10">
      <div className="max-w-4xl mx-auto">
        {/* Main Content Card */}
        <article className="glass rounded-[2rem] sm:rounded-[2.5rem] shadow-xl overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80">
          {/* Top blue accent line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-blue-600 absolute top-0 left-0 right-0" />
          
          <div className="px-6 py-10 sm:px-12 sm:py-16 md:px-16">
            <header className="mb-12 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 font-mono tracking-wide">
                <time dateTime={post.date.toString()}>
                   {format(new Date(post.date), 'yyyy-MM-dd')}
                </time>
                {post.category && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                    <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs">
                      {post.category}
                    </span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.15] mb-8 tracking-tight">
                {post.title}
              </h1>

              {post.image && (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-200/50 dark:border-slate-700/50 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                </div>
              )}
            </header>
            
            <div 
              className="prose prose-lg dark:prose-invert prose-slate max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                prose-p:leading-8 prose-p:text-slate-600 dark:prose-p:text-slate-300
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
            
            <hr className="my-12 border-slate-200 dark:border-slate-700/50" />
            <BuyMeACoffee />
          </div>
        </article>
      </div>
    </div>
  );
}
