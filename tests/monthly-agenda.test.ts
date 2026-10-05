import { describe, expect, it } from 'vitest';
import {
  getMonthlyAgenda,
  getMonthlyAgendaWindow,
  groupMonthlyAgendaByDate,
} from '@/lib/monthly-agenda';
import type { EventItem } from '@/modules/events/types';

const makeEvent = (id: string, startsAt: string, expiresAt: string): EventItem => ({
  id,
  title: `Evento ${id}`,
  place: 'Casa Teste',
  region: 'Asa Sul',
  dateLabel: startsAt.slice(0, 10),
  description: 'Programação confirmada.',
  category: 'Evento',
  sourceStatus: 'manual',
  publicationStatus: 'published',
  startsAt,
  expiresAt,
  source: { kind: 'official', label: 'Organizador', url: 'https://example.com/evento' },
});

describe('monthly agenda', () => {
  const now = new Date('2026-10-05T12:00:00Z');

  it('uses the current calendar month in Brasília', () => {
    const window = getMonthlyAgendaWindow(now);
    expect(window.start.toISOString()).toBe('2026-10-01T03:00:00.000Z');
    expect(window.end.toISOString()).toBe('2026-11-01T03:00:00.000Z');
    expect(window.label.toLowerCase()).toContain('outubro');
    expect(window.label).toContain('2026');
  });

  it('keeps only future confirmed events from the current month', () => {
    const events = [
      makeEvent('week', '2026-10-06T18:00:00-03:00', '2026-10-07T01:00:00-03:00'),
      makeEvent('later', '2026-10-23T20:00:00-03:00', '2026-10-24T01:00:00-03:00'),
      makeEvent('next-month', '2026-11-02T20:00:00-03:00', '2026-11-03T01:00:00-03:00'),
      makeEvent('past', '2026-10-02T20:00:00-03:00', '2026-10-03T01:00:00-03:00'),
    ];
    expect(getMonthlyAgenda(events, now).map((event) => event.id)).toEqual(['week', 'later']);
  });

  it('groups events by date in chronological order', () => {
    const events = getMonthlyAgenda([
      makeEvent('a', '2026-10-06T18:00:00-03:00', '2026-10-07T01:00:00-03:00'),
      makeEvent('b', '2026-10-06T21:00:00-03:00', '2026-10-07T03:00:00-03:00'),
      makeEvent('c', '2026-10-10T20:00:00-03:00', '2026-10-11T01:00:00-03:00'),
    ], now);
    const groups = groupMonthlyAgendaByDate(events);
    expect(groups).toHaveLength(2);
    expect(groups[0].date).toBe('2026-10-06');
    expect(groups[0].events).toHaveLength(2);
    expect(groups[1].date).toBe('2026-10-10');
  });
});
