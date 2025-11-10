import { useEffect, useMemo, useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import type { PostSummary } from '../../shared/types.js';

interface PostListProps {
  posts: PostSummary[];
}

const PAGE_SIZE = 6;

export function PostList({ posts }: PostListProps) {
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of posts) {
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hant'));
  }, [posts]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of posts) {
      const category = post.category ?? '未分類';
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'zh-Hant'));
  }, [posts]);

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [selectedTag, selectedCategory]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      setIsFilterPanelOpen(mediaQuery.matches);
    };
    handleChange();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const filteredPosts = posts.filter((post) => {
    const tagMatch = selectedTag === 'all' || post.tags.includes(selectedTag);
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    return tagMatch && categoryMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const pagePosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 md:space-y-12">
      {/* Filters Section with Modern Pill Design */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 md:p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between md:hidden">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">篩選條件</p>
          <button
            type="button"
            onClick={() => setIsFilterPanelOpen((prev) => !prev)}
            className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary-100 dark:border-primary-900/40 text-primary-600 dark:text-primary-300 bg-primary-50/60 dark:bg-primary-900/20 transition-colors ${isFilterPanelOpen ? 'shadow-inner' : ''}`}
            aria-expanded={isFilterPanelOpen}
            aria-controls="filters-panel"
            aria-label={isFilterPanelOpen ? '收合篩選' : '展開篩選'}
          >
            <Filter className={`w-4 h-4 transition-transform ${isFilterPanelOpen ? '' : 'rotate-90'}`} />
          </button>
        </div>
        <div
          id="filters-panel"
          className={`${isFilterPanelOpen ? 'mt-2' : 'mt-0 hidden'} md:mt-0 md:block`}
        >
          <div className="space-y-6">
          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider gradient-text mb-4">
              標籤篩選
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                  selectedTag === 'all'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                全部
              </button>
              {tagStats.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    selectedTag === tag
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tag} <span className="opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider gradient-text mb-4">
              分類篩選
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                全部
              </button>
              {categoryStats.map(({ category, count }) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {category} <span className="opacity-70">({count})</span>
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Posts Grid - Bento Box Layout */}
      {pagePosts.length === 0 ? (
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 md:p-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <FileText className="w-48 h-48" />
          </div>
          <p className="relative text-lg text-slate-600 dark:text-slate-400">
            還沒有符合篩選條件的文章！試著切換標籤或分類看看。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {pagePosts.map((post, index) => {
            // Bento Box sizing logic: first post is large, others are normal
            const isLarge = index === 0;
            const gridClass = isLarge 
              ? 'md:col-span-2 md:row-span-2' 
              : '';

            return (
              <article
                key={post.slug}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up ${gridClass}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className={`relative p-6 ${isLarge ? 'md:p-10' : 'md:p-6'} h-full flex flex-col`}>
                  {/* Header with Number Badge */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 ${isLarge ? 'text-5xl md:text-6xl' : 'text-3xl md:text-4xl'} font-bold gradient-text italic opacity-40 group-hover:opacity-70 transition-opacity`}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`${isLarge ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'} font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight`}>
                        <a
                          href={`/posts/${post.slug}`}
                          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {post.title}
                        </a>
                      </h2>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <time dateTime={post.date.toISOString()}>
                          {post.date.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                        {post.readingMinutes && (
                          <>
                            <span>·</span>
                            <span>{post.readingMinutes} 分鐘</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  {post.summary && (
                    <p className={`${isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base'} text-slate-600 dark:text-slate-300 mb-6 leading-relaxed flex-1`}>
                      {post.summary}
                    </p>
                  )}

                  {/* Footer with Category and Tags */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm">
                        {post.category ?? '未分類'}
                      </span>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-lg border border-primary-200 dark:border-primary-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={`/posts/${post.slug}`}
                      className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:gap-3 transition-all duration-300 group-hover:text-primary-700 dark:group-hover:text-primary-300"
                    >
                      <span>閱讀更多</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination with Modern Design */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8">
        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          共 <span className="font-bold text-primary-600 dark:text-primary-400">{filteredPosts.length}</span> 篇 · 
          第 <span className="font-bold text-primary-600 dark:text-primary-400">{page}</span> / 
          <span className="font-bold text-primary-600 dark:text-primary-400">{totalPages}</span> 頁
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-600 dark:hover:border-primary-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>上一頁</span>
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-600 dark:hover:border-primary-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800"
          >
            <span>下一頁</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
