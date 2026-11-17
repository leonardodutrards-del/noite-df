import type { Establishment } from '@/modules/establishments/types';

export const additionalPlacesNovember17: Establishment[] = [
  {
    id: 'hop-capital-beer',
    name: 'Hop Capital Beer',
    region: 'Guará',
    type: 'Pub',
    description: 'Cervejaria artesanal com brewpub na própria fábrica, cardápio de carnes e drinks e música ao vivo. A casa convida o público a degustar a cerveja e o chope no local de produção.',
    address: 'SIA Trecho 17, Rua 3, Lote 160 — Brasília, DF.',
    vibe: ['cerveja artesanal', 'brewpub', 'música ao vivo'],
    music: [],
    audience: ['amigos', 'famílias'],
    businessContact: {
      phone: '(61) 3234-1720',
      whatsapp: '(61) 99679-8837',
      sourceUrl: 'https://hopcapital.com.br/brewpub',
      checkedAt: '2026-11-17',
    },
    operatingHours: {
      text: 'Brewpub: quarta 16h–00h; quinta 16h–00h; sexta 16h–01h; sábado 12h–02h. Retirada na fábrica: segunda a sexta 10h–18h; sábado 12h–18h.',
      sourceUrl: 'https://hopcapital.com.br/brewpub',
      checkedAt: '2026-11-17',
    },
    mapsQuery: 'Hop Capital Beer, SIA Trecho 17, Rua 3, Lote 160, Brasília, DF',
    source: {
      kind: 'official',
      label: 'Site oficial — página do brewpub; endereço, contato e horário',
      url: 'https://hopcapital.com.br/brewpub',
      verifiedAt: '2026-11-17',
    },
    verified: false,
    publicationStatus: 'draft',
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    weeklySchedule: [],
    lastUpdated: '2026-11-17',
    publicRatings: [],
    publicRatingSummary: { sourceCount: 0, calculatedAt: '2026-11-17' },
  },
];
