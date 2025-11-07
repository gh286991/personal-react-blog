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
  summary?: string;
  readingMinutes?: number;
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
  const contentHtml = marked.parse(content) as string;

  const entry: CacheEntry = {
    mtimeMs: stat.mtimeMs,
    summary: { slug, title, date, summary, readingMinutes },
    contentHtml,
  };

  contentCache.set(slug, entry);
  return entry;
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
