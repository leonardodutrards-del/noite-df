import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember11 } from '@/data/seeds/events-2026-11-11';
import { additionalPlacesNovember11 } from '@/data/seeds/places-2026-11-11';
import { places } from '@/data/seeds/places';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Cobertura diária Noite DF — 11/11/2026', () => {
  it('inclui somente o evento novo com página oficial completa e identidade do local preservada', () => {
    expect(confirmedEventsNovember11).toHaveLength(1);
    expect(new Set(confirmedEventsNovember11.map((event) => event.id)).size).toBe(1);

    const event = confirmedEventsNovember11[0];
    expect(event.id).toBe('pagodao-das-estrelas-amsterda-2026-11-20');
    expect(event.startsAt).toBe('2026-11-20T15:00:00-03:00');
    expect(event.endsAt).toBe('2026-11-21T01:00:00-03:00');
    expect(event.place).toBe('Amsterdã (antigo Bahrein)');
    expect(event.region).toBe('Setor Hortigranjeiro');
    expect(event.source?.kind).toBe('official');
    expect(event.source?.url).toBe('https://www.sympla.com.br/evento/pagodao-das-estrelas/3637448');
    expect(event.publicationStatus).toBe('published');
  });

  it('mantém o evento futuro na agenda pública sem antecipá-lo à semana atual', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T08:40:00-03:00'));

    const agenda = await getPublicAgenda();
    expect(agenda.some((event) => event.id === 'pagodao-das-estrelas-amsterda-2026-11-20')).toBe(true);

    const weekly = getWeeklyAgenda(agenda);
    expect(weekly.some((event) => event.id === 'pagodao-das-estrelas-amsterda-2026-11-20')).toBe(false);
  });

  it('registra os novos locais como rascunhos e os mantém fora da lista pública', () => {
    expect(additionalPlacesNovember11).toHaveLength(33);
    expect(new Set(additionalPlacesNovember11.map((place) => place.id)).size).toBe(33);

    const publicIds = new Set(places.map((place) => place.id));
    for (const place of additionalPlacesNovember11) {
      expect(place.publicationStatus).toBe('draft');
      expect(place.verified).toBe(false);
      expect(place.source?.url).toMatch(/^https:\/\//);
      expect(publicIds.has(place.id)).toBe(false);
    }

    const vasto = additionalPlacesNovember11.find((place) => place.id === 'vasto-restaurante-brasilia-shopping');
    expect(vasto?.businessContact).toBeUndefined();
    expect(vasto?.publicationStatus).toBe('draft');

    const barLg = additionalPlacesNovember11.find((place) => /bar lg/i.test(place.name));
    expect(barLg).toBeUndefined();
  });
});
