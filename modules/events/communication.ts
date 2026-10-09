import type { EventItem } from './types';
import { getMonthlyAgenda } from '@/lib/monthly-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';

// Deterministic identifiers let an external publisher deduplicate future deliveries.
// This function only prepares text; it never sends content to a social account.
export function prepareAgendaCommunication(events: EventItem[], now = new Date()) {
  const weekly = getWeeklyAgenda(events, now);
  const current = getMonthlyAgenda(events, now);
  const weeklyIds = new Set(weekly.map(event => event.id));
  const feed = current.map(event => {
    const page = `https://www.noitedf.com.br/${weeklyIds.has(event.id) ? 'agenda-semanal' : 'agenda-mensal'}`;
    return {
      id: `feed:${event.id}`, title: event.title,
      caption: `${event.title}\n${event.dateLabel}\n${event.place} · ${event.region}\n\n${event.description}\n${event.admissionNote || 'Confirme entrada e couvert com a organização.'}\n\nConfira a programação no Noite DF: ${page}\nFonte: ${event.source!.url}`,
      concept: event.artwork?.authorized ? `Usar flyer com crédito: ${event.artwork.credit}.` : 'Arte roxa do Noite DF, com título, data e local legíveis; sem foto não autorizada.',
      imageUrl: event.artwork?.authorized ? event.artwork.url : null,
      source: event.source!.url!, page, expiresAt: event.expiresAt ?? event.endsAt!,
    };
  });
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(now);
  const story = weekly.length ? {
    id: `story:${date}`, title: 'Programação da semana no Noite DF',
    concept: 'Uma arte roxa, com até cinco eventos e chamada para a agenda completa.',
    caption: weekly.slice(0, 5).map(event => `${event.title} · ${event.dateLabel} · ${event.place}`).join('\n') + '\nAgenda completa: https://www.noitedf.com.br/agenda-semanal',
    sources: weekly.slice(0, 5).map(event => event.source!.url!),
  } : null;
  return { feed, story };
}
