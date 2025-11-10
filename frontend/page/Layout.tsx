import type { ReactNode } from 'react';
import { Sparkles, Rocket, Laptop, Wrench, Rss } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle.js';

interface LayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: 'hero' | 'minimal';
}

export function Layout({ title, description, children, variant = 'hero' }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {variant === 'hero' ? (
        <>
          {/* Sticky Navigation with Glass Effect */}
          <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                {/* Logo/Brand */}
                <a 
                  href="/" 
                  className="group relative text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-serif tracking-tight"
                >
                  <span className="relative inline-block">
                    <span className="hidden sm:inline">tomslab.dev｜湯編驛</span>
                    <span className="sm:hidden">湯編驛</span>
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </span>
                </a>

                {/* Navigation Links */}
                <div className="flex items-center gap-4 md:gap-6">
                  <a 
                    href="/" 
                    className="relative text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                  >
                    <span>首頁</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                  
                  <a 
                    href="#articles" 
                    className="relative text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                  >
                    <span>文章</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                  
                  <a 
                    href="/about" 
                    className="relative text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                  >
                    <span>關於</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                  
                  <a 
                    href="https://github.com/gh286991" 
                    target="_blank" 
                    rel="noreferrer"
                    className="relative text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                  >
                    <span>GitHub</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                  
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section with Modern Design */}
          <header className="relative bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
              <div className="text-center max-w-4xl mx-auto">
                {/* Eyebrow Text */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 mb-6 md:mb-8 animate-fade-in">
                  <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs md:text-sm font-semibold uppercase tracking-wider gradient-text">
                    Minimal SSR · Markdown · React 19
                  </span>
                </div>

                {/* Main Title with Gradient */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 md:mb-8 tracking-tight leading-tight animate-fade-in">
                  {title ?? (
                    <>
                      <span className="block">湯編驛</span>
                      <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-slate-500 dark:text-slate-400 mt-2">Tom's lab</span>
                    </>
                  )}
                  <div className="h-1 w-32 md:w-40 mx-auto mt-6 bg-gradient-to-r from-transparent via-primary-600 to-transparent"></div>
                </h1>

                {/* Description */}
                {description && (
                  <p className="text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 md:mb-12 leading-relaxed italic font-serif max-w-2xl mx-auto animate-fade-in">
                    {description}
                  </p>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                  <a
                    href="#articles"
                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 hover:scale-105"
                  >
                    <span>查看最新文章</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  
                  <a
                    href="https://github.com/gh286991"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-semibold rounded-xl border-2 border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 hover:scale-105"
                  >
                    <span>GitHub 專案</span>
                    <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Info Bar with Glass Effect */}
          <div className="sticky top-16 md:top-20 z-40 glass border-b border-white/20 dark:border-slate-700/50 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <span className="text-xs font-semibold uppercase tracking-wider gradient-text">技術棧</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">React 19 · SSR · Markdown</span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <span className="text-xs font-semibold uppercase tracking-wider gradient-text">文章主題</span>
                  <div className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Rocket className="w-3.5 h-3.5" />
                      MVP
                    </span>
                    <span className="flex items-center gap-1">
                      <Laptop className="w-3.5 h-3.5" />
                      軟體開發
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" />
                      工具
                    </span>
                  </div>
                </div>

                <a 
                  href="/feed.xml" 
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <Rss className="w-4 h-4" />
                  RSS 訂閱
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <header className="glass border-b border-white/20 dark:border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-xs font-semibold uppercase tracking-wider gradient-text mb-3">
                  Post Detail
                </div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {title ?? '文章詳情'}
                </h1>
                {description && (
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 italic font-serif">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-medium rounded-lg border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">返回列表</span>
                </a>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main id="articles" className="flex-1 bg-stone-50 dark:bg-slate-900">
        <div className={variant === 'hero' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'}>
          {children}
        </div>
      </main>

      {/* Footer with Gradient Accent */}
      <footer className="relative bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-serif flex items-center justify-center gap-2">
            © {currentYear} | Built with React, Vite & Bun <Sparkles className="w-4 h-4" />
          </p>
        </div>
      </footer>
    </div>
  );
}

