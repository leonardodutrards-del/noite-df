'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SavedList = { id: string; name: string; created_at: string };
type SavedItem = { list_id: string; establishment_id: string };

export function ListsClient({ initialPlaceId }: { initialPlaceId: string }) {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const response = await fetch('/api/user/lists');
    if (response.status === 401) { window.location.href = '/login?redirect=/roteiros'; return; }
    if (!response.ok) return;
    const payload = await response.json();
    setLists(payload.lists ?? []);
    setItems(payload.items ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/lists')
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = '/login?redirect=/roteiros';
          return null;
        }
        if (!response.ok) return null;
        return response.json();
      })
      .then((payload) => {
        if (!cancelled && payload) {
          setLists(payload.lists ?? []);
          setItems(payload.items ?? []);
        }
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  async function createList() {
    if (!name.trim()) return;
    await fetch('/api/user/lists', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'create', name }) });
    setName('');
    await load();
  }

  async function add(listId: string) {
    if (!initialPlaceId) return;
    await fetch('/api/user/lists', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'add_item', listId, establishmentId: initialPlaceId }) });
    await load();
  }

  return (
    <main className="container">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><Link href="/favoritos">Favoritos</Link></header>
      <section className="page-heading"><span className="badge">Roteiros</span><h1>Monte sua próxima saída</h1><p>Crie listas pessoais para date, happy hour, aniversário, fim de semana ou qualquer outro plano.</p></section>
      <div className="panel" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Date na Asa Sul" style={{ flex: 1 }} />
          <button type="button" onClick={() => void createList()}>Criar roteiro</button>
        </div>
      </div>
      <div className="grid">
        {lists.map((list) => {
          const count = items.filter((item) => item.list_id === list.id).length;
          const alreadySaved = Boolean(initialPlaceId && items.some((item) => item.list_id === list.id && item.establishment_id === initialPlaceId));
          return (
            <article className="card" key={list.id}>
              <h3>{list.name}</h3><p>{count} lugar(es)</p>
              {initialPlaceId ? <button type="button" disabled={alreadySaved} onClick={() => void add(list.id)}>{alreadySaved ? 'Já adicionado' : 'Adicionar este lugar'}</button> : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}
