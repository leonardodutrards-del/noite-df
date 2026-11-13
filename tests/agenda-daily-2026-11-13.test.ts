import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember13 } from '@/data/seeds/events-2026-11-13';
import { additionalPlacesNovember13 } from '@/data/seeds/places-2026-11-13';
import { confirmedEventsNovember10 } from '@/data/seeds/events-2026-11-10';
import { confirmedEventsNovember09 } from '@/data/seeds/events-2026-11-09';
import { places } from '@/data/seeds/places';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Cobertura diária Noite DF — 13/11/2026', () => {
  it('contains twelve new events with official ticketing sources and unique identities', () => {
    expect(confirmedEventsNovember13).toHaveLength(12);
    expect(new Set(confirmedEventsNovember13.map((event) => event.id)).size).toBe(12);

    for (const event of confirmedEventsNovember13) {
      expect(event.startsAt).toBeTruthy();
      expect(event.endsAt).toBeTruthy();
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(event.source?.verifiedAt).toBe('2026-11-13');
      expect(event.publicationStatus).toBe('published');

      const weekday = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        timeZone: 'America/Sao_Paulo',
      }).format(new Date(event.startsAt || '')).toLowerCase();
      expect(event.dateLabel.toLowerCase()).toContain(weekday);
    }
  });

  it('keeps the twelve additions visible in the public weekly agenda', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-13T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    const weekly = getWeeklyAgenda(agenda);
    for (const event of confirmedEventsNovember13) {
      expect(agenda.some((item) => item.id === event.id)).toBe(true);
      expect(weekly.some((item) => item.id === event.id)).toBe(true);
    }
  });

  it('holds future Ticiana dates because the official schedule page still shows 11/11', async () => {
    const heldIds = [
      'ticiana-marri-2026-11-13',
      'ticiana-alysson-takaki-2026-11-14',
      'ticiana-pj-camargo-2026-11-16',
    ];
    for (const id of heldIds) {
      expect(confirmedEventsNovember10.find((event) => event.id === id)?.publicationStatus).toBe('pending_review');
    }

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-13T08:00:00-03:00'));
    const agenda = await getPublicAgenda();
    for (const id of heldIds) {
      expect(agenda.some((event) => event.id === id)).toBe(false);
    }
  });

  it('keeps new venue profiles as draft-only until manual review', () => {
    expect(additionalPlacesNovember13).toHaveLength(5);
    expect(new Set(additionalPlacesNovember13.map((place) => place.id)).size).toBe(2);
    const publicIds = new Set(places.map((place) => place.id));

    for (const place of additionalPlacesNovember13) {
      expect(place.publicationStatus).toBe('draft');
      expect(place.verified).toBe(false);
      expect(place.source?.url).toMatch(/^https:\/\//);
      expect(publicIds.has(place.id)).toBe(false);
    }

    expect(additionalPlacesNovember13.some((place) => place.id === 'new-mercadito-asa-sul')).toBe(true);
    expect(additionalPlacesNovember13.some((place) => place.id === 'london-music-bar-asa-sul')).toBe(true);
    expect(additionalPlacesNovember13.some((place) => place.id === 'moto-rock-cia-pub')).toBe(true);
    expect(additionalPlacesNovember13.some((place) => place.id === 'espaco-cultural-galpaozinho')).toBe(true);
    expect(additionalPlacesNovember13.some((place) => place.id === 'aplausos-clube-comedia-guara')).toBe(true);
  });
  it('holds Porks events when the current official agenda cannot be rechecked', async () => {
    const heldIds = [
      'radio-capital-porks-sobradinho-2026-11-13',
      'velho-olho-vermelho-porks-sobradinho-2026-11-14',
    ];
    for (const id of heldIds) {
      expect(confirmedEventsNovember09.find((event) => event.id === id)?.publicationStatus).toBe('pending_review');
    }

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-13T08:00:00-03:00'));
    const agenda = await getPublicAgenda();
    for (const id of heldIds) {
      expect(agenda.some((event) => event.id === id)).toBe(false);
    }
  });

});
