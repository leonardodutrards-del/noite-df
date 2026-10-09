import { events } from '@/data/events';
import { getSupabaseAdminConfig } from '@/lib/supabase-admin';
import { establishmentService } from '@/modules/establishments/service';
import { listEditorialEvents } from './store';
import { editorialEventToPublic } from './editorial';
import type { EventItem } from './types';

export async function getPublicAgenda(): Promise<EventItem[]> {
  if (!getSupabaseAdminConfig()) return events;
  const [rows, places] = await Promise.all([listEditorialEvents(true), establishmentService.search({})]);
  const byId = new Map(places.map(place => [place.id, place]));
  return rows.flatMap(row => {
    const place = byId.get(row.establishment_id);
    const event = place && editorialEventToPublic(row, place);
    return event ? [event] : [];
  });
}
