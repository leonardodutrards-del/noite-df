import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember14Upcoming } from '@/data/seeds/events-2026-11-14-upcoming';
import { additionalPlacesNovember14 } from '@/data/seeds/places-2026-11-14';
import { getPublicAgenda } from '@/modules/events/public-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Cobertura diária — 14/11/2026', () => {
  it('includes only the three newly confirmed dated events with official sources', () => {
    expect(confirmedEventsNovember14Upcoming).toHaveLength(3);
    expect(new Set(confirmedEventsNovember14Upcoming.map((event) => event.id)).size).toBe(3);

    for (const event of confirmedEventsNovember14Upcoming) {
      expect(event.startsAt).toBeTruthy();
      expect(event.place).toBeTruthy();
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.publicationStatus).toBe('published');
    }

    expect(confirmedEventsNovember14Upcoming.map((event) => event.startsAt?.slice(0, 10))).toEqual([
      '2026-11-19',
      '2026-11-21',
      '2026-11-21',
    ]);
  });

  it('exposes the new events in the public agenda while keeping new venues in draft', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-14T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    for (const event of confirmedEventsNovember14Upcoming) {
      expect(agenda.some((item) => item.id === event.id)).toBe(true);
    }

    expect(additionalPlacesNovember14).toHaveLength(2);
    for (const place of additionalPlacesNovember14) {
      expect(place.publicationStatus).toBe('draft');
      expect(place.verified).toBe(false);
      expect(place.source?.kind).toBe('official');
    }
    expect(additionalPlacesNovember14.map((place) => place.id)).toEqual([
      'saguari-gastro-house-samambaia',
      'toinha-brasil-show-guara',
    ]);
  });
});
