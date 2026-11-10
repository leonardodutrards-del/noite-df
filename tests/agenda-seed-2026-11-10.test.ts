import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember10 } from '@/data/seeds/events-2026-11-10';
import { additionalPlacesNovember10 } from '@/data/seeds/places-2026-11-10';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 10–16/11/2026', () => {
  it('contains 27 dated events with official sources and unique ids', () => {
    expect(confirmedEventsNovember10).toHaveLength(27);
    expect(new Set(confirmedEventsNovember10.map((event) => event.id)).size).toBe(27);
    expect(confirmedEventsNovember10.some((event) => event.id === 'infinu-cabare-noturno-plastique-noir-2026-11-15')).toBe(true);
    expect(confirmedEventsNovember10.some((event) => event.id === 'oscarito-sabado-2026-11-14')).toBe(true);
    expect(confirmedEventsNovember10.some((event) => event.id === 'texxas-bar-os-meninos-barao-2026-11-13')).toBe(true);
    expect(confirmedEventsNovember10.some((event) => event.id === 'arena-dose-dupla-os-meninos-barao-2026-11-14')).toBe(true);
    expect(confirmedEventsNovember10.some((event) => event.id === 'arena-dose-dupla-10-horas-forro-2026-11-15')).toBe(true);

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
    expect(agenda.some((event) => event.id === 'oscarito-sabado-2026-11-14')).toBe(true);
    expect(agenda.some((event) => event.id === 'texxas-bar-os-meninos-barao-2026-11-13')).toBe(true);
    const weekly = getWeeklyAgenda(agenda);
    expect(weekly.some((event) => event.id === 'oscarito-sabado-2026-11-14')).toBe(true);
    expect(weekly.some((event) => event.id === 'texxas-bar-os-meninos-barao-2026-11-13')).toBe(true);
    expect(weekly.some((event) => event.id === 'arena-dose-dupla-os-meninos-barao-2026-11-14')).toBe(true);
    expect(weekly.some((event) => event.id === 'arena-dose-dupla-10-horas-forro-2026-11-15')).toBe(true);
    const tenHours = confirmedEventsNovember10.find((event) => event.id === 'arena-dose-dupla-10-horas-forro-2026-11-15');
    expect(tenHours?.endsAt).toBeUndefined();
    expect(tenHours?.dateLabel).toBe('Domingo, 15/11/2026 · a partir das 16h');
  });

  it('keeps Estação Beira Lago as a draft candidate without guessing an Instagram URL', () => {
    const station = additionalPlacesNovember10.find((place) => place.id === 'estacao-beira-lago');
    expect(station).toBeDefined();
    expect(station?.source?.url).toBe('https://linktr.ee/estacaobeiralago');
    expect(station?.publicationStatus).toBe('draft');
    expect(station?.verified).toBe(false);
    expect(station?.source?.kind).toBe('external');
    expect(station?.instagram).toBeUndefined();

    const texxas = additionalPlacesNovember10.find((place) => place.id === 'texxas-bar');
    expect(texxas).toBeDefined();
    expect(texxas?.publicationStatus).toBe('draft');
    expect(texxas?.verified).toBe(false);
    expect(texxas?.instagram).toBe('https://www.instagram.com/texxasbarbsb/');
    expect(texxas?.source?.url).toBe('https://www.sympla.com.br/evento/lgc/3586903');

    const arena = additionalPlacesNovember10.find((place) => place.id === 'arena-dose-dupla');
    expect(arena).toBeDefined();
    expect(arena?.publicationStatus).toBe('draft');
    expect(arena?.verified).toBe(false);
    expect(arena?.instagram).toBe('https://www.instagram.com/arenadosedupla/');
    expect(arena?.source?.url).toBe('https://www.sympla.com.br/evento/10-horas-de-forro/3614097');
  });
});
