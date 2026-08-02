import type { EventItem } from '@/modules/events/types';

export const events: EventItem[] = [
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
  }
];
