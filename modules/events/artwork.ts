export type EventArtwork = {
  url: string;
  alt: string;
  credit: string;
  sourceUrl: string;
  authorized: boolean;
};

export function validateEventArtwork(value: unknown, publishing: boolean): EventArtwork | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_EVENT');
  const item = value as Record<string, unknown>;
  const text = (key: string, max: number) => {
    const raw = item[key];
    if (typeof raw !== 'string' || !raw.trim() || raw.length > max || /[<>]/.test(raw)) throw new Error('INVALID_EVENT');
    return raw.trim();
  };
  const link = (key: string) => {
    const raw = text(key, 2000);
    let url: URL;
    try { url = new URL(raw); } catch { throw new Error('INVALID_EVENT'); }
    // External images are rendered by the browser, never fetched with server credentials.
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(url.hostname) ||
      /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) ||
      /\.(localhost|local|internal|test)$/i.test(url.hostname)) throw new Error('INVALID_EVENT');
    return url.href;
  };
  if (publishing && item.authorized !== true) throw new Error('INVALID_EVENT');
  return { url: link('url'), alt: text('alt', 300), credit: text('credit', 200),
    sourceUrl: link('sourceUrl'), authorized: item.authorized === true };
}
