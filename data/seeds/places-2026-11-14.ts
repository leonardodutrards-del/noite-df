import type { Establishment } from '@/modules/establishments/types';

const checkedAt = '2026-11-14';

type DraftInput = Pick<Establishment, 'id' | 'name' | 'region' | 'type' | 'description' | 'address' | 'mapsQuery'> & {
  phone?: string;
  hours?: string;
  rating?: number;
  reviewCount?: number;
  menuUrl?: string;
  agendaUrl?: string;
  source: NonNullable<Establishment['source']>;
};

const mapsUrl = (name: string, address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;

const draft = (input: DraftInput): Establishment => {
  const mapUrl = mapsUrl(input.name, input.address);
  return {
    id: input.id,
    name: input.name,
    region: input.region,
    type: input.type,
    description: input.description,
    address: input.address,
    vibe: [],
    music: [],
    audience: [],
    ...(input.phone ? { businessContact: { phone: input.phone, sourceUrl: mapUrl, checkedAt } } : {}),
    ...(input.hours ? { operatingHours: { text: input.hours, sourceUrl: mapUrl, checkedAt } } : {}),
    ...(input.menuUrl ? { menu: { url: input.menuUrl, checkedAt, images: [], examples: [] } } : {}),
    ...(input.agendaUrl ? { agendaUrl: input.agendaUrl } : {}),
    mapsQuery: input.mapsQuery,
    verified: false,
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    weeklySchedule: [],
    lastUpdated: checkedAt,
    publicationStatus: 'draft',
    source: input.source,
    publicRatings: input.rating ? [{
      provider: 'google',
      label: 'Google Business',
      url: mapUrl,
      rating: input.rating,
      reviewCount: input.reviewCount,
      collectedAt: checkedAt,
      matchedBy: ['nome', 'endereço'],
      status: 'needs_review',
      observation: 'Dados da ficha pública; correspondência e exibição aguardam revisão manual.',
    }] : [],
    publicRatingSummary: { sourceCount: 0, calculatedAt: checkedAt },
  };
};

export const additionalPlacesNovember14: Establishment[] = [
  draft({
    id: 'saguari-gastro-house-samambaia',
    name: 'Saguari Gastro House',
    region: 'Samambaia',
    type: 'Gastrobar',
    description: 'Gastrobar com cozinha autoral, coquetelaria e almoço aos fins de semana. O site oficial reúne cardápio, reservas e informações para eventos e confraternizações.',
    address: 'QS 310, Conjunto 5, Lote 7 — Samambaia, Brasília/DF, 72306-535.',
    phone: '(61) 99877-5943',
    hours: 'Segunda a sexta, 16h–0h; sábado e domingo, 12h–0h.',
    menuUrl: 'https://www.saguarigastrohouse.com.br/',
    mapsQuery: 'Saguari Gastro House, QS 310 Conjunto 5 Lote 7, Samambaia, Brasília DF',
    source: {
      kind: 'official',
      label: 'Site oficial do Saguari Gastro House — endereço, horário, cardápio e contato.',
      url: 'https://www.saguarigastrohouse.com.br/',
      verifiedAt: checkedAt,
    },
  }),
  draft({
    id: 'toinha-brasil-show-guara',
    name: 'Toinha Brasil Show',
    region: 'Guará',
    type: 'Casa de show',
    description: 'Casa de shows no Guará. O Linktree oficial reúne os canais de Instagram, Facebook, ingressos, WhatsApp e site; endereço e contato foram cruzados com a ficha pública do Google Business.',
    address: 'SOF Sul, Quadra 9, Conjunto A — Guará, Brasília/DF, 71215-245.',
    phone: '(61) 98616-5097',
    hours: 'Sexta e sábado, 19h–04h, conforme ficha pública do Google Business.',
    agendaUrl: 'https://linktr.ee/toinhabrasilshow',
    rating: 4.5,
    reviewCount: 844,
    mapsQuery: 'Toinha Brasil Show, SOF Sul Quadra 9 Conjunto A, Guará, Brasília DF',
    source: {
      kind: 'official',
      label: 'Linktree oficial @toinhabrasilshow — canais de redes sociais, ingressos, WhatsApp e site; endereço cruzado com Google Business.',
      url: 'https://linktr.ee/toinhabrasilshow',
      verifiedAt: checkedAt,
    },
  }),
];
