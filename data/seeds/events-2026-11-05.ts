import type { EventItem } from '@/modules/events/types';

// Programação conferida em fonte oficial em 05/11/2026.
export const confirmedEventsNovember05: EventItem[] = [
  {
    id: 'porks-avva-rock-2026-11-07',
    title: 'Grupo AVVA Rock',
    place: 'Porks Sobradinho',
    region: 'Sobradinho',
    dateLabel: '07/11/2026 · 21h',
    category: 'Rock ao vivo',
    description: 'Show do Grupo AVVA Rock no sábado. O site oficial do estabelecimento informa música ao vivo às sextas e sábados e lista esta apresentação para 7 de novembro. Consulte a casa para confirmar eventuais alterações.',
    startsAt: '2026-11-07T21:00:00-03:00',
    // Visibility cutoff only; the organizer did not publish a closing time.
    expiresAt: '2026-11-08T06:00:00-03:00',
    admissionNote: 'O site oficial informa que não há cobrança de entrada nem couvert, inclusive em dias de show. Confirme as condições e faça sua reserva diretamente com a casa.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: { kind: 'official', label: 'Agenda oficial do Porks Sobradinho', url: 'https://sobradinhoporks.com.br/', verifiedAt: '2026-11-05' },
  },
];
