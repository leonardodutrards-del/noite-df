import type { PublicationStatus, DataSource } from '@/modules/shared/types';

export type { PublicationStatus, DataSource };

export type CrowdStatus = 'tranquilo' | 'movimentado' | 'lotado' | 'a confirmar';

export type WeeklyScheduleItem = {
  day: string;
  title: string;
  time: string;
  details: string;
};

export type Promotion = {
  title: string;
  validUntil: string;
  description: string;
};

export type RatingBreakdown = {
  overall: number;
  food: number;
  drinks: number;
  service: number;
  music: number;
  atmosphere: number;
  priceBenefit: number;
  safety: number;
  structure: number;
  crowd: number;
  reviewCount: number;
};

export type PublicRatingSource = {
  provider: 'google' | 'tripadvisor' | 'facebook' | 'official' | 'other';
  label: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  collectedAt: string;
  matchedBy: string[];
  status: 'confirmed' | 'needs_review' | 'unavailable';
  observation?: string;
};

export type PublicRatingSummary = {
  average?: number;
  totalReviews?: number;
  sourceCount: number;
  calculatedAt: string;
};

export type Establishment = {
  id: string;
  name: string;
  region: string;
  type: 'Bar' | 'Restaurante' | 'Boate' | 'Casa de show' | 'Evento agro' | 'Gastrobar' | 'Pub' | 'Complexo gastronômico' | 'Clube / espaço de eventos';
  description: string;
  address: string;
  vibe: string[];
  music: string[];
  audience: string[];
  price?: '$' | '$$' | '$$$' | '$$$$';
  rating?: number;
  ratingBreakdown?: RatingBreakdown;
  instagram?: string;
  whatsapp?: string;
  businessContact?: {
    phone: string;
    whatsapp?: string;
    sourceUrl: string;
    checkedAt: string;
  };
  operatingHours?: { text: string; sourceUrl: string; checkedAt: string };
  agendaUrl?: string;
  menu?: {
    url: string;
    checkedAt: string;
    examples?: { name: string; price: number; note?: string }[];
  };
  mapsQuery: string;
  verified: boolean;
  ownerManaged: boolean;
  crowdStatus: CrowdStatus;
  currentPromotion?: Promotion;
  weeklySchedule: WeeklyScheduleItem[];
  lastUpdated: string;
  publicationStatus?: PublicationStatus;
  source?: DataSource;
  publicRatings?: PublicRatingSource[];
  publicRatingSummary?: PublicRatingSummary;
};

export interface CreateEstablishmentInput {
  name: string;
  type: Establishment['type'];
  description: string;
  region: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
}

export interface PartnershipRequest {
  id: string;
  userId: string;
  establishmentId: string;
  establishmentName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface EstablishmentOwner {
  establishmentId: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  addedAt: string;
}
