'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Favorite = { id: string; name: string; region: string; type: string };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [message, setMessage] = useState('Carregando favoritos...');

  useEffect(() => {
    fetch('/api/user/favorites')
      .then(async (response) => {
        if (response.status === 401) { window.location.href = '/login?redirect=/favoritos'; return null; }
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((payload) => {
        if (!payload) return;
        setFavorites(payload.favorites ?? []);
        setMessage('');
      })
      .catch(() => setMessage('Não foi possível carregar seus favoritos.'));
  }, []);

  return (
    <main className="container">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><nav><Link href="/preferencias">Preferências</Link><Link href="/roteiros">Roteiros</Link></nav></header>
      <section className="page-heading"><span className="badge">Seu Noite DF</span><h1>Favoritos</h1><p>Guarde lugares para voltar depois e use-os como base para seus roteiros.</p></section>
      {message ? <div className="notice">{message}</div> : null}
      <div className="grid">
        {favorites.map((place) => (
          <article className="card" key={place.id}>
            <h3>{place.name}</h3><p>{place.region} · {place.type}</p>
            <Link className="button" href={`/lugar/${place.id}`}>Abrir perfil</Link>
            <Link className="button ghost" href={`/roteiros?place=${encodeURIComponent(place.id)}`} style={{ marginLeft: 8 }}>Roteiro</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
