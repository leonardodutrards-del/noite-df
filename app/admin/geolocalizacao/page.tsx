'use client';

import Link from 'next/link';
import { useState } from 'react';

type GeocodeResult = {
  id: string;
  name: string;
  status: 'geocoded' | 'needs_review' | 'no_match' | 'error';
  confidence?: number;
  displayName?: string;
  reason?: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function GeolocalizacaoAdminPage() {
  const [busy, setBusy] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [geocoded, setGeocoded] = useState(0);
  const [needsReview, setNeedsReview] = useState(0);
  const [noMatch, setNoMatch] = useState(0);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [message, setMessage] = useState('');

  async function startGeocoding() {
    if (busy) return;
    setBusy(true);
    setProcessed(0);
    setGeocoded(0);
    setNeedsReview(0);
    setNoMatch(0);
    setResults([]);
    setMessage('Iniciando lote controlado. Mantenha esta tela aberta.');

    let afterId: string | undefined;
    try {
      while (true) {
        const response = await fetch('/api/admin/geocode-establishments', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ afterId }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Falha no serviço de geocodificação.');

        const batch = (payload.results ?? []) as GeocodeResult[];
        setResults((current) => [...current, ...batch]);
        setProcessed((current) => current + (payload.processed ?? batch.length));
        setGeocoded((current) => current + (payload.geocoded ?? 0));
        setNeedsReview((current) => current + (payload.needsReview ?? 0));
        setNoMatch((current) => current + (payload.noMatch ?? 0));

        if (payload.done || !payload.nextCursor) break;
        afterId = payload.nextCursor;
        await wait(1_200);
      }
      setMessage('Lote concluído. Confira os itens que ficaram pendentes de revisão.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'O processo foi interrompido.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/admin">Master Admin</Link><Link href="/">Ver mapa público</Link></nav>
      </header>

      <section className="page-heading">
        <span className="badge">Curadoria geográfica</span>
        <h1>Geolocalização dos estabelecimentos</h1>
        <p>Busca pontual no OpenStreetMap/Nominatim, uma consulta por vez e com intervalo mínimo de 1,2 segundo. Não abra o processo em duas abas simultaneamente. Só grava coordenadas quando nome e contexto geográfico passam na validação automática.</p>
      </section>

      <section className="panel" style={{ display: 'grid', gap: 16 }}>
        <div className="metrics-grid">
          <article><span>Processados</span><strong>{processed}</strong></article>
          <article><span>Coordenadas gravadas</span><strong>{geocoded}</strong></article>
          <article><span>Revisão manual</span><strong>{needsReview}</strong></article>
          <article><span>Sem correspondência</span><strong>{noMatch}</strong></article>
        </div>
        <p>O sistema não posiciona bares no centro de uma região nem inventa coordenadas. Resultados incertos ficam pendentes para conferência.</p>
        <button className="button" type="button" disabled={busy} onClick={() => void startGeocoding()}>
          {busy ? 'Geocodificando em sequência…' : processed > 0 ? 'Continuar / reiniciar verificação' : 'Iniciar geocodificação'}
        </button>
        {message ? <div className="notice" role="status">{message}</div> : null}
      </section>

      {results.length > 0 ? (
        <section className="panel" style={{ marginTop: 20 }}>
          <h2>Resultado por estabelecimento</h2>
          <div className="smart-geocode-results">
            {results.map((item, index) => (
              <article key={item.id + '-' + index}>
                <div>
                  <strong>{item.name}</strong>
                  {item.displayName ? <small>{item.displayName}</small> : null}
                  {item.reason ? <small>{item.reason}</small> : null}
                </div>
                <span className={'tag geocode-' + item.status}>
                  {item.status === 'geocoded' ? 'Coordenada gravada' : item.status === 'needs_review' ? 'Revisão manual' : item.status === 'no_match' ? 'Sem resultado' : 'Erro'}
                  {typeof item.confidence === 'number' ? ' · ' + Math.round(item.confidence * 100) + '%' : ''}
                </span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
