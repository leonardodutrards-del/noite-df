import { afterEach, describe, expect, it, vi } from 'vitest';
import { confirmedEventsNovember15 } from '@/data/seeds/events-2026-11-15';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';
import { additionalPlacesNovember10 } from '@/data/seeds/places-2026-11-10';

vi.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdminConfig: () => null,
}));

afterEach(() => vi.useRealTimers());

describe('Agenda diária 16/11/2026–16/01/2027', () => {
  it('contains 74 future-dated events with official sources and unique ids', () => {
    expect(confirmedEventsNovember15).toHaveLength(74);
    expect(new Set(confirmedEventsNovember15.map((event) => event.id)).size).toBe(74);

    for (const event of confirmedEventsNovember15) {
      expect(event.startsAt).toBeTruthy();
      expect(event.expiresAt).toBeTruthy();
      if (event.endsAt) expect(event.expiresAt).toBe(event.endsAt);
      expect(event.source?.kind).toBe('official');
      expect(event.source?.url).toMatch(/^https:\/\//);
      expect(['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-19']).toContain(event.source?.verifiedAt);
      expect(new Date(event.startsAt!).getTime()).toBeGreaterThanOrEqual(new Date('2026-11-16T00:00:00-03:00').getTime());
      expect(event.publicationStatus).toBe('published');
    }
  });

  it('removes expired 15/11 events and keeps the current Monday–Sunday window', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    const weekly = getWeeklyAgenda(agenda);

    for (const id of [
      'molhadera-complexo-2026-11-15',
      'choppada-mada-2026-11-15',
      'tardezinha-club-2026-11-15',
    ]) {
      expect(agenda.some((event) => event.id === id)).toBe(false);
    }
    expect(weekly.some((event) => event.id === 'forro-varanda-contexto-2026-11-17')).toBe(true);
    expect(weekly.some((event) => event.id === 'surra-de-modao-contexto-2026-11-18')).toBe(true);
  });

  it('keeps the already-published Alberto Moreno event as a single local fallback entry', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T08:00:00-03:00'));

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

  it('keeps verified venue candidates as unverified drafts outside the public seed', () => {
    const candidateIds = ['texxas-bar', 'estacao-beira-lago', 'arena-dose-dupla', 'o-dalva-cozinha-bar-samambaia', 'khouse-sushi-valparaiso', 'villa-butiquim-samambaia', 'oca-do-lago-asa-norte', 'royal-lounge-ceilandia', 'amsterdam-bar-santa-maria'];
    const candidates = additionalPlacesNovember10.filter((place) => candidateIds.includes(place.id));
    expect(candidates).toHaveLength(9);
    const amsterdam = candidates.find((candidate) => candidate.id === 'amsterdam-bar-santa-maria');
    expect(amsterdam?.name).toBe('Amsterdam Bar');
    expect(amsterdam?.address).toContain('DF-290');
    expect(amsterdam?.source?.url).toBe('https://crm.amsterdams.live/');

    for (const candidate of candidates) {
      expect(candidate.publicationStatus).toBe('draft');
      expect(candidate.verified).toBe(false);
      expect(candidate.source?.kind).toBe('official');
      expect(candidate.source?.url).toMatch(/^https:\/\//);
    }
  });


  it('includes newly verified official events across Brasília and Entorno', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-16T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    const weekly = getWeeklyAgenda(agenda);

    for (const id of [
      'porks-almost-unplugged-2026-11-20',
      'noite-dominicana-oca-2026-11-19',
      'underbeat-royal-lounge-2026-11-19',
      'amor-de-quinta-oscarito-2026-11-19',
      'sextanejada-oscarito-2026-11-20',
      'corona-day-oscarito-2026-11-21',
      'sabado-oscarito-2026-11-21',
      'sabado-magico-contexto-2026-11-21',
      'moleca-arena-dose-dupla-2026-11-21',
      'tbt-do-benza-arena-ccb-2026-11-19',
      'gudinaite-aabb-2026-11-21',
      'flashback-luziania-2026-11-21',
      'dominguinho-club-2026-11-22',
      'na-batida-do-morro-10-anos-2026-11-21',
    ]) {
      expect(weekly.some((event) => event.id === id)).toBe(true);
    }

    for (const id of [
      'aquele-domingo-club-2026-11-29',
      'chrigor-estacao-beira-lago-2026-11-29',
      'orla-party-chacara-eles-reis-2026-12-20',
      'nojo-de-farra-birosca-2026-12-04',
      'lacre-001-birosca-2026-12-04',
      'garoto-circo-dancante-birosca-2026-12-05',
      'conclave-furacao-2000-birosca-2026-12-11',
      'club-vittar-pabllo-vittar-arena-birosca-2026-12-12',
      'garoto-new-year-birosca-2027-01-02',
      'garoto-festival-anitta-birosca-2027-01-16',
      'bsb-punk-fest-rancore-infinu-2026-11-29',
      'isso-e-jazz-esdras-marcus-moacir-santos-infinu-2026-12-02',
      'tranquilo-jonatas-belgrande-infinu-2026-12-03',
      'infinu-daparte-2026-12-05',
      'infinu-mombojo-2026-12-05',
      'tom-ribeira-vovovovo-infinu-2026-12-06',
      'isso-e-jazz-iara-gomes-monk-infinu-2026-12-09',
      'tranquilo-youn-infinu-2026-12-10',
      'infinu-replicantes-2026-12-12',
      'valhalla-device-death-metal-infinu-2026-12-13',
      'isso-e-jazz-esdras-grupo-transa-infinu-2026-12-16',
      'isso-e-jazz-dominguinhos-infinu-2026-12-23',
      'isso-e-jazz-bailao-fim-ano-infinu-2026-12-30',
    ]) {
      expect(agenda.some((event) => event.id === id)).toBe(true);
    }

    const porks = agenda.find((event) => event.id === 'porks-almost-unplugged-2026-11-20');
    expect(porks?.startsAt).toBe('2026-11-20T21:00:00-03:00');
    expect(porks?.endsAt).toBeUndefined();
    expect(porks?.expiresAt).toBe('2026-11-21T00:00:00-03:00');
  });


  it('uses the latest official Sympla schedule for MOLHADÊRA on 20/11', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-19T08:00:00-03:00'));

    const agenda = await getPublicAgenda();
    const molhadera = agenda.find((event) => event.id === 'molhadera-complexo-2026-11-20');

    expect(molhadera?.startsAt).toBe('2026-11-20T21:00:00-03:00');
    expect(molhadera?.dateLabel).toContain('21h–05h');
    expect(molhadera?.description).toContain('Gustavo Machado 98');
    expect(molhadera?.description).toContain('Matteo');
    expect(molhadera?.description).not.toContain('Pagode do Edu');
    expect(molhadera?.source?.verifiedAt).toBe('2026-11-19');
  });

});
