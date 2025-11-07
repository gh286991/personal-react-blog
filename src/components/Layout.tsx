import type { ReactNode } from 'react';

interface LayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: 'hero' | 'minimal';
}

export function Layout({ title, description, children, variant = 'hero' }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="site-shell">
      {variant === 'hero' ? (
        <>
          <nav className="site-nav">
            <div className="nav-container">
              <a href="/" className="nav-logo">
                <span className="logo-text">Blog</span>
              </a>
              <div className="nav-links">
                <a href="/" className="nav-link">首頁</a>
                <a href="#latest" className="nav-link">文章</a>
                <a href="https://github.com/tomjhuang" target="_blank" rel="noreferrer" className="nav-link">
                  GitHub
                </a>
              </div>
            </div>
          </nav>
          <header className="site-hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <p className="hero-eyebrow">Minimal SSR · Markdown · React 19</p>
              <h1 className="hero-title">{title ?? 'My React SSR Blog'}</h1>
              {description ? <p className="hero-subtitle">{description}</p> : null}
              <div className="hero-actions">
                <a className="hero-cta" href="#latest">
                  查看最新文章
                </a>
                <a className="hero-secondary" href="https://github.com/tomjhuang" target="_blank" rel="noreferrer">
                  GitHub 專案
                </a>
              </div>
            </div>
          </header>
        </>
      ) : (
        <header className="page-banner is-compact">
          <div>
            <p className="hero-eyebrow">Post Detail</p>
            <h1 className="hero-title">{title ?? '文章詳情'}</h1>
            {description ? <p className="hero-subtitle">{description}</p> : null}
          </div>
          <a className="hero-secondary" href="/">
            ← 返回列表
          </a>
        </header>
      )}
      <main className="site-main" id="latest">
        {variant === 'hero' ? (
          <>
            <div className="info-bar">
              <div className="info-bar-content">
                <div className="info-item">
                  <span className="info-label">關於</span>
                  <span className="info-text">輕量級 SSR · Markdown · React 19</span>
                </div>
                <div className="info-item">
                  <span className="info-label">分類</span>
                  <div className="info-tags">
                    <span>⚙️ 架構</span>
                    <span>📝 產品</span>
                    <span>🧪 實驗</span>
                  </div>
                </div>
                <div className="info-item">
                  <a href="/feed.xml" className="info-link">📡 RSS 訂閱</a>
                </div>
              </div>
            </div>
            <div className="content-wrapper">
              {children}
            </div>
          </>
        ) : (
          <div className="content-wrapper content-wrapper-full">
            {children}
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>© {currentYear} | Built with React, Vite & Bun</span>
      </footer>
    </div>
  );
}
