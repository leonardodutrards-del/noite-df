'use client';

import { useEffect, useState } from 'react';

type Source = { id: string; label: string; url: string | null; verified_at: string | null };
type Connector = { id: string; connector_type: string; status: string; poll_interval_minutes: number; last_success_at: string | null; last_error_code: string | null; source: Source | null };
type Candidate = { id: string; source_url: string; confidence: number; normalized_payload: Record<string, unknown>; first_seen_at: string; review_note: string | null; auto_publish_eligible: boolean };
type Run = { id: string; status: string; started_at: string; discovered_count: number; created_count: number; updated_count: number; rejected_count: number; error_count: number; error_code: string | null };

const formatDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

export function EventIngestionConsole() {
  const [sources, setSources] = useState<Source[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [sourceId, setSourceId] = useState('');
  const [type, setType] = useState<'rss' | 'atom' | 'ics'>('rss');
  const [interval, setInterval] = useState(180);
  const [edits, setEdits] = useState<Record<string, { title: string; category: string; description: string; priceDescription: string }>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const [connectorResponse, candidateResponse] = await Promise.all([
        fetch('/api/admin/event-connectors', { cache: 'no-store' }),
        fetch('/api/admin/event-candidates', { cache: 'no-store' }),
      ]);
      const connectorData = await connectorResponse.json();
      const candidateData = await candidateResponse.json();
      if (!connectorResponse.ok) throw new Error(connectorData.error || 'Falha ao carregar conectores.');
      if (!candidateResponse.ok) throw new Error(candidateData.error || 'Falha ao carregar candidatos.');
      setSources(connectorData.availableSources || []);
      setConnectors(connectorData.connectors || []);
      setCandidates(candidateData.candidates || []);
      setRuns(candidateData.runs || []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Falha ao atualizar a central.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function configure(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sourceId) return;
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch('/api/admin/event-connectors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataSourceId: sourceId, connectorType: type, pollIntervalMinutes: interval }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar a fonte.');
      setSourceId('');
      setNotice('Fonte configurada. A coleta será feita pelo agendamento do servidor.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Falha ao configurar a fonte.');
    } finally { setBusy(false); }
  }

  async function toggle(connector: Connector) {
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch('/api/admin/event-connectors', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: connector.id, status: connector.status === 'active' ? 'paused' : 'active' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível alterar o conector.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Falha ao alterar o conector.');
    } finally { setBusy(false); }
  }

  async function review(candidate: Candidate, action: 'approve' | 'reject') {
    const payload = candidate.normalized_payload;
    const edit = edits[candidate.id] || {
      title: String(payload.title || ''), category: String(payload.category || 'Evento'),
      description: String(payload.description || ''), priceDescription: String(payload.priceDescription || ''),
    };
    setBusy(true);
    setNotice('');
    try {
      const response = await fetch('/api/admin/event-candidates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: candidate.id, action,
          note: action === 'approve' ? 'Revisado e aprovado no Master Admin.' : 'Rejeitado no Master Admin.',
          event: { title: edit.title, category: edit.category, description: edit.description, price_description: edit.priceDescription },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a revisão.');
      setNotice(action === 'approve' ? 'Evento publicado na agenda editorial.' : 'Candidato rejeitado.');
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Falha ao revisar evento.');
    } finally { setBusy(false); }
  }

  function updateEdit(id: string, key: 'title' | 'category' | 'description' | 'priceDescription', value: string, candidate: Candidate) {
    const current = edits[id] || {
      title: String(candidate.normalized_payload.title || ''),
      category: String(candidate.normalized_payload.category || 'Evento'),
      description: String(candidate.normalized_payload.description || ''),
      priceDescription: String(candidate.normalized_payload.priceDescription || ''),
    };
    setEdits((state) => ({ ...state, [id]: { ...current, [key]: value } }));
  }

  return (
    <section className="panel event-ingestion-console" style={{ marginTop: 24 }}>
      <div className="section-title" style={{ alignItems: 'flex-start' }}>
        <div><span className="badge">Operação automatizada</span><h2>Central de ingestão de eventos</h2><p>Conecte fontes oficiais, acompanhe coletas e revise os eventos encontrados antes da publicação.</p></div>
        <button className="button ghost" type="button" onClick={() => void refresh()} disabled={loading || busy}>Atualizar</button>
      </div>
      <div className="admin-stats-grid" style={{ margin: '16px 0' }}>
        <div><strong>{connectors.length}</strong><span>conectores cadastrados</span></div>
        <div><strong>{connectors.filter((item) => item.status === 'active').length}</strong><span>fontes ativas</span></div>
        <div><strong>{candidates.length}</strong><span>eventos para revisar</span></div>
        <div><strong>{runs.filter((item) => item.status === 'failed').length}</strong><span>coletas com falha no histórico</span></div>
      </div>
      {notice ? <p className="notice" role="status">{notice}</p> : null}
      <div className="event-ingestion-grid">
        <form className="card event-ingestion-form" onSubmit={configure}>
          <h3>Adicionar fonte estruturada</h3>
          <p className="field-hint">Use apenas feeds RSS, Atom ou calendários iCalendar oficiais e autorizados.</p>
          <label>Fonte oficial
            <select required value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              <option value="">Selecione um estabelecimento</option>
              {sources.map((source) => <option key={source.id} value={source.id}>{source.label} — {source.url}</option>)}
            </select>
          </label>
          <div className="event-ingestion-inline">
            <label>Formato<select value={type} onChange={(event) => setType(event.target.value as typeof type)}><option value="rss">RSS</option><option value="atom">Atom</option><option value="ics">iCalendar</option></select></label>
            <label>Intervalo em minutos<input type="number" min={5} max={10080} step={5} value={interval} onChange={(event) => setInterval(Number(event.target.value))}/></label>
          </div>
          <button className="button" type="submit" disabled={busy || !sourceId}>{busy ? 'Salvando…' : 'Ativar conector'}</button>
        </form>
        <div className="card">
          <h3>Fontes conectadas</h3>
          {loading ? <p>Carregando…</p> : connectors.length === 0 ? <p className="field-hint">Nenhum conector ativo. O monitoramento diário atual continua separado desta ingestão estruturada.</p> : (
            <div className="event-ingestion-list">{connectors.map((connector) => <article key={connector.id}>
              <div><strong>{connector.source?.label || 'Fonte oficial'} · {connector.connector_type.toUpperCase()}</strong><p className="field-hint">{connector.source?.url || 'URL não disponível'}</p><small>Status: {connector.status} · a cada {connector.poll_interval_minutes} min · última coleta: {formatDate(connector.last_success_at)}{connector.last_error_code ? ` · ${connector.last_error_code}` : ''}</small></div>
              <button className="button ghost" type="button" disabled={busy} onClick={() => void toggle(connector)}>{connector.status === 'active' ? 'Pausar' : 'Ativar'}</button>
            </article>)}</div>
          )}
        </div>
      </div>
      <div className="event-ingestion-section">
        <div><h3>Fila de revisão editorial</h3><p className="field-hint">Nesta etapa, nenhum evento é publicado sozinho. Confirme título, local, datas e fonte antes de aprovar.</p></div>
        {loading ? <p>Carregando candidatos…</p> : candidates.length === 0 ? <p className="field-hint">Nenhum evento aguardando revisão.</p> : candidates.map((candidate) => {
          const data = candidate.normalized_payload;
          const edit = edits[candidate.id] || {
            title: String(data.title || ''), category: String(data.category || 'Evento'),
            description: String(data.description || ''), priceDescription: String(data.priceDescription || ''),
          };
          return <article className="card event-candidate" key={candidate.id}>
            <div className="event-candidate-heading"><div><strong>{edit.title || 'Evento sem título'}</strong><p className="field-hint">{String(data.establishmentId || 'Estabelecimento não identificado')} · início {formatDate(data.startsAt)} · fim {formatDate(data.endsAt)}</p></div><span className="tag">{Math.round(candidate.confidence * 100)}% confiança</span></div>
            <p className="field-hint"><a href={candidate.source_url} target="_blank" rel="noreferrer">Conferir fonte original ↗</a> · recebido {formatDate(candidate.first_seen_at)}</p>
            {candidate.review_note ? <p className="field-hint">Pendências: {candidate.review_note}</p> : null}
            {candidate.auto_publish_eligible ? <span className="tag">Pode ser elegível para automação após validação do conector</span> : null}
            <div className="event-ingestion-fields">
              <label>Título<input value={edit.title} onChange={(event) => updateEdit(candidate.id, 'title', event.target.value, candidate)}/></label>
              <label>Categoria<input value={edit.category} onChange={(event) => updateEdit(candidate.id, 'category', event.target.value, candidate)}/></label>
              <label className="event-ingestion-wide">Descrição<textarea rows={3} value={edit.description} onChange={(event) => updateEdit(candidate.id, 'description', event.target.value, candidate)}/></label>
              <label className="event-ingestion-wide">Entrada / preço<input value={edit.priceDescription} onChange={(event) => updateEdit(candidate.id, 'priceDescription', event.target.value, candidate)}/></label>
            </div>
            <div className="event-ingestion-actions"><button className="button" type="button" disabled={busy} onClick={() => void review(candidate, 'approve')}>Aprovar e publicar</button><button className="button ghost" type="button" disabled={busy} onClick={() => void review(candidate, 'reject')}>Rejeitar</button></div>
          </article>;
        })}
      </div>
      <div className="event-ingestion-section">
        <h3>Histórico de coletas</h3>
        {runs.length ? <div className="event-ingestion-runs">{runs.map((run) => <article key={run.id}><span>{formatDate(run.started_at)} · {run.status}</span><small>Encontrados {run.discovered_count} · novos {run.created_count} · atualizados {run.updated_count} · rejeitados {run.rejected_count}{run.error_code ? ` · ${run.error_code}` : ''}</small></article>)}</div> : <p className="field-hint">Nenhuma execução registrada.</p>}
      </div>
    </section>
  );
}
