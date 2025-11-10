export function normalizePathname(pathname: string): string {
  if (!pathname) {
    return '/';
  }
  try {
    const url = new URL(pathname, 'http://localhost');
    pathname = url.pathname;
  } catch {
    // Ignore invalid URLs and fall back to raw pathname.
  }
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function extractPostSlug(pathname: string): string | null {
  const match = pathname.match(/^\/posts\/([^/]+)$/);
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}
