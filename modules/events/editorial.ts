import type { EventItem } from './types';
import type { Establishment } from '@/modules/establishments/types';
import type { PublicationStatus } from '@/modules/shared/types';
import { isPlaceholder } from '@/lib/data-quality';
import { sanitizeTextInput } from '@/lib/security';
import { validateEventArtwork, type EventArtwork } from './artwork';

export type EditorialEvent = {
  id: string; establishment_id: string; title: string; category: string;
  description: string; starts_at: string; ends_at: string;
  price_description: string | null; official_url: string;
  publication_status: PublicationStatus; verified_at: string | null; updated_at: string;
  artwork?: EventArtwork | null;
};

export function validateEditorialEvent(body: Record<string, unknown>, now = new Date()) {
  const text = (key: string, max = 200) => {
    if (typeof body[key] !== 'string') throw new Error('INVALID_EVENT');
    const value = sanitizeTextInput(body[key]);
    if (isPlaceholder(value) || value.length > max) throw new Error('INVALID_EVENT');
    return value;
  };
  const establishment_id = text('establishment_id');
  const title = text('title');
  const category = text('category');
  const description = text('description', 4000);
  const official_url = text('official_url', 2000);
  let url: URL;
  try { url = new URL(official_url); } catch { throw new Error('INVALID_EVENT'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('INVALID_EVENT');
  const timestamp = (key: string) => {
    const value = text(key);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('INVALID_EVENT');
    if (new Date(`${value.slice(0, 10)}T12:00:00Z`).toISOString().slice(0, 10) !== value.slice(0, 10)) throw new Error('INVALID_EVENT');
    return new Date(value).toISOString();
  };
  const starts_at = timestamp('starts_at');
  const ends_at = timestamp('ends_at');
  if (Date.parse(ends_at) <= Date.parse(starts_at)) throw new Error('INVALID_EVENT');
  const publication_status = body.publication_status as PublicationStatus;
  if (!['draft', 'pending_review', 'published', 'suspended', 'expired'].includes(publication_status)) throw new Error('INVALID_EVENT');
  if (publication_status === 'published' && (Date.parse(ends_at) <= now.getTime() || body.sourceConfirmed !== true)) throw new Error('INVALID_EVENT');
  const price_description = typeof body.price_description === 'string' ? sanitizeTextInput(body.price_description).slice(0, 1500) : null;
  const artwork = validateEventArtwork(body.artwork, publication_status === 'published');
  return { establishment_id, title, category, description, official_url, starts_at, ends_at, publication_status, price_description,
    artwork,
    verified_at: publication_status === 'published' ? now.toISOString() : null };
}

export function editorialEventToPublic(row: EditorialEvent, place: Establishment, now = new Date()): EventItem | null {
  if (place.publicationStatus !== 'published' || row.publication_status !== 'published' || !row.verified_at || Date.parse(row.ends_at) <= now.getTime()) return null;
  try {
    validateEditorialEvent({ ...row, sourceConfirmed: true }, now);
  } catch { return null; }
  const format = (value: string) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  return { id: row.id, title: row.title, place: place.name, region: place.region,
    dateLabel: `${format(row.starts_at).replace(', ', ' · ')} até ${format(row.ends_at)}`,
    category: row.category, description: row.description, admissionNote: row.price_description || undefined,
    artwork: row.artwork || undefined,
    startsAt: new Date(Date.parse(row.starts_at) - 3 * 3600000).toISOString().replace('Z', '-03:00'),
    endsAt: row.ends_at, expiresAt: row.ends_at, sourceStatus: 'manual', publicationStatus: 'published',
    source: { kind: 'official', label: 'Canal oficial do organizador', url: row.official_url, verifiedAt: row.verified_at.slice(0, 10) } };
}
