import type { EventItem } from '@/modules/events/types';

const event = (id: string, title: string, place: string, region: string, dateLabel: string,
  description: string, url: string, expiresAt: string, startsAt?: string, verifiedAt = '2026-09-16'): EventItem => ({
  id, title, place, region, dateLabel, description, startsAt, expiresAt,
  admissionNote: id.startsWith('contexto-')
    ? 'O organizador informa couvert artístico obrigatório para ingressos VIP. Valor do couvert e demais ingressos não informado na descrição. Consulte o lote e as condições na fonte.'
    : undefined,
  category: 'Programação divulgada pelo organizador', sourceStatus: 'manual', publicationStatus: 'published',
  source: { kind: 'official', label: 'Canal oficial do estabelecimento ou organizador', url, verifiedAt },
});
const oscarito = 'https://www.instagram.com/oscaritobrasilia/p/DdPg0FfgQ5P/';

export const researchedEvents: EventItem[] = [
  event('contexto-love-2026-09-18', 'Deu Mó Love — Doze por Oito', 'Contexto Bar', 'Setor de Clubes Sul', '18/09/2026 · A partir das 18h',
    'Pagode com Doze por Oito. Confirme horário, classificação e ingressos no canal do local.',
    'https://www.sympla.com.br/evento/deu-mo-love-18-09-varanda-do-contexto/3558908', '2026-09-19T06:00:00-03:00'),
  event('contexto-sabado-2026-09-19', 'Sábado Mágico e feijoada', 'Contexto Bar', 'Setor de Clubes Sul', '19/09/2026 · A partir das 12h',
    'Programação divulgada com Amor de Aluguel, Nossa Galera e Benzadeus. Consulte ingressos e condições da feijoada.',
    'https://www.sympla.com.br/evento/sabado-magico-19-09-varanda-contexto-bar/3559033', '2026-09-20T06:00:00-03:00', '2026-09-19T12:00:00-03:00'),
  event('oscarito-quinta-2026-09-17', 'Amor de Quinta', 'Oscarito Brasília', 'SIG', '17/09/2026 · A partir das 19h',
    'Semana de aniversário com Amor de Aluguel, Nossa Galera e DJs. Confirme condições no perfil oficial.',
    oscarito, '2026-09-18T06:00:00-03:00', '2026-09-17T19:00:00-03:00'),
  event('oscarito-sexta-2026-09-18', 'Nova Sextanejada', 'Oscarito Brasília', 'SIG', '18/09/2026 · A partir das 19h',
    'Trio Sertanejada, participação de Surra de Modão, Henrique e Ruan e DJ Mjay na programação anunciada.',
    oscarito, '2026-09-19T06:00:00-03:00', '2026-09-18T19:00:00-03:00'),
  event('oscarito-day-2026-09-19', 'Corona Day Osca', 'Oscarito Brasília', 'SIG', '19/09/2026 · 9h às 16h',
    'Atividades esportivas, aulas e samba no Palco Corona. Consulte disponibilidade e ingresso.',
    oscarito, '2026-09-19T16:00:00-03:00', '2026-09-19T09:00:00-03:00'),
  event('oscarito-sabado-2026-09-19', 'Sabadô no Osca — aniversário', 'Oscarito Brasília', 'SIG', '19/09/2026 · A partir das 18h',
    'Clima de Montanha, Violada Original, Banda Dexcomplica e DJ Primo na festa anunciada pelo Oscarito.',
    oscarito, '2026-09-20T06:00:00-03:00', '2026-09-19T18:00:00-03:00'),
  event('oscarito-domingo-2026-09-20', 'Feijoada no Cerratto', 'Oscarito Brasília', 'SIG', '20/09/2026 · A partir das 12h',
    'Feijoada no restaurante Cerratto, dentro do Oscarito. Confirme condições, preço e disponibilidade diretamente com a casa.',
    oscarito, '2026-09-21T00:00:00-03:00', '2026-09-20T12:00:00-03:00'),
  event('galpao17-rock-festival-2026-09-19', 'Galpão 17 Rock Festival', 'Galpão 17', 'Guará', '19/09/2026 · 17h às 4h',
    'Festival de rock com três palcos e mais de 11 horas de apresentações. Consulte ingressos, atrações e condições na fonte oficial.',
    'https://www.sympla.com.br/evento/galpao-17-rock-festival-galpao-17/3566065',
    '2026-09-20T04:00:00-03:00', '2026-09-19T17:00:00-03:00', '2026-09-17'),
  event('contexto-surra-modao-2026-09-23', 'Surra de Modão + Cardápio em Dobro', 'Contexto Bar', 'Setor de Clubes Sul', '23/09/2026 · 18h às 2h',
    'Sertanejo com Marlon, Melão e Júnior Ferreira. Promoção de combos, petiscos e drinks das 18h às 21h; confira condições na fonte oficial.',
    'https://www.sympla.com.br/evento/surra-de-modao-cardapio-em-dobro-23-09-varanda-do-contexto/3558538',
    '2026-09-24T02:00:00-03:00', '2026-09-23T18:00:00-03:00', '2026-09-17'),
  event('trends-aniversario-2026-09-19', '9º aniversário do Trend’s Rock Bar', 'Trends Pub', 'Gama', '19/09/2026 · 19h às 1h30',
    'Noite de rock com Caio MacBeserra, Sepulnation (tributo ao Sepultura) e Bom Scotch. Consulte ingressos e regras no canal oficial.',
    'https://www.sympla.com.br/evento/9-aniversario-trends-rock-bar/3543742',
    '2026-09-20T01:30:00-03:00', '2026-09-19T19:00:00-03:00', '2026-09-17'),
  event('brutos-volkstreme-2026-10-18', 'Piseiro Volkstreme', 'Galpão dos Brutos', 'Sobradinho', '18/10/2026 · A partir das 14h',
    'Evento futuro divulgado no perfil dos Brutos. Consulte localização, atrações e ingressos com a organização.',
    'https://www.instagram.com/piseirovolkstreme/p/DdTqiVgRwEs/', '2026-10-19T06:00:00-03:00', '2026-10-18T14:00:00-03:00'),
];
