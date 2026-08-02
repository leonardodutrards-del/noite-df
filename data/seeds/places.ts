import type { Establishment } from '@/modules/establishments/types';

export const places: Establishment[] = [
  {
    id: 'panca-cheia-sobradinho',
    name: 'Pança Cheia',
    region: 'Sobradinho',
    type: 'Restaurante',
    description: 'Referência local para comer bem, reunir família e começar a noite com comida forte e ambiente de região administrativa.',
    address: 'Sobradinho - DF',
    vibe: ['comida boa', 'família', 'boteco', 'cerveja'],
    music: ['variado'],
    audience: ['famílias', 'grupos', 'moradores locais'],
    price: '$$',
    rating: 4.5,
    ratingBreakdown: { overall: 4.5, food: 4.7, drinks: 4.2, service: 4.4, music: 3.8, atmosphere: 4.3, priceBenefit: 4.5, safety: 4.2, structure: 4.1, crowd: 4.0, reviewCount: 38 },
    instagram: '',
    mapsQuery: 'Pança Cheia Sobradinho DF',
    verified: false,
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    currentPromotion: {
      title: 'Promoção da semana',
      validUntil: 'A confirmar',
      description: 'Campo reservado para o restaurante atualizar almoço, jantar, combo ou música ao vivo.'
    },
    weeklySchedule: [
      { day: 'Sexta', title: 'Jantar em grupo', time: '19h às 23h', details: 'Sugestão de noite para família e amigos. Confirmar programação oficial.' }
    ],
    lastUpdated: '2026-07-09',
    publicationStatus: 'published',
    source: { kind: 'manual', label: 'Cadastro inicial do MVP', verifiedAt: '2026-07-09' }
  },
  {
    id: 'rancho-do-vaqueiro-planaltina',
    name: 'Rancho do Vaqueiro',
    region: 'Planaltina',
    type: 'Casa de show',
    description: 'Rolê para quem gosta de piseiro, sertanejo, vaquejada, dança e noite agro no DF.',
    address: 'Planaltina - DF',
    vibe: ['piseiro', 'sertanejo', 'dançar', 'agro'],
    music: ['piseiro', 'sertanejo', 'forró'],
    audience: ['jovens', 'agro', 'grupos'],
    price: '$$',
    rating: 4.6,
    ratingBreakdown: { overall: 4.6, food: 3.8, drinks: 4.3, service: 4.1, music: 4.9, atmosphere: 4.8, priceBenefit: 4.2, safety: 4.0, structure: 4.1, crowd: 4.7, reviewCount: 51 },
    instagram: '',
    mapsQuery: 'Rancho do Vaqueiro Planaltina DF',
    verified: false,
    ownerManaged: false,
    crowdStatus: 'movimentado',
    currentPromotion: {
      title: 'Lista / entrada',
      validUntil: 'Fim de semana',
      description: 'Campo para atualizar valor de entrada, lista VIP e atrações.'
    },
    weeklySchedule: [
      { day: 'Sábado', title: 'Noite de piseiro', time: '22h', details: 'Piseiro, sertanejo e dança. Programação deve ser confirmada pelo perfil oficial.' }
    ],
    lastUpdated: '2026-07-09',
    publicationStatus: 'published',
    source: { kind: 'manual', label: 'Cadastro inicial do MVP', verifiedAt: '2026-07-09' }
  },
  {
    id: 'bar-do-batata-planaltina',
    name: 'Bar do Batata',
    region: 'Planaltina',
    type: 'Bar',
    description: 'Bar conhecido na comunidade local, bom para reunir amigos e viver a noite de Planaltina fora do circuito turístico tradicional.',
    address: 'Planaltina - DF',
    vibe: ['boteco raiz', 'cerveja', 'amigos'],
    music: ['variado'],
    audience: ['moradores locais', 'grupos'],
    price: '$',
    rating: 4.4,
    ratingBreakdown: { overall: 4.4, food: 4.1, drinks: 4.5, service: 4.2, music: 3.9, atmosphere: 4.4, priceBenefit: 4.8, safety: 4.0, structure: 3.9, crowd: 4.3, reviewCount: 29 },
    instagram: '',
    mapsQuery: 'Bar do Batata Planaltina DF',
    verified: false,
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    weeklySchedule: [
      { day: 'Quinta a domingo', title: 'Boteco local', time: 'Noite', details: 'Espaço para o dono atualizar música, promoção e movimento da semana.' }
    ],
    lastUpdated: '2026-07-09',
    publicationStatus: 'published',
    source: { kind: 'manual', label: 'Cadastro inicial do MVP', verifiedAt: '2026-07-09' }
  },
  {
    id: 'granja-do-torto-eventos',
    name: 'Parque de Exposições Granja do Torto',
    region: 'Granja do Torto / Brasília',
    type: 'Evento agro',
    description: 'Ponto estratégico para acompanhar shows, exposições, provas de laço, três tambores e eventos agro para vários públicos.',
    address: 'Granja do Torto - Brasília - DF',
    vibe: ['shows', 'agro', 'família', 'rodeio'],
    music: ['sertanejo', 'piseiro', 'forró'],
    audience: ['famílias', 'agro', 'turistas', 'jovens'],
    price: '$$',
    rating: 4.5,
    ratingBreakdown: { overall: 4.5, food: 3.9, drinks: 4.0, service: 4.0, music: 4.7, atmosphere: 4.6, priceBenefit: 4.1, safety: 4.2, structure: 4.4, crowd: 4.6, reviewCount: 44 },
    instagram: '',
    mapsQuery: 'Parque de Exposições Granja do Torto Brasília DF',
    verified: false,
    ownerManaged: false,
    crowdStatus: 'a confirmar',
    weeklySchedule: [
      { day: 'Agenda variável', title: 'Shows, laço e três tambores', time: 'Monitorar', details: 'Módulo preparado para acompanhar eventos oficiais, produtores e calendários agro.' }
    ],
    lastUpdated: '2026-07-09',
    publicationStatus: 'published',
    source: { kind: 'manual', label: 'Monitoramento manual do MVP', verifiedAt: '2026-07-09' }
  }
];
