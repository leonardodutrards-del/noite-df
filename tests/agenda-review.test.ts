import { afterEach, expect, it, vi } from 'vitest';
import { getPublicAgenda } from '../modules/events/public-agenda';
import { confirmedAgendaUpdates, heldAgendaIds } from '../data/agenda-review-2026-10-13';
import { confirmedEventsOctober26 } from '../data/seeds/events-2026-10-26';
const mocks = vi.hoisted(() => ({ rows: vi.fn(), places: vi.fn() }));
vi.mock('../lib/supabase-admin', () => ({ getSupabaseAdminConfig: () => ({}) }));
vi.mock('../modules/events/store', () => ({ listEditorialEvents: mocks.rows }));
vi.mock('../modules/establishments/service', () => ({ establishmentService: { search: mocks.places } }));
afterEach(() => { vi.resetAllMocks(); vi.useRealTimers(); });
it('publishes the three verified October additions without claiming artwork rights and expires each one', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T15:00:00Z'));
  mocks.rows.mockResolvedValue([]);
  mocks.places.mockResolvedValue([]);
  const agenda = await getPublicAgenda();
  for (const event of confirmedEventsOctober26) {
    expect(agenda.filter(item => item.id === event.id)).toHaveLength(1);
    expect(event.source?.verifiedAt).toBe('2026-10-26');
    expect(event.artwork).toBeUndefined();
    expect(Date.parse(event.endsAt!)).toBeGreaterThan(Date.parse(event.startsAt!));
    vi.setSystemTime(new Date(event.expiresAt!));
    expect((await getPublicAgenda()).some(item => item.id === event.id)).toBe(false);
  }
});
it('prefers a database correction of an October addition with the same official source', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-26T15:00:00Z'));
  const event = confirmedEventsOctober26[0];
  mocks.places.mockResolvedValue([{ id: 'contexto', name: event.place, region: event.region, publicationStatus: 'published' }]);
  mocks.rows.mockResolvedValue([{
    id: 'contexto-corrected', establishment_id: 'contexto', title: 'Programação atualizada do Contexto',
    category: event.category, description: event.description, starts_at: event.startsAt, ends_at: event.endsAt,
    price_description: event.admissionNote, official_url: `${event.source!.url}/?ref=official`,
    publication_status: 'published', verified_at: '2026-10-27T12:00:00Z', updated_at: '2026-10-27T12:00:00Z',
  }]);
  const agenda = await getPublicAgenda();
  expect(agenda.some(item => item.id === event.id)).toBe(false);
  expect(agenda.some(item => item.id === 'contexto-corrected')).toBe(true);
});
it('shows the confirmed Eita event with database enabled, without inventing closing time, then expires it', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-16T13:31:00Z'));
  mocks.rows.mockResolvedValue([]);
  mocks.places.mockResolvedValue([]);
  const event = (await getPublicAgenda()).find(item => item.id === 'eita-the-chaos-party-2026-10-16');
  expect(event?.startsAt).toBe('2026-10-16T21:00:00-03:00');
  expect(event?.admissionNote).toContain('R$ 30');
  expect(event?.endsAt).toBeUndefined();
  vi.setSystemTime(new Date('2026-10-17T03:00:00Z'));
  expect((await getPublicAgenda()).some(item => item.id === event?.id)).toBe(false);
});
it('holds stale records, publishes confirmed additions once and keeps subsequent editorial updates', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-16T13:31:00Z'));
  const base = confirmedAgendaUpdates[0];
  mocks.places.mockResolvedValue([{ id: 'complexo-fora-do-eixo', name: 'Complexo', region: 'SAAN', publicationStatus: 'published' }]);
  mocks.rows.mockResolvedValue([{ ...base, id: Array.from(heldAgendaIds)[0], verified_at: '2026-09-16T00:00:00Z', title: 'Needs confirmation' }, { ...base, id: 'db-newer', title: 'Antilove atualizado', verified_at: '2026-10-14T00:00:00Z' }]);
  const result = await getPublicAgenda();
  expect(result.some(e => e.title === 'Needs confirmation')).toBe(false);
  expect(result.filter(e => e.source?.url === base.official_url)).toHaveLength(1);
  expect(result.some(e => e.title === 'Antilove atualizado')).toBe(true);
});
