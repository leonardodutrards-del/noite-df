import { supabaseAdminJson } from '@/lib/supabase-admin';
import type { EditorialEvent } from './editorial';

export async function listEditorialEvents(publishedOnly = false): Promise<EditorialEvent[]> {
  return supabaseAdminJson<EditorialEvent[]>(`events?select=*&order=starts_at.asc&limit=1000${publishedOnly ? '&publication_status=eq.published&ends_at=gt.' + encodeURIComponent(new Date().toISOString()) : ''}`);
}

export async function findEditorialEvent(id: string) {
  const rows = await supabaseAdminJson<EditorialEvent[]>(`events?id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ?? null;
}

export async function saveEditorialEvent(row: Record<string, unknown>, existing?: EditorialEvent) {
  const path = existing ? `events?id=eq.${existing.id}&updated_at=eq.${encodeURIComponent(existing.updated_at)}` : 'events';
  const rows = await supabaseAdminJson<EditorialEvent[]>(path, {
    method: existing ? 'PATCH' : 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
  });
  if (!rows.length) throw new Error('EVENT_CONFLICT');
  return rows[0];
}
