import type { Establishment } from '@/modules/establishments/types';

const checkedAt = '2026-11-14';

type DraftInput = Pick<Establishment, 'id' | 'name' | 'region' | 'type' | 'description' | 'address' | 'mapsQuery'> & {
  phone?: string;
  contactSourceUrl?: string;
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
    ...(input.phone ? { businessContact: { phone: input.phone, sourceUrl: input.contactSourceUrl ?? mapUrl, checkedAt } } : {}),
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
  draft({
    id: 'estacao-beira-lago-setor-de-clubes-sul',
    name: 'Estação Beira Lago',
    region: 'Setor de Clubes Sul',
    type: 'Clube / espaço de eventos',
    description: 'Espaço de entretenimento e eventos na orla do Lago Paranoá, com festas e apresentações. A ficha pública do Google Business e a página oficial da Sympla para o evento Chama no Pagode identificam o local no SCES Trecho 1, Conjunto 3.',
    address: 'SCES Trecho 1, Conjunto 3, Lote 5 — Setor de Clubes Sul, Brasília/DF, 70200-001.',
    rating: 3.7,
    reviewCount: 44,
    mapsQuery: 'Estação Beira Lago, SCES Trecho 1 Conjunto 3 Lote 5, Setor de Clubes Sul, Brasília DF',
    source: {
      kind: 'external',
      label: 'Google Business — ficha pública da Estação Beira Lago; endereço cruzado com a página oficial do evento Chama no Pagode na Sympla.',
      url: mapsUrl('Estação Beira Lago', 'SCES Trecho 1, Conjunto 3, Lote 5 — Setor de Clubes Sul, Brasília/DF, 70200-001'),
      verifiedAt: checkedAt,
    },
  }),
  draft({
    id: 'london-music-bar-aguas-claras',
    name: 'London Music Bar — Águas Claras',
    region: 'Águas Claras',
    type: 'Pub',
    description: 'Unidade de Águas Claras do London Music Bar, distinta da unidade da Asa Sul já cadastrada em draft. Pub com shows de pop rock, karaokê e gastronomia; a página oficial de ingresso confirma o endereço para o evento de 20/11.',
    address: 'Avenida Jacarandá, 22 — Águas Claras, Brasília/DF, 71927-540.',
    phone: '+55 61 98154-6925',
    rating: 4.6,
    reviewCount: 729,
    mapsQuery: 'London Music Bar Águas Claras, Avenida Jacarandá 22, Brasília DF',
    source: {
      kind: 'external',
      label: 'Google Business — ficha da unidade Águas Claras; evento oficial da Sympla e reportagem da VEJA distinguem a unidade de Águas Claras da segunda unidade na Asa Sul.',
      url: mapsUrl('London Music Bar — Águas Claras', 'Avenida Jacarandá, 22 — Águas Claras, Brasília/DF, 71927-540'),
      verifiedAt: checkedAt,
    },
  }),
  draft({
    id: 'moto-rock-e-cia-taguatinga',
    name: 'Moto Rock & Cia',
    region: 'Taguatinga',
    type: 'Pub',
    description: 'Rock bar/pub de Taguatinga Norte, com shows ao vivo, cerveja, drinks e comida de bar. O site oficial confirma endereço e WhatsApp; a página oficial da Sympla anuncia o Dark House Fest em 14/11.',
    address: 'Setor QNJ, Quadra 18, Área Especial — Taguatinga Norte, Brasília/DF, 72140-100.',
    phone: '+55 61 98683-5177',
    contactSourceUrl: 'https://motorockecia.com.br/contato/',
    rating: 4.6,
    reviewCount: 520,
    mapsQuery: 'Moto Rock & Cia, Setor QNJ Quadra 18 Área Especial, Taguatinga Norte, Brasília DF',
    source: {
      kind: 'official',
      label: 'Site oficial Moto Rock & Cia — descrição da casa, endereço, WhatsApp e Instagram.',
      url: 'https://motorockecia.com.br/',
      verifiedAt: checkedAt,
    },
  }),
  draft({
    id: 'brasilia-motonautica-clube',
    name: 'Brasília Motonáutica Clube',
    region: 'Vila Planalto',
    type: 'Clube / espaço de eventos',
    description: 'Clube social e esportivo no Lago Paranoá, com restaurante, bar, lanchonete e salões para eventos. A página oficial da Sympla confirma o clube como local do Samba de Maria em 14/11.',
    address: 'Lotes Clube, SCEN Trecho 1, Motonáutica 22 e 24 — Brasília/DF, 70800-200.',
    phone: '+55 61 4042-8360',
    rating: 4.1,
    reviewCount: 41,
    mapsQuery: 'Brasília Motonáutica Clube, SCEN Trecho 1 Motonáutica 22 24, Brasília DF',
    source: {
      kind: 'official',
      label: 'Site oficial Brasília Motonáutica Clube; endereço cruzado com Google Business e página oficial do evento Samba de Maria na Sympla.',
      url: 'https://brasiliamotonauticaclube.com/',
      verifiedAt: checkedAt,
    },
  }),
  draft({
    id: 'mansao-rotineira-santa-maria',
    name: 'Mansão Rotineira',
    region: 'Santa Maria',
    type: 'Clube / espaço de eventos',
    description: 'Chácara e espaço de eventos em Santa Maria, Setor de Mansões Abraão II. Perfil mantido em draft a partir da ficha pública do Google Business; o evento Flashdance anunciado para 21/11 foi marcado como cancelado e não foi incluído na agenda.',
    address: 'Setor de Mansões Abraão II, Chácara 03 — Santa Maria, Brasília/DF, 72579-745.',
    phone: '+55 61 99203-2333',
    rating: 4.6,
    reviewCount: 31,
    mapsQuery: 'Mansão Rotineira, Setor de Mansões Abraão II Chácara 03, Santa Maria DF',
    source: {
      kind: 'external',
      label: 'Google Business — ficha pública da Mansão Rotineira; evento Flashdance verificado separadamente e excluído por estar cancelado.',
      url: mapsUrl('Mansão Rotineira', 'Setor de Mansões Abraão II, Chácara 03 — Santa Maria, Brasília/DF, 72579-745'),
      verifiedAt: checkedAt,
    },
  }),
  draft({
    id: 'babylon-delicatessen-samambaia',
    name: 'Babylon Delicatessen',
    region: 'Samambaia',
    type: 'Gastrobar',
    description: 'Bar e restaurante em fase de pré-abertura, com proposta de delicatessen, carnes na brasa, pizzas, petiscos, drinks e música ao vivo. O site oficial informa endereço e WhatsApp; a primeira agenda pública localizada é o evento Consciência Negra 2026 em 20/11.',
    address: 'QN 303, Conjunto 04, Loja 04 — Samambaia Sul, Brasília/DF.',
    phone: '+55 61 99509-7813',
    contactSourceUrl: 'https://www.babylonbsb.com.br/',
    mapsQuery: 'Babylon Delicatessen, QN 303 Conjunto 04 Loja 04, Samambaia Sul, Brasília DF',
    source: {
      kind: 'official',
      label: 'Site oficial Babylon BSB — pré-abertura, endereço, proposta da casa e WhatsApp; evento oficial de 20/11 confirmado na Sympla.',
      url: 'https://www.babylonbsb.com.br/',
      verifiedAt: checkedAt,
    },
  }),
];
