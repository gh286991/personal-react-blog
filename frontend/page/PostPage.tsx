import { useEffect, useState, useRef } from 'react';
import type { Post } from '../../shared/types.js';
import { BuyMeACoffeeButton } from '../components/BuyMeACoffeeButton.js';

interface PostPageProps {
  post: Post;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function PostPage({ post }: PostPageProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 提取標題並為其添加 ID
  useEffect(() => {
    if (!contentRef.current) return;

    // 使用 setTimeout 確保 DOM 已經完全渲染
    const timer = setTimeout(() => {
      const content = contentRef.current;
      if (!content) return;

      const headingElements = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings: Heading[] = [];

      headingElements.forEach((heading, index) => {
        const text = heading.textContent || '';
        
        // 生成 ID：使用文字內容轉換為 URL 友好的格式
        let id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // 如果 ID 為空，使用索引作為後備
        if (!id) {
          id = `heading-${index}`;
        } else {
          // 檢查是否已存在，如果存在則加上索引
          const baseId = `heading-${index}-${id}`;
          if (document.getElementById(baseId)) {
            id = `heading-${index}-${id}-${Date.now()}`;
          } else {
            id = baseId;
          }
        }

        // 為標題添加 ID（確保是 HTMLElement）
        if (heading instanceof HTMLElement) {
          heading.id = id;
          // 強制設置屬性以確保 ID 生效
          heading.setAttribute('id', id);
        }

        extractedHeadings.push({
          id,
          text,
          level: parseInt(heading.tagName.charAt(1)),
        });
      });

      setHeadings(extractedHeadings);

      // 設置 Intersection Observer 來追蹤當前可見的標題
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // 找到當前視窗中最接近頂部的標題
          const visibleHeadings = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

          if (visibleHeadings.length > 0) {
            setActiveId(visibleHeadings[0].target.id);
          }
        },
        {
          rootMargin: '-20% 0px -70% 0px',
          threshold: 0,
        }
      );

      headingElements.forEach((heading) => {
        if (heading instanceof HTMLElement) {
          observerRef.current?.observe(heading);
        }
      });

      // 設置第一個標題為初始活動狀態
      if (headingElements.length > 0 && headingElements[0] instanceof HTMLElement) {
        setActiveId(headingElements[0].id);
      }
    }, 100); // 100ms 延遲確保 DOM 已渲染

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [post.contentHtml]);

  const scrollToHeading = (id: string) => {
    if (!contentRef.current) return;
    
    // 從 headings 狀態中找到對應的標題信息
    const headingIndex = headings.findIndex(h => h.id === id);
    if (headingIndex === -1) {
      console.warn('在 headings 狀態中找不到 ID:', id);
      return;
    }
    
    // 直接通過索引獲取對應的 DOM 元素
    const allHeadings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const element = allHeadings[headingIndex] as HTMLElement;
    
    if (element) {
      // 確保元素有正確的 ID（重新設置以防被清除）
      element.id = id;
      element.setAttribute('id', id);
      
      // 計算目標位置，考慮固定導航欄和 scroll-margin-top
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const offset = 120; // 與 CSS scroll-margin-top 一致
      const targetPosition = rect.top + scrollTop - offset;
      
      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth',
      });

      // 設置為活動狀態
      setActiveId(id);
    } else {
      console.warn(`通過索引 ${headingIndex} 找不到標題元素`);
    }
  };

  // 依據 activeId 為實際標題增加高亮樣式
  useEffect(() => {
    if (!contentRef.current || !activeId) return;

    const contentEl = contentRef.current;
    contentEl.querySelectorAll('.active-heading').forEach((el) => {
      el.classList.remove('active-heading');
    });

    const selector =
      typeof CSS !== 'undefined' && CSS.escape
        ? `#${CSS.escape(activeId)}`
        : `#${activeId}`;
    const activeHeadingEl = contentEl.querySelector(selector);

    if (activeHeadingEl instanceof HTMLElement) {
      activeHeadingEl.classList.add('active-heading');
    }
  }, [activeId]);

  const currentHeading = headings.find((heading) => heading.id === activeId);

  // 當有段落導航時，為 body 添加 class，以便為 footer 增加底部 padding
  useEffect(() => {
    if (headings.length > 0) {
      document.body.classList.add('has-toc-mobile');
    } else {
      document.body.classList.remove('has-toc-mobile');
    }
    
    return () => {
      document.body.classList.remove('has-toc-mobile');
    };
  }, [headings.length]);

  return (
    <article className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-fade-in-up">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-accent to-primary-600"></div>

      <div className="p-6 md:p-10 lg:p-12">
        {/* Article Header */}
        <header className="mb-10 pb-8 border-b-2 border-slate-200 dark:border-slate-700">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <time 
              dateTime={post.date.toISOString()}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {post.date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>

            {post.readingMinutes && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readingMinutes} 分鐘閱讀
              </span>
            )}

            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-lg border border-primary-200 dark:border-primary-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              最後更新：{post.lastUpdated.toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary-500/30">
              📁 {post.category ?? '未分類'}
            </span>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Article Content with Custom Prose Styles */}
        <div
          ref={contentRef}
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <div className="support-cta" role="complementary" aria-label="支持創作">
          <p className="support-cta-message">
            喜歡這篇文章嗎？<br />
            請我吃碗暖心拉麵，支持我持續分享更多筆記與實作經驗。
          </p>
          <BuyMeACoffeeButton />
        </div>
      </div>

      {/* Floating Table of Contents */}
      {headings.length > 0 && (
        <>
          {/* Desktop: Floating Sidebar */}
          <aside className="toc-sidebar">
            <div className="toc-container">
              <h2 className="toc-title">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                段落導航
              </h2>
              <nav className="toc-nav">
                {headings.map((heading) => {
                  const indent = heading.level - 1;
                  const isActive = activeId === heading.id;
                  
                  return (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHeading(heading.id);
                      }}
                      className={`toc-link ${isActive ? 'toc-link-active' : ''}`}
                      style={{ paddingLeft: `${12 + indent * 12}px` }}
                    >
                      {heading.text}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile: Overlay when open */}
          {isTocOpen && (
            <div
              className="toc-overlay toc-overlay-visible"
              onClick={() => setIsTocOpen(false)}
            />
          )}

          {/* Mobile: Toggle Button */}
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className={`toc-mobile-toggle ${isTocOpen ? 'toc-mobile-toggle-open' : ''}`}
            aria-label="段落導航"
            aria-expanded={isTocOpen}
          >
            <div className="toc-mobile-toggle-content">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>段落導航 ({headings.length})</span>
            </div>
            <svg
              className={`w-5 h-5 toc-mobile-toggle-icon ${isTocOpen ? 'toc-mobile-toggle-icon-open' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Mobile: Bottom Drawer Panel */}
          <aside className={`toc-mobile-panel ${isTocOpen ? 'toc-mobile-panel-open' : ''}`}>
            <div className="toc-container">
              <div className="toc-header">
                {/* 拖動指示器通過 CSS ::before 顯示 */}
              </div>
              <nav className="toc-nav">
                {headings.map((heading) => {
                  const indent = heading.level - 1;
                  const isActive = activeId === heading.id;
                  
                  return (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHeading(heading.id);
                        setIsTocOpen(false);
                      }}
                      className={`toc-link ${isActive ? 'toc-link-active' : ''}`}
                      style={{ paddingLeft: `${12 + indent * 12}px` }}
                    >
                      {heading.text}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        </>
      )}
    </article>
  );
}
