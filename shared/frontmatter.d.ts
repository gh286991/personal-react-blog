/**
 * Markdown Frontmatter 類型定義
 * 用於在編輯 Markdown 文件時提供 TypeScript 類型檢查
 */

import type { PostCategory } from './types.js';

/**
 * Markdown Frontmatter 結構定義
 */
export interface PostFrontmatter {
  /** 文章標題 */
  title: string;
  /** 發布日期 (ISO 8601 格式，例如: "2024-01-01") */
  date: string;
  /** 文章摘要 */
  summary: string;
  /** 文章分類，必須是 PostCategory 中的值 */
  category: PostCategory;
  /** 文章標籤 */
  tags: string[];
  /** 最後更新日期 (ISO 8601 格式，可選) */
  updated?: string;
  /** 是否為精選文章 */
  promoted?: boolean;
  /** 是否為推薦文章 (與 promoted 同義，保留向後兼容) */
  featured?: boolean;
}

// 重新導出 PostCategory 以便使用
export type { PostCategory };

