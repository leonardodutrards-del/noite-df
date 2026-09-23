import { places as defaultPlaces } from '@/data/seeds/places';
import type { EstablishmentRepository } from '@/modules/establishments/repository';
import type { Establishment } from '@/modules/establishments/types';

export class InMemoryEstablishmentRepository implements EstablishmentRepository {
  private places: Map<string, Establishment> = new Map();

  constructor(initialPlaces: Establishment[] = defaultPlaces) {
    this.reset(initialPlaces);
  }

  public reset(initialPlaces: Establishment[] = defaultPlaces): void {
    this.places.clear();
    for (const place of initialPlaces) {
      this.places.set(place.id, { ...place });
    }
  }

  async listAll(): Promise<Establishment[]> {
    return Array.from(this.places.values());
  }

  async listPublished(): Promise<Establishment[]> {
    return Array.from(this.places.values()).filter(
      (place) => place.publicationStatus === 'published'
    );
  }

  async findById(id: string): Promise<Establishment | null> {
    const item = this.places.get(id);
    return item ? { ...item } : null;
  }

  async update(id: string, updates: Partial<Establishment>): Promise<Establishment | null> {
    const existing = this.places.get(id);
    if (!existing) return null;

    const updated: Establishment = {
      ...existing,
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    this.places.set(id, updated);
    return { ...updated };
  }

  async create(item: Establishment): Promise<Establishment> {
    const created: Establishment = {
      ...item,
      lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0],
      publicationStatus: item.publicationStatus || 'published',
    };
    this.places.set(created.id, created);
    return { ...created };
  }
}

export const establishmentRepository = new InMemoryEstablishmentRepository();
