import { createHash } from 'node:crypto';
import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminJson, supabaseAdminRequest } from '@/lib/supabase-admin';
import { normalizeEventCandidate, type EventConnectorType } from '@/modules/events/ingestion';
import { parseHtmlJsonLdEvents, parseIcsCalendar, parseRssAtomFeed } from '@/modules/events/feed-parsers';

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

async function requestPinnedHttps(url: URL): Promise<{ status: number; contentType: string; location: string | null; text: string }> {
  const addresses = await dnsLookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => unsafeHost(entry.address))) {
    throw new Error('SOURCE_DNS_BLOCKED');
  }
  const selected = addresses[0];
  return new Promise((resolve, reject) => {
    const request = httpsRequest(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'NoiteDFAgendaBot/1.0 (+https://www.noitedf.com.br)',
        Accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml,text/calendar,text/html;q=0.9',
      },
      lookup: (_hostname, options, callback) => {
        // Node 24 requests all DNS records for some HTTPS internals; honor
        // the lookup callback's all=true contract instead of returning an
        // undefined scalar address.
        if (options?.all) {
          callback(null, addresses);
          return;
        }
        callback(null, selected.address, selected.family);
      },
    }, (response) => {
      const chunks: Buffer[] = [];
      let total = 0;
      response.on('data', (chunk: Buffer) => {
        total += chunk.byteLength;
        if (total > 400_000) {
          request.destroy(new Error('FEED_TOO_LARGE'));
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => resolve({
        status: response.statusCode ?? 0,
        contentType: String(response.headers['content-type'] || '').toLowerCase(),
        location: typeof response.headers.location === 'string' ? response.headers.location : null,
        text: Buffer.concat(chunks).toString('utf8'),
      }));
      response.on('error', reject);
    });
    request.setTimeout(5000, () => request.destroy(new Error('FETCH_TIMEOUT')));
    request.on('error', reject);
    request.end();
  });
}

async function fetchFeed(url: URL): Promise<{ text: string; contentType: string }> {
  let current = url;
  for (let hop = 0; hop <= 2; hop += 1) {
    const response = await requestPinnedHttps(current);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (!response.location || hop === 2) throw new Error('REDIRECT_LIMIT');
      const next = safeSourceUrl(new URL(response.location, current).toString());
      if (!next || next.hostname.toLowerCase() !== url.hostname.toLowerCase()) throw new Error('REDIRECT_BLOCKED');
      current = next;
      continue;
    }
    if (response.status < 200 || response.status >= 300) throw new Error(`HTTP_${response.status}`);
    if (!/(xml|rss|atom|calendar|text\/plain|text\/html)/.test(response.contentType)) throw new Error('UNSUPPORTED_FEED_CONTENT_TYPE');
    return { text: response.text, contentType: response.contentType };
  }
  throw new Error('REDIRECT_LIMIT');
}


async function writeWithoutBody(path: string, method: 'POST' | 'PATCH', body: Record<string, unknown>): Promise<void> {
  const response = await supabaseAdminRequest(path, {
    method,
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`SUPABASE_ADMIN_REQUEST_FAILED_${response.status}`);
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
    officialUrl: (() => { const candidateUrl = safeSourceUrl(event.url || ''); return candidateUrl && candidateUrl.hostname.toLowerCase() === sourceUrl.hostname.toLowerCase() ? candidateUrl.toString() : source.url!; })(),
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
    ? await supabaseAdminJson<Array<{ id: string; status: string }>>(`event_candidates?connector_id=eq.${connector.id}&source_event_key=eq.${encodeURIComponent(candidate.sourceEventKey)}&select=id,status&limit=1`)
    : await supabaseAdminJson<Array<{ id: string; status: string }>>(`event_candidates?connector_id=eq.${connector.id}&fingerprint=eq.${fingerprint}&select=id,status&limit=1`);
  if (existing[0]) {
    // Never overwrite a human decision or a published event when a feed is polled again.
    if (existing[0].status !== 'pending_review') return { status: existing[0].status, inserted: false };
    await writeWithoutBody(`event_candidates?id=eq.${existing[0].id}&status=eq.pending_review`, 'PATCH', row);
    return { status: candidate.status, inserted: false };
  } else {
    await writeWithoutBody('event_candidates', 'POST', { ...row, first_seen_at: new Date().toISOString() });
    return { status: candidate.status, inserted: true };
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.EVENT_INGESTION_CRON_SECRET || process.env.CRON_SECRET;
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
      if (connector.connector_type !== 'rss' && connector.connector_type !== 'atom' && connector.connector_type !== 'ics' && connector.connector_type !== 'html') {
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
        : connector.connector_type === 'html'
          ? parseHtmlJsonLdEvents(feed.text, source.url)
          : parseRssAtomFeed(feed.text);
      let created = 0;
      let updated = 0;
      let pending = 0;
      let rejected = 0;
      for (const event of events) {
        const result = await saveCandidate(connector, source, event);
        if (result.status === 'blocked' || result.status === 'rejected' || result.status === 'duplicate') rejected += 1;
        else if (result.status === 'pending_review' || result.status === 'eligible_for_auto_publish') pending += 1;
        if (result.inserted) created += 1;
        else updated += 1;
      }
      const finishedAt = new Date().toISOString();
      if (runId) await writeWithoutBody(`event_ingestion_runs?id=eq.${runId}`, 'PATCH', {
        status: 'succeeded', finished_at: finishedAt, discovered_count: events.length,
        created_count: created, updated_count: updated, rejected_count: rejected, summary: { pendingReview: pending },
      });
      await writeWithoutBody(`event_source_connectors?id=eq.${connector.id}`, 'PATCH', {
        last_checked_at: finishedAt, last_success_at: finishedAt, last_error_at: null,
        last_error_code: null, next_check_at: new Date(now.getTime() + connector.poll_interval_minutes * 60000).toISOString(),
      });
      results.push({ connectorId: connector.id, status: 'succeeded', discovered: events.length });
    } catch (error) {
      const code = error instanceof Error ? error.message.slice(0, 120) : 'UNKNOWN';
      const finishedAt = new Date().toISOString();
      if (runId) await writeWithoutBody(`event_ingestion_runs?id=eq.${runId}`, 'PATCH', {
        status: 'failed', finished_at: finishedAt, error_count: 1, error_code: code,
      }).catch(() => undefined);
      await writeWithoutBody(`event_source_connectors?id=eq.${connector.id}`, 'PATCH', {
        last_checked_at: finishedAt, last_error_at: finishedAt, last_error_code: code,
        next_check_at: new Date(now.getTime() + Math.max(connector.poll_interval_minutes, 60) * 60000).toISOString(),
        status: code === 'CONNECTOR_NOT_IMPLEMENTED' ? 'needs_attention' : 'active',
      }).catch(() => undefined);
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

/** Supabase pg_net scheduler invokes this endpoint with POST. */
export async function POST(request: NextRequest) {
  return GET(request);
}
