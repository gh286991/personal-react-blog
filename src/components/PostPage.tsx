import type { Post } from '../content';

interface PostPageProps {
  post: Post;
}

export function PostPage({ post }: PostPageProps) {
  return (
    <article className="post-card">
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
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
