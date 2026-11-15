import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember15 } from '@/data/seeds/events-2026-11-15';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';
import { candidatePlacesNovember15 } from '@/data/seeds/place-candidates-2026-11-15';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 15–28/11/2026', () => {
  it('contains 39 dated events with official sources and unique ids', () => {
    expect(confirmedEventsNovember15).toHaveLength(39);
    expect(new Set(confirmedEventsNovember15.map((event) => event.id)).size).toBe(39);

    for (const event of confirmedEventsNovember15) {
      expect(event.startsAt).toBeTruthy();
      expect(event.endsAt).toBeTruthy();
      expect(event.expiresAt).toBe(event.endsAt);
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.source?.verifiedAt).toBe('2026-11-15');
      expect(event.publicationStatus).toBe('published');
    }
  });

  it('includes the Sunday 15/11 additions in the current Monday–Sunday window only once', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T08:53:00-03:00'));

    const agenda = await getPublicAgenda();
    const weekly = getWeeklyAgenda(agenda);

    expect(agenda.filter((event) => event.id === 'molhadera-complexo-2026-11-15')).toHaveLength(1);
    expect(agenda.filter((event) => event.id === 'choppada-mada-2026-11-15')).toHaveLength(1);
    expect(weekly.some((event) => event.id === 'molhadera-complexo-2026-11-15')).toBe(true);
    expect(weekly.some((event) => event.id === 'choppada-mada-2026-11-15')).toBe(true);
    expect(weekly.some((event) => event.id === 'forro-varanda-contexto-2026-11-17')).toBe(false);
  });

  it('keeps the already-published Alberto Moreno event as a single local fallback entry', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-15T08:53:00-03:00'));

    const agenda = await getPublicAgenda();
    expect(agenda.filter((event) => event.id === 'alberto-moreno-adega-2026-11-21')).toHaveLength(1);
  });

  it('includes the verified venue schedules in the next Monday–Sunday window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    const weekly = getWeeklyAgenda(agenda);

    for (const id of [
      'surra-de-modao-contexto-2026-11-18',
      'ticiana-rosana-brown-2026-11-17',
      'infinu-jimi-oliver-2026-11-18',
      'infinu-joyce-alane-2026-11-19',
      'infinu-soxodo-2026-11-20',
      'ambar-sexta-mtv-summer-eletro-clipes-2026-11-20',
    ]) {
      expect(weekly.some((event) => event.id === id)).toBe(true);
    }
  });

  it('keeps the three new venue candidates as unverified drafts outside the public seed', () => {
    expect(candidatePlacesNovember15).toHaveLength(3);
    for (const candidate of candidatePlacesNovember15) {
      expect(candidate.status).toBe('confirmed_candidate');
      expect(candidate.place.publicationStatus).toBe('draft');
      expect(candidate.place.verified).toBe(false);
      expect(candidate.sources.some((source) => source.kind === 'official')).toBe(true);
    }
  });

});
