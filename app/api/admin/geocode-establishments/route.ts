import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';
import { authService } from '@/modules/auth/service';
import { scoreNominatimCandidate, type NominatimCandidate } from '@/modules/establishments/geocoding';

export const runtime = 'nodejs';
export const maxDuration = 10;

const BATCH_SIZE = 3;
const REQUEST_INTERVAL_MS = 1_100;

type EstablishmentRow = {
  id: string;
  name: string;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocode(row: EstablishmentRow): Promise<NominatimCandidate[]> {
  const query = [row.name, row.address, row.region, 'Distrito Federal, Brasil'].filter(Boolean).join(', ');
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('limit', '5');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'NoiteDF/1.0 (+https://www.noitedf.com.br)',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.5',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000),
  });

  if (response.status === 429) throw new Error('NOMINATIM_RATE_LIMITED');
  if (!response.ok) throw new Error('NOMINATIM_UNAVAILABLE');
  return response.json() as Promise<NominatimCandidate[]>;
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({})) as { afterId?: string };
    const params = new URLSearchParams({
      select: 'id,name,region,address,latitude,longitude',
      publication_status: 'eq.published',
      or: '(latitude.is.null,longitude.is.null)',
      order: 'id.asc',
      limit: String(BATCH_SIZE),
    });
    if (typeof body.afterId === 'string' && body.afterId.trim()) {
      params.set('id', 'gt.' + body.afterId.trim());
    }

    const rows = await supabaseAdminJson<EstablishmentRow[]>(
      'establishments?' + params.toString()
    );

    if (rows.length === 0) {
      return NextResponse.json({ done: true, processed: 0, geocoded: 0, needsReview: 0, noMatch: 0, results: [] });
    }

    const results: Array<Record<string, unknown>> = [];
    let geocoded = 0;
    let needsReview = 0;
    let noMatch = 0;

    for (let index = 0; index < rows.length; index += 1) {
      if (index > 0) await wait(REQUEST_INTERVAL_MS);
      const row = rows[index];

      try {
        const candidates = await geocode(row);
        const ranked = candidates
          .map((candidate) => ({
            candidate,
            score: scoreNominatimCandidate(row, candidate),
          }))
          .sort((left, right) => right.score.confidence - left.score.confidence);
        const best = ranked[0];

        if (!best) {
          noMatch += 1;
          results.push({ id: row.id, name: row.name, status: 'no_match', reason: 'Nenhum resultado no OpenStreetMap.' });
          continue;
        }

        if (!best.score.accepted) {
          needsReview += 1;
          results.push({
            id: row.id,
            name: row.name,
            status: 'needs_review',
            confidence: best.score.confidence,
            displayName: best.candidate.display_name,
            candidate: { latitude: Number(best.candidate.lat), longitude: Number(best.candidate.lon) },
            reason: best.score.reason,
          });
          continue;
        }

        const latitude = Number(best.candidate.lat);
        const longitude = Number(best.candidate.lon);
        const update = await supabaseAdminRequest('establishments?id=eq.' + encodeURIComponent(row.id), {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ latitude, longitude }),
        });
        if (!update.ok) throw new Error('ESTABLISHMENT_COORDINATE_UPDATE_FAILED');

        geocoded += 1;
        results.push({
          id: row.id,
          name: row.name,
          status: 'geocoded',
          confidence: best.score.confidence,
          displayName: best.candidate.display_name,
          latitude,
          longitude,
        });

        await authService.logAudit({
          actorId: actor.id,
          actorEmail: actor.email,
          actorRole: actor.role,
          action: 'geocode_establishment',
          entityType: 'establishment',
          entityId: row.id,
          details: {
            provider: 'OpenStreetMap Nominatim',
            confidence: best.score.confidence,
            displayName: best.candidate.display_name,
            latitude,
            longitude,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'GEOCODING_FAILED';
        if (message === 'NOMINATIM_RATE_LIMITED' || message === 'NOMINATIM_UNAVAILABLE') {
          return NextResponse.json({
            error: message,
            processed: results.length,
            geocoded,
            needsReview,
            noMatch,
            nextCursor: rows[index - 1]?.id ?? body.afterId ?? null,
            results,
          }, { status: message === 'NOMINATIM_RATE_LIMITED' ? 429 : 503 });
        }
        results.push({ id: row.id, name: row.name, status: 'error', reason: message });
      }
    }

    return NextResponse.json({
      done: rows.length < BATCH_SIZE,
      processed: rows.length,
      geocoded,
      needsReview,
      noMatch,
      nextCursor: rows[rows.length - 1].id,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GEOCODING_FAILED';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível geocodificar os estabelecimentos.' }, { status: 500 });
  }
}
