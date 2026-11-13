import type { Establishment } from '@/modules/establishments/types';

const checkedAt = '2026-11-13';
const mapsUrl = (name: string, address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${address}`)}`;

export const additionalPlacesNovember13: Establishment[] = [
  {
    id: 'new-mercadito-asa-sul',
    name: 'New Mercadito Bar e Restaurante',
    region: 'Asa Sul',
    type: 'Gastrobar',
    description: 'Bar e restaurante com coquetelaria, pratos e petiscos na SHCS CLS 201. A ficha pública do Google Business e a página oficial de ingresso de 14/11 confirmam a operação e o endereço; perfil oficial e site próprio não foram identificados nesta rodada.',
    address: 'SHCS CLS 201 — Asa Sul, Brasília/DF, 70232-550',
    vibe: ['coquetelaria', 'gastronomia'],
    music: [],
    audience: [],
    businessContact: {
      phone: '(61) 99022-7504',
      sourceUrl: mapsUrl('New Mercadito Bar e Restaurante', 'SHCS CLS 201, Asa Sul, Brasília/DF'),
      checkedAt,
    },
    mapsQuery: 'New Mercadito Bar e Restaurante, SHCS CLS 201, Asa Sul, Brasília, DF',
    verified: false,
    publicationStatus: 'draft',
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    weeklySchedule: [],
    lastUpdated: checkedAt,
    source: {
      kind: 'external',
      label: 'Google Business — ficha pública de nome, categoria, endereço e telefone; evento oficial Sympla em 14/11 corrobora a atividade. Perfil/site oficial pendente.',
      url: mapsUrl('New Mercadito Bar e Restaurante', 'SHCS CLS 201, Asa Sul, Brasília/DF'),
      verifiedAt: checkedAt,
    },
    publicRatings: [],
    publicRatingSummary: { sourceCount: 0, calculatedAt: checkedAt },
  },
  {
    id: 'london-music-bar-asa-sul',
    name: 'London Music Bar — Asa Sul',
    region: 'Asa Sul',
    type: 'Pub',
    description: 'Pub com programação de música ao vivo, pop rock e tributos. A unidade da Asa Sul foi identificada em página oficial de evento de 13/11 e teve o endereço cruzado com Google Business. Não mesclar com a listagem distinta de London Music Bar em Águas Claras.',
    address: 'SHCS CLS 409, Bloco C, s/n, Loja 36 — Asa Sul, Brasília/DF',
    vibe: ['pub', 'música ao vivo'],
    music: ['rock', 'pop rock'],
    audience: ['público de shows'],
    mapsQuery: 'London Music Bar, SHCS CLS 409, Bloco C, Loja 36, Asa Sul, Brasília, DF',
    verified: false,
    publicationStatus: 'draft',
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    weeklySchedule: [],
    lastUpdated: checkedAt,
    source: {
      kind: 'official',
      label: 'Sympla oficial — produtor London Music Bar; evento, unidade e endereço confirmados para 13/11.',
      url: 'https://www.sympla.com.br/evento/sexta-13-11-serenissima-tributo-legiao-urbana-leo-martine-uma-noite-emocionante-celebrando/3651423',
      verifiedAt: checkedAt,
    },
    publicRatings: [],
    publicRatingSummary: { sourceCount: 0, calculatedAt: checkedAt },
  },
];
