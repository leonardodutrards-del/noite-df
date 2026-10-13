import { events } from '@/data/events';
import { getSupabaseAdminConfig } from '@/lib/supabase-admin';
import { establishmentService } from '@/modules/establishments/service';
import { listEditorialEvents } from './store';
import { editorialEventToPublic } from './editorial';
import type { EventItem } from './types';
import { confirmedAgendaUpdates, heldAgendaIds } from '@/data/agenda-review-2026-10-13';

export async function getPublicAgenda(): Promise<EventItem[]> {
  if (!getSupabaseAdminConfig()) return events;
  const [rows, places] = await Promise.all([listEditorialEvents(true), establishmentService.search({})]);
  const byId = new Map(places.map(place => [place.id, place]));
  const bySource = new Map<string, typeof rows[number]>();
  for (const row of [...rows, ...confirmedAgendaUpdates]) {
    if (heldAgendaIds.has(row.id) && (!row.verified_at || Date.parse(row.verified_at) <= Date.parse('2026-10-13T21:00:00Z'))) continue;
    const key = row.official_url.split('?')[0].replace(/\/$/, '');
    const previous = bySource.get(key);
    if (!previous || Date.parse(row.verified_at || '') >= Date.parse(previous.verified_at || '')) bySource.set(key, row);
  }
  return Array.from(bySource.values()).flatMap(row => {
    const place = byId.get(row.establishment_id);
    const event = place && editorialEventToPublic(row, place);
    return event ? [event] : [];
  });
}
