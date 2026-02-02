import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Post, PostSummary, PostCategory } from './types';
export type { Post, PostSummary, PostCategory };

// Constants
const POSTS_DIR = path.join(process.cwd(), 'posts');
const VALID_CATEGORIES: readonly PostCategory[] = ['Blog', 'Tech', 'Note', 'Project', 'Tutorial', 'Lab'] as const;

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

export async function getAllPosts(): Promise<PostSummary[]> {
  const files = getAllMarkdownFiles(POSTS_DIR);
  const posts: PostSummary[] = [];

  for (const file of files) {
    const slug = path.basename(file.relativePath, '.md');
    // Simple sanitization for slug
    if (!/^[a-z0-9-]+$/.test(slug)) continue;

    const post = await parsePost(file.fullPath, slug, file.folder);
    if (post) {
      posts.push(post);
    }
  }

  // Sort by date desc
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // Security check for slug
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const files = getAllMarkdownFiles(POSTS_DIR);
  const file = files.find(f => path.basename(f.relativePath, '.md') === slug);
  
  if (!file) return null;

  const raw = fs.readFileSync(file.fullPath, 'utf8');
  const { data, content } = matter(raw);
  
  const summary = await parsePost(file.fullPath, slug, file.folder);
  if (!summary) return null;

  const html = await marked.parse(content);
  // Add lazy loading and fix image paths
  const contentHtml = normalizeImagePaths(html as string);

  return {
    ...summary,
    contentHtml,
  };
}

// Helpers
function getAllMarkdownFiles(dir: string, baseDir: string = dir): Array<{ relativePath: string; fullPath: string; folder: string | null }> {
  const results: Array<{ relativePath: string; fullPath: string; folder: string | null }> = [];
  
  if (!fs.existsSync(dir)) return [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      results.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      const folder = path.dirname(relativePath) === '.' ? null : path.dirname(relativePath);
      results.push({ relativePath, fullPath, folder });
    }
  }
  
  return results;
}

async function parsePost(filePath: string, slug: string, folder: string | null): Promise<PostSummary | null> {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const stat = fs.statSync(filePath);

    // Determines category
    let category: PostCategory | null = null;
    if (typeof data.category === 'string' && VALID_CATEGORIES.includes(data.category as PostCategory)) {
      category = data.category as PostCategory;
    } else if (folder && VALID_CATEGORIES.includes(folder as PostCategory)) {
      category = folder as PostCategory;
    }

    // Build summary
    let summary = data.summary;
    if (!summary) {
      summary = content.slice(0, 200).replace(/[#>*_`-]/g, '');
    }

    // Word count for reading time
    const wordCount = content.split(/\s+/).length;
    const readingMinutes = Math.max(1, Math.round(wordCount / 150));

    // Resolve date
    let date = stat.mtime;
    if (data.date) {
      const parsedDate = new Date(data.date);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate;
      }
    }

    // Resolve image
    let image = data.image || data.cover || data.heroImage || null;
    if (image && !image.startsWith('http') && !image.startsWith('/')) {
        image = '/' + image;
    }

    // Resolve tags
    let tags: string[] = [];
    if (Array.isArray(data.tags)) tags = data.tags;
    else if (typeof data.tags === 'string') tags = data.tags.split(',').map(t => t.trim());


    // Calculate reading time
    const wordsPerMinute = 200;
    const calculatedWordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(calculatedWordCount / wordsPerMinute) + ' 分鐘';

    return {
      slug,
      title: data.title || slug, // Kept original logic for title fallback
      date, // Kept original Date object
      lastUpdated: data.updated ? new Date(data.updated) : stat.mtime, // Kept original
      summary, // Kept original processed summary
      category, // Kept original processed category
      tags, // Kept original processed tags
      readingMinutes, // Kept original readingMinutes
      image, // Kept original processed image
      featured: Boolean(data.featured || data.promoted), // Kept original
      readingTime, // Added new readingTime
    };

  } catch (e) {
    console.warn(`Failed to parse post ${filePath}:`, e);
    return null;
  }
}

function normalizeImagePaths(html: string): string {
    return html.replace(
        /<img\s+([^>]*?)>/gi,
        (match, attributes) => {
            const srcMatch = attributes.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
            if (!srcMatch) return match;
            
            let src = srcMatch[1];
            if (/^https?:\/\//.test(src) || src.startsWith('/')) return match;

            // Simple normalization for relative paths like "images/foo.png" -> "/foo.png" assuming images are in public root or public/images
            // This is a simplification from the original logic
            const fileName = path.basename(src);
            const newSrc = `/${fileName}`; // Assumes images are at root or we serve them from root
            
            return match.replace(src, newSrc);
        }
    );
}
