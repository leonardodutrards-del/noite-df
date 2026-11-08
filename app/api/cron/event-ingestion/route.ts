import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminJson } from '@/lib/supabase-admin';
import { normalizeEventCandidate, type EventConnectorType } from '@/modules/events/ingestion';
import { parseIcsCalendar, parseRssAtomFeed } from '@/modules/events/feed-parsers';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Connector = {
  id: string;
  data_source_id: string;
  connector_type: EventConnectorType;
  poll_interval_minutes: number;
  config: Record<string, unknown>;
  next_check_at: string | null;
};
type Source = {
  id: string;
  entity_type: string;
  entity_id: string;
  source_kind: string;
  label: string;
  url: string | null;
  verified_at: string | null;
};
type ParsedEvent = {
  title?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  url?: string;
  sourceEventKey?: string;
};

function unsafeHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true;
  const version = isIP(host);
  if (version === 4) {
    const [a, b] = host.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  if (version === 6) {
    return host === '::' || host === '::1' || host.startsWith('fc') ||
      host.startsWith('fd') || host.startsWith('fe8') || host.startsWith('fe9') ||
      host.startsWith('fea') || host.startsWith('feb') || host.startsWith('ff') ||
      host.startsWith('::ffff:');
  }
  return false;
}

function safeSourceUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password ||
      (url.port && url.port !== '443') || unsafeHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function assertPublicDns(url: URL): Promise<void> {
  if (isIP(url.hostname)) return;
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => unsafeHost(entry.address))) throw new Error('SOURCE_DNS_BLOCKED');
}

async function readLimited(response: Response): Promise<string> {
  const maxBytes = 400_000;
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) throw new Error('FEED_TOO_LARGE');
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error('FEED_TOO_LARGE');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

async function fetchFeed(url: URL): Promise<{ text: string; contentType: string }> {
  let current = url;
  for (let hop = 0; hop <= 2; hop += 1) {
    await assertPublicDns(current);
    const response = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'NoiteDFAgendaBot/1.0 (+https://www.noitedf.com.br)',
        Accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml,text/calendar;q=0.9',
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || hop === 2) throw new Error('REDIRECT_LIMIT');
      const next = safeSourceUrl(new URL(location, current).toString());
      if (!next || next.hostname.toLowerCase() !== url.hostname.toLowerCase()) throw new Error('REDIRECT_BLOCKED');
      await assertPublicDns(next);
      current = next;
      continue;
    }
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!/(xml|rss|atom|calendar|text\/plain)/.test(contentType)) throw new Error('UNSUPPORTED_FEED_CONTENT_TYPE');
    return { text: await readLimited(response), contentType };
  }
  throw new Error('REDIRECT_LIMIT');
}

async function saveCandidate(connector: Connector, source: Source, event: ParsedEvent): Promise<{ status: string; inserted: boolean }> {
  const sourceUrl = safeSourceUrl(source.url || '');
  if (!sourceUrl) throw new Error('SOURCE_URL_BLOCKED');
  const candidate = normalizeEventCandidate({
    title: event.title,
    category: 'Evento',
    description: event.description || '',
    establishmentId: source.entity_id,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    officialUrl: event.url || source.url,
    sourceEventKey: event.sourceEventKey,
  }, {
    connectorType: connector.connector_type,
    officialSourceVerified: Boolean(source.verified_at),
    hostAllowed: true,
  });
  const fingerprintInput = event.sourceEventKey ||
    `${candidate.title.toLowerCase()}|${candidate.startsAt}|${source.entity_id}`;
  const fingerprint = createHash('sha256').update(`${connector.id}|${fingerprintInput}`).digest('hex');
  const status = candidate.status === 'blocked' ? 'rejected' : 'pending_review';
  const row = {
    connector_id: connector.id,
    source_event_key: candidate.sourceEventKey,
    fingerprint,
    source_url: candidate.officialUrl || source.url,
    raw_payload: event,
    normalized_payload: candidate,
    confidence: candidate.confidence,
    auto_publish_eligible: candidate.status === 'eligible_for_auto_publish',
    status,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    review_note: candidate.reasons.join(', ') || null,
  };
  const existing = candidate.sourceEventKey
    ? await supabaseAdminJson<Array<{ id: string }>>(`event_candidates?connector_id=eq.${connector.id}&source_event_key=eq.${encodeURIComponent(candidate.sourceEventKey)}&limit=1`)
    : await supabaseAdminJson<Array<{ id: string }>>(`event_candidates?connector_id=eq.${connector.id}&fingerprint=eq.${fingerprint}&limit=1`);
  if (existing[0]) {
    await supabaseAdminJson(`event_candidates?id=eq.${existing[0].id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(row),
    });
    return { status: candidate.status, inserted: false };
  } else {
    await supabaseAdminJson('event_candidates', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ ...row, first_seen_at: new Date().toISOString() }),
    });
    return { status: candidate.status, inserted: true };
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const now = new Date();
  const connectors = await supabaseAdminJson<Connector[]>(
    'event_source_connectors?select=*&status=eq.active&order=next_check_at.asc.nullsfirst&limit=40'
  );
  const due = connectors.filter((item) => !item.next_check_at || Date.parse(item.next_check_at) <= now.getTime()).slice(0, 8);
  const results: Array<{ connectorId: string; status: string; discovered?: number; error?: string }> = [];

  for (const connector of due) {
    let source: Source | undefined;
    let runId: string | undefined;
    try {
      const sources = await supabaseAdminJson<Source[]>(
        `data_sources?id=eq.${connector.data_source_id}&entity_type=eq.establishment&source_kind=eq.official&select=id,entity_type,entity_id,source_kind,label,url,verified_at&limit=1`
      );
      source = sources[0];
      if (!source?.url || !safeSourceUrl(source.url)) throw new Error('OFFICIAL_SOURCE_NOT_AVAILABLE');
      if (connector.connector_type !== 'rss' && connector.connector_type !== 'atom' && connector.connector_type !== 'ics') {
        throw new Error('CONNECTOR_NOT_IMPLEMENTED');
      }

      const runs = await supabaseAdminJson<Array<{ id: string }>>('event_ingestion_runs', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ connector_id: connector.id, status: 'running' }),
      });
      runId = runs[0]?.id;
      const feed = await fetchFeed(safeSourceUrl(source.url)!);
      const events = connector.connector_type === 'ics'
        ? parseIcsCalendar(feed.text)
        : parseRssAtomFeed(feed.text);
      let created = 0;
      let updated = 0;
      let pending = 0;
      let rejected = 0;
      for (const event of events) {
        const result = await saveCandidate(connector, source, event);
        if (result.status === 'blocked') rejected += 1;
        else pending += 1;
        if (result.inserted) created += 1;
        else updated += 1;
      }
      const finishedAt = new Date().toISOString();
      if (runId) await supabaseAdminJson(`event_ingestion_runs?id=eq.${runId}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          status: 'succeeded', finished_at: finishedAt, discovered_count: events.length,
          created_count: created, updated_count: updated, rejected_count: rejected, summary: { pendingReview: pending },
        }),
      });
      await supabaseAdminJson(`event_source_connectors?id=eq.${connector.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          last_checked_at: finishedAt, last_success_at: finishedAt, last_error_at: null,
          last_error_code: null, next_check_at: new Date(now.getTime() + connector.poll_interval_minutes * 60000).toISOString(),
        }),
      });
      results.push({ connectorId: connector.id, status: 'succeeded', discovered: events.length });
    } catch (error) {
      const code = error instanceof Error ? error.message.slice(0, 120) : 'UNKNOWN';
      const finishedAt = new Date().toISOString();
      if (runId) await supabaseAdminJson(`event_ingestion_runs?id=eq.${runId}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'failed', finished_at: finishedAt, error_count: 1, error_code: code }),
      }).catch(() => []);
      await supabaseAdminJson(`event_source_connectors?id=eq.${connector.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          last_checked_at: finishedAt, last_error_at: finishedAt, last_error_code: code,
          next_check_at: new Date(now.getTime() + Math.max(connector.poll_interval_minutes, 60) * 60000).toISOString(),
          status: code === 'CONNECTOR_NOT_IMPLEMENTED' ? 'needs_attention' : 'active',
        }),
      }).catch(() => []);
      results.push({ connectorId: connector.id, status: 'failed', error: code });
    }
  }

  return NextResponse.json({
    processed: results.length,
    discovered: results.reduce((sum, item) => sum + (item.discovered || 0), 0),
    results,
    publicationMode: 'manual_review_only',
  });
}
