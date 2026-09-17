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

export function getWeekendEvents(items: EventItem[], now = new Date()) {
  const { start, end } = getWeekendWindow(now);
  const eventDay = (event: EventItem) => event.startsAt?.slice(0, 10) ??
    event.dateLabel.match(/^(\d{2})\/(\d{2})\/(\d{4})/)?.slice(1).reverse().join('-');
  return items.filter(event => {
    if (!isConfirmedEvent(event) || event.source?.kind !== 'official' || !event.source.url) return false;
    const day = eventDay(event);
    return !!day && day >= start && day <= end;
  }).sort((a, b) => (eventDay(a) ?? '').localeCompare(eventDay(b) ?? '') ||
    (a.startsAt ?? '').localeCompare(b.startsAt ?? ''));
}
