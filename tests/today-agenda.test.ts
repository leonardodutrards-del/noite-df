import { describe, expect, it } from 'vitest';
import type { EventItem } from '@/modules/events/types';
import { getTodayEvents } from '@/lib/today-agenda';

const sample: EventItem = {
  id: 'show', title: 'Pagode de domingo', place: 'Bar', region: 'Asa Sul', dateLabel: '27/09 · 13h',
  category: 'Pagode', description: 'Show ao vivo', sourceStatus: 'manual', publicationStatus: 'published',
  startsAt: '2026-09-27T13:00:00-03:00', expiresAt: '2026-09-27T23:00:00-03:00',
  source: { kind: 'official', label: 'Organizador', url: 'https://example.com/show' },
};

describe('events today in Brasília', () => {
  it('includes ongoing events and excludes expired, stale or unverified ones', () => {
    const now = new Date('2026-09-27T17:00:00Z');
    expect(getTodayEvents([sample, { ...sample, id: 'duplicate' },
      { ...sample, id: 'yesterday', startsAt: '2026-09-26T22:00:00-03:00' },
      { ...sample, id: 'unverified', source: { kind: 'manual', label: 'Post' } },
      { ...sample, id: 'expired', expiresAt: '2026-09-27T13:30:00-03:00' }], now).map((event) => event.id)).toEqual(['show']);
  });
  it('changes date at midnight in Brasília', () => {
    expect(getTodayEvents([sample], new Date('2026-09-28T03:00:00Z'))).toEqual([]);
  });
});
