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
        <div className="layout-grid">
          <section className="content-column">{children}</section>
          <aside className="site-sidebar">
            <div className="sidebar-card">
              <h4>關於這個部落格</h4>
              <p>
                專注在輕量級的 SSR、平行渲染與 Markdown 工作流程。所有內容皆以低記憶體環境為前提打造。
              </p>
            </div>
            <div className="sidebar-card">
              <h4>內容分類</h4>
              <ul>
                <li>⚙️ 架構筆記</li>
                <li>📝 產品日誌</li>
                <li>🧪 實驗/測試</li>
              </ul>
            </div>
            <div className="sidebar-card">
              <h4>訂閱更新</h4>
              <p>想收到新文章通知？把 RSS 新增到你的閱讀器。</p>
              <a className="hero-cta is-small" href="/feed.xml">
                RSS 訂閱
              </a>
            </div>
          </aside>
        </div>
      </main>
      <footer className="site-footer">
        <span>© {currentYear} | Built with React, Vite & Bun</span>
      </footer>
    </div>
  );
}
