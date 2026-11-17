import type { EventItem } from '@/modules/events/types';

const symplaSource17 = (url: string) => ({
  kind: 'official' as const,
  label: 'Sympla — página oficial do evento',
  url,
  verifiedAt: '2026-11-17',
});

export const confirmedEventsNovember17: EventItem[] = [
  {
    id: 'consciencia-negra-babylon-2026-11-20',
    title: 'Negra Arte Cultura — Consciência Negra 2026: Resistência, Festa e Liberdade',
    place: 'Babylon Delicatessen',
    region: 'Samambaia',
    dateLabel: 'Sexta-feira, 20/11/2026 · 12h–01h30 (21/11)',
    category: 'Samba / Cultura / Gastronomia',
    description: 'Celebração da cultura afro-brasileira com samba, música, feijoada e ações de solidariedade. O evento é promovido pela própria Babylon Delicatessen; artistas individuais não foram anunciados na página consultada.',
    startsAt: '2026-11-20T12:00:00-03:00',
    endsAt: '2026-11-21T01:30:00-03:00',
    expiresAt: '2026-11-21T01:30:00-03:00',
    admissionNote: 'Lotes anunciados: R$ 60, R$ 80 e R$ 100; taxas da Sympla podem ser aplicadas.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: symplaSource17('https://www.sympla.com.br/evento/lgc/3640226'),
  },
  {
    id: 'noite-na-skina-2026-11-21',
    title: 'Noite na Skina',
    place: 'Skinão Petiscaria',
    region: 'Sobradinho',
    dateLabel: 'Sábado, 21/11/2026 · 18h–01h (22/11)',
    category: 'Festa',
    description: 'A página oficial da Sympla confirma a festa no Skinão Petiscaria, em AR 07, Conjunto 1, Sobradinho II. O conteúdo acessível não apresenta line-up ou atrações detalhadas.',
    startsAt: '2026-11-21T18:00:00-03:00',
    endsAt: '2026-11-22T01:00:00-03:00',
    expiresAt: '2026-11-22T01:00:00-03:00',
    admissionNote: 'Preço e atrações não informados no texto acessível; consultar a página oficial.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: symplaSource17('https://www.sympla.com.br/evento/lgc/3616254'),
  },
];
