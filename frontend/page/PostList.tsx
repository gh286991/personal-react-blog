import { useEffect, useMemo, useState } from 'react';
import { FileText, Filter, Star, Folder, ChevronDown, ChevronRight, File } from 'lucide-react';
import type { PostSummary, PostCategory } from '../../shared/types.js';

interface PostListProps {
  posts: PostSummary[];
  showFilters?: boolean;
}


function shouldAnimateOnLoad() {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return true;
  }

  try {
    const entries =
      typeof performance.getEntriesByType === 'function'
        ? (performance.getEntriesByType('navigation') as PerformanceNavigationTiming[])
        : [];
    const navEntry = entries[0];
    if (navEntry?.type) {
      return navEntry.type === 'navigate';
    }
  } catch {
    // ignore and fall back to legacy API
  }

  const legacyNav = performance.navigation;
  if (legacyNav) {
    return legacyNav.type === legacyNav.TYPE_NAVIGATE;
  }

  return true;
}

export function PostList({ posts, showFilters = true }: PostListProps) {
  const tagStats = useMemo(() => {
    if (!showFilters) return [];
    const counts: Record<string, number> = {};
    for (const post of posts) {
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hant'));
  }, [posts, showFilters]);

  const categoryStats = useMemo(() => {
    if (!showFilters) return [];
    const counts: Record<string, number> = {};
    for (const post of posts) {
      const category = post.category ?? '未分類';
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'zh-Hant'));
  }, [posts, showFilters]);

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const cardAnimationClass = shouldAnimate ? 'animate-fade-in-up' : '';

  useEffect(() => {
    setShouldAnimate(shouldAnimateOnLoad());
  }, []);

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

  // 分離推薦文章和普通文章
  const featuredPosts = useMemo(() => {
    return posts.filter((post) => post.featured === true);
  }, [posts]);

  // 如果不需要篩選，直接使用按日期排序的文章（已經在後端排序）
  const filteredPosts = useMemo(() => {
    const allPosts = showFilters
      ? posts.filter((post) => {
          const tagMatch = selectedTag === 'all' || post.tags.includes(selectedTag);
          const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
          return tagMatch && categoryMatch;
        })
      : posts; // 首頁直接顯示所有文章（已按日期排序）
    
    // 排除推薦文章，避免重複顯示
    return allPosts.filter((post) => !post.featured);
  }, [posts, showFilters, selectedTag, selectedCategory]);

  // 按 category 分組文章（目錄式顯示）
  const postsByCategory = useMemo(() => {
    const grouped: Record<string, PostSummary[]> = {};
    
    for (const post of filteredPosts) {
      const category = post.category ?? '未分類';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(post);
    }
    
    // 按 category 順序排序（Blog, Tech, Note, Project, Tutorial, 未分類）
    const categoryOrder: Record<string, number> = {
      'Blog': 1,
      'Tech': 2,
      'Note': 3,
      'Project': 4,
      'Tutorial': 5,
      '未分類': 99,
    };
    
    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const orderA = categoryOrder[a] ?? 50;
        const orderB = categoryOrder[b] ?? 50;
        return orderA - orderB;
      })
      .map(([category, posts]) => ({
        category,
        posts: posts.sort((a, b) => b.date.getTime() - a.date.getTime()), // 每個分類內按日期排序
      }));
  }, [filteredPosts]);

  // 管理摺疊狀態
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // 默認展開所有分類
    return new Set(postsByCategory.map(({ category }) => category));
  });

  // 每個分類顯示的文章數量限制
  const POSTS_PER_CATEGORY = 10;
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleShowAll = (category: string) => {
    setExpandedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 md:space-y-16">
      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && !showFilters && (
        <div className="space-y-4">
          {/* Featured Section Header */}
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-primary-600 dark:text-primary-400 fill-current" />
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              推薦文章
            </h2>
          </div>
          
          {/* Featured Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, index) => (
              <article
                key={post.slug}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-500 hover:scale-[1.02] hover:-translate-y-1 ${cardAnimationClass}`}
                style={shouldAnimate ? { animationDelay: `${index * 100}ms` } : undefined}
              >
                {/* Featured Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-semibold rounded-full shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span>推薦</span>
                  </div>
                </div>

                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600"></div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight">
                      <a
                        href={`/posts/${post.slug}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {post.title}
                      </a>
                    </h3>
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

                  {/* Summary */}
                  {post.summary && (
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mb-6 leading-relaxed flex-1">
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
            ))}
          </div>
        </div>
      )}

      {/* Divider between Featured and Regular Posts */}
      {featuredPosts.length > 0 && !showFilters && filteredPosts.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">所有文章</span>
          </div>
        </div>
      )}

      {/* Filters Section with Modern Pill Design */}
      {showFilters && (
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
      )}

      {/* Posts Display: Card Grid for Home, Tree View for List */}
      {filteredPosts.length === 0 ? (
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 md:p-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <FileText className="w-48 h-48" />
          </div>
          <p className="relative text-lg text-slate-600 dark:text-slate-400">
            還沒有符合篩選條件的文章！試著切換標籤或分類看看。
          </p>
        </div>
      ) : showFilters ? (
        /* Tree View for List Page */
        <div className="space-y-0">
          {postsByCategory.map(({ category, posts: categoryPosts }, categoryIndex) => {
            const isExpanded = expandedCategories.has(category);
            const isLastCategory = categoryIndex === postsByCategory.length - 1;
            const hasMorePosts = categoryPosts.length > POSTS_PER_CATEGORY;
            const visiblePosts = expandedPosts.has(category) ? categoryPosts : categoryPosts.slice(0, POSTS_PER_CATEGORY);
            const needsVerticalLine = isExpanded && (visiblePosts.length > 0 || hasMorePosts) && !isLastCategory;
            const needsCollapsedLine = !isExpanded && !isLastCategory;
            
            return (
              <div
                key={category}
                className="relative"
                style={shouldAnimate ? { animationDelay: `${categoryIndex * 50}ms` } : undefined}
              >
                {/* Tree Structure Lines for Category */}
                <div className="absolute left-0 top-[0.5rem] md:top-[1rem] w-6 pointer-events-none" style={{ height: '100%' }}>
                  {/* Vertical line connecting categories (from previous category) */}
                  {categoryIndex > 0 && (
                    <div className="absolute left-3 top-0 w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                  )}
                  {/* Horizontal line to category icon - aligned with folder icon center (button padding p-3 = 0.75rem, icon is w-5 h-5 = 1.25rem, center at ~1.375rem from top) */}
                  <div className="absolute left-3 top-[0rem] md:top-[1.625rem] w-3 h-px bg-slate-300 dark:bg-slate-600"></div>
                  {/* Vertical line down (only if expanded and not last category) */}
                  {isExpanded && needsVerticalLine && (
                    <div className="absolute left-3 top-[0rem] md:top-[1.625rem] w-px bg-slate-300 dark:bg-slate-600" style={{ bottom: 0 }}></div>
                  )}
                  {/* Vertical line down (if collapsed and not last category - extends to next category) */}
                  {needsCollapsedLine && (
                    <div className="absolute left-3 top-[0rem] md:top-[1.625rem] w-px bg-slate-300 dark:bg-slate-600" style={{ bottom: 0 }}></div>
                  )}
                </div>

                <div className="pl-8">
                  {/* Category Header - Tree Node */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 transition-transform" />
                        ) : (
                          <ChevronRight className="w-4 h-4 transition-transform" />
                        )}
                        <Folder className={`w-5 h-5 ${isExpanded ? 'fill-current' : ''} transition-all`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                          {category}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {categoryPosts.length} 篇文章
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded">
                        {categoryPosts.length}
                      </span>
                    </div>
                  </button>

                  {/* Category Posts - Tree Children */}
                  {isExpanded && (
                    <div className="ml-6 mt-0 relative">
                      {visiblePosts.map((post, postIndex) => {
                        const isLastPost = postIndex === visiblePosts.length - 1;
                        const isLastItem = isLastPost && (!hasMorePosts || expandedPosts.has(category));
                        const shouldContinueLine = !isLastItem || !isLastCategory;
                        const isFirstPost = postIndex === 0;
                        
                        return (
                          <div key={post.slug} className="relative">
                            {/* Tree lines for each post */}
                            <div className="absolute left-0 top-0 w-6 pointer-events-none" style={{ height: '100%' }}>
                              {/* Vertical line from category (only for first post) */}
                              {isFirstPost && (
                                <div className="absolute left-0 top-0 w-px h-1/2 bg-slate-300 dark:bg-slate-600"></div>
                              )}
                              {/* Horizontal line to post - aligned with file icon center (article padding p-3 = 0.75rem, icon w-4 h-4 = 1rem with mt-0.5, center at ~1.375rem from article top) */}
                              <div className="absolute left-0 top-[1.375rem] md:top-[1.625rem] w-3 h-px bg-slate-300 dark:bg-slate-600"></div>
                              {/* Vertical line down (if should continue) */}
                              {shouldContinueLine && (
                                <div className="absolute left-0 top-[1.375rem] md:top-[1.625rem] w-px bg-slate-300 dark:bg-slate-600" style={{ bottom: 0 }}></div>
                              )}
                            </div>
                            
                            <article
                              className="group relative hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg transition-colors ml-6"
                              style={shouldAnimate ? { animationDelay: `${(categoryIndex * 100) + (postIndex * 20)}ms` } : undefined}
                            >
                              <a
                                href={`/posts/${post.slug}`}
                                className="block p-3 md:p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <File className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm md:text-base font-medium text-slate-900 dark:text-white mb-1.5 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {post.title}
                                      </h3>
                                      {post.summary && (
                                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">
                                          {post.summary}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 flex-wrap">
                                        <time 
                                          dateTime={post.date.toISOString()}
                                          className="text-xs text-slate-500 dark:text-slate-400"
                                        >
                                          {post.date.toLocaleDateString('zh-TW', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                          })}
                                        </time>
                                        {post.readingMinutes && (
                                          <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {post.readingMinutes} 分鐘
                                          </span>
                                        )}
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          {post.tags.slice(0, 3).map((tag) => (
                                            <span
                                              key={tag}
                                              className="inline-flex items-center px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded border border-primary-200 dark:border-primary-700"
                                            >
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </a>
                            </article>
                          </div>
                        );
                      })}
                      
                      {/* Show More/Less Button */}
                      {hasMorePosts && (
                        <div className="relative ml-6">
                          <div className="absolute left-0 top-0 w-6 pointer-events-none" style={{ height: '100%' }}>
                            {/* Vertical line from last post */}
                            {visiblePosts.length > 0 && (
                              <div className="absolute left-0 top-0 w-px h-1/2 bg-slate-300 dark:bg-slate-600"></div>
                            )}
                            {/* Horizontal line to button - aligned with button text center */}
                            <div className="absolute left-0 top-1/2 w-3 h-px bg-slate-300 dark:bg-slate-600"></div>
                            {/* Vertical line down (if not last category) */}
                            {!isLastCategory && (
                              <div className="absolute left-0 top-1/2 w-px bg-slate-300 dark:bg-slate-600" style={{ bottom: 0 }}></div>
                            )}
                          </div>
                          <div className="ml-6 p-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleShowAll(category)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                            >
                              {expandedPosts.has(category) ? (
                                <>
                                  <span>顯示較少</span>
                                  <ChevronDown className="w-3 h-3" />
                                </>
                              ) : (
                                <>
                                  <span>顯示更多 ({categoryPosts.length - POSTS_PER_CATEGORY} 篇)</span>
                                  <ChevronRight className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Card Grid for Home Page */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
          {filteredPosts.map((post, index) => {
            // Bento Box sizing logic: first post is large, others are normal
            const isLarge = index === 0;
            const gridClass = isLarge 
              ? 'md:col-span-2 md:row-span-2' 
              : '';

            return (
              <article
                key={post.slug}
                className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-[1.02] hover:-translate-y-1 ${cardAnimationClass} ${gridClass}`}
                style={shouldAnimate ? { animationDelay: `${index * 100}ms` } : undefined}
              >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className={`relative p-6 ${isLarge ? 'md:p-10' : 'md:p-6'} h-full flex flex-col`}>
                  {/* Header with First Character Badge */}
                  <div className="flex items-start gap-1.5 mb-4">
                    <div className={`flex-shrink-0 ${isLarge ? 'text-7xl md:text-7xl' : 'text-3xl md:text-4xl'} font-bold gradient-text italic opacity-40 group-hover:opacity-70 transition-opacity pr-1.5`}>
                      {post.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`${isLarge ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl'} font-bold text-slate-900 dark:text-white mb-3 leading-tight tracking-tight`}>
                        <a
                          href={`/posts/${post.slug}`}
                          className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          {post.title.slice(1)}
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

      {/* Summary Footer */}
      <div className="flex items-center justify-center pt-8">
        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          共 <span className="font-bold text-primary-600 dark:text-primary-400">{filteredPosts.length}</span> 篇文章
        </div>
      </div>
    </div>
  );
}
