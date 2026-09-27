import type { EventItem } from '@/modules/events/types';
import { isPlaceholder } from '@/lib/data-quality';

export function dateInBrasilia(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (key: string) => parts.find((item) => item.type === key)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getTodayEvents(items: EventItem[], now = new Date()): EventItem[] {
  const today = dateInBrasilia(now);
  const seen = new Set<string>();
  return items.filter((item) => {
    const starts = item.startsAt ? Date.parse(item.startsAt) : NaN;
    const cutoff = item.expiresAt ?? item.endsAt;
    const ends = cutoff ? Date.parse(cutoff) : NaN;
    if (item.publicationStatus !== 'published' ||
      [item.title, item.place, item.region, item.dateLabel, item.description].some(isPlaceholder) ||
      item.source?.kind !== 'official' || !item.source.url?.startsWith('https://') ||
      !Number.isFinite(starts) || !Number.isFinite(ends) ||
      dateInBrasilia(new Date(starts)) !== today || ends <= now.getTime()) return false;
    const key = `${item.place.toLowerCase()}|${starts}|${item.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
}
