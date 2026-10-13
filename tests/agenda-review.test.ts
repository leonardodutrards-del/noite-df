import { afterEach, expect, it, vi } from 'vitest';
import { getPublicAgenda } from '../modules/events/public-agenda';
import { confirmedAgendaUpdates, heldAgendaIds } from '../data/agenda-review-2026-10-13';
const mocks = vi.hoisted(() => ({ rows: vi.fn(), places: vi.fn() }));
vi.mock('../lib/supabase-admin', () => ({ getSupabaseAdminConfig: () => ({}) }));
vi.mock('../modules/events/store', () => ({ listEditorialEvents: mocks.rows }));
vi.mock('../modules/establishments/service', () => ({ establishmentService: { search: mocks.places } }));
afterEach(() => vi.resetAllMocks());
it('holds stale records, publishes confirmed additions once and keeps subsequent editorial updates', async () => {
  const base = confirmedAgendaUpdates[0];
  mocks.places.mockResolvedValue([{ id: 'complexo-fora-do-eixo', name: 'Complexo', region: 'SAAN', publicationStatus: 'published' }]);
  mocks.rows.mockResolvedValue([{ ...base, id: Array.from(heldAgendaIds)[0], verified_at: '2026-09-16T00:00:00Z', title: 'Needs confirmation' }, { ...base, id: 'db-newer', title: 'Antilove atualizado', verified_at: '2026-10-14T00:00:00Z' }]);
  const result = await getPublicAgenda();
  expect(result.some(e => e.title === 'Needs confirmation')).toBe(false);
  expect(result.filter(e => e.source?.url === base.official_url)).toHaveLength(1);
  expect(result.some(e => e.title === 'Antilove atualizado')).toBe(true);
});
