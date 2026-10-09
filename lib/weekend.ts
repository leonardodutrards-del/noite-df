import type { EventItem } from '@/modules/events/types';
import { isConfirmedEvent } from '@/lib/data-quality';

const brasiliaDay = (now: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
};

const dateKey = (day: Date) => day.toISOString().slice(0, 10);
const dateLabel = (day: Date) => new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', day: '2-digit', month: 'long',
}).format(day);

export function getWeekendWindow(now = new Date()) {
  const today = brasiliaDay(now);
  // Friday to Sunday in Brasília; on Monday through Thursday show the next weekend.
  const daysUntilFriday = (5 - today.getUTCDay() + 7) % 7;
  const friday = new Date(today);
  friday.setUTCDate(today.getUTCDate() + (today.getUTCDay() === 0 ? -2 : today.getUTCDay() === 6 ? -1 : daysUntilFriday));
  const sunday = new Date(friday);
  sunday.setUTCDate(friday.getUTCDate() + 2);
  return { start: dateKey(friday), end: dateKey(sunday), label: `${dateLabel(friday)} a ${dateLabel(sunday)}` };
}

const eventDay = (event: EventItem) => event.startsAt?.slice(0, 10) ??
  event.dateLabel.match(/^(\d{2})\/(\d{2})\/(\d{4})/)?.slice(1).reverse().join('-');

function eventsInWindow(items: EventItem[], start: string, end: string) {
  return items.filter(event => {
    if (!isConfirmedEvent(event) || event.source?.kind !== 'official' || !event.source.url) return false;
    const day = eventDay(event);
    return !!day && day >= start && day <= end;
  }).sort((a, b) => (eventDay(a) ?? '').localeCompare(eventDay(b) ?? '') ||
    (a.startsAt ?? '').localeCompare(b.startsAt ?? ''));
}

export function getWeekendEvents(items: EventItem[], now = new Date()) {
  const { start, end } = getWeekendWindow(now);
  return eventsInWindow(items, start, end);
}

export function getNextConfirmedWeekend(items: EventItem[], now = new Date(), maxWeeks = 6) {
  const base = getWeekendWindow(now);
  for (let offset = 0; offset < maxWeeks; offset += 1) {
    const friday = new Date(`${base.start}T12:00:00Z`);
    friday.setUTCDate(friday.getUTCDate() + offset * 7);
    const sunday = new Date(friday);
    sunday.setUTCDate(friday.getUTCDate() + 2);
    const start = dateKey(friday);
    const end = dateKey(sunday);
    const events = eventsInWindow(items, start, end);
    if (events.length > 0 || offset === maxWeeks - 1) {
      return {
        start,
        end,
        label: `${dateLabel(friday)} a ${dateLabel(sunday)}`,
        events,
        shifted: offset > 0,
      };
    }
  }
  return { ...base, events: [] as EventItem[], shifted: false };
}

export function getWeekendDays(now = new Date(), startOverride?: string) {
  const start = startOverride ?? getWeekendWindow(now).start;
  return ['Sexta-feira', 'Sábado', 'Domingo'].map((name, offset) => {
    const day = new Date(`${start}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + offset);
    const key = dateKey(day);
    return { key, title: `${name} · ${key.slice(8, 10)}/${key.slice(5, 7)}` };
  });
}
