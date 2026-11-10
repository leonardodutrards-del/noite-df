import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember10 } from '@/data/seeds/events-2026-11-10';
import { places } from '@/data/places';
import { getPublicAgenda } from '@/modules/events/public-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 10–16/11/2026', () => {
  it('contains 22 dated events with official sources and unique ids', () => {
    expect(confirmedEventsNovember10).toHaveLength(22);
    expect(new Set(confirmedEventsNovember10.map((event) => event.id)).size).toBe(22);

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
    expect(agenda.filter((event) => event.id.startsWith('porks-')).length).toBe(3);
  });

  it('adds Estação Beira Lago as a verified local profile without guessing an Instagram URL', () => {
    const station = places.find((place) => place.id === 'estacao-beira-lago');
    expect(station).toBeDefined();
    expect(station?.source?.url).toBe('https://linktr.ee/estacaobeiralago');
    expect(station?.publicationStatus).toBe('published');
    expect(station?.instagram).toBeUndefined();
  });
});
