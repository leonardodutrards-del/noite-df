import type { EstablishmentRepository } from './repository';
import type { Establishment } from './types';

export type EstablishmentFilters = {
  query?: string;
  region?: string;
  vibe?: string;
};

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export class EstablishmentService {
  constructor(private readonly repository: EstablishmentRepository) {}

  async search(filters: EstablishmentFilters): Promise<Establishment[]> {
    const establishments = await this.repository.listPublished();
    const query = normalize(filters.query ?? '');

    return establishments.filter((place) => {
      const haystack = normalize([
        place.name,
        place.region,
        place.type,
        place.description,
        ...place.vibe,
        ...place.music,
        ...place.audience,
      ].join(' '));

      const matchesQuery = !query || haystack.includes(query);
      const matchesRegion = !filters.region || filters.region === 'todos' || place.region === filters.region;
      const matchesVibe = !filters.vibe || filters.vibe === 'todas' || place.vibe.some((item) => normalize(item).includes(normalize(filters.vibe!)));

      return matchesQuery && matchesRegion && matchesVibe;
    });
  }
}
