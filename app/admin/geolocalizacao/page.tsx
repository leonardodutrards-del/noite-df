'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type GeocodeResult = {
  id: string;
  name: string;
  status: 'geocoded' | 'needs_review' | 'no_match' | 'error';
  confidence?: number;
  displayName?: string;
  reason?: string;
};

type DiscoveryCandidate = {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  osmType: string;
  address: string;
  duplicateMatches: Array<{ id: string; name: string; region: string }>;
  wazeUrl: string;
};

type PendingPlace = {
  id: string;
  name: string;
  region: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  publication_status: string;
};

const TYPES = ['Bar', 'Restaurante', 'Boate', 'Casa de show', 'Evento agro', 'Gastrobar', 'Pub', 'Complexo gastronômico', 'Clube / espaço de eventos'];

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

  const [searchName, setSearchName] = useState('');
  const [searchRegion, setSearchRegion] = useState('Brasília, DF');
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [selected, setSelected] = useState<DiscoveryCandidate | null>(null);
  const [newName, setNewName] = useState('');
  const [newRegion, setNewRegion] = useState('Brasília, DF');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState('Bar');
  const [newDescription, setNewDescription] = useState('');
  const [wazeShareUrl, setWazeShareUrl] = useState('');
  const [discoveryBusy, setDiscoveryBusy] = useState(false);
  const [discoveryMessage, setDiscoveryMessage] = useState('');
  const [pendingPlaces, setPendingPlaces] = useState<PendingPlace[]>([]);
  const [pendingWazeLinks, setPendingWazeLinks] = useState<Record<string, string>>({});
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  const loadPendingPlaces = useCallback(async () => {
    setPendingLoading(true);
    try {
      const response = await fetch('/api/admin/discover-establishments?pending=1', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Falha ao carregar locais pendentes.');
      setPendingPlaces(payload.establishments ?? []);
    } catch (error) {
      setPendingMessage(error instanceof Error ? error.message : 'Falha ao carregar locais pendentes.');
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void loadPendingPlaces();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loadPendingPlaces]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void startGeocoding();
    });
    return () => window.cancelAnimationFrame(frame);
    // The admin geocoding job intentionally starts once when this protected page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function importWazeLocation(place: PendingPlace) {
    const wazeUrl = pendingWazeLinks[place.id]?.trim();
    if (!wazeUrl || pendingLoading) return;
    setPendingLoading(true);
    setPendingMessage('Importando coordenadas do link Waze de ' + place.name + '…');
    try {
      const response = await fetch('/api/admin/discover-establishments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'import_waze_location', establishmentId: place.id, wazeUrl }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Não foi possível importar a localização.');
      setPendingWazeLinks((current) => ({ ...current, [place.id]: '' }));
      setPendingMessage('Localização Waze importada para ' + place.name + '.');
      await loadPendingPlaces();
    } catch (error) {
      setPendingMessage(error instanceof Error ? error.message : 'Falha ao importar localização.');
    } finally {
      setPendingLoading(false);
    }
  }

  async function searchMissingEstablishments() {
    if (searchName.trim().length < 3 || discoveryBusy) return;
    setDiscoveryBusy(true);
    setDiscoveryMessage('Pesquisando opções no DF e Entorno…');
    setCandidates([]);
    setSelected(null);
    try {
      const params = new URLSearchParams({ q: searchName.trim(), region: searchRegion.trim() });
      const response = await fetch('/api/admin/discover-establishments?' + params.toString(), { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Não foi possível pesquisar.');
      setCandidates(payload.results ?? []);
      setDiscoveryMessage(payload.results?.length
        ? 'Confira o nome e o ponto no mapa. Só cadastre depois de confirmar que é o local correto.'
        : 'Nenhum resultado encontrado. Confira a escrita ou tente informar bairro/endereço.');
    } catch (error) {
      setDiscoveryMessage(error instanceof Error ? error.message : 'Falha na busca.');
    } finally {
      setDiscoveryBusy(false);
    }
  }

  function chooseCandidate(candidate: DiscoveryCandidate) {
    setSelected(candidate);
    setNewName(searchName.trim());
    setNewRegion(searchRegion.trim());
    setNewAddress(candidate.displayName.slice(0, 240));
    setWazeShareUrl('');
  }

  async function createDraft() {
    if (!selected || discoveryBusy) return;
    setDiscoveryBusy(true);
    setDiscoveryMessage('Salvando como rascunho para revisão…');
    try {
      const response = await fetch('/api/admin/discover-establishments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          region: newRegion,
          address: newAddress,
          type: newType,
          description: newDescription,
          latitude: selected.latitude,
          longitude: selected.longitude,
          wazeUrl: wazeShareUrl,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Não foi possível criar o cadastro.');
      setDiscoveryMessage('Estabelecimento criado como rascunho. Ele ainda não aparece publicamente; revise e publique pelo Master Admin.');
      setCandidates([]);
      setSelected(null);
      setSearchName('');
      setNewDescription('');
      setWazeShareUrl('');
    } catch (error) {
      setDiscoveryMessage(error instanceof Error ? error.message : 'Falha ao cadastrar.');
    } finally {
      setDiscoveryBusy(false);
    }
  }

  async function startGeocoding() {
    if (busy) return;
    setBusy(true);
    setProcessed(0);
    setGeocoded(0);
    setNeedsReview(0);
    setNoMatch(0);
    setResults([]);
    setMessage('Iniciando lote automático e sequencial. O processo pode continuar enquanto esta tela permanecer aberta.');

    let afterId: string | undefined;
    try {
      while (true) {
        const response = await fetch('/api/admin/geocode-establishments', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ afterId }),
        });
        const payload = await response.json().catch(() => ({}));
        if (response.status === 429) {
          const retrySeconds = Number(response.headers.get('Retry-After')) || 3;
          setMessage('Serviço de mapas ocupado. Retomando em ' + retrySeconds + ' segundos…');
          await wait(Math.min(Math.max(retrySeconds, 2), 30) * 1000);
          continue;
        }
        if (!response.ok && (response.status === 502 || response.status === 503) && !String(payload.error || '').includes('RATE_GUARD') && !String(payload.error || '').includes('CACHE')) {
          setMessage('Serviço de mapas temporariamente indisponível. Tentando novamente em 4 segundos…');
          await wait(4_000);
          continue;
        }
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
        <p>Localize cadastros existentes, pesquise novos lugares no DF e Entorno e confira cada ponto no Waze antes de incluir. Novos registros entram como rascunho, nunca publicados automaticamente.</p>
      </section>

      <section className="panel" style={{ display: 'grid', gap: 14, marginBottom: 22 }}>
        <div>
          <span className="eyebrow">Importação direta do Waze</span>
          <h2 style={{ marginTop: 6 }}>Coordenadas dos locais já cadastrados</h2>
          <p>Para cada local sem coordenadas, abra a busca no Waze, escolha o destino correto, use Compartilhar rota e cole aqui o link compartilhado. O sistema importa o parâmetro ll e não sobrescreve coordenadas já existentes.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <strong>{pendingPlaces.length} locais com localização pendente</strong>
          <button className="button ghost" type="button" disabled={pendingLoading} onClick={() => void loadPendingPlaces()}>Atualizar lista</button>
        </div>
        {pendingMessage ? <div className="notice" role="status">{pendingMessage}</div> : null}
        {pendingLoading && pendingPlaces.length === 0 ? <p>Carregando estabelecimentos…</p> : null}
        <div style={{ display: 'grid', gap: 10 }}>
          {pendingPlaces.map((place) => {
            const hasPartialCoordinates = place.latitude !== null || place.longitude !== null;
            const wazeSearch = 'https://waze.com/ul?q=' + encodeURIComponent([place.name, place.address, place.region].filter(Boolean).join(', '));
            return (
              <article key={place.id} className="panel" style={{ display: 'grid', gap: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <strong>{place.name}</strong>
                  <small>{place.region} · {place.publication_status}</small>
                </div>
                <small>{place.address}</small>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a className="button ghost" href={wazeSearch} target="_blank" rel="noopener noreferrer">Buscar no Waze ↗</a>
                  {hasPartialCoordinates ? <small>Coordenada parcial já existe — revisão manual, sem sobrescrita automática.</small> : null}
                </div>
                {!hasPartialCoordinates ? (
                  <>
                    <label style={{ display: 'grid', gap: 6 }}>Cole o link compartilhado do Waze
                      <input
                        value={pendingWazeLinks[place.id] || ''}
                        onChange={(event) => setPendingWazeLinks((current) => ({ ...current, [place.id]: event.target.value }))}
                        placeholder="https://waze.com/ul?ll=..."
                      />
                    </label>
                    <div>
                      <button className="button" type="button" disabled={pendingLoading || !(pendingWazeLinks[place.id] || '').trim()} onClick={() => void importWazeLocation(place)}>
                        Importar coordenadas do Waze
                      </button>
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
          {!pendingLoading && pendingPlaces.length === 0 ? <p>Não há locais pendentes de coordenadas.</p> : null}
        </div>
      </section>

      <section className="panel" style={{ display: 'grid', gap: 16, marginBottom: 22 }}>
        <div>
          <span className="eyebrow">Busca complementar de estabelecimentos</span>
          <h2 style={{ marginTop: 6 }}>Encontrou um lugar que ainda não está no Noite DF?</h2>
          <p>Pesquise pelo nome e região. A busca usa OpenStreetMap para sugerir pontos e oferece um link direto para conferir o destino no Waze.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>Nome do local
            <input value={searchName} onChange={(event) => setSearchName(event.target.value)} placeholder="Ex.: Bar do Zé" maxLength={100} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>Região / cidade
            <input value={searchRegion} onChange={(event) => setSearchRegion(event.target.value)} placeholder="Ex.: Sobradinho, DF" maxLength={100} />
          </label>
        </div>
        <button className="button" type="button" disabled={discoveryBusy || searchName.trim().length < 3} onClick={() => void searchMissingEstablishments()}>
          {discoveryBusy ? 'Aguarde…' : 'Pesquisar locais'}
        </button>
        {discoveryMessage ? <div className="notice" role="status">{discoveryMessage}</div> : null}

        {candidates.length > 0 ? (
          <div style={{ display: 'grid', gap: 10 }}>
            <h3>Resultados para conferir</h3>
            {candidates.map((candidate, index) => (
              <article key={candidate.latitude + '-' + candidate.longitude + '-' + index} className="panel" style={{ display: 'grid', gap: 8, padding: 14 }}>
                <strong>{candidate.displayName}</strong>
                <small>Lat. {candidate.latitude.toFixed(6)} · Long. {candidate.longitude.toFixed(6)} · {candidate.osmType}</small>
                {candidate.duplicateMatches.length > 0 ? (
                  <small style={{ color: '#fbbf24' }}>Possível cadastro existente: {candidate.duplicateMatches.map((item) => item.name + ' (' + item.region + ')').join(', ')}</small>
                ) : null}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a className="button ghost" href={candidate.wazeUrl} target="_blank" rel="noopener noreferrer">Conferir no Waze ↗</a>
                  <button className="button" type="button" onClick={() => chooseCandidate(candidate)}>Selecionar este ponto</button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {selected ? (
          <div className="panel" style={{ display: 'grid', gap: 12, padding: 16 }}>
            <h3>Novo cadastro — revisão obrigatória</h3>
            <p>O ponto selecionado será salvo como rascunho. Confira os dados e, se quiser, cole o link compartilhado do Waze. Se esse link tiver coordenadas (parâmetro ll), elas serão priorizadas.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>Nome
                <input value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={120} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>Região
                <input value={newRegion} onChange={(event) => setNewRegion(event.target.value)} maxLength={100} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>Categoria
                <select value={newType} onChange={(event) => setNewType(event.target.value)}>{TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select>
              </label>
            </div>
            <label style={{ display: 'grid', gap: 6 }}>Endereço conferido
              <input value={newAddress} onChange={(event) => setNewAddress(event.target.value)} maxLength={240} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Descrição (opcional)
              <textarea value={newDescription} onChange={(event) => setNewDescription(event.target.value)} maxLength={500} rows={3} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>Link compartilhado do Waze (opcional)
              <input value={wazeShareUrl} onChange={(event) => setWazeShareUrl(event.target.value)} placeholder="https://waze.com/ul?ll=..." />
            </label>
            <small>Coordenadas selecionadas: {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}</small>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a className="button ghost" href={selected.wazeUrl} target="_blank" rel="noopener noreferrer">Abrir ponto no Waze ↗</a>
              <button className="button" type="button" disabled={discoveryBusy || !newName.trim() || !newRegion.trim() || !newAddress.trim()} onClick={() => void createDraft()}>
                {discoveryBusy ? 'Salvando…' : 'Adicionar como rascunho'}
              </button>
              <button className="button ghost" type="button" disabled={discoveryBusy} onClick={() => setSelected(null)}>Cancelar</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel" style={{ display: 'grid', gap: 16 }}>
        <div>
          <span className="eyebrow">Base já cadastrada</span>
          <h2 style={{ marginTop: 6 }}>Geolocalizar os estabelecimentos existentes</h2>
          <p>Consulta controlada no OpenStreetMap/Nominatim, uma por vez, com intervalo global. Correspondências incertas ficam para revisão manual.</p>
        </div>
        <div className="metrics-grid">
          <article><span>Processados</span><strong>{processed}</strong></article>
          <article><span>Coordenadas gravadas</span><strong>{geocoded}</strong></article>
          <article><span>Revisão manual</span><strong>{needsReview}</strong></article>
          <article><span>Sem correspondência</span><strong>{noMatch}</strong></article>
        </div>
        <button className="button" type="button" disabled={busy} onClick={() => void startGeocoding()}>
          {busy ? 'Geocodificando em sequência…' : processed > 0 ? 'Reiniciar verificação' : 'Iniciar geocodificação'}
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
