import { describe, expect, it } from 'vitest';
import { getWeeklyAgenda, getWeeklyAgendaWindow } from '@/lib/weekly-agenda';
import type { EventItem } from '@/modules/events/types';

const sample: EventItem = {
  id: 'confirmed', title: 'Forró na Varanda', place: 'Contexto', region: 'Setor de Clubes Sul',
  dateLabel: '29/09/2026 · 18h', description: 'Forró ao vivo.', category: 'Forró',
  sourceStatus: 'manual', publicationStatus: 'published', startsAt: '2026-09-29T18:00:00-03:00',
  expiresAt: '2026-09-30T01:00:00-03:00',
  source: { kind: 'official', label: 'Organizador', url: 'https://example.com/evento' },
};

describe('weekly agenda', () => {
  const sunday = new Date('2026-09-27T15:00:00Z');
  it('shows the coming Monday through Sunday on a Sunday in Brasília', () => {
    const week = getWeeklyAgendaWindow(sunday);
    expect(week.start.toISOString()).toBe('2026-09-28T03:00:00.000Z');
    expect(week.end.toISOString()).toBe('2026-10-05T03:00:00.000Z');
    expect(week.label).toBe('28/09 a 04/10/2026');
  });
  it('keeps the current week on a weekday', () => {
    expect(getWeeklyAgendaWindow(new Date('2026-09-30T18:00:00Z')).start.toISOString()).toBe('2026-09-28T03:00:00.000Z');
  });
  it('excludes past, unverified, unpublished and duplicate entries', () => {
    const variants: EventItem[] = [sample, { ...sample, id: 'duplicate' },
      { ...sample, id: 'past', startsAt: '2026-09-22T18:00:00-03:00' },
      { ...sample, id: 'unverified', source: { kind: 'manual', label: 'Post', url: 'https://example.com' } },
      { ...sample, id: 'unpublished', publicationStatus: 'draft' }];
    expect(getWeeklyAgenda(variants, sunday).map((event) => event.id)).toEqual(['confirmed']);
    expect(getWeeklyAgenda([sample], new Date('2026-09-30T04:01:00Z'))).toEqual([]);
  });
});
