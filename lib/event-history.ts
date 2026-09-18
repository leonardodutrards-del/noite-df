import type { EventItem } from '@/modules/events/types';
import { isPlaceholder } from '@/lib/data-quality';

export function getPastOfficialEvents(items: EventItem[], now = new Date()): EventItem[] {
  return items.filter(event => {
    if (event.publicationStatus && event.publicationStatus !== 'published') return false;
    if (event.source?.kind !== 'official' || !event.source.url?.startsWith('https://')) return false;
    if ([event.title, event.place, event.dateLabel, event.description].some(value => !value || isPlaceholder(value))) return false;
    const cutoff = event.expiresAt ?? event.endsAt;
    if (!cutoff) return false;
    const time = Date.parse(cutoff);
    return Number.isFinite(time) && time < now.getTime();
  }).sort((a, b) => Date.parse(b.startsAt ?? b.expiresAt ?? b.endsAt ?? '') - Date.parse(a.startsAt ?? a.expiresAt ?? a.endsAt ?? ''));
}
