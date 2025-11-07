import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CONTENT_BASE = process.env.CONTENT_BASE ?? process.cwd();
const POSTS_DIR = path.join(CONTENT_BASE, 'posts');

// LRU 快取最大大小（只快取 HTML 內容）
const MAX_HTML_CACHE_SIZE = 3;

export interface PostSummary {
  slug: string;
  title: string;
  date: Date;
  lastUpdated: Date;
  summary?: string;
  readingMinutes?: number;
  tags: string[];
  category: string;
}

export interface Post extends PostSummary {
  contentHtml: string;
}

interface SummaryCacheEntry {
  mtimeMs: number;
  summary: PostSummary;
}

interface HtmlCacheEntry {
  mtimeMs: number;
  contentHtml: string;
  lastAccessed: number;
}

// 分離快取：summary 快取（永久，用於列表頁）和 HTML 快取（LRU，用於詳情頁）
const summaryCache = new Map<string, SummaryCacheEntry>();
const htmlCache = new Map<string, HtmlCacheEntry>();

// 動態載入 marked（只在需要時載入）
let markedModule: typeof import('marked') | null = null;

async function getMarked() {
  if (!markedModule) {
    markedModule = await import('marked');
  }
  return markedModule;
}

function parseMarkdownSummary(filePath: string, slug: string): PostSummary {
  const stat = fs.statSync(filePath);
  const cached = summaryCache.get(slug);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.summary;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const title = data.title ?? slug;
  const date = data.date ? new Date(data.date) : stat.mtime;
  const summary = data.summary ?? content.replace(/[#>*_`-]/g, '').slice(0, 140).trim();
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 250));
  const tags = normalizeTags(data.tags);
  const category = normalizeCategory(data.category);
  const lastUpdated = normalizeUpdatedDate(data.updated ?? data.lastUpdated, stat.mtime);

  const postSummary: PostSummary = {
    slug,
    title,
    date,
    lastUpdated,
    summary,
    readingMinutes,
    tags,
    category,
  };

  summaryCache.set(slug, { mtimeMs: stat.mtimeMs, summary: postSummary });
  return postSummary;
}

async function parseMarkdownHtml(filePath: string, slug: string): Promise<string> {
  const stat = fs.statSync(filePath);
  const cached = htmlCache.get(slug);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    // 更新最後訪問時間（LRU）
    cached.lastAccessed = Date.now();
    return cached.contentHtml;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(raw);
  const marked = await getMarked();
  const contentHtml = marked.marked.parse(content) as string;

  // LRU 快取：如果超過最大大小，移除最舊的
  if (htmlCache.size >= MAX_HTML_CACHE_SIZE) {
    const entries = Array.from(htmlCache.entries());
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    const oldestKey = entries[0][0];
    htmlCache.delete(oldestKey);
  }

  htmlCache.set(slug, {
    mtimeMs: stat.mtimeMs,
    contentHtml,
    lastAccessed: Date.now(),
  });

  return contentHtml;
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => String(tag).trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 8);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 8);
  }
  return [];
}

function normalizeCategory(raw: unknown): string {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  return '未分類';
}

function normalizeUpdatedDate(raw: unknown, fallback: Date): Date {
  if (typeof raw === 'string' && raw.trim().length > 0) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return fallback;
}

export function loadPostSummaries(): PostSummary[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b));

  const summaries = files
    .map((file) => {
      const slug = path.basename(file, '.md');
      const fullPath = path.join(POSTS_DIR, file);
      try {
        return parseMarkdownSummary(fullPath, slug);
      } catch (error) {
        console.error(`[content] Failed to parse ${file}:`, error);
        return null;
      }
    })
    .filter((entry): entry is PostSummary => Boolean(entry))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return summaries;
}

export async function loadPost(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const summary = parseMarkdownSummary(filePath, slug);
    // 只在需要時才生成 HTML（延遲載入）
    const contentHtml = await parseMarkdownHtml(filePath, slug);
    return { ...summary, contentHtml };
  } catch (error) {
    console.error(`[content] Failed to read post ${slug}:`, error);
    return null;
  }
}
