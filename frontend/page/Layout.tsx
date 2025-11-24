import { useState, type ReactNode } from 'react';
import { Sparkles, Rocket, Laptop, Wrench, Rss } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { AuthorSidebar } from '../components/AuthorSidebar';
import { MainNav } from '../components/MainNav';
import { ConsentBanner } from '../components/ConsentBanner';

interface LayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: 'hero' | 'minimal';
  showSidebar?: boolean;
  showBackLink?: boolean;
}

export function Layout({ title, description, children, variant = 'hero', showSidebar = false, showBackLink = false }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {variant === 'hero' ? (
        <>
          {/* Sticky Navigation with Glass Effect */}
          <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-700/50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 md:h-20">
                {/* Logo/Brand */}
                <a 
                  href="/" 
                  className="group relative flex items-end gap-2 hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="/favicon-32x32.png" 
                    alt="湯編驛" 
                    className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
                  />
                  <div className="flex items-end gap-2">
                    <span className="text-2xl md:text-3xl text-slate-900 dark:text-white font-bold font-serif tracking-tight">
                      湯編驛
                    </span>
                    <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium tracking-tight pb-0.5">
                      tomslab.dev
                    </span>
                  </div>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>

                {/* Navigation Links - Desktop */}
                <div className="hidden md:flex items-center gap-4 md:gap-6">
                  <MainNav />
                  <ThemeToggle />
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="選單"
                  >
                    {isMobileMenuOpen ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
              <div 
                className="md:hidden fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Mobile Menu Dropdown - Absolute positioned */}
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-full left-0 right-0 z-50 border-t border-white/20 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 shadow-lg">
                <div className="px-4 py-4">
                  <MainNav orientation="vertical" className="gap-3" />
                </div>
              </div>
            )}
          </nav>

          {/* Hero Section with Modern Design */}
          <header className={`relative bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 transition-all duration-300 ${isMobileMenuOpen ? 'blur-sm' : ''}`}>
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
                    想法編譯 · 實作記錄 · 開發筆記
                  </span>
                </div>

                {/* Main Title with Gradient */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 md:mb-8 tracking-tight leading-tight animate-fade-in">
                  {title ?? (
                    <>
                      <span className="block font-serif">湯編驛</span>
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
          <div className={`sticky top-16 md:top-20 z-40 glass border-b border-white/20 dark:border-slate-700/50 animate-fade-in transition-all duration-300 ${isMobileMenuOpen ? 'blur-sm' : ''}`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-3">
              {/* Mobile compact drawer */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => setIsInfoDrawerOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between rounded-2xl px-3 py-2.5 bg-primary-50/80 dark:bg-primary-900/30 text-left"
                  aria-expanded={isInfoDrawerOpen}
                >
                  <div>
                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      資訊重點
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">文章主題 · RSS</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-primary-600 dark:text-primary-300 transition-transform ${isInfoDrawerOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isInfoDrawerOpen && (
                  <div className="mt-2 space-y-1.5">
                    <div className="rounded-xl px-3 py-1.5 bg-primary-50 dark:bg-primary-900/15 text-xs text-slate-600 dark:text-slate-300">
                      <p className="font-semibold text-primary-700 dark:text-primary-300 mb-1">文章主題</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1"><Rocket className="w-3.5 h-3.5" />MVP</span>
                        <span className="flex items-center gap-1"><Laptop className="w-3.5 h-3.5" />軟體開發</span>
                        <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" />工具</span>
                      </div>
                    </div>
                    <a
                      href="/feed.xml"
                      className="rounded-xl px-3 py-1.5 bg-primary-50 dark:bg-primary-900/15 text-xs font-semibold text-primary-600 dark:text-primary-300 flex items-center gap-2 justify-center"
                    >
                      <Rss className="w-4 h-4" />
                      RSS 訂閱
                    </a>
                  </div>
                )}
              </div>
              {/* Desktop/tablet info bar */}
              <div className="hidden md:flex md:flex-wrap md:items-center md:justify-between gap-3">
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
        <header className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-700/50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20">
            <div className="flex justify-between items-center h-full gap-2 sm:gap-4">
              {/* Left: Logo/Brand (same as hero variant) */}
              <a 
                href="/" 
                className="group relative flex items-end gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
              >
                  <img 
                    src="/favicon-32x32.png" 
                  alt="湯編驛" 
                  className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0"
                />
                <div className="flex items-end gap-2">
                  <span className="text-2xl md:text-3xl text-slate-900 dark:text-white font-bold font-serif tracking-tight">
                    湯編驛
                  </span>
                  <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium tracking-tight pb-0.5">
                    tomslab.dev
                  </span>
                </div>
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </a>

              {/* Right: Navigation and Actions */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {!showBackLink && (
                  <div className="hidden md:flex">
                    <MainNav />
                  </div>
                )}
                <ThemeToggle />
                {showBackLink && (
                  <a
                    href="/posts"
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-medium rounded-lg border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm">返回列表</span>
                  </a>
                )}
                {!showBackLink && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="選單"
                  >
                    {isMobileMenuOpen ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Backdrop */}
          {isMobileMenuOpen && !showBackLink && (
            <div 
              className="sm:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Menu Dropdown - Absolute positioned */}
          {isMobileMenuOpen && !showBackLink && (
            <div className="sm:hidden absolute top-full left-0 right-0 z-50 border-t border-white/20 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 shadow-lg">
              <div className="px-4 py-4">
                <MainNav orientation="vertical" className="gap-3" />
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main Content */}
      <main id="articles" className={`flex-1 bg-stone-50 dark:bg-slate-900 transition-all duration-300 ${isMobileMenuOpen ? 'blur-sm' : ''}`}>
        {showSidebar ? (
          <div className="py-12 md:py-16">
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-8 items-start">
                {/* Main Content - Original width, left-aligned within flex container */}
                <div className="flex-1 min-w-0">
                  <div className="max-w-7xl">
                    {children}
                  </div>
                </div>
                
                {/* Sidebar - Only on very large screens (2xl: 1536px+), normal flow, doesn't compress content */}
                <div className="hidden 2xl:block w-80 flex-shrink-0">
                  <AuthorSidebar />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={variant === 'hero' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16' : 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16'}>
            {children}
          </div>
        )}
      </main>

      {/* Footer with Gradient Accent */}
      <footer className={`relative bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 site-footer transition-all duration-300 ${isMobileMenuOpen ? 'blur-sm' : ''}`}>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-serif flex items-center justify-center gap-2 flex-wrap">
            <span>© {currentYear} 湯編驛. All rights reserved. | Built with React, Vite & Bun <Sparkles className="w-4 h-4 inline" /></span>
          </p>
        </div>
      </footer>

      {/* Consent Banner */}
      <ConsentBanner />
    </div>
  );
}
