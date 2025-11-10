import type { RouteMatch } from '../shared/types.js';
import { normalizePathname, extractPostSlug } from '../shared/url.js';

export function matchRoute(pathname: string): RouteMatch {
  const normalized = normalizePathname(pathname);

  if (normalized === '/') {
    return { kind: 'list' };
  }

  if (normalized === '/about') {
    return { kind: 'static', staticPage: 'about' };
  }

  if (normalized === '/posts') {
    return { kind: 'archive' };
  }

  const slug = extractPostSlug(normalized);
  if (slug) {
    return { kind: 'detail', slug };
  }

  return { kind: 'not-found' };
}

export type { RouteMatch };
