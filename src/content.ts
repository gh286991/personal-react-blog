import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const CONTENT_BASE = process.env.CONTENT_BASE ?? process.cwd();
const POSTS_DIR = path.join(CONTENT_BASE, 'posts');

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

interface CacheEntry {
  mtimeMs: number;
  summary: PostSummary;
  contentHtml?: string;
}

const contentCache = new Map<string, CacheEntry>();

function parseMarkdown(filePath: string, slug: string): CacheEntry {
  const stat = fs.statSync(filePath);
  const cached = contentCache.get(slug);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached;
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
  const contentHtml = marked.parse(content) as string;

  const entry: CacheEntry = {
    mtimeMs: stat.mtimeMs,
    summary: { slug, title, date, lastUpdated, summary, readingMinutes, tags, category },
    contentHtml,
  };

  contentCache.set(slug, entry);
  return entry;
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
        const entry = parseMarkdown(fullPath, slug);
        return entry.summary;
      } catch (error) {
        console.error(`[content] Failed to parse ${file}:`, error);
        return null;
      }
    })
    .filter((entry): entry is PostSummary => Boolean(entry))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return summaries;
}

export function loadPost(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const entry = parseMarkdown(filePath, slug);
    return { ...entry.summary, contentHtml: entry.contentHtml ?? '' };
  } catch (error) {
    console.error(`[content] Failed to read post ${slug}:`, error);
    return null;
  }
}
