import type { EventItem } from './types';

export interface EventRepository {
  listPublished(): Promise<EventItem[]>;
  findById(id: string): Promise<EventItem | null>;
}
