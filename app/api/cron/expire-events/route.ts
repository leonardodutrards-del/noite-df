import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminRequest } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 15;

/**
 * Expires only published events with an explicit end time in the past.
 * Events without ends_at are intentionally left untouched because their
 * duration cannot be inferred safely.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const cutoff = new Date().toISOString();
    const query = new URLSearchParams({
      publication_status: 'eq.published',
      ends_at: `lt.${cutoff}`,
      select: 'id',
    });
    const response = await supabaseAdminRequest(`events?${query.toString()}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        publication_status: 'expired',
        updated_at: cutoff,
      }),
    });

    if (!response.ok) {
      throw new Error(`EVENT_EXPIRATION_FAILED_${response.status}`);
    }

    const updated = await response.json() as Array<{ id: string }>;
    return NextResponse.json({
      expired: updated.length,
      checkedAt: cutoff,
      rule: 'published events with ends_at before current UTC time',
    });
  } catch (error) {
    console.error('event-expiration-cron', error);
    return NextResponse.json({ error: 'Falha ao encerrar eventos vencidos.' }, { status: 500 });
  }
}
