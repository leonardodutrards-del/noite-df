import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember10 } from '@/data/seeds/events-2026-11-10';
import { confirmedEventsNovember10Upcoming } from '@/data/seeds/events-2026-11-10-upcoming';
import { additionalPlacesNovember10 } from '@/data/seeds/places-2026-11-10';
import { getPublicAgenda } from '@/modules/events/public-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 10–16/11/2026', () => {
  it('contains 23 dated events with official sources and unique ids', () => {
    expect(confirmedEventsNovember10).toHaveLength(23);
    expect(new Set(confirmedEventsNovember10.map((event) => event.id)).size).toBe(23);
    expect(confirmedEventsNovember10.some((event) => event.id === 'infinu-cabare-noturno-plastique-noir-2026-11-15')).toBe(true);

    for (const event of confirmedEventsNovember10) {
      expect(event.startsAt).toBeTruthy();
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.publicationStatus).toBe('published');
    }
  });

  it('preserves multiple events that share an official weekly agenda URL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    expect(agenda.filter((event) => event.id.startsWith('ticiana-')).length).toBe(6);
    expect(agenda.filter((event) => event.id.startsWith('ambar-')).length).toBe(3);
    expect(agenda.filter((event) => event.id.startsWith('birosca-')).length).toBe(2);
    expect(agenda.filter((event) => event.place === 'Infinu Comunidade Criativa' && event.startsAt?.slice(0, 10) === '2026-11-14')).toHaveLength(3);
    expect(agenda.filter((event) => event.place === 'Porks Sobradinho').length).toBe(3);
  });

  it('contains 28 additional future events with official sources and unique ids', () => {
    expect(confirmedEventsNovember10Upcoming).toHaveLength(28);
    expect(new Set(confirmedEventsNovember10Upcoming.map((event) => event.id)).size).toBe(28);
    expect(confirmedEventsNovember10Upcoming.every((event) => event.source?.kind === 'official')).toBe(true);
    expect(confirmedEventsNovember10Upcoming.every((event) => Date.parse(event.startsAt || '') > Date.parse('2026-11-16T23:59:59-03:00'))).toBe(true);
  });

  it('keeps distinct events on the same venue and date', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T08:00:00-03:00'));
    const agenda = await getPublicAgenda();
    expect(agenda.filter((event) => event.place === 'Birosca do Conic' && event.startsAt?.slice(0, 10) === '2026-12-04')).toHaveLength(2);
  });

  it('keeps Estação Beira Lago as a draft candidate without guessing an Instagram URL', () => {
    const station = additionalPlacesNovember10.find((place) => place.id === 'estacao-beira-lago');
    expect(station).toBeDefined();
    expect(station?.source?.url).toBe('https://linktr.ee/estacaobeiralago');
    expect(station?.publicationStatus).toBe('draft');
    expect(station?.verified).toBe(false);
    expect(station?.source?.kind).toBe('external');
    expect(station?.instagram).toBeUndefined();
  });
});
