import type { PublicationStatus, DataSource } from '@/modules/shared/types';

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

export type Establishment = {
  id: string;
  name: string;
  region: string;
  type: 'Bar' | 'Restaurante' | 'Boate' | 'Casa de show' | 'Evento agro' | 'Gastrobar';
  description: string;
  address: string;
  vibe: string[];
  music: string[];
  audience: string[];
  price: '$' | '$$' | '$$$' | '$$$$';
  rating?: number;
  ratingBreakdown?: RatingBreakdown;
  instagram?: string;
  whatsapp?: string;
  mapsQuery: string;
  verified: boolean;
  ownerManaged: boolean;
  crowdStatus: CrowdStatus;
  currentPromotion?: Promotion;
  weeklySchedule: WeeklyScheduleItem[];
  lastUpdated: string;
  publicationStatus?: PublicationStatus;
  source?: DataSource;
};
