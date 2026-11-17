import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember17 } from '@/data/seeds/events-2026-11-17';
import { getPublicAgenda } from '@/modules/events/public-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 17/11/2026', () => {
  it('contains the two newly confirmed events with official sources and unique ids', () => {
    expect(confirmedEventsNovember17).toHaveLength(2);
    expect(new Set(confirmedEventsNovember17.map((event) => event.id)).size).toBe(2);

    for (const event of confirmedEventsNovember17) {
      expect(event.startsAt).toBeTruthy();
      expect(event.endsAt).toBeTruthy();
      expect(event.expiresAt).toBe(event.endsAt);
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.source?.verifiedAt).toBe('2026-11-17');
      expect(event.publicationStatus).toBe('published');
      expect(new Date(event.startsAt!).getTime()).toBeGreaterThan(new Date('2026-11-17T08:00:00-03:00').getTime());
    }
  });

  it('exposes the new events and the corrected Contexto details in the public agenda', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-17T08:00:00-03:00'));

    const agenda = await getPublicAgenda();

    expect(agenda.some((event) => event.id === 'consciencia-negra-babylon-2026-11-20')).toBe(true);
    expect(agenda.some((event) => event.id === 'noite-na-skina-2026-11-21')).toBe(true);

    const sertanejada = agenda.find((event) => event.id === 'surra-de-modao-contexto-2026-11-18');
    expect(sertanejada?.title).toBe('A Sertajenada convida + Cardápio em Dobro');
    expect(sertanejada?.source?.verifiedAt).toBe('2026-11-17');

    const toma = agenda.find((event) => event.id === 'festa-toma-contexto-2026-11-21');
    expect(toma?.endsAt).toBe('2026-11-22T09:00:00-03:00');
    expect(toma?.expiresAt).toBe('2026-11-22T09:00:00-03:00');
    expect(toma?.source?.verifiedAt).toBe('2026-11-17');
  });
});
