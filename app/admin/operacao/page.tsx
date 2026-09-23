'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Stage = 'uncontacted' | 'contacted' | 'replied' | 'trial' | 'partner' | 'paused' | 'lost';

type Item = {
  establishment: { id: string; name: string; region: string };
  completeness: { score: number; missing: string[] };
  pipeline: { establishmentId: string; stage: Stage; contactChannel?: string; nextFollowUpAt?: string; trialEndsAt?: string };
};

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

  async function load() {
    const response = await fetch('/api/admin/operacao', { cache: 'no-store' });
    if (!response.ok) {
      setMessage(response.status === 401 || response.status === 403 ? 'Acesso restrito ao Master Admin.' : 'Falha ao carregar operação.');
      return;
    }
    const payload = await response.json();
    setItems(payload.items ?? []);
  }

  useEffect(() => { void load(); }, []);

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

  async function changeStage(establishmentId: string, stage: Stage) {
    setMessage('');
    const response = await fetch('/api/admin/operacao', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ establishmentId, stage, trialPlanCode: stage === 'trial' ? 'pro' : undefined }),
    });
    if (!response.ok) {
      setMessage('Não foi possível atualizar o funil.');
      return;
    }
    await load();
  }

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/admin">Master Admin</Link><Link href="/planos">Planos</Link></nav>
      </header>
      <section className="page-heading">
        <span className="badge">Operação & Growth</span>
        <h1>CRM dos 73 estabelecimentos</h1>
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
              </div>
              <label>
                Etapa
                <select value={item.pipeline.stage} onChange={(e) => void changeStage(item.establishment.id, e.target.value as Stage)} style={{ display: 'block', marginTop: 6 }}>
                  {(Object.keys(labels) as Stage[]).map((stage) => <option key={stage} value={stage}>{labels[stage]}</option>)}
                </select>
              </label>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
