import { describe, expect, it } from 'vitest';
import { getWeeklyAgenda, getWeeklyAgendaWindow } from '@/lib/weekly-agenda';
import type { EventItem } from '@/modules/events/types';
import { confirmedEventsNovember05 } from '@/data/seeds/events-2026-11-05';

const sample: EventItem = {
  id: 'confirmed', title: 'Forró na Varanda', place: 'Contexto', region: 'Setor de Clubes Sul',
  dateLabel: '06/10/2026 · 18h', description: 'Forró ao vivo.', category: 'Forró',
  sourceStatus: 'manual', publicationStatus: 'published', startsAt: '2026-10-06T18:00:00-03:00',
  expiresAt: '2026-10-07T01:00:00-03:00',
  source: { kind: 'official', label: 'Organizador', url: 'https://example.com/evento' },
};

describe('weekly agenda', () => {
  const sunday = new Date('2026-10-11T15:00:00Z');

  it('keeps the current Monday through Sunday on a Sunday in Brasília', () => {
    const week = getWeeklyAgendaWindow(sunday);
    expect(week.start.toISOString()).toBe('2026-10-05T03:00:00.000Z');
    expect(week.end.toISOString()).toBe('2026-10-12T03:00:00.000Z');
    expect(week.label).toBe('05/10 a 11/10/2026');
  });

  it('keeps the same current week on a weekday', () => {
    expect(getWeeklyAgendaWindow(new Date('2026-10-07T18:00:00Z')).start.toISOString()).toBe('2026-10-05T03:00:00.000Z');
  });

  it('excludes past, unverified, unpublished and duplicate entries', () => {
    const now = new Date('2026-10-05T12:00:00Z');
    const variants: EventItem[] = [
      sample,
      { ...sample, id: 'duplicate' },
      { ...sample, id: 'past', startsAt: '2026-09-22T18:00:00-03:00' },
      { ...sample, id: 'unverified', source: { kind: 'manual', label: 'Post', url: 'https://example.com' } },
      { ...sample, id: 'unpublished', publicationStatus: 'draft' },
    ];
    expect(getWeeklyAgenda(variants, now).map((event) => event.id)).toEqual(['confirmed']);
    expect(getWeeklyAgenda([sample], new Date('2026-10-07T04:01:00Z'))).toEqual([]);
  });
});

it('keeps an ongoing weekly event until its exact expiry', () => {
  expect(getWeeklyAgenda([sample], new Date('2026-10-07T00:30:00-03:00'))).toEqual([sample]);
  expect(getWeeklyAgenda([sample], new Date('2026-10-07T01:00:00-03:00'))).toEqual([]);
});


it('shows verified November 6–8 events in the current weekly window', () => {
  const now = new Date('2026-11-06T12:00:00-03:00');
  const visible = getWeeklyAgenda(confirmedEventsNovember05, now);
  expect(visible.map((event) => event.id)).toEqual(expect.arrayContaining([
    'deu-mo-love-contexto-2026-11-06',
    'louca-vida-galpao17-2026-11-06',
    'sextanejada-oscarito-2026-11-06',
    'sabado-oscarito-2026-11-07',
    'surra-de-modao-dvd-cota-mil-2026-11-07',
    'bloco-eu-sozinho-galpao17-2026-11-07',
    'molhadera-sunset-complexo-2026-11-08',
    'texxas-bar-thauane-tay-gomes-2026-11-07',
    'da-roda-a-moda-dom-muster-2026-11-07',
    'flashback-dance-lobby-2026-11-07',
    'trance-house-hangar61-2026-11-07',
  ]));
});
