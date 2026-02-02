import { getAllPosts } from '@/lib/content';
import { PostList } from '@/app/components/PostList';
import { FilterBar } from '@/app/components/FilterBar';
import Link from 'next/link';
import { Sparkles, ArrowRight, Github } from 'lucide-react';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen px-4 pb-20 sm:px-6 lg:px-8">
      <header className="pt-20 pb-16 md:pt-32 md:pb-24 text-center max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs md:text-sm font-semibold uppercase tracking-wider gradient-text">
            想法編譯 · 實作記錄 · 開發筆記
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight animate-fade-in-up [animation-delay:200ms]">
          湯編驛
        </h1>
        
        {/* Tagline */}
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto italic animate-fade-in-up [animation-delay:400ms]">
          開發筆記，記錄程式碼與想法的實踐過程
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up [animation-delay:600ms]">
          <Link 
            href="#articles" 
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            查看最新文章
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link 
            href="https://github.com/gh286991" 
            target="_blank"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold rounded-xl border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-105"
          >
            <Github className="w-5 h-5" />
            GitHub 專案
          </Link>
        </div>
      </header>
      
      <main id="articles" className="scroll-mt-24">
        <FilterBar />
        <PostList posts={posts} isHome={true} />
      </main>
    </div>
  );
}
