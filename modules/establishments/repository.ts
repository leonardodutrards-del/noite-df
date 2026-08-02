import type { Establishment } from './types';

export interface EstablishmentRepository {
  listPublished(): Promise<Establishment[]>;
  findById(id: string): Promise<Establishment | null>;
}
