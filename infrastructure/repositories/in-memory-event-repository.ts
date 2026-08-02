import { events } from '@/data/seeds/events';
import type { EventRepository } from '@/modules/events/repository';
import type { EventItem } from '@/modules/events/types';

export class InMemoryEventRepository implements EventRepository {
  async listPublished(): Promise<EventItem[]> {
    return events.filter((event) => event.publicationStatus !== 'suspended' && event.publicationStatus !== 'expired');
  }

  async findById(id: string): Promise<EventItem | null> {
    return events.find((event) => event.id === id) ?? null;
  }
}
