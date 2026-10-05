import type { EventItem } from '@/modules/events/types';
import { isPlaceholder } from '@/lib/data-quality';

const zone = 'America/Sao_Paulo';

function localParts(now: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return { year: value('year'), month: value('month'), day: value('day') };
}

export function getMonthlyAgendaWindow(now = new Date()) {
  const { year, month } = localParts(now);
  const nextMonthDate = new Date(`${year}-${month}-01T12:00:00Z`);
  nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
  const nextYear = String(nextMonthDate.getUTCFullYear());
  const nextMonth = String(nextMonthDate.getUTCMonth() + 1).padStart(2, '0');

  const start = new Date(`${year}-${month}-01T00:00:00-03:00`);
  const end = new Date(`${nextYear}-${nextMonth}-01T00:00:00-03:00`);
  const label = new Intl.DateTimeFormat('pt-BR', {
    timeZone: zone,
    month: 'long',
    year: 'numeric',
  }).format(now);

  return { start, end, label };
}

export function getMonthlyAgenda(items: EventItem[], now = new Date()) {
  const { start, end } = getMonthlyAgendaWindow(now);
  const seen = new Set<string>();

  return items.filter((item) => {
    const begins = item.startsAt ? Date.parse(item.startsAt) : NaN;
    const expires = item.expiresAt ?? item.endsAt;
    const cutoff = expires ? Date.parse(expires) : NaN;

    if (
      item.publicationStatus !== 'published' ||
      [item.title, item.place, item.region, item.dateLabel, item.description].some(isPlaceholder) ||
      !item.source ||
      item.source.kind !== 'official' ||
      !item.source.url ||
      !/^https:\/\//.test(item.source.url) ||
      !Number.isFinite(begins) ||
      !Number.isFinite(cutoff) ||
      cutoff <= now.getTime() ||
      begins < Math.max(start.getTime(), now.getTime()) ||
      begins >= end.getTime()
    ) {
      return false;
    }

    const key = `${item.place.toLowerCase()}|${begins}|${item.title.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
}

export function groupMonthlyAgendaByDate(items: EventItem[]) {
  const groups = new Map<string, EventItem[]>();

  for (const item of items) {
    if (!item.startsAt) continue;
    const date = new Date(item.startsAt);
    const key = new Intl.DateTimeFormat('sv-SE', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([date, events]) => ({
    date,
    label: new Intl.DateTimeFormat('pt-BR', {
      timeZone: zone,
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(`${date}T12:00:00-03:00`)),
    events,
  }));
}
