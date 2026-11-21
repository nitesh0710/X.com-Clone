import { facts, type FactKey } from '@/config/site';

const TOKEN = /\{\{([A-Z0-9_]+)\}\}/g;

/** Replaces {{KEY}} tokens with owner facts where supplied; leaves the rest as tokens. */
export function fillText(s: string): string {
  return s.replace(TOKEN, (m, k: string) => {
    const v = (facts as Record<string, string>)[k as FactKey];
    return v && v.trim() ? v : m;
  });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Escapes text, fills facts, wraps unfilled tokens in <mark class="ph">, and
 * allows a tiny safe subset of inline markup: [text](/path) links and **bold**.
 */
export function fillHtml(s: string): string {
  return escapeHtml(fillText(s))
    .replace(TOKEN, (m) => `<mark class="ph">${m}</mark>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((\/[a-z0-9\-/?=&;#]*)\)/g, '<a class="link" href="$2">$1</a>');
}

/** Plain text for structured data: drops link/bold markup. */
export function plainText(s: string): string {
  return fillText(s)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
