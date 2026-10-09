import type { DataSource, PublicationStatus } from '@/modules/shared/types';
import type { EventArtwork } from './artwork';

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
  // Editorial visibility cutoff; not a claim about the event's closing time.
  expiresAt?: string;
  admissionNote?: string;
  artwork?: EventArtwork;
  publicationStatus?: PublicationStatus;
  source?: DataSource;
};
