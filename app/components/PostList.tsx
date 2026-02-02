import Link from 'next/link';
import { PostSummary } from '@/lib/types';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

interface PostListProps {
  posts: PostSummary[];
  isHome?: boolean;
}

export function PostList({ posts, isHome = false }: PostListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto max-w-6xl mx-auto w-full px-4 sm:px-0">
      {posts.map((post, index) => {
        // Bento Box sizing logic: first post is large, others are normal
        const isFeatured = isHome && index === 0;
        
        return (
          <article 
            key={post.slug} 
            className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-[1.02] hover:-translate-y-1 flex flex-col ${
              isFeatured ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <Link href={`/posts/${post.slug}`} className="block h-full flex flex-col">
               {/* Gradient Top Border (Restored) */}
               <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
               
               {/* Hover Glow Effect (Restored) */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className={`relative p-6 ${isFeatured ? 'md:p-10' : 'md:p-6'} h-full flex flex-col`}>
                <header className="flex items-start gap-4 mb-4 relative z-10">
                   {/* Big Decorative First Letter (Restored) */}
                   <div className={`flex-shrink-0 font-bold gradient-text italic opacity-40 group-hover:opacity-70 transition-opacity leading-none select-none ${
                     isFeatured ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'
                   }`}>
                      {post.title.charAt(0)}
                   </div>

                   <div className="flex-1 min-w-0">
                      <h2 className={`font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                        isFeatured ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'
                      }`}>
                        {post.title.substring(1)}
                      </h2>
                      
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-mono">
                        <time dateTime={post.date.toString()}>
                          {format(new Date(post.date), 'yyyy-MM-dd')}
                        </time>
                        {post.readingTime && (
                           <>
                             <span>·</span>
                             <span className="flex items-center gap-1">
                               {post.readingTime}
                             </span>
                           </>
                        )}
                      </div>
                   </div>
                </header>

                <p className={`text-slate-600 dark:text-slate-300 mb-6 leading-relaxed flex-1 relative z-10 ${
                  isFeatured ? 'text-base md:text-lg' : 'text-sm md:text-base line-clamp-3'
                }`}>
                  {post.summary}
                </p>
                
                {/* Footer with Category and Tags (Restored Style) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-auto relative z-10 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                     {post.category && (
                       <span className="inline-flex items-center px-2.5 py-0.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm">
                         {post.category}
                       </span>
                     )}
                     {post.tags && post.tags.slice(0, 3).map(tag => (
                       <span key={tag} className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-700/50">
                         #{tag}
                       </span>
                     ))}
                  </div>

                  <div className="hidden sm:inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:gap-3 transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    <span>閱讀更多</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
