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
import { confirmedEventsNovember10Upcoming } from '@/data/seeds/events-2026-11-10-upcoming';
import { confirmedEventsNovember11 } from '@/data/seeds/events-2026-11-11';
import { confirmedEventsNovember12 } from '@/data/seeds/events-2026-11-12';
import { confirmedEventsNovember12Upcoming } from '@/data/seeds/events-2026-11-12-upcoming';
import { confirmedEventsNovember13 } from '@/data/seeds/events-2026-11-13';

const normalizeIdentity = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const normalizeSourceIdentity = (value: string) => {
  const clean = value.split('?')[0].replace(/\/$/, '').toLowerCase();
  try {
    const parsed = new URL(clean);
    if (parsed.hostname === 'sympla.com.br' || parsed.hostname.endsWith('.sympla.com.br')) {
      const eventId = parsed.pathname.match(/\/(\d+)$/)?.[1];
      if (eventId) return `sympla:${eventId}`;
    }
  } catch {
    // Preserve the normalized URL for sources outside the supported URL shape.
  }
  return clean;
};

function verifiedLocalAgenda(): EventItem[] {
  const fallback = [...events, ...confirmedEventsOctober16, ...confirmedEventsOctober26, ...confirmedEventsNovember05, ...confirmedEventsNovember09, ...confirmedEventsNovember10, ...confirmedEventsNovember10Upcoming, ...confirmedEventsNovember11, ...confirmedEventsNovember12, ...confirmedEventsNovember12Upcoming, ...confirmedEventsNovember13]
    .filter((event) => isConfirmedEvent(event) && Date.parse(event.expiresAt || '') > Date.now());
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const seenEvents = new Set<string>();

  return fallback.filter((event) => {
    const sourceUrl = event.source?.url?.split('?')[0].replace(/\/$/, '');
    const source = sourceUrl ? `${sourceUrl.toLowerCase()}|${Date.parse(event.startsAt || '')}|${normalizeIdentity(event.place)}` : '';
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

      const sourceUrl = normalizeSourceIdentity(row.official_url);
      const key = `${sourceUrl}|${Date.parse(row.starts_at || '')}|${row.establishment_id}`;
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
    const correctionSourceKey = (event: EventItem) => {
      const url = event.source?.url ? normalizeSourceIdentity(event.source.url) : '';
      return url ? `${url}|${Date.parse(event.startsAt || '')}|${normalizeIdentity(event.place)}` : '';
    };
    const existing = new Set(publicEvents.map(key));
    const existingSources = new Set(publicEvents.map(correctionSourceKey).filter(Boolean));

    return [
      ...publicEvents,
      ...[...confirmedEventsOctober16, ...confirmedEventsOctober26, ...confirmedEventsNovember05, ...confirmedEventsNovember09, ...confirmedEventsNovember10, ...confirmedEventsNovember10Upcoming, ...confirmedEventsNovember11, ...confirmedEventsNovember12, ...confirmedEventsNovember12Upcoming, ...confirmedEventsNovember13].filter((event) =>
        Date.parse(event.expiresAt || '') > Date.now() &&
        !existing.has(key(event)) &&
        !existingSources.has(correctionSourceKey(event))
      ),
    ];
  } catch (error) {
    console.error('Editorial agenda database unavailable; serving verified local agenda:', error);
    return verifiedLocalAgenda();
  }
}
