import { afterEach, describe, expect, it, vi } from 'vitest';
import { researchedEvents } from '@/data/seeds/events-2026-09';
import { places } from '@/data/places';
import { isConfirmedEvent, isPlaceholder } from '@/lib/data-quality';

afterEach(() => vi.useRealTimers());

describe('Dated official programming', () => {
  it('keeps genuine hyphenated labels while rejecting an empty dash', () => {
    expect(isPlaceholder('Sexta-feira')).toBe(false);
    expect(isPlaceholder('Deu Mó Love — Doze por Oito')).toBe(false);
    expect(isPlaceholder('—')).toBe(true);
  });
  it('links every event to a known venue and a dated primary source', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-16T18:00:00-03:00'));
    for (const event of researchedEvents) {
      expect(places.some(place => place.name === event.place)).toBe(true);
      expect(event.source?.kind).toBe('official');
      expect(new URL(event.source!.url!).protocol).toBe('https:');
      expect(isConfirmedEvent(event)).toBe(true);
    }
  });
  it('removes September programming after its editorial cutoff without discarding October', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-22T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent).map(event => event.id)).toEqual(['contexto-surra-modao-2026-09-23', 'galpao17-dark-side-2026-09-25', 'contexto-surra-modao-2026-09-30', 'brutos-volkstreme-2026-10-18']);
    vi.setSystemTime(new Date('2026-09-24T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent).map(event => event.id)).toEqual(['galpao17-dark-side-2026-09-25', 'contexto-surra-modao-2026-09-30', 'brutos-volkstreme-2026-10-18']);
    vi.setSystemTime(new Date('2026-09-26T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent).map(event => event.id)).toEqual(['contexto-surra-modao-2026-09-30', 'brutos-volkstreme-2026-10-18']);
    vi.setSystemTime(new Date('2026-10-02T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent).map(event => event.id)).toEqual(['brutos-volkstreme-2026-10-18']);
    vi.setSystemTime(new Date('2026-10-20T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent)).toEqual([]);
  });
});
