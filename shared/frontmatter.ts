/**
 * Frontmatter 驗證工具
 * 用於在開發時驗證 Markdown frontmatter 的類型
 */

import type { PostCategory } from './types';
export interface PostFrontmatter {
  title: string;
  date: string;
  summary: string;
  category: PostCategory;
  tags: string[];
  image?: string;
  featured?: boolean;
}

/**
 * 驗證 frontmatter 的 category 是否為有效值
 */
export function validateCategory(category: string): category is PostCategory {
  const validCategories: PostCategory[] = ['Blog', 'Tech', 'Note', 'Project', 'Tutorial', 'Lab'];
  return validCategories.includes(category as PostCategory);
}

/**
 * 驗證 frontmatter 對象
 */
export function validateFrontmatter(data: unknown): data is PostFrontmatter {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const fm = data as Record<string, unknown>;
  
  // 檢查必需欄位
  if (typeof fm.title !== 'string' || fm.title.trim() === '') {
    return false;
  }
  
  if (typeof fm.date !== 'string' || fm.date.trim() === '') {
    return false;
  }
  
  if (typeof fm.summary !== 'string' || fm.summary.trim() === '') {
    return false;
  }
  
  // 驗證 category
  if (typeof fm.category !== 'string' || !validateCategory(fm.category)) {
    return false;
  }
  
  // 驗證 tags
  if (!Array.isArray(fm.tags) || !fm.tags.every(tag => typeof tag === 'string')) {
    return false;
  }
  
  return true;
}

/**
 * 獲取所有有效的 category 值
 */
export function getValidCategories(): readonly PostCategory[] {
  return ['Blog', 'Tech', 'Note', 'Project', 'Tutorial', 'Lab'] as const;
}

