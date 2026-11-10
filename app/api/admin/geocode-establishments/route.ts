import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';
import { authService } from '@/modules/auth/service';
import { scoreNominatimCandidate, type NominatimCandidate } from '@/modules/establishments/geocoding';

export const runtime = 'nodejs';
export const maxDuration = 10;

const BATCH_SIZE = 1;
const MAX_RATE_LIMIT_WAIT_MS = 1_000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSafeOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return false;
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

type GeocodeCacheRow = { candidates: NominatimCandidate[] };

type EstablishmentRow = {
  id: string;
  name: string;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

function buildGeocodingQuery(row: EstablishmentRow): string {
  return [row.name, row.address, row.region, 'Brasil'].filter(Boolean).join(', ');
}

async function geocode(query: string): Promise<NominatimCandidate[]> {
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
    signal: AbortSignal.timeout(5_000),
  });

  if (response.status === 429) throw new Error('NOMINATIM_RATE_LIMITED');
  if (!response.ok) throw new Error('NOMINATIM_UNAVAILABLE');
  return response.json() as Promise<NominatimCandidate[]>;
}

async function geocodeWithGlobalSlot(query: string): Promise<NominatimCandidate[]> {
  let waitMs: number;
  try {
    waitMs = await supabaseAdminJson<number>('rpc/claim_nominatim_request_slot', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  } catch {
    throw new Error('NOMINATIM_RATE_GUARD_FAILED');
  }

  if (!Number.isFinite(waitMs) || waitMs < 0) {
    throw new Error('NOMINATIM_RATE_GUARD_FAILED');
  }
  if (waitMs > MAX_RATE_LIMIT_WAIT_MS) {
    throw new Error('NOMINATIM_QUEUE_BUSY:' + Math.ceil(waitMs / 1000));
  }
  if (waitMs > 0) await wait(waitMs);

  try {
    return await geocode(query);
  } finally {
    await supabaseAdminJson<unknown>('rpc/release_nominatim_request_slot', {
      method: 'POST',
      body: JSON.stringify({}),
    }).catch((error) => {
      // The lease expires automatically if release fails, so a crashed serverless
      // invocation cannot permanently block future geocoding.
      console.error('nominatim-slot-release', error);
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireMasterAdmin(request);
    if (!isSafeOrigin(request)) {
      return NextResponse.json({ error: 'Origem da requisição não permitida.' }, { status: 403 });
    }
    if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
      return NextResponse.json({ error: 'Content-Type inválido.' }, { status: 415 });
    }
    const body = await request.json().catch(() => null) as { afterId?: string } | null;
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || (body.afterId !== undefined && (typeof body.afterId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.afterId)))) {
      return NextResponse.json({ error: 'Cursor inválido.' }, { status: 400 });
    }

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
      const row = rows[index];

      if (row.latitude !== null || row.longitude !== null) {
        needsReview += 1;
        results.push({
          id: row.id,
          name: row.name,
          status: 'needs_review',
          reason: 'O registro já possui uma das coordenadas preenchida; revisão manual necessária para evitar sobrescrever dados existentes.',
        });
        continue;
      }

      try {
        const query = buildGeocodingQuery(row);
        const queryFingerprint = createHash('sha256').update(query).digest('hex');
        const cacheParams = new URLSearchParams({
          select: 'candidates',
          establishment_id: 'eq.' + row.id,
          query_fingerprint: 'eq.' + queryFingerprint,
          limit: '1',
        });
        let cacheRows: GeocodeCacheRow[];
        try {
          cacheRows = await supabaseAdminJson<GeocodeCacheRow[]>(
            'establishment_geocode_cache?' + cacheParams.toString()
          );
        } catch {
          throw new Error('GEOCODING_CACHE_UNAVAILABLE');
        }

        let candidates = Array.isArray(cacheRows[0]?.candidates)
          ? cacheRows[0].candidates
          : null;
        if (!candidates) {
          candidates = await geocodeWithGlobalSlot(query);
          const cacheWrite = await supabaseAdminRequest(
            'establishment_geocode_cache?on_conflict=establishment_id%2Cquery_fingerprint',
            {
              method: 'POST',
              headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
              body: JSON.stringify({
                establishment_id: row.id,
                query_fingerprint: queryFingerprint,
                candidates,
              }),
            }
          );
          if (!cacheWrite.ok) throw new Error('GEOCODING_CACHE_WRITE_FAILED');
        }

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
        const update = await supabaseAdminRequest('establishments?id=eq.' + encodeURIComponent(row.id) + '&latitude=is.null&longitude=is.null', {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ latitude, longitude }),
        });
        if (!update.ok) throw new Error('ESTABLISHMENT_COORDINATE_UPDATE_FAILED');
        const updatedRows = await update.json().catch(() => null) as Array<{ id?: string }> | null;
        if (!Array.isArray(updatedRows) || updatedRows.length !== 1 || updatedRows[0]?.id !== row.id) {
          needsReview += 1;
          results.push({
            id: row.id,
            name: row.name,
            status: 'needs_review',
            confidence: best.score.confidence,
            displayName: best.candidate.display_name,
            reason: 'O registro foi alterado durante a geocodificação; nenhuma coordenada foi sobrescrita. Confira manualmente.',
          });
          continue;
        }

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
        }).catch((auditError) => {
          console.error('geocode-audit-log', auditError);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'GEOCODING_FAILED';
        if (message === 'NOMINATIM_RATE_LIMITED' || message.startsWith('NOMINATIM_QUEUE_BUSY:') || message === 'NOMINATIM_UNAVAILABLE' || message === 'ESTABLISHMENT_COORDINATE_UPDATE_FAILED' || message === 'TimeoutError' || message === 'AbortError' || message === 'NOMINATIM_RATE_GUARD_FAILED' || message === 'GEOCODING_CACHE_UNAVAILABLE' || message === 'GEOCODING_CACHE_WRITE_FAILED') {
          return NextResponse.json({
            error: message,
            processed: results.length,
            geocoded,
            needsReview,
            noMatch,
            nextCursor: rows[index - 1]?.id ?? body.afterId ?? null,
            results,
          }, {
            status: message === 'NOMINATIM_RATE_LIMITED' || message.startsWith('NOMINATIM_QUEUE_BUSY:') ? 429 : 503,
            headers: message.startsWith('NOMINATIM_QUEUE_BUSY:')
              ? { 'Retry-After': message.split(':')[1] || '3' }
              : undefined,
          });
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
    if (message === 'NOMINATIM_RATE_GUARD_FAILED' || message === 'GEOCODING_CACHE_UNAVAILABLE' || message === 'GEOCODING_CACHE_WRITE_FAILED') return NextResponse.json({ error: 'Proteção de geocodificação indisponível; operação interrompida por segurança.' }, { status: 503 });
    return NextResponse.json({ error: 'Não foi possível geocodificar os estabelecimentos.' }, { status: 500 });
  }
}
