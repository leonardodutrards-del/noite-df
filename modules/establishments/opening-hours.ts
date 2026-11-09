import type { Establishment } from './types';

export type WeekdayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type DayOpeningHours = { closed: boolean; open: string; close: string };
export type OperatingHours = {
  timezone: 'America/Sao_Paulo';
  schedule: Partial<Record<WeekdayKey, DayOpeningHours>>;
  sourceUrl?: string;
  checkedAt?: string;
  exceptions?: Record<string, DayOpeningHours>;
};
export type OpeningStatus = {
  state: 'open' | 'closed' | 'unknown';
  label: string;
  nextChange?: string;
};

const DAY_KEYS: Record<string, WeekdayKey> = {
  Mon: 'monday', Tue: 'tuesday', Wed: 'wednesday', Thu: 'thursday',
  Fri: 'friday', Sat: 'saturday', Sun: 'sunday',
};
const DAY_LABELS: Record<WeekdayKey, string> = {
  monday: 'segunda-feira', tuesday: 'terça-feira', wednesday: 'quarta-feira',
  thursday: 'quinta-feira', friday: 'sexta-feira', saturday: 'sábado', sunday: 'domingo',
};
const ORDER: WeekdayKey[] = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function partsAt(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'short', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}
function minutes(value: string) {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}
function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + amount);
  return result;
}
function localDateKey(date: Date, timezone: string) {
  const p = partsAt(date, timezone);
  return `${p.year}-${p.month}-${p.day}`;
}
function isFresh(hours: OperatingHours, now: Date) {
  if (!hours.checkedAt || !hours.sourceUrl) return false;
  const checked = new Date(`${hours.checkedAt}T12:00:00-03:00`);
  const age = now.getTime() - checked.getTime();
  return Number.isFinite(age) && age >= -86400000 && age <= 90 * 86400000;
}
function getDay(hours: OperatingHours, date: Date): DayOpeningHours | undefined {
  const key = DAY_KEYS[partsAt(date, hours.timezone).weekday];
  const exception = hours.exceptions?.[localDateKey(date, hours.timezone)];
  return exception ?? (key ? hours.schedule[key] : undefined);
}

export function getOpeningStatus(place: Pick<Establishment, 'operatingHours'>, now = new Date()): OpeningStatus {
  const hours = place.operatingHours as OperatingHours | undefined;
  if (!hours?.schedule || !isFresh(hours, now)) {
    return { state: 'unknown', label: 'Horário não confirmado' };
  }
  const timezone = hours.timezone || 'America/Sao_Paulo';
  const local = partsAt(now, timezone);
  const current = Number(local.hour) * 60 + Number(local.minute);
  const today = getDay(hours, now);
  const yesterday = getDay(hours, addDays(now, -1));

  if (yesterday && !yesterday.closed && minutes(yesterday.close) < minutes(yesterday.open) && current < minutes(yesterday.close)) {
    return { state: 'open', label: 'Aberto agora', nextChange: yesterday.close };
  }
  if (today && !today.closed && current >= minutes(today.open) && current < (minutes(today.close) > minutes(today.open) ? minutes(today.close) : 1440)) {
    return { state: 'open', label: 'Aberto agora', nextChange: today.close };
  }

  for (let offset = 0; offset < 8; offset += 1) {
    const date = addDays(now, offset);
    const day = getDay(hours, date);
    if (!day || day.closed) continue;
    const opening = minutes(day.open);
    if (offset > 0 || current < opening) {
      return { state: 'closed', label: offset === 0 ? `Abre hoje às ${day.open}` : `Abre ${DAY_LABELS[DAY_KEYS[partsAt(date, timezone).weekday]]} às ${day.open}` };
    }
  }
  return { state: 'closed', label: 'Fechado hoje' };
}

export function isValidOperatingHours(value: unknown): value is OperatingHours {
  if (!value || typeof value !== 'object') return false;
  const hours = value as Partial<OperatingHours>;
  if (hours.timezone !== 'America/Sao_Paulo' || !hours.schedule || typeof hours.schedule !== 'object') return false;
  for (const key of ORDER) {
    const day = hours.schedule[key];
    if (!day) continue;
    if (typeof day.closed !== 'boolean') return false;
    if (!day.closed && (!/^([01]\\d|2[0-3]):[0-5]\\d$/.test(day.open) || !/^([01]\\d|2[0-3]):[0-5]\\d$/.test(day.close) || day.open === day.close)) return false;
  }
  if (hours.sourceUrl && !/^https:\\/\\//i.test(hours.sourceUrl)) return false;
  if (hours.checkedAt && !/^\\d{4}-\\d{2}-\\d{2}$/.test(hours.checkedAt)) return false;
  return true;
}
