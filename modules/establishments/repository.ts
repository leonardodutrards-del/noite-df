import type { Establishment } from './types';

export interface EstablishmentRepository {
  listAll(): Promise<Establishment[]>;
  listPublished(): Promise<Establishment[]>;
  findById(id: string): Promise<Establishment | null>;
  update(id: string, updates: Partial<Establishment>): Promise<Establishment | null>;
  create(item: Establishment): Promise<Establishment>;
}
