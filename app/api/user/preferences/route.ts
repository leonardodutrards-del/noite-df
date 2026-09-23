import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

type PreferenceRow = { regions: string[]; music: string[]; vibes: string[]; budget: string | null };

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, 20);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const rows = await supabaseAdminJson<PreferenceRow[]>(
      `user_preferences?profile_id=eq.${encodeURIComponent(user.id)}&select=regions,music,vibes,budget`
    );
    return NextResponse.json({ preferences: rows[0] ?? { regions: [], music: [], vibes: [], budget: null } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao carregar preferências.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = (await request.json()) as Record<string, unknown>;
    const payload = {
      profile_id: user.id,
      regions: cleanArray(body.regions),
      music: cleanArray(body.music),
      vibes: cleanArray(body.vibes),
      budget: typeof body.budget === 'string' ? body.budget.trim().slice(0, 40) || null : null,
      updated_at: new Date().toISOString(),
    };
    const response = await supabaseAdminRequest('user_preferences?on_conflict=profile_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('PREFERENCES_SAVE_FAILED');
    return NextResponse.json({ preferences: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message === 'UNAUTHORIZED' ? 'Autenticação necessária.' : 'Falha ao salvar preferências.' }, { status: message === 'UNAUTHORIZED' ? 401 : 500 });
  }
}
