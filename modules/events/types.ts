import type { DataSource, PublicationStatus } from '@/modules/shared/types';

export type EventItem = {
  id: string;
  title: string;
  place: string;
  region: string;
  dateLabel: string;
  category: string;
  description: string;
  sourceStatus: 'manual' | 'api-futura';
  startsAt?: string;
  endsAt?: string;
  publicationStatus?: PublicationStatus;
  source?: DataSource;
};
