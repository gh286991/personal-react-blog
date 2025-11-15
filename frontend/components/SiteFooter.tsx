import { Sparkles } from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 site-footer">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-serif flex items-center justify-center gap-2 flex-wrap">
          <span>
            © {currentYear} 湯編驛. All rights reserved. | Built with React, Vite & Bun{' '}
            <Sparkles className="w-4 h-4 inline" />
          </span>
        </p>
      </div>
    </footer>
  );
}
