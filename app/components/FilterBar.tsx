import Link from 'next/link';
import { Rocket, Laptop, Wrench, Rss } from 'lucide-react';

export function FilterBar() {
  return (
    <div className="hidden md:flex flex-wrap items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 mb-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider gradient-text flex-shrink-0">
          文章主題
        </span>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            <Rocket className="w-4 h-4 text-orange-500" />
            <span>MVP</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            <Laptop className="w-4 h-4 text-blue-500" />
            <span>軟體開發</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            <Wrench className="w-4 h-4 text-green-500" />
            <span>工具</span>
          </div>
        </div>
      </div>

      <Link 
        href="/feed.xml"
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all shadow-sm hover:shadow"
      >
        <Rss className="w-4 h-4" />
        <span>RSS 訂閱</span>
      </Link>
    </div>
  );
}
