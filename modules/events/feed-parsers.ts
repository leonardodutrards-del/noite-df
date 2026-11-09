export type ParsedFeedEvent = {
  title?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  url?: string;
  sourceEventKey?: string;
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(block: string, names: string[]): string | undefined {
  for (const name of names) {
    const expression = new RegExp(`<(?:[\\w.-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${name}\\s*>`, 'i');
    const match = block.match(expression);
    if (match?.[1]) return decodeXml(match[1]);
  }
  return undefined;
}

function atomLink(block: string): string | undefined {
  const links = Array.from(block.matchAll(/<link\b([^>]*)\/?\s*>/gi));
  for (const link of links) {
    const attrs = link[1] ?? '';
    const rel = attrs.match(/\brel=["']([^"']+)["']/i)?.[1];
    const href = attrs.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (href && (!rel || rel === 'alternate')) return decodeXml(href);
  }
  return undefined;
}

function normalizeFeedDate(value?: string): string | undefined {
  if (!value) return undefined;
  const raw = value.trim();
  if (/(?:Z|[+-]\\d{2}:?\\d{2})$/i.test(raw)) {
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined;
  }
  // Preserve timezone-less ISO values for editorial review; never infer
  // the server's timezone for an event published in Brasília local time.
  const local = raw.match(/^(\\d{4})-(\\d{2})-(\\d{2})(?:T(\\d{2}):(\\d{2})(?::(\\d{2}))?)?$/);
  if (!local) return undefined;
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = local;
  return `LOCAL=${year}${month}${day}T${hour}${minute}${second}`;
}

/** Parses common RSS 2.0 and Atom entries. Feed publication dates are not
 * treated as event start dates; only explicit event date fields are mapped. */
export function parseRssAtomFeed(xml: string): ParsedFeedEvent[] {
  if (xml.length > 400_000) throw new Error('FEED_TOO_LARGE');
  const blocks = Array.from(xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi));
  return blocks.map((match) => {
    const block = match[2] ?? '';
    const link = tag(block, ['link']) ?? atomLink(block);
    return {
      title: tag(block, ['title']),
      description: tag(block, ['description', 'summary', 'content']),
      startsAt: normalizeFeedDate(tag(block, ['eventStart', 'startDate', 'dtstart', 'start'])),
      endsAt: normalizeFeedDate(tag(block, ['eventEnd', 'endDate', 'dtend', 'end'])),
      location: tag(block, ['location', 'venue']),
      url: link,
      sourceEventKey: tag(block, ['guid', 'id']),
    };
  }).filter((event) => Boolean(event.title || event.url));
}

function unfoldIcsLines(ics: string): string[] {
  return ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
}

function icsDate(value: string, property: string): string | undefined {
  // UTC values are safe to normalize. TZID-local and all-day values remain
  // unconverted so the review queue can resolve the correct local timezone.
  if (/^\d{8}T\d{6}Z$/.test(value)) {
    const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
    return new Date(iso).toISOString();
  }
  if (/^\d{8}T\d{4,6}$/.test(value) || /^\d{8}$/.test(value)) return `${property};LOCAL=${value}`;
  return undefined;
}

/** Parses VEVENT blocks. Local TZID/all-day timestamps are deliberately
 * preserved as unresolved markers instead of guessing a timezone. */
export function parseIcsCalendar(ics: string): ParsedFeedEvent[] {
  if (ics.length > 400_000) throw new Error('FEED_TOO_LARGE');
  const lines = unfoldIcsLines(ics);
  const events: ParsedFeedEvent[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current) {
        const start = current.DTSTART ? icsDate(current.DTSTART, 'DTSTART') : undefined;
        const end = current.DTEND ? icsDate(current.DTEND, 'DTEND') : undefined;
        events.push({
          title: current.SUMMARY ? decodeXml(current.SUMMARY) : undefined,
          description: current.DESCRIPTION ? decodeXml(current.DESCRIPTION) : undefined,
          startsAt: start,
          endsAt: end,
          location: current.LOCATION ? decodeXml(current.LOCATION) : undefined,
          url: current.URL,
          sourceEventKey: current.UID,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const property = line.slice(0, separator).split(';')[0].toUpperCase();
    const value = line.slice(separator + 1).trim();
    if (['UID', 'SUMMARY', 'DESCRIPTION', 'DTSTART', 'DTEND', 'LOCATION', 'URL'].includes(property)) {
      current[property] = value;
    }
  }

  return events.filter((event) => Boolean(event.title || event.url));
}


function jsonLdDate(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const raw = value.trim();
  if (/(Z|[+-]\d{2}:\d{2})$/i.test(raw)) return normalizeFeedDate(raw);
  const local = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!local) return undefined;
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = local;
  return `LOCAL=${year}${month}${day}T${hour}${minute}${second}`;
}

function eventType(value: unknown): boolean {
  const values = Array.isArray(value) ? value : [value];
  return values.some((item) => typeof item === 'string' && /(?:^|\/)\w*Event$/i.test(item));
}

/** Extracts Schema.org Event objects from public HTML JSON-LD only.
 * Arbitrary page text is never guessed as an event. Local timestamps remain
 * unresolved markers for editorial timezone confirmation. */
export function parseHtmlJsonLdEvents(html: string, pageUrl: string): ParsedFeedEvent[] {
  if (html.length > 400_000) throw new Error('FEED_TOO_LARGE');
  const scripts = Array.from(html.matchAll(/<script\b[^>]*type=[\"']application\/ld\+json[\"'][^>]*>([\s\S]*?)<\/script\s*>/gi));
  const found: Record<string, unknown>[] = [];
  const visit = (value: unknown, depth = 0) => {
    if (depth > 12 || !value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach((item) => visit(item, depth + 1)); return; }
    const record = value as Record<string, unknown>;
    if (eventType(record['@type'])) found.push(record);
    if (record['@graph']) visit(record['@graph'], depth + 1);
    if (record.itemListElement) visit(record.itemListElement, depth + 1);
    if (record.item) visit(record.item, depth + 1);
  };
  for (const match of scripts) {
    const raw = (match[1] || '').trim().replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
    try { visit(JSON.parse(raw)); } catch { /* Invalid JSON-LD is ignored and remains a human-review source issue. */ }
  }
  return found.map((event) => {
    const location = event.location && typeof event.location === 'object'
      ? (event.location as Record<string, unknown>).name
      : event.location;
    const identifier = event.identifier && typeof event.identifier === 'object'
      ? (event.identifier as Record<string, unknown>).value
      : event.identifier;
    const url = typeof event.url === 'string' ? event.url : pageUrl;
    return {
      title: typeof event.name === 'string' ? decodeXml(event.name) : undefined,
      description: typeof event.description === 'string' ? decodeXml(event.description) : undefined,
      startsAt: jsonLdDate(event.startDate),
      endsAt: jsonLdDate(event.endDate),
      location: typeof location === 'string' ? decodeXml(location) : undefined,
      url,
      sourceEventKey: typeof identifier === 'string' || typeof identifier === 'number'
        ? String(identifier)
        : typeof event['@id'] === 'string' ? event['@id'] : undefined,
    };
  }).filter((event) => Boolean(event.title || event.url));
}
