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
      </div>
      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
