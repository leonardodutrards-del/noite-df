import type { EventItem } from '@/modules/events/types';
import { researchedEvents } from './events-2026-09';
import { confirmedEventsOctober16 } from './events-2026-10-16';
import { confirmedEventsOctober26 } from './events-2026-10-26';

export const events: EventItem[] = [
  {
    id: 'eita-chaos-party-2026-10-30',
    title: 'The Chaos Party — 2ª edição',
    place: 'Eita Lounge Bar',
    region: 'Sobradinho',
    dateLabel: '30/10/2026 · Horário não informado',
    category: 'Festa / DJs',
    description: 'The Chaos Party, 2ª edição, com DJ Clara MTS e Walison BSB. Endereço divulgado: QD 1, Setor de Oficinas, Rua C, lotes 26/27. Proibida a entrada de menores de 18 anos. Data e atrações conferidas no flyer do story de @eitaloungebar enviado pelo responsável pelo Noite DF em 29/10/2026. Confirme horário e condições diretamente com a organização.',
    // Midnight is only a date-ordering anchor; dateLabel explicitly hides the unknown time.
    startsAt: '2026-10-30T00:00:00-03:00',
    expiresAt: '2026-10-31T00:00:00-03:00',
    admissionNote: 'Horário e valores de entrada não informados no flyer. Consulte a organização; não há confirmação de gratuidade.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: { kind: 'official', label: 'Flyer do story de @eitaloungebar, enviado ao Noite DF', url: 'https://www.instagram.com/eitaloungebar/', verifiedAt: '2026-10-29' },
  },
  {
    id: 'rancho-sexta-forrozeira-2026-10-30',
    title: 'Sexta Forrozeira',
    place: 'Rancho do Vaqueiro',
    region: 'Planaltina',
    dateLabel: '30/10/2026 · 21h',
    category: 'Forró / Piseiro',
    description: 'Sexta Forrozeira no Rancho do Vaqueiro, às 21h. DJs anunciados: Yuri Vieira, Dandan Vieira e Neguin do Grau. O flyer anuncia caipirinha free para elas até 23h e porção de batata-frita por R$9,99, sujeitos às condições da organização. Evento para maiores de 18 anos. Programação conferida no flyer enviado ao Noite DF em 29/10/2026. Horário de encerramento não informado.',
    startsAt: '2026-10-30T21:00:00-03:00',
    // Editorial cutoff only; the flyer does not state the closing time.
    expiresAt: '2026-10-31T00:00:00-03:00',
    admissionNote: 'Valor do ingresso não informado. O flyer indica contato (61) 99376-7575 para ingressos. Confirme condições e pagamento diretamente com a organização.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: { kind: 'official', label: 'Flyer do Rancho do Vaqueiro enviado ao Noite DF', url: 'https://www.instagram.com/ranchodovaqueirobsb/', verifiedAt: '2026-10-29' },
  },

  {
    id: 'agenda-granja-torto',
    title: 'Agenda agro da Granja do Torto',
    place: 'Parque de Exposições Granja do Torto',
    region: 'Brasília / Granja do Torto',
    dateLabel: 'Monitorar',
    category: 'Shows, laço e três tambores',
    description: 'Espaço reservado para puxar agenda oficial, perfis de produtores, eventos agro, shows, provas de laço e três tambores.',
    sourceStatus: 'api-futura',
    publicationStatus: 'published',
    source: { kind: 'manual', label: 'Placeholder de agenda; confirmar antes de divulgar', verifiedAt: '2026-07-09' }
  },
  {
    id: 'piseiro-planaltina',
    title: 'Noite de piseiro em Planaltina',
    place: 'Rancho do Vaqueiro',
    region: 'Planaltina',
    dateLabel: 'Fim de semana',
    category: 'Piseiro / Sertanejo',
    description: 'Exemplo de evento local para o público que procura dança, sertanejo e noite agro.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: { kind: 'manual', label: 'Demonstração do MVP; confirmar programação oficial', verifiedAt: '2026-07-09' }
  },
  ...researchedEvents,
  ...confirmedEventsOctober16,
  ...confirmedEventsOctober26
];
