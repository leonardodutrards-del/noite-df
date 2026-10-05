'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Stage = 'uncontacted' | 'contacted' | 'replied' | 'trial' | 'partner' | 'paused' | 'lost';
type VisitStatus =
  | 'not_visited'
  | 'visited'
  | 'owner_contacted'
  | 'interested'
  | 'follow_up'
  | 'trial'
  | 'signed'
  | 'lost';

type Item = {
  establishment: {
    id: string;
    name: string;
    region: string;
    address?: string;
    instagram?: string;
    whatsapp?: string;
  };
  completeness: { score: number; missing: string[] };
  pipeline: {
    establishmentId: string;
    stage: Stage;
    contactChannel?: string;
    nextFollowUpAt?: string;
    trialEndsAt?: string;
    visitStatus?: VisitStatus;
    visitedAt?: string;
    visitNotes?: string;
  };
};

type Draft = { notes: string; followUp: string };

const stageLabels: Record<Stage, string> = {
  uncontacted: 'Não contatado',
  contacted: 'Contato enviado',
  replied: 'Respondeu',
  trial: 'Teste grátis',
  partner: 'Parceiro ativo',
  paused: 'Pausado',
  lost: 'Não convertido',
};

const visitLabels: Record<VisitStatus, string> = {
  not_visited: 'Não visitado',
  visited: 'Visitado',
  owner_contacted: 'Falei com o dono',
  interested: 'Interessado',
  follow_up: 'Retornar',
  trial: 'Teste ativo',
  signed: 'Assinou',
  lost: 'Não converteu',
};

const quickVisits: Array<{ status: VisitStatus; label: string }> = [
  { status: 'visited', label: '✓ Visitei' },
  { status: 'owner_contacted', label: '👤 Falei com o dono' },
  { status: 'interested', label: '🔥 Interessado' },
  { status: 'follow_up', label: '↩ Retornar' },
  { status: 'trial', label: '🧪 Trial' },
  { status: 'signed', label: '💳 Assinou' },
];

function toLocalInput(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function OperationPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('Sobradinho');
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [activationEmail, setActivationEmail] = useState('');
  const [activationEstablishmentId, setActivationEstablishmentId] = useState('');
  const [activationBusy, setActivationBusy] = useState(false);

  async function load() {
    const response = await fetch('/api/admin/operacao', { cache: 'no-store' });
    if (!response.ok) {
      setMessage(response.status === 401 || response.status === 403 ? 'Acesso restrito ao Master Admin.' : 'Falha ao carregar operação.');
      return;
    }
    const payload = await response.json();
    const nextItems = (payload.items ?? []) as Item[];
    setItems(nextItems);
    setDrafts((current) => {
      const next = { ...current };
      for (const item of nextItems) {
        if (!next[item.establishment.id]) {
          next[item.establishment.id] = {
            notes: item.pipeline.visitNotes ?? '',
            followUp: toLocalInput(item.pipeline.nextFollowUpAt),
          };
        }
      }
      return next;
    });
    setActivationEstablishmentId((current) => {
      if (current) return current;
      return nextItems.find((item) => item.establishment.region === 'Sobradinho')?.establishment.id ?? nextItems[0]?.establishment.id ?? '';
    });
  }

  useEffect(() => {
    void load();
  }, []);

  const regionItems = useMemo(
    () => regionFilter === 'todas' ? items : items.filter((item) => item.establishment.region === regionFilter),
    [items, regionFilter]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return regionItems.filter((item) => {
      if (!normalized) return true;
      return `${item.establishment.name} ${item.establishment.region} ${item.establishment.address ?? ''}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [regionItems, query]);

  const summary = useMemo(() => {
    const counts = Object.fromEntries(Object.keys(stageLabels).map((key) => [key, 0])) as Record<Stage, number>;
    const visits = Object.fromEntries(Object.keys(visitLabels).map((key) => [key, 0])) as Record<VisitStatus, number>;
    let completeness = 0;
    for (const item of regionItems) {
      counts[item.pipeline.stage] += 1;
      visits[item.pipeline.visitStatus ?? 'not_visited'] += 1;
      completeness += item.completeness.score;
    }
    return {
      counts,
      visits,
      average: regionItems.length ? Math.round(completeness / regionItems.length) : 0,
    };
  }, [regionItems]);

  function updateDraft(establishmentId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [establishmentId]: {
        notes: current[establishmentId]?.notes ?? '',
        followUp: current[establishmentId]?.followUp ?? '',
        ...patch,
      },
    }));
  }

  async function updateVisit(item: Item, visitStatus: VisitStatus) {
    const draft = drafts[item.establishment.id] ?? { notes: '', followUp: '' };
    if (visitStatus === 'follow_up' && !draft.followUp) {
      setMessage('Escolha a data de retorno antes de marcar "Retornar".');
      return;
    }

    setMessage('');
    const response = await fetch('/api/admin/operacao', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        establishmentId: item.establishment.id,
        visitStatus,
        visitNotes: draft.notes,
        nextFollowUpAt: draft.followUp ? new Date(draft.followUp).toISOString() : null,
        trialPlanCode: visitStatus === 'trial' ? 'pro' : undefined,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error || 'Não foi possível atualizar a visita.');
      return;
    }
    setMessage(`${item.establishment.name}: ${visitLabels[visitStatus]}.`);
    await load();
  }

  async function saveVisitDetails(item: Item) {
    const status = item.pipeline.visitStatus ?? 'not_visited';
    await updateVisit(item, status);
  }

  async function activatePartner() {
    if (!activationEmail.trim() || !activationEstablishmentId) {
      setMessage('Selecione o estabelecimento e informe o e-mail usado pelo dono no cadastro.');
      return;
    }

    setActivationBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/partners/activate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: activationEmail.trim(),
          establishmentId: activationEstablishmentId,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(payload.error || 'Não foi possível vincular a conta.');
        return;
      }
      setMessage(
        payload.activation?.alreadyLinked
          ? 'Essa conta já estava vinculada a este estabelecimento.'
          : `Parceiro ativado: ${payload.activation?.establishmentName ?? 'estabelecimento'}.`
      );
      setActivationEmail('');
      await load();
    } finally {
      setActivationBusy(false);
    }
  }

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/admin">Master Admin</Link>
          <Link href="/parceiros/sobradinho">Apresentação Sobradinho</Link>
          <Link href="/planos">Planos</Link>
        </nav>
      </header>

      <section className="page-heading">
        <span className="badge">Operação comercial</span>
        <h1>CRM de campo · {regionFilter === 'todas' ? 'Todas as regiões' : regionFilter}</h1>
        <p>Visita, conversa com o dono, interesse, retorno, teste e assinatura em uma única tela.</p>
      </section>

      <section className="panel" style={{ marginBottom: 24 }}>
        <span className="badge">Ativação rápida</span>
        <h2 style={{ marginBottom: 8 }}>Vincular o dono ao estabelecimento na hora</h2>
        <p style={{ color: 'var(--muted)', marginTop: 0 }}>
          O dono cria a conta em <Link href="/cadastro" target="_blank">/cadastro</Link>. Depois, informe o mesmo e-mail aqui para liberar o painel sem esperar a fila normal de aprovação.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) minmax(240px, 1fr) auto', gap: 12, alignItems: 'end' }}>
          <label>
            Estabelecimento
            <select
              value={activationEstablishmentId}
              onChange={(e) => setActivationEstablishmentId(e.target.value)}
              style={{ width: '100%', display: 'block', marginTop: 6 }}
            >
              {regionItems.map((item) => (
                <option key={item.establishment.id} value={item.establishment.id}>{item.establishment.name}</option>
              ))}
            </select>
          </label>
          <label>
            E-mail da conta do dono
            <input
              type="email"
              value={activationEmail}
              onChange={(e) => setActivationEmail(e.target.value)}
              placeholder="dono@estabelecimento.com"
              style={{ width: '100%', display: 'block', marginTop: 6 }}
            />
          </label>
          <button type="button" className="button" disabled={activationBusy} onClick={() => void activatePartner()}>
            {activationBusy ? 'Ativando…' : 'Ativar parceiro'}
          </button>
        </div>
      </section>

      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <article><span>Estabelecimentos</span><strong>{regionItems.length}</strong></article>
        <article><span>Visitados</span><strong>{regionItems.length - summary.visits.not_visited}</strong></article>
        <article><span>Interessados</span><strong>{summary.visits.interested}</strong></article>
        <article><span>Retornos</span><strong>{summary.visits.follow_up}</strong></article>
        <article><span>Trials</span><strong>{summary.visits.trial}</strong></article>
        <article><span>Assinaram</span><strong>{summary.visits.signed}</strong></article>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12, marginBottom: 18 }}>
        <input
          aria-label="Buscar estabelecimento"
          placeholder="Buscar por nome, endereço ou região"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%' }}
        />
        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setActivationEstablishmentId('');
          }}
        >
          <option value="Sobradinho">Sobradinho</option>
          <option value="todas">Todas as regiões</option>
          {Array.from(new Set(items.map((item) => item.establishment.region)))
            .filter((region) => region !== 'Sobradinho')
            .sort()
            .map((region) => <option key={region} value={region}>{region}</option>)}
        </select>
      </div>

      {message ? <div className="notice" style={{ marginBottom: 18 }}>{message}</div> : null}

      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map((item) => {
          const visitStatus = item.pipeline.visitStatus ?? 'not_visited';
          const draft = drafts[item.establishment.id] ?? { notes: '', followUp: '' };
          return (
            <article className="card" key={item.establishment.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>{item.establishment.name}</h3>
                    <span className="tag">{visitLabels[visitStatus]}</span>
                    <span className="tag">{stageLabels[item.pipeline.stage]}</span>
                  </div>
                  <p style={{ marginBottom: 4 }}>
                    {item.establishment.region} · cadastro {item.completeness.score}% completo
                  </p>
                  {item.establishment.address ? <small style={{ color: 'var(--muted)' }}>{item.establishment.address}</small> : null}
                  {item.completeness.missing.length ? (
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: 4 }}>Falta: {item.completeness.missing.join(', ')}</small>
                  ) : null}
                  {item.pipeline.visitedAt ? (
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: 4 }}>
                      Última atualização presencial: {new Date(item.pipeline.visitedAt).toLocaleString('pt-BR')}
                    </small>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Link className="button ghost" href={`/lugar/${item.establishment.id}`} target="_blank">Ver perfil</Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {quickVisits.map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    className={visitStatus === action.status ? 'button' : 'button ghost'}
                    onClick={() => void updateVisit(item, action.status)}
                    style={{ padding: '8px 12px', fontSize: 12 }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 220px auto', gap: 10, marginTop: 14, alignItems: 'end' }}>
                <label>
                  Observação da visita
                  <input
                    value={draft.notes}
                    onChange={(e) => updateDraft(item.establishment.id, { notes: e.target.value })}
                    placeholder="Ex: dono gostou do Premium; retornar com sócio"
                    style={{ width: '100%', display: 'block', marginTop: 5 }}
                  />
                </label>
                <label>
                  Próximo retorno
                  <input
                    type="datetime-local"
                    value={draft.followUp}
                    onChange={(e) => updateDraft(item.establishment.id, { followUp: e.target.value })}
                    style={{ width: '100%', display: 'block', marginTop: 5 }}
                  />
                </label>
                <button type="button" className="button ghost" onClick={() => void saveVisitDetails(item)}>
                  Salvar
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
