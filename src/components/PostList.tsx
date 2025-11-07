import { useEffect, useMemo, useState } from 'react';
import type { PostSummary } from '../content';

interface PostListProps {
  posts: PostSummary[];
}

const PAGE_SIZE = 3;

export function PostList({ posts }: PostListProps) {
  const tagStats = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort(
        (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hant', { sensitivity: 'base' }),
      );
  }, [posts]);

  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      const category = post.category ?? '未分類';
      counts.set(category, (counts.get(category) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.category.localeCompare(b.category, 'zh-Hant', { sensitivity: 'base' }),
      );
  }, [posts]);

  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [selectedTag, selectedCategory]);

  const filteredPosts = posts.filter((post) => {
    const tagMatch = selectedTag === 'all' || post.tags.includes(selectedTag);
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    return tagMatch && categoryMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const pagePosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="posts-container">
      <div className="filters-section">
        <div className="filters-inline">
          <div className="filter-group-inline">
            <span className="filter-label">標籤：</span>
            <div className="filter-buttons">
              <button
                type="button"
                className={selectedTag === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setSelectedTag('all')}
              >
                全部
              </button>
              {tagStats.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  className={selectedTag === tag ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag} <span className="count">({count})</span>
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group-inline">
            <span className="filter-label">分類：</span>
            <div className="filter-buttons">
              <button
                type="button"
                className={selectedCategory === 'all' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setSelectedCategory('all')}
              >
                全部
              </button>
              {categoryStats.map(({ category, count }) => (
                <button
                  key={category}
                  type="button"
                  className={selectedCategory === category ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category} <span className="count">({count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {pagePosts.length === 0 ? (
        <div className="empty-state">
          <p>還沒有符合篩選條件的文章！試著切換標籤或分類看看。</p>
        </div>
      ) : (
        <div className="posts-grid">
          {pagePosts.map((post, index) => (
            <article key={post.slug} className={`post-card-grid ${index === 0 ? 'featured' : ''}`}>
              <div className="post-card-header">
                <span className="post-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="post-header-content">
                  <h2>
                    <a href={`/posts/${post.slug}`}>{post.title}</a>
                  </h2>
                  <div className="post-meta-compact">
                    <time dateTime={post.date.toISOString()}>
                      {post.date.toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                    {post.readingMinutes && <span> · {post.readingMinutes} 分鐘</span>}
                  </div>
                </div>
              </div>
              {post.summary && (
                <p className="post-summary">{post.summary}</p>
              )}
              <div className="post-footer">
                <div className="post-taxonomy-compact">
                  <span className="post-category-badge">{post.category ?? '未分類'}</span>
                  {post.tags.length > 0 && (
                    <div className="tag-chips-compact">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-chip-small">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <a href={`/posts/${post.slug}`} className="read-more">
                  閱讀更多 →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="pagination-section">
        <div className="pagination-info">
          共 {filteredPosts.length} 篇 · 第 {page} / {totalPages} 頁
        </div>
        <div className="pagination-controls">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← 上一頁
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            下一頁 →
          </button>
        </div>
      </div>
    </div>
  );
}

