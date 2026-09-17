import { afterEach, describe, expect, it, vi } from 'vitest';
import { researchedEvents } from '@/data/seeds/events-2026-09';
import { getWeekendEvents, getWeekendWindow } from '@/lib/weekend';

afterEach(() => vi.useRealTimers());

describe('Indicações do fim de semana', () => {
  it('seleciona sexta a domingo pelo horário de Brasília, inclusive no domingo', () => {
    expect(getWeekendWindow(new Date('2026-09-17T18:00:00Z'))).toMatchObject({ start: '2026-09-18', end: '2026-09-20' });
    expect(getWeekendWindow(new Date('2026-09-20T15:00:00Z'))).toMatchObject({ start: '2026-09-18', end: '2026-09-20' });
    expect(getWeekendWindow(new Date('2026-09-21T15:00:00Z'))).toMatchObject({ start: '2026-09-25', end: '2026-09-27' });
  });

  it('mostra apenas eventos vigentes com data e fonte oficial, mesmo sem startsAt', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T15:00:00-03:00'));
    const items = getWeekendEvents(researchedEvents, new Date());
    expect(items.some(event => event.id === 'contexto-love-2026-09-18')).toBe(true);
    expect(items.some(event => event.id === 'oscarito-sexta-2026-09-18')).toBe(true);
    expect(items.some(event => event.id === 'oscarito-quinta-2026-09-17')).toBe(false);
    expect(items.some(event => event.id === 'brutos-volkstreme-2026-10-18')).toBe(false);
  });
});
