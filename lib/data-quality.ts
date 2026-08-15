import type { Establishment, WeeklyScheduleItem, CrowdStatus } from '@/modules/establishments/types';
import type { EventItem } from '@/modules/events/types';

const PLACEHOLDER_PATTERNS = [
  'a confirmar',
  'atualizacao em breve',
  'ainda nao localizada',
  'ainda nao localizado',
  'exemplo de evento',
  'espaco reservado',
  'em breve',
  'monitorar',
  'demonstracao do mvp',
  'placeholder',
  'nao informado',
  'pendente',
  '—',
  '-',
];

export function normalizeString(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

export function isPlaceholder(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) || value <= 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return true;
    }
    const normalized = normalizeString(trimmed);
    return PLACEHOLDER_PATTERNS.some((pattern) => normalized === pattern || normalized.includes(pattern));
  }

  return false;
}

export function hasRealValue(value: unknown): boolean {
  return !isPlaceholder(value);
}

export function getConfirmedCrowdStatus(status?: CrowdStatus | string | null): CrowdStatus | undefined {
  if (!status || isPlaceholder(status)) {
    return undefined;
  }
  const normalized = normalizeString(status);
  if (normalized === 'a confirmar' || normalized.includes('confirmar')) {
    return undefined;
  }
  if (['tranquilo', 'movimentado', 'lotado'].includes(normalized)) {
    return status as CrowdStatus;
  }
  return undefined;
}

export function getConfirmedSchedules(schedules?: WeeklyScheduleItem[] | null): WeeklyScheduleItem[] {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }

  return schedules.filter((item) => {
    if (!item) return false;
    if (isPlaceholder(item.day) || isPlaceholder(item.title) || isPlaceholder(item.time)) {
      return false;
    }
    if (item.details && isPlaceholder(item.details)) {
      return false;
    }
    return true;
  });
}

export function isConfirmedEvent(event?: EventItem | null): boolean {
  if (!event) return false;

  if (event.publicationStatus && event.publicationStatus !== 'published') {
    return false;
  }

  if (
    isPlaceholder(event.title) ||
    isPlaceholder(event.place) ||
    isPlaceholder(event.dateLabel) ||
    isPlaceholder(event.description)
  ) {
    return false;
  }

  // Must have an identifiable, non-placeholder source
  if (!event.source || !event.source.label || isPlaceholder(event.source.label)) {
    return false;
  }

  // Check if date has expired
  if (event.endsAt) {
    const ends = new Date(event.endsAt).getTime();
    if (!Number.isNaN(ends) && ends < Date.now()) {
      return false;
    }
  }

  return true;
}

export function hasConfirmedRating(place?: Establishment | null): boolean {
  if (!place) return false;
  if (typeof place.rating !== 'number' || Number.isNaN(place.rating) || place.rating <= 0) {
    return false;
  }

  // A valid rating must be backed by confirmed public ratings or a non-empty rating breakdown
  const hasConfirmedPublicRatings = Array.isArray(place.publicRatings) &&
    place.publicRatings.some((s) => s.status === 'confirmed' && typeof s.rating === 'number' && s.rating > 0);

  const hasConfirmedBreakdown = !!(
    place.ratingBreakdown &&
    typeof place.ratingBreakdown.overall === 'number' &&
    place.ratingBreakdown.overall > 0 &&
    (place.ratingBreakdown.reviewCount ?? 0) > 0
  );

  return hasConfirmedPublicRatings || hasConfirmedBreakdown;
}
