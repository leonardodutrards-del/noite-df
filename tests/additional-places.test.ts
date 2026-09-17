import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { additionalPlaces } from '@/data/seeds/places-2026-09';
import { recommendPlaces } from '@/lib/recommend';

describe('September establishment additions', () => {
  it('keeps identifiers unique across old and new records', () => {
    expect(new Set(places.map(p => p.id)).size).toBe(places.length);
    expect(places).toHaveLength(73);
  });
  it('makes the new records discoverable in their regions', () => {
    for (const place of additionalPlaces) {
      expect(recommendPlaces(place.name, place.region, 'todas').map(p => p.id)).toContain(place.id);
      expect(new URL(place.source!.url!).protocol).toBe('https:');
      expect(place.price).toBeUndefined();
      expect(place.publicRatings).toEqual([]);
      expect(place.ownerManaged).toBe(false);
    }
  });
  it('keeps the two Figueiredo branches distinct', () => {
    const branches = places.filter(p => p.name.startsWith('Figueiredo'));
    expect(branches).toHaveLength(2);
    expect(new Set(branches.map(p => p.region)).size).toBe(2);
  });
});
