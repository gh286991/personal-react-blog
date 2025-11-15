import { ThemeToggle } from './ThemeToggle.js';
import { MainNav } from './MainNav.js';

interface MinimalHeaderProps {
  title?: string;
  description?: string;
  subtitle?: string;
  note?: string;
  showBackLink?: boolean;
}

export function MinimalHeader({
  title,
  description,
  subtitle,
  note,
  showBackLink = false,
}: MinimalHeaderProps) {
  return (
    <header className="glass border-b border-white/20 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 md:py-8">
        <div className="flex justify-between items-center sm:items-start gap-2 sm:gap-4">
          <div className="flex flex-col flex-1">
            <a
              href="/"
              className="sm:hidden text-2xl font-semibold text-slate-900 dark:text-white font-serif tracking-tight mb-2"
            >
              湯編驛
            </a>
            <div className="sm:hidden">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
                {title ?? '文章詳情'}
              </h1>
              {description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 italic font-serif mb-2">{description}</p>
              )}
              {note && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                  {note}
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-end gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {title ?? '文章詳情'}
                </h1>
                {subtitle && (
                  <div className="text-xs md:text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider pb-1">
                    {subtitle}
                  </div>
                )}
              </div>
              {description && (
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 italic font-serif mb-2">{description}</p>
              )}
              {note && (
                <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                  {note}
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:flex">
            <MainNav className="items-center gap-6 text-slate-600 dark:text-slate-300 font-medium" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {showBackLink && (
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-medium rounded-lg border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm">返回列表</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
