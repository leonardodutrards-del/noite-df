'use client';

import { useState } from 'react';
import type { EditorialEvent } from '@/modules/events/editorial';
import type { PublicationStatus } from '@/modules/shared/types';

type Place = { id: string; name: string; publicationStatus?: PublicationStatus };
const empty = { establishment_id: '', title: '', category: 'Música ao vivo', description: '', starts_at: '', ends_at: '', official_url: '', price_description: '', publication_status: 'draft' as PublicationStatus, image_url: '', image_alt: '', image_credit: '', image_source: '', image_authorized: false };
const localTime = (iso: string) => new Date(Date.parse(iso) - 3 * 3600000).toISOString().slice(0, 16);
const labels: Record<string, string> = { draft: 'Rascunho', pending_review: 'Em revisão', published: 'Publicado', suspended: 'Suspenso', expired: 'Encerrado' };

export function AgendaEditor({ places, initialEvents, initialNow }: { places: Place[]; initialEvents: EditorialEvent[]; initialNow: number }) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<EditorialEvent | null>(null);
  const [form, setForm] = useState(empty);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('current');
  const [now, setNow] = useState(initialNow);
  async function reload() {
    const res = await fetch('/api/admin/events', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Não foi possível carregar a agenda.');
    setEvents(data.events);
    setNow(Date.now());
  }
  function edit(event: EditorialEvent) {
    setEditing(event);
    setForm({ ...empty, ...event, starts_at: localTime(event.starts_at), ends_at: localTime(event.ends_at), price_description: event.price_description || '',
      image_url: event.artwork?.url || '', image_alt: event.artwork?.alt || '', image_credit: event.artwork?.credit || '', image_source: event.artwork?.sourceUrl || '', image_authorized: event.artwork?.authorized === true });
    setConfirmed(false);
    setMessage('Confira a fonte antes de publicar alterações.');
    document.getElementById('agenda-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const res = await fetch('/api/admin/events', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, starts_at: `${form.starts_at}:00-03:00`, ends_at: `${form.ends_at}:00-03:00`, sourceConfirmed: confirmed,
          artwork: form.image_url ? { url: form.image_url, alt: form.image_alt, credit: form.image_credit, sourceUrl: form.image_source, authorized: form.image_authorized } : null,
          ...(editing ? { id: editing.id, expectedUpdatedAt: editing.updated_at } : {}) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível salvar.');
      setEditing(null); setForm(empty); setConfirmed(false);
      setMessage(form.publication_status === 'published' ? 'Evento publicado. As agendas públicas já podem ser atualizadas ao abrir a página.' : 'Evento salvo. Ele ficará fora das agendas públicas até ser publicado.');
      await reload();
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Não foi possível salvar.'); }
    finally { setBusy(false); }
  }
  const visible = events.filter(event => filter === 'all' || (filter === 'review' ? ['draft', 'pending_review'].includes(event.publication_status) : Date.parse(event.ends_at) > now));
  return <>
    {message && <p role="status" className="panel">{message}</p>}
    <form id="agenda-form" onSubmit={save} className="panel agenda-simple-form">
      <h2>{editing ? 'Corrigir evento' : 'Novo evento'}</h2>
      <p className="field-hint">Preencha os dados da programação recebida. Salvar rascunho não publica no site.</p>
      <fieldset className="agenda-form-section"><legend>1. Onde e o quê?</legend>
      <label>Qual estabelecimento?<select required value={form.establishment_id} onChange={e => setForm({ ...form, establishment_id: e.target.value })}><option value="">Escolha a casa</option>{places.map(place => <option key={place.id} value={place.id}>{place.name}{place.publicationStatus !== 'published' ? ' (fora do guia público)' : ''}</option>)}</select></label>
      <label>Nome do evento<input required placeholder="Ex.: Sexta de pagode" maxLength={200} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
      <label>O que vai acontecer?<textarea required placeholder="Atrações, programação e endereço confirmado." maxLength={4000} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      </fieldset>
      <fieldset className="agenda-form-section"><legend>2. Quando acontece?</legend>
      <p className="field-hint">Use o horário de Brasília. Se terminar depois da meia-noite, escolha o dia seguinte no encerramento.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <label>Começa em<input required type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} /></label>
        <label>Termina em<input required type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></label>
      </div>
      </fieldset>
      <details className="agenda-extra" open={Boolean(editing && (form.price_description || form.category !== 'Música ao vivo'))}><summary>Detalhes extras: entrada e tipo de evento</summary><div className="agenda-extra-body">
      <label>Tipo de evento<input required maxLength={200} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></label>
      <label>Valor de entrada e condições<textarea placeholder="Ex.: entrada gratuita até 20h. Preencha somente o que foi confirmado." maxLength={1500} rows={2} value={form.price_description} onChange={e => setForm({ ...form, price_description: e.target.value })} /></label>
      </div></details>
      <details className="agenda-extra" open={Boolean(form.image_url)}><summary>Adicionar imagem · opcional</summary><div className="agenda-extra-body">
        <p className="field-hint">Use o endereço direto de uma imagem estável. Links de posts do Instagram não são arquivos de imagem. O flyer aparece nas agendas e no perfil do local; texto, horário e endereço continuam legíveis fora da arte.</p>
        <label>Link HTTPS da imagem<input type="url" maxLength={2000} value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://…/flyer.jpg" /></label>
        {form.image_url && <>
          <label>Descrição acessível<input required maxLength={300} value={form.image_alt} onChange={e => setForm({ ...form, image_alt: e.target.value })} /></label>
          <label>Crédito da imagem<input required maxLength={200} value={form.image_credit} onChange={e => setForm({ ...form, image_credit: e.target.value })} placeholder="Nome do estabelecimento ou organizador" /></label>
          <label>Fonte da imagem<input required type="url" maxLength={2000} value={form.image_source} onChange={e => setForm({ ...form, image_source: e.target.value })} /></label>
          <label><input style={{ width: 'auto' }} type="checkbox" required={form.publication_status === 'published'} checked={form.image_authorized} onChange={e => setForm({ ...form, image_authorized: e.target.checked })} /> Tenho autorização do responsável para usar esta imagem.</label>
        </>}
      </div></details>
      <fieldset className="agenda-form-section"><legend>3. Confira e salve</legend>
      <label>Link que confirma a programação<input required type="url" value={form.official_url} onChange={e => setForm({ ...form, official_url: e.target.value })} placeholder="Cole o link oficial do evento ou da casa" /></label>
      <label>O que fazer ao salvar?<select value={form.publication_status} onChange={e => setForm({ ...form, publication_status: e.target.value as PublicationStatus })}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{value === 'draft' ? 'Guardar rascunho (não aparece no site)' : value === 'published' ? 'Publicar no site' : label}</option>)}</select></label>
      {form.publication_status === 'published' && <label><input style={{ width: 'auto' }} type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> Conferi a fonte oficial, data, horário e local desta programação.</label>}
      <div className="agenda-form-actions"><button disabled={busy} type="submit">{busy ? 'Salvando…' : form.publication_status === 'published' ? 'Publicar programação' : form.publication_status === 'draft' ? 'Salvar rascunho' : 'Salvar alteração'}</button>{editing && <button type="button" disabled={busy} onClick={() => { setEditing(null); setForm(empty); setConfirmed(false); }}>Cancelar edição</button>}</div>
      </fieldset>
    </form>
    <section><h2>Programação cadastrada</h2><label>Exibir<select value={filter} onChange={e => setFilter(e.target.value)}><option value="current">Ainda válidos</option><option value="review">Rascunhos e revisão</option><option value="all">Todos, incluindo encerrados</option></select></label>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>{visible.map(event => <article className="panel" key={event.id}><h3>{event.title}</h3><p>{places.find(place => place.id === event.establishment_id)?.name} · {new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }).format(new Date(event.starts_at))}</p><p>{Date.parse(event.ends_at) <= now ? 'Encerrado' : labels[event.publication_status]}</p><a href={event.official_url} target="_blank" rel="noreferrer">Conferir fonte ↗</a><div style={{ marginTop: 12 }}><button type="button" disabled={busy} onClick={() => edit(event)}>Editar programação</button></div></article>)}{!visible.length && <p>Nenhum evento nesta seleção.</p>}</div>
    </section>
  </>;
}
