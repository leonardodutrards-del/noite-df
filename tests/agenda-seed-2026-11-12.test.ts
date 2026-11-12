import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember12 } from '@/data/seeds/events-2026-11-12';
import { confirmedEventsNovember12Upcoming } from '@/data/seeds/events-2026-11-12-upcoming';
import { additionalPlacesNovember12 } from '@/data/seeds/places-2026-11-12';
import { places } from '@/data/seeds/places';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Cobertura diária Noite DF — 12/11/2026', () => {
  it('contains seven current-week events with official sources and unique ids', () => {
    expect(confirmedEventsNovember12).toHaveLength(10);
    expect(new Set(confirmedEventsNovember12.map((event) => event.id)).size).toBe(10);

    expect(confirmedEventsNovember12.some((event) => event.id === 'portal-pub-pagodin-0800-2026-11-13')).toBe(true);
    expect(confirmedEventsNovember12.some((event) => event.id === 'rancho-joao-paulin-piseiro-mistura-louca-2026-11-14')).toBe(true);
    expect(confirmedEventsNovember12.some((event) => event.id === 'club-gastrobar-tardezinha-2026-11-15')).toBe(true);

    for (const event of confirmedEventsNovember12) {
      expect(event.startsAt).toBeTruthy();
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.source?.verifiedAt).toBe('2026-11-12');
      expect(event.publicationStatus).toBe('published');

      const weekday = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        timeZone: 'America/Sao_Paulo',
      }).format(new Date(event.startsAt || '')).toLowerCase();
      expect(event.dateLabel.toLowerCase()).toContain(weekday);
    }
  });

  it('contains five future events with official sources and unique ids', () => {
    expect(confirmedEventsNovember12Upcoming).toHaveLength(5);
    expect(new Set(confirmedEventsNovember12Upcoming.map((event) => event.id)).size).toBe(5);
    expect(confirmedEventsNovember12Upcoming.every((event) => event.source?.kind === 'official')).toBe(true);
    expect(confirmedEventsNovember12Upcoming.every((event) => event.source?.verifiedAt === '2026-11-12')).toBe(true);
  });

  it('shows all current-week additions in the public weekly agenda and excludes past Surra de Modão', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-12T08:30:00-03:00'));

    const agenda = await getPublicAgenda();
    const weekly = getWeeklyAgenda(agenda);
    for (const event of confirmedEventsNovember12) {
      expect(weekly.some((item) => item.id === event.id)).toBe(true);
    }
    expect(weekly.some((event) => event.title.toLowerCase().includes('surra de modão'))).toBe(false);
  });

  it('keeps the five newly identified venues as draft-only profiles', () => {
    expect(additionalPlacesNovember12).toHaveLength(5);
    expect(new Set(additionalPlacesNovember12.map((place) => place.id)).size).toBe(5);
    expect(additionalPlacesNovember12.some((place) => place.id === 'portal-pub-e-lounge')).toBe(true);
    expect(additionalPlacesNovember12.some((place) => place.id === 'club-gastrobar-valparaiso')).toBe(true);
    const publicIds = new Set(places.map((place) => place.id));

    for (const place of additionalPlacesNovember12) {
      expect(place.publicationStatus).toBe('draft');
      expect(place.verified).toBe(false);
      expect(place.source?.kind).toBe('official');
      expect(place.source?.url).toMatch(/^https:\/\//);
      expect(publicIds.has(place.id)).toBe(false);
    }
  });
});
