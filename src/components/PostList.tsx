import type { PostSummary } from '../content';

interface PostListProps {
  posts: PostSummary[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div>
      {posts.map((post) => (
        <article key={post.slug} className="post-card">
          <h2>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
          <p style={{ color: 'blue' }}>fdfdffs</p>
          <div className="post-meta">
            <time dateTime={post.date.toISOString()}>
              {post.date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            {post.readingMinutes ? ` · ${post.readingMinutes} 分鐘` : null}
          </div>
          {post.summary ? <p>{post.summary}</p> : null}
        </article>
      ))}
    </div>
  );
}
