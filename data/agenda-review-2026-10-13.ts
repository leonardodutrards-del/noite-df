import type { EditorialEvent } from '@/modules/events/editorial';

// Retained in the database for editorial history; awaiting fresh confirmation.
export const heldAgendaIds = new Set(['4747b51b-9fa9-5c2f-9e9f-f8df7560fbe7', 'aff02efa-2b46-5a4e-9911-6595f36ec6a1']);
export const confirmedAgendaUpdates: EditorialEvent[] = [
  { id: 'sympla-3615103', establishment_id: 'complexo-fora-do-eixo', title: 'Antilove Club', category: 'Festa', description: 'Festa com DJs no Complexo Fora do Eixo, SAAN Quadra 1, 700, Brasília/DF. Abertura às 21h. Evento para maiores de 18 anos.', starts_at: '2026-10-17T00:00:00Z', ends_at: '2026-10-17T08:00:00Z', official_url: 'https://www.sympla.com.br/evento/antilove-club-16-de-outubro/3615103', price_description: 'Consulte lotes e condições na fonte oficial.', publication_status: 'published', verified_at: '2026-10-13T21:00:00Z', updated_at: '2026-10-13T21:00:00Z' },
  { id: 'sympla-3615105', establishment_id: 'complexo-fora-do-eixo', title: 'Molhadêra do CPX', category: 'Pagode, swingueira e funk', description: 'Domingo no Complexo Fora do Eixo, SAAN Quadra 1, 700, Brasília/DF. Gustavo Machado 98, Sanchez e DJ Kacá. Evento para maiores de 18 anos.', starts_at: '2026-10-19T00:00:00Z', ends_at: '2026-10-19T07:00:00Z', official_url: 'https://www.sympla.com.br/evento/molhadera-do-cpx-18-de-outubro/3615105', price_description: 'Consulte lotes e condições na fonte oficial.', publication_status: 'published', verified_at: '2026-10-13T21:00:00Z', updated_at: '2026-10-13T21:00:00Z' },
];
