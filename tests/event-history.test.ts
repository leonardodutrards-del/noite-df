import { describe, expect, it } from 'vitest';
import { researchedEvents } from '@/data/seeds/events-2026-09';
import { events } from '@/data/events';
import { getPastOfficialEvents } from '@/lib/event-history';

describe('histórico de eventos oficiais', () => {
  it('arquiva somente eventos encerrados com fonte verificável e mantém os futuros fora', () => {
    const history = getPastOfficialEvents(events, new Date('2026-09-21T12:00:00-03:00'));
    expect(history.some(event => event.id === 'oscarito-sabado-2026-09-19')).toBe(true);
    expect(history.some(event => event.id === 'contexto-surra-modao-2026-09-23')).toBe(false);
    expect(history.some(event => event.id === 'agenda-granja-torto')).toBe(false);
    expect(history.every(event => event.source?.kind === 'official' && event.source.url)).toBe(true);
    expect(researchedEvents.some(event => event.id === 'oscarito-sabado-2026-09-19')).toBe(true);
  });
});
