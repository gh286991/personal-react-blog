export function formatISODate(date?: Date | null): string | undefined {
  if (!date) return undefined;
  const timestamp = date.getTime();
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}

export function toAbsoluteUrl(baseUrl: string, value: string | null): string {
  if (!value || value.trim().length === 0) {
    return `${baseUrl}/favicon.svg`;
  }
  if (/^https?:\/\//.test(value)) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${baseUrl}${value}`;
  }
  return `${baseUrl}/${value}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
