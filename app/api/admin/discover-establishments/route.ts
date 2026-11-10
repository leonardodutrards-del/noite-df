import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';
import { authService } from '@/modules/auth/service';

export const runtime = 'nodejs';
export const maxDuration = 10;

const DF_GO_BOUNDS = { south: -18.5, north: -14, west: -49.5, east: -45 };
const TYPES = ['Bar', 'Restaurante', 'Boate', 'Casa de show', 'Evento agro', 'Gastrobar', 'Pub', 'Complexo gastronômico', 'Clube / espaço de eventos'] as const;

type Candidate = {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  address?: Record<string, string>;
  namedetails?: Record<string, string>;
};

type ExistingRow = { id: string; name: string; region: string };

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isSafeOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isInCoverage(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= DF_GO_BOUNDS.south && latitude <= DF_GO_BOUNDS.north
    && longitude >= DF_GO_BOUNDS.west && longitude <= DF_GO_BOUNDS.east;
}

function parseWazeCoordinates(value: unknown): { latitude: number; longitude: number } | null {
  if (typeof value !== 'string' || value.length > 2000) return null;
  try {
    const url = new URL(value);
    if (!['waze.com', 'www.waze.com'].includes(url.hostname)) return null;
    const raw = url.searchParams.get('ll');
    if (!raw) return null;
    const [latitude, longitude] = raw.split(',').map(Number);
    return isInCoverage(latitude, longitude) ? { latitude, longitude } : null;
  } catch {
    return null;
  }
}

async function claimNominatimSlot() {
  const waitMs = await supabaseAdminJson<number>('rpc/claim_nominatim_request_slot', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!Number.isFinite(waitMs) || waitMs < 0) throw new Error('RATE_GUARD_INVALID');
  if (waitMs > 1000) throw new Error('NOMINATIM_QUEUE_BUSY');
  if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
}

async function releaseNominatimSlot() {
  await supabaseAdminJson<unknown>('rpc/release_nominatim_request_slot', {
    method: 'POST',
    body: JSON.stringify({}),
  }).catch((error) => console.error('nominatim-slot-release', error));
}

async function findPossibleDuplicates(name: string): Promise<ExistingRow[]> {
  const params = new URLSearchParams({
    select: 'id,name,region',
    name: 'ilike.*' + name.replace(/[,*()]/g, ' ') + '*',
    limit: '30',
  });
  return supabaseAdminJson<ExistingRow[]>('establishments?' + params.toString());
}

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    if (!isSafeOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });

    if (request.nextUrl.searchParams.get('pending') === '1') {
      const params = new URLSearchParams({
        select: 'id,name,region,address,latitude,longitude,publication_status',
        or: '(latitude.is.null,longitude.is.null)',
        order: 'name.asc',
        limit: '300',
      });
      const establishments = await supabaseAdminJson<Array<{
        id: string; name: string; region: string; address: string;
        latitude: number | null; longitude: number | null; publication_status: string;
      }>>('establishments?' + params.toString());
      return NextResponse.json({ establishments });
    }

    const query = (request.nextUrl.searchParams.get('q') || '').trim();
    const region = (request.nextUrl.searchParams.get('region') || '').trim();
    if (query.length < 3 || query.length > 100 || region.length > 100) {
      return NextResponse.json({ error: 'Informe um nome com pelo menos 3 caracteres e uma região válida.' }, { status: 400 });
    }

    const searchQuery = [query, region, 'Distrito Federal ou Goiás', 'Brasil'].filter(Boolean).join(', ');
    try {
      await claimNominatimSlot();
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'NOMINATIM_QUEUE_BUSY') {
        return NextResponse.json({ error: 'Busca ocupada. Aguarde alguns segundos e tente novamente.' }, { status: 429, headers: { 'Retry-After': '3' } });
      }
      return NextResponse.json({ error: 'Proteção global de consultas indisponível. A busca foi interrompida.' }, { status: 503 });
    }

    let candidates: Candidate[];
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('namedetails', '1');
      url.searchParams.set('limit', '8');
      url.searchParams.set('countrycodes', 'br');
      url.searchParams.set('viewbox', '-49.5,-14,-45,-18.5');
      url.searchParams.set('bounded', '1');
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NoiteDF/1.0 (+https://www.noitedf.com.br)',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (response.status === 429) return NextResponse.json({ error: 'O serviço de mapas limitou temporariamente as buscas. Tente mais tarde.' }, { status: 429, headers: { 'Retry-After': '60' } });
      if (!response.ok) return NextResponse.json({ error: 'Serviço de mapas indisponível no momento.' }, { status: 503 });
      candidates = await response.json() as Candidate[];
    } finally {
      await releaseNominatimSlot();
    }

    const possibleDuplicates = await findPossibleDuplicates(query).catch(() => []);
    const normalizedQuery = normalize(query);
    const duplicates = possibleDuplicates.filter((item) =>
      normalize(item.name) === normalizedQuery
    );

    const results = candidates.flatMap((candidate) => {
      const latitude = Number(candidate.lat);
      const longitude = Number(candidate.lon);
      if (!isInCoverage(latitude, longitude)) return [];
      return [{
        name: query,
        displayName: candidate.display_name,
        latitude,
        longitude,
        osmType: candidate.type || candidate.class || 'local',
        address: candidate.display_name,
        duplicateMatches: duplicates,
        wazeUrl: 'https://waze.com/ul?ll=' + encodeURIComponent(latitude + ',' + longitude) + '&navigate=yes&utm_source=noitedf',
      }];
    });

    return NextResponse.json({ results, duplicateMatches: duplicates });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DISCOVERY_FAILED';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível pesquisar estabelecimentos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireMasterAdmin(request);
    if (!isSafeOrigin(request)) return NextResponse.json({ error: 'Origem não permitida.' }, { status: 403 });
    if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
      return NextResponse.json({ error: 'Content-Type inválido.' }, { status: 415 });
    }

    const body = await request.json().catch(() => null) as Record<string, unknown> | null;

    if (body?.action === 'import_waze_location') {
      const establishmentId = typeof body.establishmentId === 'string' ? body.establishmentId.trim() : '';
      const wazeUrl = body.wazeUrl;
      const coordinates = parseWazeCoordinates(wazeUrl);
      if (!establishmentId || establishmentId.length > 160 || !coordinates) {
        return NextResponse.json({ error: 'Informe o estabelecimento e um link compartilhado do Waze contendo coordenadas ll válidas para DF/Entorno.' }, { status: 400 });
      }
      const update = await supabaseAdminRequest(
        'establishments?id=eq.' + encodeURIComponent(establishmentId) + '&latitude=is.null&longitude=is.null',
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ latitude: coordinates.latitude, longitude: coordinates.longitude, updated_at: new Date().toISOString() }),
        }
      );
      if (!update.ok) return NextResponse.json({ error: 'Não foi possível atualizar a localização.' }, { status: 502 });
      const updatedRows = await update.json() as Array<{ id: string; name: string; latitude: number; longitude: number }>;
      if (!Array.isArray(updatedRows) || updatedRows.length !== 1 || updatedRows[0]?.id !== establishmentId) {
        return NextResponse.json({ error: 'O cadastro já possui coordenadas ou foi alterado. Nada foi sobrescrito.' }, { status: 409 });
      }
      await authService.logAudit({
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        action: 'import_waze_establishment_coordinates',
        entityType: 'establishment',
        entityId: establishmentId,
        details: { provider: 'Waze shared deep link', latitude: coordinates.latitude, longitude: coordinates.longitude },
      }).catch((auditError) => console.error('waze-location-audit', auditError));
      return NextResponse.json({ establishment: updatedRows[0] });
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const region = typeof body?.region === 'string' ? body.region.trim() : '';
    const address = typeof body?.address === 'string' ? body.address.trim() : '';
    const type = typeof body?.type === 'string' ? body.type : '';
    const description = typeof body?.description === 'string' ? body.description.trim().slice(0, 500) : '';
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const wazeCoordinates = parseWazeCoordinates(body?.wazeUrl);
    const hasWazeUrl = typeof body?.wazeUrl === 'string' && body.wazeUrl.trim().length > 0;

    if (hasWazeUrl && !wazeCoordinates) {
      return NextResponse.json({ error: 'O link compartilhado do Waze não contém coordenadas válidas para DF/Entorno. Confira o link ou deixe o campo vazio para usar o ponto selecionado.' }, { status: 400 });
    }
    if (!name || name.length > 120 || !region || region.length > 100 || !address || address.length > 240
      || !TYPES.includes(type as typeof TYPES[number]) || !isInCoverage(latitude, longitude)) {
      return NextResponse.json({ error: 'Dados inválidos. Confira nome, região, endereço, categoria e coordenadas dentro de DF/Entorno.' }, { status: 400 });
    }

    const finalCoordinates = wazeCoordinates ?? { latitude, longitude };
    const possibleDuplicates = await findPossibleDuplicates(name).catch(() => []);
    const exactDuplicate = possibleDuplicates.find((item) =>
      normalize(item.name) === normalize(name) && normalize(item.region) === normalize(region)
    );
    if (exactDuplicate) {
      return NextResponse.json({ error: 'Este estabelecimento já está cadastrado nesta região.', duplicate: exactDuplicate }, { status: 409 });
    }

    const slugBase = normalize(name).replace(/\s+/g, '-').slice(0, 90);
    const regionSuffix = normalize(region).replace(/\s+/g, '-').slice(0, 30);
    const id = slugBase + '-' + regionSuffix;
    const idCheck = await supabaseAdminJson<Array<{ id: string }>>('establishments?select=id&id=eq.' + encodeURIComponent(id) + '&limit=1');
    if (idCheck.length > 0) return NextResponse.json({ error: 'Já existe um cadastro com identificador semelhante. Revise o registro existente antes de criar outro.' }, { status: 409 });

    const row = {
      id,
      slug: id,
      name,
      type,
      description,
      region,
      address,
      latitude: finalCoordinates.latitude,
      longitude: finalCoordinates.longitude,
      publication_status: 'draft',
      verified_at: null,
      created_by: actor.id,
      updated_by: actor.id,
      vibe: [],
      music: [],
      audience: [],
      maps_query: name + ', ' + address + ', ' + region,
      owner_managed: false,
      crowd_status: 'a confirmar',
      weekly_schedule: [],
      public_ratings: [],
      public_rating_summary: { sourceCount: 0, calculatedAt: new Date().toISOString() },
    };

    const response = await supabaseAdminRequest('establishments', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(row),
    });
    if (!response.ok) return NextResponse.json({ error: 'Falha ao salvar o novo cadastro. Nenhum registro foi confirmado.' }, { status: 502 });
    const inserted = await response.json() as Array<{ id: string; name: string; publication_status: string }>;
    if (!Array.isArray(inserted) || inserted.length !== 1 || inserted[0]?.id !== id) {
      return NextResponse.json({ error: 'O banco não confirmou a criação do estabelecimento.' }, { status: 502 });
    }

    await authService.logAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: 'create_establishment_draft_from_discovery',
      entityType: 'establishment',
      entityId: id,
      details: {
        source: wazeCoordinates ? 'Waze shared deep link' : 'OpenStreetMap candidate reviewed by admin',
        latitude: finalCoordinates.latitude,
        longitude: finalCoordinates.longitude,
        publicationStatus: 'draft',
      },
    }).catch((auditError) => {
      console.error('establishment-discovery-audit', auditError);
    });

    return NextResponse.json({ establishment: inserted[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DISCOVERY_CREATE_FAILED';
    if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    if (message.startsWith('FORBIDDEN')) return NextResponse.json({ error: 'Acesso restrito ao Master Admin.' }, { status: 403 });
    return NextResponse.json({ error: 'Não foi possível cadastrar o estabelecimento.' }, { status: 500 });
  }
}
