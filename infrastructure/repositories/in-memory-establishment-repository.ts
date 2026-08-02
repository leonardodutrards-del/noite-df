import { places } from '@/data/seeds/places';
import type { EstablishmentRepository } from '@/modules/establishments/repository';
import type { Establishment } from '@/modules/establishments/types';

export class InMemoryEstablishmentRepository implements EstablishmentRepository {
  async listPublished(): Promise<Establishment[]> {
    return places.filter((place) => place.publicationStatus !== 'suspended' && place.publicationStatus !== 'expired');
  }

  async findById(id: string): Promise<Establishment | null> {
    return places.find((place) => place.id === id) ?? null;
  }
}
