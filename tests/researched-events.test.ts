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
  it('expires events at their documented cutoff and preserves later dates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-22T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent).some(event => event.id === 'oscarito-sabado-2026-09-19')).toBe(false);
    expect(researchedEvents.filter(isConfirmedEvent).some(event => event.id === 'galpao17-radio-rock-2026-10-02')).toBe(true);
    vi.setSystemTime(new Date('2026-10-03T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent).some(event => event.id === 'galpao17-radio-rock-2026-10-02')).toBe(false);
    expect(researchedEvents.filter(isConfirmedEvent).some(event => event.id === 'galpao17-dia-los-muertos-2026-10-31')).toBe(true);
    vi.setSystemTime(new Date('2026-11-02T12:00:00-03:00'));
    expect(researchedEvents.filter(isConfirmedEvent)).toEqual([]);
  });
});
