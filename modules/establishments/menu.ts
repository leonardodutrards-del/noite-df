import type { Establishment } from './types';
import { validateEventArtwork } from '@/modules/events/artwork';

export function validateMenu(value: unknown): Establishment['menu'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_MENU');
  const body = value as Record<string, unknown>;
  let url: URL;
  try { url = new URL(String(body.url)); } catch { throw new Error('INVALID_MENU'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 2000) throw new Error('INVALID_MENU');
  if (typeof body.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.checkedAt) ||
    !Number.isFinite(Date.parse(body.checkedAt)) || new Date(body.checkedAt).toISOString().slice(0, 10) !== body.checkedAt) throw new Error('INVALID_MENU');
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.length > 12)) throw new Error('INVALID_MENU');
  let images;
  try { images = (body.images as unknown[] | undefined)?.map(image => {
    const parsed = validateEventArtwork(image, true);
    if (!parsed) throw new Error('INVALID_MENU');
    return parsed;
  }); } catch { throw new Error('INVALID_MENU'); }
  const examples = body.examples as NonNullable<Establishment['menu']>['examples'];
  if (examples !== undefined && (!Array.isArray(examples) || examples.length > 50 || examples.some(item =>
    !item || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 200 || /[<>]/.test(item.name) ||
    typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0 ||
    (item.from !== undefined && typeof item.from !== 'boolean') ||
    (item.note !== undefined && (typeof item.note !== 'string' || item.note.length > 1000 || /[<>]/.test(item.note)))
  ))) throw new Error('INVALID_MENU');
  return { url: url.href, checkedAt: body.checkedAt, images, examples };
}
