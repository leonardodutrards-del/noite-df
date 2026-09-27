import type { EventItem } from '@/modules/events/types';
import { isPlaceholder } from '@/lib/data-quality';

const zone = 'America/Sao_Paulo';

export function getWeeklyAgendaWindow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const localNoon = new Date(`${value('year')}-${value('month')}-${value('day')}T12:00:00Z`);
  const weekday = localNoon.getUTCDay();
  // On Sunday show the coming week; on all other days show the current week.
  localNoon.setUTCDate(localNoon.getUTCDate() + (weekday === 0 ? 1 : 1 - weekday));
  const monday = localNoon.toISOString().slice(0, 10);
  localNoon.setUTCDate(localNoon.getUTCDate() + 7);
  const nextMonday = localNoon.toISOString().slice(0, 10);
  return {
    start: new Date(`${monday}T00:00:00-03:00`),
    end: new Date(`${nextMonday}T00:00:00-03:00`),
    label: `${monday.slice(8, 10)}/${monday.slice(5, 7)} a ${new Date(new Date(`${nextMonday}T12:00:00Z`).getTime() - 86400000).toISOString().slice(8, 10)}/${new Date(new Date(`${nextMonday}T12:00:00Z`).getTime() - 86400000).toISOString().slice(5, 7)}/${monday.slice(0, 4)}`,
  };
}

export function getWeeklyAgenda(items: EventItem[], now = new Date()) {
  const { start, end } = getWeeklyAgendaWindow(now);
  const seen = new Set<string>();
  return items.filter((item) => {
    const begins = item.startsAt ? Date.parse(item.startsAt) : NaN;
    const expires = item.expiresAt ?? item.endsAt;
    const cutoff = expires ? Date.parse(expires) : NaN;
    if (item.publicationStatus !== 'published' ||
      [item.title, item.place, item.region, item.dateLabel, item.description].some(isPlaceholder) ||
      !item.source || item.source.kind !== 'official' || !item.source.url ||
      !/^https:\/\//.test(item.source.url) ||
      !Number.isFinite(begins) || !Number.isFinite(cutoff) || cutoff <= now.getTime() ||
      begins < Math.max(start.getTime(), now.getTime()) || begins >= end.getTime()) return false;
    const key = `${item.place.toLowerCase()}|${begins}|${item.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
}
