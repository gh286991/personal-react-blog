import type sanitizeHtml from 'sanitize-html';
import type { IOptions as SanitizeOptions } from 'sanitize-html';

export interface HtmlSanitizeOptions {
  slug?: string;
  onSanitized?: (meta: { slug?: string }) => void;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:[a-z0-9-_]*[a-z0-9])?$/i;

const SAFE_HTML_TAGS = [
  'a',
  'p',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'code',
  'pre',
  'blockquote',
  'img',
  'h1',
  'h2',
  'h3',
  'h4',
  'hr',
  'br',
  'span',
  'del',
  'ins',
  'sup',
  'sub',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const SAFE_ATTRIBUTE_ALLOWLIST: Record<string, string[]> = {
  a: ['href', 'name', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
  code: ['class'],
  pre: ['class'],
  table: ['class'],
  th: ['scope'],
};

const SAFE_CLASS_PATTERNS: Record<string, (string | RegExp)[]> = {
  code: [/^language-/],
  pre: [/^language-/],
};

let sanitizeHtmlModule: typeof sanitizeHtml | null = null;
let htmlSanitizeOptions: SanitizeOptions | null = null;

async function getSanitizeHtml(): Promise<typeof sanitizeHtml> {
  if (!sanitizeHtmlModule) {
    const mod = await import('sanitize-html');
    sanitizeHtmlModule = (mod.default ?? mod) as typeof sanitizeHtml;
  }
  return sanitizeHtmlModule;
}

function buildSanitizeOptions(sanitize: typeof sanitizeHtml): SanitizeOptions {
  return {
    allowedTags: SAFE_HTML_TAGS,
    allowedAttributes: {
      ...SAFE_ATTRIBUTE_ALLOWLIST,
    },
    allowedClasses: SAFE_CLASS_PATTERNS,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      a: ['http', 'https', 'mailto'],
    },
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    enforceHtmlBoundary: true,
    allowProtocolRelative: false,
    transformTags: {
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  };
}

export async function sanitizeMarkdownHtml(html: string, options: HtmlSanitizeOptions = {}): Promise<string> {
  const sanitize = await getSanitizeHtml();
  if (!htmlSanitizeOptions) {
    htmlSanitizeOptions = buildSanitizeOptions(sanitize);
  }
  const cleaned = sanitize(html, htmlSanitizeOptions);
  if (cleaned !== html && options.onSanitized) {
    options.onSanitized({ slug: options.slug });
  }
  return cleaned;
}

export function sanitizePlainText(raw: unknown, maxLength = 200): string {
  if (raw == null) {
    return '';
  }
  const value = String(raw)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  if (value.length === 0) {
    return '';
  }
  return value.slice(0, maxLength);
}

export function sanitizeSlug(raw: string): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  if (!SLUG_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}
