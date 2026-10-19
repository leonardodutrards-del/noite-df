import type { EventItem } from '@/modules/events/types';

const zone = 'America/Sao_Paulo';
const dayKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
const shortDate = (date: Date, year = false) => new Intl.DateTimeFormat('pt-BR', { timeZone: zone, day: '2-digit', month: '2-digit', ...(year ? { year: 'numeric' } : {}) }).format(date);
const weekday = (date: Date) => new Intl.DateTimeFormat('pt-BR', { timeZone: zone, weekday: 'long' }).format(date).replace('-feira', '');
const hour = (date: Date) => new Intl.DateTimeFormat('pt-BR', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date).replace(':00', 'h').replace(':', 'h').replace(/^0/, '');

export function eventDateDisplay(event: Pick<EventItem, 'startsAt' | 'endsAt' | 'dateLabel'>) {
  const start = new Date(event.startsAt || '');
  const end = new Date(event.endsAt || '');
  if (!Number.isFinite(start.getTime())) {
    const [date, ...time] = event.dateLabel.split(' · ');
    return { date, time: time.join(' · '), note: '' };
  }
  const crossYear = Number.isFinite(end.getTime()) && dayKey(start).slice(0, 4) !== dayKey(end).slice(0, 4);
  const day = weekday(start);
  const date = `${day[0].toUpperCase()}${day.slice(1)}, ${shortDate(start, crossYear)}`;
  if (!Number.isFinite(end.getTime()) || end <= start) return { date, time: hour(start), note: '' };
  const time = `${hour(start)} às ${hour(end)}`;
  if (dayKey(start) === dayKey(end)) return { date, time, note: '' };
  const endHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', hourCycle: 'h23' }).format(end));
  const nextDay = dayKey(new Date(start.getTime() + 86400000)) === dayKey(end);
  const note = nextDay && endHour < 6
    ? `Termina na madrugada de ${weekday(end)}, ${shortDate(end, crossYear)}.`
    : `Termina ${weekday(end)}, ${shortDate(end, crossYear)}.`;
  return { date, time, note };
}
