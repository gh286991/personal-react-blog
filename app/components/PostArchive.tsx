'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PostSummary } from '@/lib/types';
import { format } from 'date-fns';
import { Folder, ChevronDown, ChevronRight, FileText, Tag as TagIcon, LayoutGrid, List } from 'lucide-react';

interface PostArchiveProps {
  posts: PostSummary[];
}

export function PostArchive({ posts }: PostArchiveProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Default to list view as requested
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  // Categories expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Extract all unique tags and categories with counts
  const { tags, categories } = useMemo(() => {
    const tagCounts = new Map<string, number>();
    const catCounts = new Map<string, number>();
    
    posts.forEach(post => {
      // Tags
      post.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      // Categories
      if (post.category) {
        catCounts.set(post.category, (catCounts.get(post.category) || 0) + 1);
      }
    });

    return {
      tags: Array.from(tagCounts.entries()).map(([name, count]) => ({ name, count })),
      categories: Array.from(catCounts.entries()).map(([name, count]) => ({ name, count }))
    };
  }, [posts]);

  // Expand all categories by default on mount
  useMemo(() => {
    const allCats = new Set(categories.map(c => c.name));
    setExpandedCategories(allCats);
  }, [categories]);

  const toggleCategory = (category: string) => {
    const next = new Set(expandedCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    setExpandedCategories(next);
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchTag = selectedTag ? post.tags?.includes(selectedTag) : true;
      const matchCat = selectedCategory ? post.category === selectedCategory : true;
      return matchTag && matchCat;
    });
  }, [posts, selectedTag, selectedCategory]);

  // Group by category for list view
  const postsByCategory = useMemo(() => {
    const groups = new Map<string, PostSummary[]>();
    filteredPosts.forEach(post => {
      const cat = post.category || '未分類';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)?.push(post);
    });
    return groups;
  }, [filteredPosts]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Filters Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-12">
        
        {/* Tags Filter */}
        <div className="mb-8">
           <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
             <span>標籤篩選</span>
           </h3>
           <div className="flex flex-wrap gap-2">
             <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
             >
               全部
             </button>
             {tags.map(({ name, count }) => (
               <button
                 key={name}
                 onClick={() => setSelectedTag(selectedTag === name ? null : name)}
                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                   selectedTag === name
                     ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                     : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                 }`}
               >
                 <span>{name}</span>
                 <span className="opacity-60 text-xs">({count})</span>
               </button>
             ))}
           </div>
        </div>

        {/* Categories Filter */}
        <div>
           <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
             <span>分類篩選</span>
           </h3>
           <div className="flex flex-wrap gap-2">
             <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
             >
               全部
             </button>
             {categories.map(({ name, count }) => (
               <button
                 key={name}
                 onClick={() => setSelectedCategory(selectedCategory === name ? null : name)}
                 className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                   selectedCategory === name
                     ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                     : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                 }`}
               >
                 <span>{name}</span>
                 <span className="opacity-60 text-xs">({count})</span>
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Tree View Layout */}
      <div className="space-y-8 relative pl-4 md:pl-0">
        {Array.from(postsByCategory.entries()).map(([category, categoryPosts]) => {
           const isExpanded = expandedCategories.has(category);
           
           return (
             <div key={category} className="relative">
               {/* Left Vertical Line connecting categories */}
               <div className="absolute left-[11px] top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-700/50 -ml-px z-0 last:bottom-auto"></div>

               {/* Category Header */}
               <div 
                 className="flex items-center gap-3 cursor-pointer group mb-6 relative z-10"
                 onClick={() => toggleCategory(category)}
               >
                 <div className="w-6 h-6 flex items-center justify-center">
                    <folder className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}>
                      <Folder className="w-full h-full fill-current" />
                    </folder>
                    {/* Expand Icon overlay? Or simply use click */}
                    <div className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ChevronDown className={`w-4 h-4 text-slate-400 ${isExpanded ? '' : '-rotate-90'}`} />
                    </div>
                 </div>
                 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{category}</h2>
                 <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                   {categoryPosts.length} 篇文章
                 </span>
               </div>

               {/* Posts List */}
               {isExpanded && (
                 <div className="ml-3 pl-6 border-l border-slate-200 dark:border-slate-700/50 space-y-8 relative">
                    {categoryPosts.map((post) => (
                      <article key={post.slug} className="group relative">
                         {/* Horizontal connector */}
                         <div className="absolute -left-6 top-5 w-4 h-px bg-slate-200 dark:bg-slate-700/50"></div>
                         
                         <Link href={`/posts/${post.slug}`} className="block">
                           <div className="relative pl-2 transition-transform group-hover:translate-x-1">
                              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                                {post.summary}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <time className="text-slate-500 font-mono">
                                  {format(new Date(post.date), 'yyyy年MM月dd日')}
                                </time>
                                {post.readingTime && (
                                  <span className="text-slate-400">{post.readingTime}</span>
                                )}
                                <div className="flex gap-2">
                                   {post.tags?.map(tag => (
                                     <span key={tag} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium">
                                       #{tag}
                                     </span>
                                   ))}
                                </div>
                              </div>
                           </div>
                         </Link>
                      </article>
                    ))}
                 </div>
               )}
             </div>
           );
        })}
      </div>
    </div>
  );
}
