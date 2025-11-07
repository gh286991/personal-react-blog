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
    <div>
      <section className="filters-panel">
        <div className="filters-header">
          <h3>內容模擬區</h3>
          <p>標籤、分類與分頁目前是前端模擬，協助規劃資料結構。</p>
        </div>
        <FilterGroup
          title="依標籤瀏覽"
          items={tagStats.map(({ tag, count }) => ({ label: `${tag} (${count})`, value: tag }))}
          activeValue={selectedTag}
          onChange={setSelectedTag}
          emptyText="目前沒有標籤資料"
        />
        <FilterGroup
          title="依分類瀏覽"
          items={categoryStats.map(({ category, count }) => ({
            label: `${category} (${count})`,
            value: category,
          }))}
          activeValue={selectedCategory}
          onChange={setSelectedCategory}
          emptyText="目前沒有分類資料"
        />
      </section>

      <section className="pagination-bar">
        <span>
          共 {filteredPosts.length} 篇 · 第 {page} / {totalPages} 頁
        </span>
        <div className="pagination-controls">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            ← 上一頁
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            下一頁 →
          </button>
        </div>
      </section>

      {pagePosts.length === 0 ? (
        <div className="empty-state">
          <p>還沒有符合篩選條件的文章！試著切換標籤或分類看看。</p>
        </div>
      ) : null}

      {pagePosts.map((post) => (
        <article key={post.slug} className="post-card">
          <h2>
            <a href={`/posts/${post.slug}`}>{post.title}</a>
          </h2>
          <div className="post-meta">
            <time dateTime={post.date.toISOString()}>
              {post.date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
            {post.readingMinutes ? ` · ${post.readingMinutes} 分鐘` : null}
            <span className="updated-pill">
              更新：{post.lastUpdated.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
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
          {post.summary ? <p>{post.summary}</p> : null}
        </article>
      ))}
    </div>
  );
}

interface FilterGroupProps {
  title: string;
  items: { label: string; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
  emptyText: string;
}

function FilterGroup({ title, items, activeValue, onChange, emptyText }: FilterGroupProps) {
  if (items.length === 0) {
    return (
      <section className="filter-group">
        <h4>{title}</h4>
        <p className="muted-text">{emptyText}</p>
      </section>
    );
  }

  return (
    <section className="filter-group">
      <h4>{title}</h4>
      <div className="filter-pills">
        <button
          type="button"
          className={activeValue === 'all' ? 'filter-pill is-active' : 'filter-pill'}
          onClick={() => onChange('all')}
        >
          全部
        </button>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={activeValue === item.value ? 'filter-pill is-active' : 'filter-pill'}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
