import type { Post } from '../content';
import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';

interface PostPageProps {
  post: Post;
}

export function PostPage({ post }: PostPageProps) {
  const safeHtml = useMemo(() => {
    // 伺服端已使用 sanitize-html 清理；此處在瀏覽器再做一次防禦性清理
    if (typeof window === 'undefined') {
      return post.contentHtml;
    }
    return DOMPurify.sanitize(post.contentHtml, {
      // 嚴格基線：允許必要連結與圖片屬性，與伺服端配置對齊
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+\-.]+(?:[^a-z+\-.:]|$))/i,
    });
  }, [post.contentHtml]);
  const content = useMemo(() => parse(safeHtml), [safeHtml]);
  return (
    <article className="post-card post-page">
      <a href="/" className="back-link" aria-label="返回文章列表">
        ← 返回文章列表
      </a>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <time dateTime={post.date.toISOString()}>
          {post.date.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {post.readingMinutes ? ` · ${post.readingMinutes} 分鐘` : null}
        <span className="updated-pill">
          最後更新：{post.lastUpdated.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="post-taxonomy">
        <span className="post-category">分類：{post.category ?? '未分類'}</span>
        {post.tags.length > 0 ? (
          <div className="tag-chip-row">
            {post.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="post-content">{content}</div>
    </article>
  );
}
