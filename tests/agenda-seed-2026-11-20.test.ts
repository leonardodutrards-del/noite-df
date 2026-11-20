import { afterEach, expect, it, vi } from 'vitest';
import { getPublicAgenda } from '../modules/events/public-agenda';
import { confirmedEventsNovember20 } from '../data/seeds/events-2026-11-20';

const mocks = vi.hoisted(() => ({ rows: vi.fn(), places: vi.fn() }));
vi.mock('../lib/supabase-admin', () => ({ getSupabaseAdminConfig: () => ({}) }));
vi.mock('../modules/events/store', () => ({ listEditorialEvents: mocks.rows }));
vi.mock('../modules/establishments/service', () => ({ establishmentService: { search: mocks.places } }));

afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

it('publishes the six newly confirmed official Sympla events with exact local times', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-20T12:00:00Z'));
  mocks.rows.mockResolvedValue([]);
  mocks.places.mockResolvedValue([]);

  const agenda = await getPublicAgenda();

  for (const expected of confirmedEventsNovember20) {
    const matches = agenda.filter(event => event.id === expected.id);
    expect(matches).toHaveLength(1);
    expect(matches[0].source?.kind).toBe('official');
    expect(matches[0].source?.url).toBe(expected.source?.url);
    expect(matches[0].source?.verifiedAt).toBe('2026-11-20');
    expect(matches[0].startsAt).toBe(expected.startsAt);
    expect(matches[0].endsAt).toBe(expected.endsAt);
    expect(Date.parse(matches[0].endsAt!)).toBeGreaterThan(Date.parse(matches[0].startsAt!));
  }
});

it('keeps the newly confirmed events available when the editorial database is unavailable', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-20T12:00:00Z'));
  mocks.rows.mockRejectedValue(new Error('SUPABASE_ADMIN_REQUEST_FAILED_503'));
  mocks.places.mockResolvedValue([]);

  const agenda = await getPublicAgenda();

  for (const expected of confirmedEventsNovember20) {
    expect(agenda.filter(event => event.id === expected.id)).toHaveLength(1);
  }
});
