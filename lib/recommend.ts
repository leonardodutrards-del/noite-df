import { places } from '@/data/seeds/places';

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function recommendPlaces(query: string, region: string, vibe: string) {
  const normalizedQuery = normalize(query);

  return places.filter((place) => {
    const haystack = normalize([
      place.name,
      place.region,
      place.type,
      place.description,
      ...place.vibe,
      ...place.music,
      ...place.audience,
    ].join(' '));

    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesRegion = region === 'todos' || place.region === region;
    const matchesVibe = vibe === 'todas' || place.vibe.some((item) => normalize(item).includes(normalize(vibe)));

    return matchesQuery && matchesRegion && matchesVibe;
  });
}
