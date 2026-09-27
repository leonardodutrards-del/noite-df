'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Stage = 'uncontacted' | 'contacted' | 'replied' | 'trial' | 'partner' | 'paused' | 'lost';

type Item = {
  establishment: { id: string; name: string; region: string };
  completeness: { score: number; missing: string[] };
  pipeline: { establishmentId: string; stage: Stage; contactChannel?: string; nextFollowUpAt?: string; lastContactAt?: string; notes?: string; trialEndsAt?: string };
};

type ContactDraft = { contactChannel: string; notes: string; nextFollowUpAt: string };

function followUpDate(value?: string): string {
  return value ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)) : '';
}

const labels: Record<Stage, string> = {
  uncontacted: 'Não contatado',
  contacted: 'Contato enviado',
  replied: 'Respondeu',
  trial: 'Teste grátis',
  partner: 'Parceiro ativo',
  paused: 'Pausado',
  lost: 'Não convertido',
};

export default function OperationPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState<Record<string, ContactDraft>>({});
  const [savingId, setSavingId] = useState('');

  function draft(item: Item): ContactDraft {
    return drafts[item.establishment.id] ?? {
      contactChannel: item.pipeline.contactChannel ?? '',
      notes: item.pipeline.notes ?? '',
      nextFollowUpAt: followUpDate(item.pipeline.nextFollowUpAt),
    };
  }

  function edit(item: Item, patch: Partial<ContactDraft>) {
    setDrafts(current => ({ ...current, [item.establishment.id]: { ...draft(item), ...patch } }));
  }

  async function load() {
    const response = await fetch('/api/admin/operacao', { cache: 'no-store' });
    if (!response.ok) {
      setMessage(response.status === 401 || response.status === 403 ? 'Acesso restrito ao Master Admin.' : 'Falha ao carregar operação.');
      return;
    }
    const payload = await response.json();
    setItems(payload.items ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/operacao', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          if (!cancelled) setMessage(response.status === 401 || response.status === 403 ? 'Acesso restrito ao Master Admin.' : 'Falha ao carregar operação.');
          return null;
        }
        return response.json();
      })
      .then((payload) => {
        if (!cancelled && payload) setItems(payload.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setMessage('Falha ao carregar operação.');
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? items.filter((item) => `${item.establishment.name} ${item.establishment.region}`.toLowerCase().includes(normalized))
      : items;
  }, [items, query]);

  const summary = useMemo(() => {
    const counts = Object.fromEntries(Object.keys(labels).map((key) => [key, 0])) as Record<Stage, number>;
    let completeness = 0;
    for (const item of items) {
      counts[item.pipeline.stage] += 1;
      completeness += item.completeness.score;
    }
    return { counts, average: items.length ? Math.round(completeness / items.length) : 0 };
  }, [items]);

  async function save(item: Item, stage = item.pipeline.stage) {
    setMessage('');
    const fields = draft(item);
    if (stage === 'contacted' && !fields.contactChannel) {
      setMessage('Escolha o canal antes de marcar um contato como enviado.');
      return;
    }
    setSavingId(item.establishment.id);
    try {
      const response = await fetch('/api/admin/operacao', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          establishmentId: item.establishment.id, stage,
          ...fields,
          nextFollowUpAt: fields.nextFollowUpAt || null,
          markContacted: stage === 'contacted' && item.pipeline.stage !== 'contacted',
          startTrial: stage === 'trial' && item.pipeline.stage !== 'trial',
          trialPlanCode: stage === 'trial' ? 'pro' : undefined,
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Não foi possível atualizar o funil.');
      }
      await load();
      setMessage('Acompanhamento salvo.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o funil.');
    } finally {
      setSavingId('');
    }
  }

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/admin">Master Admin</Link><Link href="/planos">Planos</Link></nav>
      </header>
      <section className="page-heading">
        <span className="badge">Operação & Growth</span>
        <h1>CRM dos {items.length} estabelecimentos</h1>
        <p>Contato, resposta, teste gratuito, conversão e qualidade cadastral em uma única fila operacional.</p>
      </section>
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <article><span>Completude média</span><strong>{summary.average}%</strong></article>
        <article><span>Contatados</span><strong>{summary.counts.contacted}</strong></article>
        <article><span>Respostas</span><strong>{summary.counts.replied}</strong></article>
        <article><span>Em trial</span><strong>{summary.counts.trial}</strong></article>
        <article><span>Parceiros</span><strong>{summary.counts.partner}</strong></article>
      </div>
      <input aria-label="Buscar estabelecimento" placeholder="Buscar por nome ou região" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', marginBottom: 18 }} />
      {message ? <div className="notice">{message}</div> : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((item) => (
          <article className="card" key={item.establishment.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h3>{item.establishment.name}</h3>
                <p>{item.establishment.region} · cadastro {item.completeness.score}% completo</p>
                {item.completeness.missing.length ? <small style={{ color: 'var(--muted)' }}>Falta: {item.completeness.missing.join(', ')}</small> : null}
                <p><Link href={`/lugar/${item.establishment.id}`}>Ver perfil público</Link></p>
              </div>
              <label>
                Etapa
                <select value={item.pipeline.stage} disabled={savingId === item.establishment.id} onChange={(e) => void save(item, e.target.value as Stage)} style={{ display: 'block', marginTop: 6 }}>
                  {(Object.keys(labels) as Stage[]).map((stage) => <option key={stage} value={stage}>{labels[stage]}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
              <label>Canal de contato
                <select value={draft(item).contactChannel} onChange={(e) => edit(item, { contactChannel: e.target.value })} style={{ display: 'block', width: '100%' }}>
                  <option value="">Não informado</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option><option value="telefone">Telefone</option><option value="outro">Outro</option>
                </select>
              </label>
              <label>Próximo contato
                <input type="date" value={draft(item).nextFollowUpAt} onChange={(e) => edit(item, { nextFollowUpAt: e.target.value })} style={{ display: 'block', width: '100%' }} />
              </label>
            </div>
            <label style={{ display: 'block', marginTop: 12 }}>Notas internas
              <textarea rows={2} maxLength={2000} value={draft(item).notes} onChange={(e) => edit(item, { notes: e.target.value })} placeholder="Registre a resposta ou o próximo passo; não inclua dados pessoais desnecessários." style={{ display: 'block', width: '100%' }} />
            </label>
            <button type="button" disabled={savingId === item.establishment.id} onClick={() => void save(item)} style={{ marginTop: 10 }}>Salvar acompanhamento</button>
            {item.pipeline.lastContactAt && <small style={{ display: 'block', marginTop: 8 }}>Último contato registrado: {new Date(item.pipeline.lastContactAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</small>}
          </article>
        ))}
      </div>
    </main>
  );
}
