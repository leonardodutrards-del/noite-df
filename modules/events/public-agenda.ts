import { events } from '@/data/events';
import { isConfirmedEvent } from '@/lib/data-quality';
import { getSupabaseAdminConfig } from '@/lib/supabase-admin';
import { establishmentService } from '@/modules/establishments/service';
import { listEditorialEvents } from './store';
import { editorialEventToPublic } from './editorial';
import type { EventItem } from './types';
import { confirmedAgendaUpdates, heldAgendaIds } from '@/data/agenda-review-2026-10-13';
import { confirmedEventsOctober16 } from '@/data/seeds/events-2026-10-16';
import { confirmedEventsOctober26 } from '@/data/seeds/events-2026-10-26';
import { confirmedEventsNovember05 } from '@/data/seeds/events-2026-11-05';
import { confirmedEventsNovember09 } from '@/data/seeds/events-2026-11-09';
import { confirmedEventsNovember10 } from '@/data/seeds/events-2026-11-10';
import { confirmedEventsNovember11 } from '@/data/seeds/events-2026-11-11';

const normalizeIdentity = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

function verifiedLocalAgenda(): EventItem[] {
  const fallback = [...events, ...confirmedEventsOctober16, ...confirmedEventsOctober26, ...confirmedEventsNovember05, ...confirmedEventsNovember09, ...confirmedEventsNovember10, ...confirmedEventsNovember11]
    .filter(isConfirmedEvent);
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const seenEvents = new Set<string>();

  return fallback.filter((event) => {
    const sourceUrl = event.source?.url?.split('?')[0].replace(/\/$/, '');
    const sourceDate = event.startsAt?.slice(0, 10) || '';
    const source = sourceUrl ? `${sourceUrl.toLowerCase()}|${sourceDate}|${normalizeIdentity(event.place)}` : '';
    const key = `${normalizeIdentity(event.place)}|${Date.parse(event.startsAt || '')}|${normalizeIdentity(event.title)}`;
    if (seenIds.has(event.id) || (source && seenSources.has(source)) || seenEvents.has(key)) return false;
    seenIds.add(event.id);
    if (source) seenSources.add(source);
    seenEvents.add(key);
    return true;
  });
}

export async function getPublicAgenda(): Promise<EventItem[]> {
  if (!getSupabaseAdminConfig()) return verifiedLocalAgenda();

  try {
    const [rows, places] = await Promise.all([
      listEditorialEvents(true),
      establishmentService.search({}),
    ]);
    const byId = new Map(places.map((place) => [place.id, place]));
    const bySource = new Map<string, typeof rows[number]>();

    for (const row of [...rows, ...confirmedAgendaUpdates]) {
      if (
        heldAgendaIds.has(row.id) &&
        (!row.verified_at || Date.parse(row.verified_at) <= Date.parse('2026-10-13T21:00:00Z'))
      ) continue;

      const key = row.official_url.split('?')[0].replace(/\/$/, '');
      const previous = bySource.get(key);
      if (!previous || Date.parse(row.verified_at || '') >= Date.parse(previous.verified_at || '')) {
        bySource.set(key, row);
      }
    }

    const publicEvents = Array.from(bySource.values()).flatMap((row) => {
      const place = byId.get(row.establishment_id);
      const event = place && editorialEventToPublic(row, place);
      return event ? [event] : [];
    });

    // Keep verified editorial additions visible with the database enabled.
    // Database records take precedence, including edits to a title or location.
    const key = (event: EventItem) =>
      `${normalizeIdentity(event.place)}|${Date.parse(event.startsAt || '')}|${normalizeIdentity(event.title)}`;
    const sourceKey = (event: EventItem) => {
      const url = event.source?.url?.split('?')[0].replace(/\/$/, '');
      const sourceDate = event.startsAt?.slice(0, 10) || '';
      return url ? `${url.toLowerCase()}|${sourceDate}|${normalizeIdentity(event.place)}` : '';
    };
    const existing = new Set(publicEvents.map(key));
    const existingSources = new Set(publicEvents.map(sourceKey).filter(Boolean));

    return [
      ...publicEvents,
      ...[...confirmedEventsOctober16, ...confirmedEventsOctober26, ...confirmedEventsNovember05, ...confirmedEventsNovember09, ...confirmedEventsNovember10, ...confirmedEventsNovember11].filter((event) =>
        Date.parse(event.expiresAt || '') > Date.now() &&
        !existing.has(key(event)) &&
        !existingSources.has(sourceKey(event))
      ),
    ];
  } catch (error) {
    console.error('Editorial agenda database unavailable; serving verified local agenda:', error);
    return verifiedLocalAgenda();
  }
}
