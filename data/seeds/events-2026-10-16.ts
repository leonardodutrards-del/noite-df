import type { EventItem } from '@/modules/events/types';

export const confirmedEventsOctober16: EventItem[] = [{
  id: 'eita-the-chaos-party-2026-10-16',
  title: 'The Chaos Party',
  place: 'Eita Lounge Bar',
  region: 'Sobradinho',
  dateLabel: '16/10/2026 · A partir das 21h',
  category: 'Festa com DJs',
  description: 'The Chaos Party com Yuri Vieira, Clara MTS e Kaio Vieira. QD 1, Setor de Oficina, Rua C, lotes 26/27, Sobradinho/DF. Evento para maiores de 18 anos. Horário de encerramento não divulgado.',
  startsAt: '2026-10-16T21:00:00-03:00',
  // Conservative visibility cutoff, not an advertised closing time.
  expiresAt: '2026-10-17T00:00:00-03:00',
  admissionNote: 'Entrada: R$ 30. Valor informado por Leonardo Dutra em 16/10/2026; confirme condições com a organização.',
  sourceStatus: 'manual',
  publicationStatus: 'published',
  source: {
    kind: 'official',
    label: 'Divulgação de @eitaloungebar e @thechaos_party; prints conferidos em 16/10/2026',
    url: 'https://www.instagram.com/thechaos_party/',
    verifiedAt: '2026-10-16',
  },
}];
