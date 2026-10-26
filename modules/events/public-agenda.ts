import { events } from '@/data/events';
import { getSupabaseAdminConfig } from '@/lib/supabase-admin';
import { establishmentService } from '@/modules/establishments/service';
import { listEditorialEvents } from './store';
import { editorialEventToPublic } from './editorial';
import type { EventItem } from './types';
import { confirmedAgendaUpdates, heldAgendaIds } from '@/data/agenda-review-2026-10-13';
import { confirmedEventsOctober16 } from '@/data/seeds/events-2026-10-16';
import { confirmedEventsOctober26 } from '@/data/seeds/events-2026-10-26';

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
  const publicEvents = Array.from(bySource.values()).flatMap(row => {
    const place = byId.get(row.establishment_id);
    const event = place && editorialEventToPublic(row, place);
    return event ? [event] : [];
  });
  // Keep verified editorial additions visible with the database enabled.
  // Database records take precedence, including edits to a title or location.
  const key = (event: EventItem) => `${event.place.toLowerCase()}|${Date.parse(event.startsAt || '')}|${event.title.toLowerCase()}`;
  const sourceKey = (event: EventItem) => event.source?.url?.split('?')[0].replace(/\/$/, '');
  const existing = new Set(publicEvents.map(key));
  const existingSources = new Set(publicEvents.map(sourceKey).filter(Boolean));
  return [...publicEvents, ...[...confirmedEventsOctober16, ...confirmedEventsOctober26].filter(event =>
    Date.parse(event.expiresAt || '') > Date.now() && !existing.has(key(event)) && !existingSources.has(sourceKey(event)))];
}
