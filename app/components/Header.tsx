import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/40 dark:border-white/10 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          {/* Original Logo */}
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/favicon/android-chrome-192x192.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
              湯編驛
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
              tomslab.dev
            </span>
          </div>
        </Link>
        
        
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              首頁
            </Link>
            <Link href="/posts" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              文章
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              關於
            </Link>
            <Link href="/works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              項目 / Lab
            </Link>
          </nav>

          
          {/* Mobile Menu Button (Restored) */}
          <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
             <span className="sr-only">Menu</span>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
    </header>
  );
}
