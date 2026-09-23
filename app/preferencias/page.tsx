'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function split(value: string) { return value.split(',').map((item) => item.trim()).filter(Boolean); }

export default function PreferencesPage() {
  const [regions, setRegions] = useState('');
  const [music, setMusic] = useState('');
  const [vibes, setVibes] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/user/preferences').then(async (response) => {
      if (response.status === 401) { window.location.href = '/login?redirect=/preferencias'; return; }
      if (!response.ok) return;
      const payload = await response.json();
      setRegions((payload.preferences?.regions ?? []).join(', '));
      setMusic((payload.preferences?.music ?? []).join(', '));
      setVibes((payload.preferences?.vibes ?? []).join(', '));
      setBudget(payload.preferences?.budget ?? '');
    });
  }, []);

  async function save() {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ regions: split(regions), music: split(music), vibes: split(vibes), budget }),
    });
    setMessage(response.ok ? 'Preferências salvas.' : 'Não foi possível salvar.');
  }

  return (
    <main className="container">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><Link href="/favoritos">Favoritos</Link></header>
      <section className="page-heading"><span className="badge">Personalização</span><h1>O que combina com você?</h1><p>Esses sinais serão usados pela recomendação e, depois, pelo Concierge IA.</p></section>
      <section className="panel account-form">
        <label>Regiões<input value={regions} onChange={(e) => setRegions(e.target.value)} placeholder="Asa Sul, Asa Norte" /></label>
        <label>Música<input value={music} onChange={(e) => setMusic(e.target.value)} placeholder="pagode, rock, sertanejo" /></label>
        <label>Vibes<input value={vibes} onChange={(e) => setVibes(e.target.value)} placeholder="date, tranquilo, animado" /></label>
        <label>Orçamento<input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Até R$ 120" /></label>
        <button type="button" onClick={() => void save()}>Salvar preferências</button>
        {message ? <p>{message}</p> : null}
      </section>
    </main>
  );
}
