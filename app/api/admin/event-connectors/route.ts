import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/modules/auth/service';
import { requireMasterAdmin } from '@/modules/auth/session';
import { supabaseAdminJson } from '@/lib/supabase-admin';

type ConnectorType = 'rss' | 'atom' | 'ics' | 'html';
type ConnectorStatus = 'active' | 'paused' | 'needs_attention' | 'disabled';

type Source = {
  id: string;
  entity_type: string;
  entity_id: string;
  source_kind: string;
  label: string;
  url: string | null;
  verified_at: string | null;
};

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  const status = message === 'UNAUTHORIZED' ? 401 : message.startsWith('FORBIDDEN') ? 403 :
    message === 'SOURCE_NOT_FOUND' ? 404 : message === 'INVALID_CONNECTOR' ? 400 : 503;
  const messages: Record<number, string> = {
    401: 'Entre na sua conta.',
    403: 'Acesso restrito ao Master Admin.',
    404: 'Fonte oficial não encontrada.',
    400: 'Confira a fonte, o tipo de conector e a frequência.',
    503: 'Não foi possível atualizar os conectores.',
  };
  return NextResponse.json({ error: messages[status] }, { status });
}

function validHttpsUrl(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password &&
      (!url.port || url.port === '443') &&
      url.hostname !== 'instagram.com' && !url.hostname.endsWith('.instagram.com') &&
      url.hostname !== 'linktr.ee' && !url.hostname.endsWith('.linktr.ee');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireMasterAdmin(request);
    const [connectors, sources] = await Promise.all([
      supabaseAdminJson<Array<Record<string, unknown>>>(
        'event_source_connectors?select=*&order=updated_at.desc&limit=200'
      ),
      supabaseAdminJson<Source[]>(
        'data_sources?entity_type=eq.establishment&source_kind=eq.official&select=id,entity_type,entity_id,source_kind,label,url,verified_at&limit=500'
      ),
    ]);
    const byId = new Map(sources.map((source) => [source.id, source]));
    return NextResponse.json({
      connectors: connectors.map((connector) => ({
        ...connector,
        source: byId.get(String(connector.data_source_id)) ?? null,
      })),
      availableSources: sources.filter((source) => validHttpsUrl(source.url)),
    });
  } catch (error) {
    return responseError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));
    const sourceId = typeof body.dataSourceId === 'string' ? body.dataSourceId : '';
    const connectorType = body.connectorType as ConnectorType;
    const pollInterval = Number(body.pollIntervalMinutes ?? 180);
    if (!/^[0-9a-f-]{36}$/i.test(sourceId) ||
      !['rss', 'atom', 'ics', 'html'].includes(connectorType) ||
      !Number.isInteger(pollInterval) || pollInterval < 5 || pollInterval > 10080) {
      throw new Error('INVALID_CONNECTOR');
    }

    const sources = await supabaseAdminJson<Source[]>(
      `data_sources?id=eq.${sourceId}&entity_type=eq.establishment&source_kind=eq.official&select=id,entity_type,entity_id,source_kind,label,url,verified_at&limit=1`
    );
    const source = sources[0];
    if (!source) throw new Error('SOURCE_NOT_FOUND');
    if (!validHttpsUrl(source.url)) throw new Error('INVALID_CONNECTOR');

    const existing = await supabaseAdminJson<Array<{ id: string }>>(
      `event_source_connectors?data_source_id=eq.${sourceId}&select=id&limit=1`
    );
    const now = new Date().toISOString();
    const payload = {
      data_source_id: sourceId,
      connector_type: connectorType,
      status: 'active' satisfies ConnectorStatus,
      poll_interval_minutes: pollInterval,
      next_check_at: now,
      last_error_code: null,
      updated_at: now,
    };
    const saved = existing[0]
      ? await supabaseAdminJson<Array<Record<string, unknown>>>(`event_source_connectors?id=eq.${existing[0].id}`, {
          method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        })
      : await supabaseAdminJson<Array<Record<string, unknown>>>('event_source_connectors', {
          method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload),
        });

    await authService.logAudit({
      actorId: actor.id, actorEmail: actor.email, actorRole: actor.role,
      action: 'configure_event_connector', entityType: 'data_source', entityId: sourceId,
      afterData: { connector: saved[0], sourceLabel: source.label },
    });
    return NextResponse.json({ connector: saved[0] }, { status: existing[0] ? 200 : 201 });
  } catch (error) {
    return responseError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === 'string' ? body.id : '';
    const status = body.status as ConnectorStatus;
    if (!/^[0-9a-f-]{36}$/i.test(id) || !['active', 'paused', 'disabled'].includes(status)) {
      throw new Error('INVALID_CONNECTOR');
    }
    const saved = await supabaseAdminJson<Array<Record<string, unknown>>>(`event_source_connectors?id=eq.${id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ status, next_check_at: status === 'active' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }),
    });
    if (!saved.length) throw new Error('SOURCE_NOT_FOUND');
    await authService.logAudit({
      actorId: actor.id, actorEmail: actor.email, actorRole: actor.role,
      action: 'change_event_connector_status', entityType: 'event_source_connector', entityId: id,
      afterData: saved[0],
    });
    return NextResponse.json({ connector: saved[0] });
  } catch (error) {
    return responseError(error);
  }
}
