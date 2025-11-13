import fs from 'node:fs';
import path from 'node:path';
import type { GrayMatterFile } from 'gray-matter';
import type { Post, PostSummary, SiteConfig } from '../shared/types.js';
import { sanitizeMarkdownHtml, sanitizePlainText, sanitizeSlug } from './security/contentSanitizers.js';

// 動態載入 gray-matter（只在需要時載入）
type MatterFunction = (input: string) => GrayMatterFile<string>;
let matterModule: MatterFunction | null = null;

async function getMatter(): Promise<MatterFunction> {
  if (!matterModule) {
    const mod = await import('gray-matter');
    // gray-matter 是 CommonJS 模組，可能是 default 或直接導出
    matterModule = (mod.default ?? mod) as MatterFunction;
  }
  return matterModule;
}

const CONTENT_BASE = process.env.CONTENT_BASE ?? process.cwd();
const POSTS_DIR = path.resolve(CONTENT_BASE, 'posts');
const DEFAULT_MAX_HTML_CACHE_SIZE = 0; // 完全禁用 HTML 快取以節省記憶體
const DEFAULT_SUMMARY_CACHE_SIZE = 5; // 只保留最近 5 個摘要（從 50 降到 5）
const LOW_MEMORY_MODE = String(process.env.LOW_MEMORY_MODE ?? '').toLowerCase() === 'true';

const MAX_HTML_CACHE_SIZE = LOW_MEMORY_MODE ? 0 : resolveHtmlCacheSize();
const SUMMARY_CACHE_MAX_SIZE = LOW_MEMORY_MODE ? 0 : resolveSummaryCacheSize();
const HTML_CACHE_ENABLED = !LOW_MEMORY_MODE && MAX_HTML_CACHE_SIZE > 0;
const SUMMARY_CACHE_ENABLED = !LOW_MEMORY_MODE && SUMMARY_CACHE_MAX_SIZE > 0;
export const isLowMemoryMode = LOW_MEMORY_MODE;

interface SummaryCacheEntry {
  mtimeMs: number;
  summary: PostSummary;
}

interface HtmlCacheEntry {
  mtimeMs: number;
  contentHtml: string;
  lastAccessed: number;
}

interface ParsedPostFile {
  stat: fs.Stats;
  matterFile: GrayMatterFile<string>;
}

// 分離快取：summary 快取（LRU，用於列表頁）和 HTML 快取（LRU，用於詳情頁）
const summaryCache = new Map<string, SummaryCacheEntry>();
const htmlCache = new Map<string, HtmlCacheEntry>();

async function readParsedPost(filePath: string): Promise<ParsedPostFile> {
  // 優化：使用 statSync 和 readFileSync（同步但更高效，且檔案通常不大）
  // 對於小檔案，同步讀取比非同步更節省記憶體（避免 Promise 開銷）
  const stat = fs.statSync(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  const matter = await getMatter();
  const matterFile = matter(raw);
  return { stat, matterFile };
}

function getCachedSummary(slug: string, mtimeMs: number): PostSummary | null {
  if (!SUMMARY_CACHE_ENABLED) {
    return null;
  }
  const cached = summaryCache.get(slug);
  if (!cached || cached.mtimeMs !== mtimeMs) {
    if (cached && cached.mtimeMs !== mtimeMs) {
      summaryCache.delete(slug);
    }
    return null;
  }
  // 優化：只在快取接近上限時才移動到最前面（減少操作）
  if (summaryCache.size > SUMMARY_CACHE_MAX_SIZE * 0.8) {
    summaryCache.delete(slug);
    summaryCache.set(slug, cached);
  }
  return cached.summary;
}

function setCachedSummary(slug: string, entry: SummaryCacheEntry) {
  if (!SUMMARY_CACHE_ENABLED) {
    return;
  }
  if (summaryCache.has(slug)) {
    summaryCache.delete(slug);
  }
  summaryCache.set(slug, entry);
  enforceSummaryCacheLimit();
}

function enforceSummaryCacheLimit() {
  if (!SUMMARY_CACHE_ENABLED) {
    summaryCache.clear();
    return;
  }
  while (summaryCache.size > SUMMARY_CACHE_MAX_SIZE) {
    const oldestKey = summaryCache.keys().next().value;
    if (oldestKey === undefined) {
      break;
    }
    summaryCache.delete(oldestKey);
  }
}

// 動態載入第三方套件（只在需要時載入）
let markedModule: typeof import('marked') | null = null;

async function getMarked() {
  if (!markedModule) {
    markedModule = await import('marked');
  }
  return markedModule;
}

// 快取文件列表以避免重複掃描
let cachedMarkdownFiles: Array<{ relativePath: string; fullPath: string; folder: string | null }> | null = null;
let cachedMarkdownFilesMtime: number = 0;

// 遞迴掃描所有 .md 文件，包含子目錄
function getAllMarkdownFiles(dir: string, baseDir: string = dir): Array<{ relativePath: string; fullPath: string; folder: string | null }> {
  // 檢查快取是否有效（檢查 posts 目錄的 mtime）
  try {
    const postsDirStat = fs.statSync(POSTS_DIR);
    if (cachedMarkdownFiles && cachedMarkdownFilesMtime === postsDirStat.mtimeMs) {
      return cachedMarkdownFiles;
    }
  } catch {
    // 如果目錄不存在，返回空陣列
    return [];
  }

  const results: Array<{ relativePath: string; fullPath: string; folder: string | null }> = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // 遞迴掃描子目錄
      results.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      // 提取文件夾名稱作為分類（如果在子目錄中）
      const folder = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
      results.push({ relativePath, fullPath, folder });
    }
  }
  
  // 更新快取
  try {
    const postsDirStat = fs.statSync(POSTS_DIR);
    cachedMarkdownFiles = results;
    cachedMarkdownFilesMtime = postsDirStat.mtimeMs;
  } catch {
    // 忽略錯誤
  }
  
  return results;
}

function resolvePostFilePath(safeSlug: string): string | null {
  // 首先嘗試在根目錄找
  const rootCandidate = path.resolve(POSTS_DIR, `${safeSlug}.md`);
  if (fs.existsSync(rootCandidate)) {
    return rootCandidate;
  }
  
  // 如果根目錄找不到，遞迴搜尋子目錄
  const allFiles = getAllMarkdownFiles(POSTS_DIR);
  const found = allFiles.find(f => path.basename(f.relativePath, '.md') === safeSlug);
  
  if (found) {
    // 安全性檢查：確保路徑在 POSTS_DIR 內
    const relative = path.relative(POSTS_DIR, found.fullPath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      return null;
    }
    return found.fullPath;
  }
  
  return null;
}

function resolveHtmlCacheSize(): number {
  const raw = process.env.MAX_HTML_CACHE_SIZE;
  if (!raw) {
    return DEFAULT_MAX_HTML_CACHE_SIZE;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_MAX_HTML_CACHE_SIZE;
  }
  // 防止設定過大造成記憶體壓力（可視需要調整上限）
  return Math.min(parsed, 50);
}

function resolveSummaryCacheSize(): number {
  const raw = process.env.MAX_SUMMARY_CACHE_SIZE;
  if (!raw) {
    return DEFAULT_SUMMARY_CACHE_SIZE;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_SUMMARY_CACHE_SIZE;
  }
  return Math.min(parsed, 1000);
}

function logContentError(message: string, error?: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message, error);
    return;
  }
  const detail = error instanceof Error ? error.message : undefined;
  console.error(detail ? `${message}: ${detail}` : message);
}

async function parseMarkdownSummary(filePath: string, slug: string): Promise<PostSummary> {
  return parseMarkdownSummaryInternal(filePath, slug);
}

async function parseMarkdownHtml(filePath: string, slug: string): Promise<string> {
  return parseMarkdownHtmlInternal(filePath, slug);
}

async function parseMarkdownSummaryInternal(filePath: string, slug: string, preParsed?: ParsedPostFile): Promise<PostSummary> {
  const parsed = preParsed ?? await readParsedPost(filePath);
  const { stat, matterFile } = parsed;
  const cached = getCachedSummary(slug, stat.mtimeMs);
  if (cached) {
    return cached;
  }

  const summary = buildPostSummary(slug, matterFile, stat);
  setCachedSummary(slug, { mtimeMs: stat.mtimeMs, summary });
  return summary;
}

function buildPostSummary(slug: string, matterFile: GrayMatterFile<string>, stat: fs.Stats): PostSummary {
  const { data, content } = matterFile;
  const title = sanitizePlainText(data.title, 80) || slug;
  const date = resolvePublishDate(data.date, stat);
  
  // 優化：只在需要時才處理 fallback summary
  let summary: string | undefined;
  if (typeof data.summary === 'string') {
    summary = sanitizePlainText(data.summary, 200);
  } else {
    // 只處理前 500 字元以減少記憶體使用
    const preview = content.slice(0, 500).replace(/[#>*_`-]/g, '');
    summary = sanitizePlainText(preview, 200);
  }
  
  // 優化：使用更高效的單詞計數方式
  let wordCount = 0;
  let inWord = false;
  for (let i = 0; i < content.length; i++) {
    const isSpace = /\s/.test(content[i]);
    if (!isSpace && !inWord) {
      wordCount++;
      inWord = true;
    } else if (isSpace) {
      inWord = false;
    }
  }
  
  const readingMinutes = Math.max(1, Math.round(wordCount / 150));
  const tags = normalizeTags(data.tags);
  const category = normalizeCategory(data.category);
  const lastUpdated = resolveLastUpdatedDate(stat, data.updated ?? data.lastUpdated);
  const featured = Boolean(data.featured || data.promoted || data.promote);

  return {
    slug,
    title,
    date,
    lastUpdated,
    summary: summary ?? null,
    readingMinutes,
    tags,
    category,
    featured,
  };
}

async function parseMarkdownHtmlInternal(
  filePath: string,
  slug: string,
  preParsed?: ParsedPostFile,
): Promise<string> {
  const stat = preParsed?.stat ?? fs.statSync(filePath);
  if (HTML_CACHE_ENABLED) {
    const cached = htmlCache.get(slug);
    if (cached && cached.mtimeMs === stat.mtimeMs) {
      cached.lastAccessed = Date.now();
      return cached.contentHtml;
    }
  }

  const parsed = preParsed ?? await readParsedPost(filePath);
  const matterFile = parsed.matterFile;
  const marked = await getMarked();
  const unsafeHtml = marked.marked.parse(matterFile.content) as string;
  const contentHtml = await sanitizeMarkdownHtml(unsafeHtml, {
    slug,
    onSanitized: ({ slug: sanitizedSlug }: { slug?: string }) => {
      if (process.env.NODE_ENV !== 'production') {
        logContentError(`[content] Sanitized unsafe HTML in post "${sanitizedSlug ?? 'unknown'}"`);
      }
    },
  });

  if (!HTML_CACHE_ENABLED) {
    return contentHtml;
  }

  ensureHtmlCacheCapacity();
  htmlCache.set(slug, {
    mtimeMs: stat.mtimeMs,
    contentHtml,
    lastAccessed: Date.now(),
  });

  return contentHtml;
}

function ensureHtmlCacheCapacity() {
  if (!HTML_CACHE_ENABLED || MAX_HTML_CACHE_SIZE === 0) {
    htmlCache.clear();
    return;
  }
  if (htmlCache.size < MAX_HTML_CACHE_SIZE) {
    return;
  }
  let oldestKey: string | null = null;
  let oldestAccess = Number.POSITIVE_INFINITY;
  for (const [key, entry] of htmlCache.entries()) {
    if (entry.lastAccessed < oldestAccess) {
      oldestAccess = entry.lastAccessed;
      oldestKey = key;
    }
  }
  if (oldestKey) {
    htmlCache.delete(oldestKey);
  }
}

export function clearContentCaches() {
  summaryCache.clear();
  htmlCache.clear();
  // 清除文件列表快取
  cachedMarkdownFiles = null;
  cachedMarkdownFilesMtime = 0;
}


function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => sanitizePlainText(tag, 30))
      .filter((tag) => tag.length > 0)
      .slice(0, 8);
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((tag) => sanitizePlainText(tag, 30))
      .filter((tag) => tag.length > 0)
      .slice(0, 8);
  }
  return [];
}

function normalizeCategory(raw: unknown): string {
  if (typeof raw === 'string') {
    return sanitizePlainText(raw, 40) || '未分類';
  }
  return '未分類';
}

function resolvePublishDate(raw: unknown, stat: fs.Stats): Date {
  const parsed = parseDateLike(raw);
  if (parsed) {
    return parsed;
  }
  const created = firstValidDate(stat.birthtime, stat.ctime);
  return created ?? stat.mtime;
}

function resolveLastUpdatedDate(stat: fs.Stats, raw?: unknown): Date {
  const parsed = parseDateLike(raw);
  if (parsed) {
    return parsed;
  }
  return stat.mtime;
}

function parseDateLike(raw: unknown): Date | null {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      const parsed = new Date(trimmed);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  return null;
}

function firstValidDate(...dates: Array<Date | undefined>): Date | null {
  for (const date of dates) {
    if (date && !Number.isNaN(date.getTime()) && date.getTime() > 0) {
      return date;
    }
  }
  return null;
}

// 批次處理工具：限制並發數以減少記憶體峰值
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R | null>,
  concurrency: number = 5
): Promise<R[]> {
  const results: (R | null)[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results.filter((entry): entry is R => entry !== null);
}

export async function loadPostSummaries(): Promise<PostSummary[]> {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  const files = getAllMarkdownFiles(POSTS_DIR)
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  // 使用批次處理限制並發數（預設 5 個），減少記憶體峰值
  const concurrency = LOW_MEMORY_MODE ? 1 : 3; // 降低並發數以減少記憶體峰值
  const summaries = await batchProcess(
    files,
    async (fileInfo) => {
      const slug = path.basename(fileInfo.relativePath, '.md');
      const safeSlug = sanitizeSlug(slug);
      if (!safeSlug) {
        logContentError(`[content] Skipping invalid slug "${slug}"`);
        return null;
      }
      try {
        const summary = await parseMarkdownSummary(fileInfo.fullPath, safeSlug);
        // 如果文章在子目錄中，且沒有在 frontmatter 中指定 category，使用資料夾名稱
        if (fileInfo.folder && (!summary.category || summary.category === '未分類')) {
          summary.category = fileInfo.folder;
        }
        return summary;
      } catch (error) {
        logContentError(`[content] Failed to parse ${fileInfo.relativePath}`, error);
        return null;
      }
    },
    concurrency
  );

  return summaries.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function loadPost(slug: string): Promise<Post | null> {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return null;
  }

  const filePath = resolvePostFilePath(safeSlug);
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  try {
    const parsed = await readParsedPost(filePath);
    const summary = await parseMarkdownSummaryInternal(filePath, safeSlug, parsed);
    // 只在需要時才生成 HTML（延遲載入）
    const contentHtml = await parseMarkdownHtmlInternal(filePath, safeSlug, parsed);
    return { ...summary, contentHtml };
  } catch (error) {
    logContentError(`[content] Failed to read post ${safeSlug}`, error);
    return null;
  }
}
export async function loadConfig(): Promise<SiteConfig> {
  const configPath = path.resolve(CONTENT_BASE, '_config.md');
  const defaultConfig: SiteConfig = {
    showFilters: false, // 預設首頁不顯示篩選
  };

  if (!fs.existsSync(configPath)) {
    return defaultConfig;
  }

  try {
    const matter = await getMatter();
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const parsed = matter(fileContent);
    const { data } = parsed;

    const config: SiteConfig = {
      showFilters: typeof data.showFilters === 'boolean' ? data.showFilters : defaultConfig.showFilters,
    };

    return config;
  } catch (error) {
    logContentError(`[content] Failed to read config file`, error);
    return defaultConfig;
  }
}

