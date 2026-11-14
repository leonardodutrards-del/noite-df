import type { EventItem } from '@/modules/events/types';

const officialSource = (label: string, url: string) => ({
  kind: 'official' as const,
  label,
  url,
  verifiedAt: '2026-11-12',
});

export const confirmedEventsNovember11: EventItem[] = [
  {
    id: 'pagodao-das-estrelas-amsterda-2026-11-20',
    title: 'Pagodão das Estrelas',
    place: 'Amsterdã (antigo Bahrein)',
    region: 'Setor Hortigranjeiro',
    dateLabel: 'Sexta-feira, 20/11/2026 · 15h–01h',
    category: 'Pagodão / Música ao vivo',
    description: 'Programação com Jean Mussa, Nossa Cor, Papel Marchê, Forte Atração, Jaque, Gabriel Vizy, Nosso Rolê, Lucas Alves, Clara Muniz, Leozinho, Daniel Pinheiro, Marcelo B1 e DJ Geovanna. A página da Sympla identifica o local no cabeçalho como Bahrein Comida de Boteco e, na descrição do evento, como AMSTERDÃ (antigo Bahrein). Endereço informado: Setor Hortigranjeiro, Chácara 12, km 1/2, Brasília/DF. Não vincular ao Bahrein Cozinha e Bar de Valparaíso: é outro endereço.',
    startsAt: '2026-11-20T15:00:00-03:00',
    endsAt: '2026-11-21T01:00:00-03:00',
    expiresAt: '2026-11-21T01:00:00-03:00',
    admissionNote: 'Preço e lotes não informados no conteúdo oficial consultado; conferir valores e taxas diretamente na Sympla.',
    sourceStatus: 'manual',
    publicationStatus: 'published',
    source: officialSource('Sympla oficial — Pagodão das Estrelas / produtor Vibe Múltipla', 'https://www.sympla.com.br/evento/pagodao-das-estrelas/3637448'),
  },
];
