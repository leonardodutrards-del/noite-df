import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';

export const runtime = 'nodejs';
export const maxDuration = 30;

type Source = { id: string; entity_id: string; label: string; url: string | null; source_kind: string };
type PreviousCheck = { content_sha256: string | null };

function allowedUrl(raw: string, allowedHosts: Set<string>): URL | null {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (url.port && url.port !== '443') return null;
    if (!allowedHosts.has(host)) return null;
    return url;
  } catch {
    return null;
  }
}

async function readLimited(response: Response, maxBytes: number): Promise<Uint8Array> {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new Error('PAGE_TOO_LARGE');
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error('PAGE_TOO_LARGE');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

async function inspectSource(source: Source, allowedHosts: Set<string>) {
  const checkedAt = new Date().toISOString();
  const initial = source.url ? allowedUrl(source.url, allowedHosts) : null;
  if (!initial) return { source_id: source.id, check_status: 'blocked', http_status: null, content_sha256: null, checked_at: checkedAt, note: 'Fonte fora da lista de domínios HTTPS autorizados.' };

  try {
    let url = initial;
    let response: Response | null = null;
    for (let hop = 0; hop <= 2; hop += 1) {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(3500),
        headers: { 'User-Agent': 'NoiteDFAgendaMonitor/1.0 (+https://www.noitedf.com.br)', Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,text/plain;q=0.8' },
        cache: 'no-store',
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location || hop === 2) throw new Error('REDIRECT_LIMIT');
      const next = allowedUrl(new URL(location, url).toString(), allowedHosts);
      if (!next) throw new Error('REDIRECT_BLOCKED');
      url = next;
    }
    if (!response) throw new Error('NO_RESPONSE');
    if (!response.ok) return { source_id: source.id, check_status: 'http_error', http_status: response.status, content_sha256: null, checked_at: checkedAt, note: 'A fonte respondeu com erro HTTP.' };
    const type = response.headers.get('content-type')?.toLowerCase() || '';
    if (!/(text\/html|application\/xhtml\\+xml|application\/json|text\/plain)/.test(type)) throw new Error('UNSUPPORTED_CONTENT_TYPE');
    const bytes = await readLimited(response, 400_000);
    const digest = createHash('sha256').update(bytes).digest('hex');
    const previous = await supabaseAdminJson<PreviousCheck[]>(
      `agenda_source_checks?source_id=eq.${encodeURIComponent(source.id)}&content_sha256=not.is.null&select=content_sha256&order=checked_at.desc&limit=1`
    );
    const oldDigest = previous[0]?.content_sha256;
    const status = !oldDigest ? 'baseline' : oldDigest === digest ? 'ok' : 'changed';
    return { source_id: source.id, check_status: status, http_status: response.status, content_sha256: digest, checked_at: checkedAt, note: status === 'changed' ? 'Conteúdo da fonte mudou; conferir manualmente antes de atualizar a agenda.' : null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'UNKNOWN';
    const blocked = reason === 'REDIRECT_BLOCKED' || reason === 'REDIRECT_LIMIT';
    return { source_id: source.id, check_status: blocked ? 'blocked' : 'error', http_status: null, content_sha256: null, checked_at: checkedAt, note: blocked ? 'Redirecionamento não autorizado.' : reason.slice(0, 120) };
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }
  const hosts = (process.env.AGENDA_SOURCE_ALLOWED_HOSTS || '')
    .split(',').map(host => host.trim().toLowerCase()).filter(Boolean);
  if (!hosts.length) return NextResponse.json({ error: 'Configure AGENDA_SOURCE_ALLOWED_HOSTS com domínios oficiais autorizados.' }, { status: 503 });

  try {
    const sources = await supabaseAdminJson<Source[]>(
      'data_sources?entity_type=eq.establishment&source_kind=eq.official&url=not.is.null&select=id,entity_id,label,url,source_kind&order=captured_at.asc&limit=200'
    );
    const day = Math.floor(Date.now() / 86_400_000);
    const batchSize = 12;
    const start = (day * batchSize) % Math.max(sources.length, 1);
    const selected = sources.length
      ? Array.from({ length: Math.min(batchSize, sources.length) }, (_, index) => sources[(start + index) % sources.length])
      : [];
    const results = [];
    for (let index = 0; index < selected.length; index += 3) {
      const batch = await Promise.all(selected.slice(index, index + 3).map(source => inspectSource(source, new Set(hosts))));
      results.push(...batch);
    }
    if (results.length) {
      const response = await supabaseAdminRequest('agenda_source_checks', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(results),
      });
      if (!response.ok) throw new Error(`CHECK_HISTORY_WRITE_FAILED_${response.status}`);
    }
    return NextResponse.json({
      checked: results.length,
      changed: results.filter(item => item.check_status === 'changed').length,
      blocked: results.filter(item => item.check_status === 'blocked').length,
      errors: results.filter(item => item.check_status === 'error' || item.check_status === 'http_error').length,
      nextBatch: (start + batchSize) % Math.max(sources.length, 1),
    });
  } catch (error) {
    console.error('agenda-source-monitor', error);
    return NextResponse.json({ error: 'Falha ao verificar fontes da agenda.' }, { status: 500 });
  }
}
