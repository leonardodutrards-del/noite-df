'use client';

/* Internal hash navigation is intentionally rendered as anchors on this single-page experience. */
/* eslint-disable @next/next/no-html-link-for-pages */

import { useMemo, useState } from 'react';
import type { Establishment } from '@/modules/establishments/types';
import { events } from '@/data/events';
import { PlaceCard } from '@/components/PlaceCard';
import { EventCard } from '@/components/EventCard';
import { recommendPlaces } from '@/lib/recommend';
import { hasConfirmedRating, isConfirmedEvent } from '@/lib/data-quality';
import { track } from '@/lib/analytics';
import { matchesRadar, radarOptions, type RadarFilter } from '@/lib/radar';
import { getTodayEvents } from '@/lib/today-agenda';
import {
  getRegionOptionsWithCounts,
  type RegionScope,
} from '@/lib/regions';
import {
  intentOptions,
  matchesNightIntent,
  normalizeIntentText,
  type NightIntent,
} from '@/lib/night-intents';

export function ExperienceHub({ initialPlaces }: { initialPlaces: Establishment[] }) {
  const places = initialPlaces;
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('todos');
  const [vibe, setVibe] = useState('todas');
  const [priceFilter, setPriceFilter] = useState('todas');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [musicFilter, setMusicFilter] = useState('todas');
  const [intentFilter, setIntentFilter] = useState<NightIntent | null>(null);
  const [radarFilter, setRadarFilter] = useState<RadarFilter | null>(null);

  const regionOptions = useMemo(
    () => getRegionOptionsWithCounts(places),
    [places]
  );

  const groupedRegions = useMemo(() => {
    const groups: Record<RegionScope, typeof regionOptions> = { df: [], entorno: [] };
    for (const option of regionOptions) groups[option.scope].push(option);
    return groups;
  }, [regionOptions]);

  const regionBasePlaces = useMemo(
    () => region === 'todos' ? places : places.filter((place) => place.region === region),
    [places, region]
  );

  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const place of regionBasePlaces) {
      counts.set(place.type, (counts.get(place.type) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(([left], [right]) => left.localeCompare(right, 'pt-BR'));
  }, [regionBasePlaces]);

  const musicOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const place of regionBasePlaces) {
      for (const music of place.music) counts.set(music, (counts.get(music) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(([left], [right]) => left.localeCompare(right, 'pt-BR'));
  }, [regionBasePlaces]);

  const vibes = useMemo(
    () => ['todas', ...Array.from(new Set(regionBasePlaces.flatMap((place) => place.vibe))).sort((a, b) => a.localeCompare(b, 'pt-BR'))],
    [regionBasePlaces]
  );

  const todayEventPlaces = useMemo(
    () => new Set(getTodayEvents(events).map((event) => normalizeIntentText(event.place))),
    []
  );

  const filteredPlaces = useMemo(
    () => recommendPlaces(query, region, vibe, places, priceFilter)
      .filter((place) => typeFilter === 'todos' || place.type === typeFilter)
      .filter((place) => musicFilter === 'todas' || place.music.some(
        (music) => normalizeIntentText(music) === normalizeIntentText(musicFilter)
      ))
      .filter((place) => !radarFilter || matchesRadar(place, radarFilter))
      .filter((place) => !intentFilter || matchesNightIntent(place, intentFilter, todayEventPlaces)),
    [query, region, vibe, places, priceFilter, typeFilter, musicFilter, radarFilter, intentFilter, todayEventPlaces]
  );

  const selectedRadar = radarOptions.find((option) => option.id === radarFilter);
  const selectedIntent = intentOptions.find((option) => option.id === intentFilter);
  const hasFilters = Boolean(
    query ||
    region !== 'todos' ||
    vibe !== 'todas' ||
    radarFilter ||
    priceFilter !== 'todas' ||
    typeFilter !== 'todos' ||
    musicFilter !== 'todas' ||
    intentFilter
  );

  const clearFilters = () => {
    setQuery('');
    setRegion('todos');
    setVibe('todas');
    setPriceFilter('todas');
    setTypeFilter('todos');
    setMusicFilter('todas');
    setIntentFilter(null);
    setRadarFilter(null);
  };

  const rankings = useMemo(() => {
    return places
      .filter((place) => hasConfirmedRating(place) && typeof place.rating === 'number' && place.rating > 0)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, [places]);

  const confirmedEvents = useMemo(() => {
    return events.filter((event) => isConfirmedEvent(event));
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 2) {
      track('search', { query: val, region, vibe });
    }
  };

  return (
    <main className="container">
      <header className="topbar">
        <a className="brand" href="/">Noite DF</a>
        <nav>
          <a href="#radar">Radar</a>
          <a href="#lugares">Lugares</a>
          <a href="#ranking">Ranking</a>
          <a href="#agenda">Agenda</a>
          <a href="/hoje">Hoje</a>
          <a href="/agenda-semanal">Agenda semanal</a>
          <a href="/fim-de-semana">Fim de semana</a>
          <a href="/planos">Para estabelecimentos</a>
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Área do Parceiro</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="badge">Brasília além do roteiro óbvio</span>
          <h1>Onde vale a pena ir hoje no DF?</h1>
          <p>Encontre bares, restaurantes e eventos no DF e Entorno. Escolha sua região e o estilo da sua noite.</p>

          <div className="searchbar searchbar-primary">
            <input
              id="busca"
              name="busca"
              aria-label="Busca"
              placeholder="Bar, música, evento ou cidade..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
            />
            <select
              id="regiao"
              name="regiao"
              aria-label="Região"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setTypeFilter('todos');
                setMusicFilter('todas');
                setVibe('todas');
                track('search', { query, region: e.target.value, vibe });
              }}
            >
              <option value="todos">Todas as regiões ({places.length})</option>
              <optgroup label="Distrito Federal">
                {groupedRegions.df.map((item) => (
                  <option key={item.name} value={item.name}>{item.name} ({item.count})</option>
                ))}
              </optgroup>
              <optgroup label="Entorno">
                {groupedRegions.entorno.map((item) => (
                  <option key={item.name} value={item.name}>{item.name} ({item.count})</option>
                ))}
              </optgroup>
            </select>
          </div>

          <details className="filter-panel">
            <summary>
              Mais filtros
              <span>{[typeFilter !== 'todos', musicFilter !== 'todas', vibe !== 'todas', priceFilter !== 'todas'].filter(Boolean).length || ''}</span>
            </summary>
            <div className="filter-grid">
              <label>
                Tipo de lugar
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="todos">Todos os tipos</option>
                  {typeOptions.map(([type, count]) => <option key={type} value={type}>{type} ({count})</option>)}
                </select>
              </label>
              <label>
                Música
                <select value={musicFilter} onChange={(e) => setMusicFilter(e.target.value)}>
                  <option value="todas">Todos os estilos musicais</option>
                  {musicOptions.map(([music, count]) => <option key={music} value={music}>{music} ({count})</option>)}
                </select>
              </label>
              <label>
                Vibe
                <select value={vibe} onChange={(e) => {
                  setVibe(e.target.value);
                  track('search', { query, region, vibe: e.target.value });
                }}>
                  {vibes.map((item) => <option key={item} value={item}>{item === 'todas' ? 'Todas as vibes' : item}</option>)}
                </select>
              </label>
              <label>
                Faixa de preço
                <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                  <option value="todas">Todas as faixas</option>
                  <option value="$">$ · econômico</option>
                  <option value="$$">$$ · intermediário</option>
                  <option value="$$$">$$$ · mais elaborado</option>
                  <option value="$$$$">$$$$ · experiência premium</option>
                </select>
              </label>
            </div>
          </details>

          <div className="hero-actions">
            <a className="button" href="#lugares">Explorar agora</a>
            <a className="button ghost" href="/fim-de-semana">Indicações do fim de semana</a>
            <a className="button ghost" href="/planos">Cadastrar meu local</a>
          </div>
        </div>

        <aside className="panel decision-card">
          <span className="eyebrow">O que você quer hoje?</span>
          <h2>Escolha o tipo de rolê</h2>
          <div className="intent-grid">
            {intentOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={intentFilter === option.id}
                onClick={() => {
                  const next = intentFilter === option.id ? null : option.id;
                  setIntentFilter(next);
                  track('search', { query, region, intent: next ?? 'todos' });
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="recommendation">
            {selectedIntent
              ? selectedIntent.description
              : 'Escolha uma intenção e combine com região, música, tipo e preço para refinar os resultados.'}
          </p>
          {intentFilter ? (
            <button className="button ghost" type="button" onClick={() => setIntentFilter(null)}>
              Limpar intenção
            </button>
          ) : null}
        </aside>
      </section>

      <section id="radar">
        <div className="section-title">
          <div>
            <span className="eyebrow">Radar da cidade</span>
            <h2>Escolha a energia da sua noite</h2>
          </div>
        </div>
        <div className="chip-grid">
          {radarOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={radarFilter === option.id}
              aria-controls="lugares"
              onClick={() => {
                const next = radarFilter === option.id ? null : option.id;
                setRadarFilter(next);
                track('search', { query, region, vibe, radar: next ?? 'todos' });
                document.getElementById('lugares')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section id="lugares">
        <div className="section-title">
          <div>
            <span className="eyebrow">Guia inteligente</span>
            <h2>Lugares para você</h2>
            <p role="status" aria-live="polite">
              {filteredPlaces.length} {filteredPlaces.length === 1 ? 'opção encontrada' : 'opções encontradas'} · fonte e última atualização em cada perfil.
            </p>

            {hasFilters ? (
              <div className="active-filter-row">
                {region !== 'todos' ? <span className="tag">📍 {region}</span> : null}
                {typeFilter !== 'todos' ? <span className="tag">{typeFilter}</span> : null}
                {musicFilter !== 'todas' ? <span className="tag">🎵 {musicFilter}</span> : null}
                {vibe !== 'todas' ? <span className="tag">{vibe}</span> : null}
                {priceFilter !== 'todas' ? <span className="tag">{priceFilter}</span> : null}
                {selectedIntent ? <span className="tag">{selectedIntent.label}</span> : null}
                {selectedRadar ? <span className="tag">{selectedRadar.label}</span> : null}
                <button className="button ghost" type="button" onClick={clearFilters}>Limpar filtros</button>
              </div>
            ) : null}

            {selectedRadar ? (
              <p className="radar-selection">
                {selectedRadar.label}: {selectedRadar.description}
                <button type="button" onClick={() => setRadarFilter(null)}>Limpar filtro</button>
              </p>
            ) : null}
          </div>
        </div>

        {filteredPlaces.length ? (
          <div className="grid">
            {filteredPlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>Nenhum resultado com esses filtros</h3>
            <p>Remova um filtro, escolha outra região ou experimente outra intenção de rolê.</p>
            <button className="button ghost" type="button" onClick={clearFilters}>Mostrar todos os locais</button>
          </div>
        )}
      </section>

      <section id="ranking" className="soft-section">
        <div className="section-title">
          <div>
            <span className="eyebrow">Índice Noite DF</span>
            <h2>Ranking da comunidade</h2>
            <p>Classificação calculada exclusivamente com base em avaliações numéricas públicas e confirmadas.</p>
          </div>
        </div>
        {rankings.length > 0 ? (
          <div className="ranking-list">
            {rankings.map((place, index) => (
              <article key={place.id}>
                <strong>#{index + 1}</strong>
                <div>
                  <a href={`/lugar/${place.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3>{place.name}</h3>
                  </a>
                  <p>{place.region} · {place.type}</p>
                </div>
                <span>{place.rating?.toFixed(1)} ★</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="notice">
            <p>Ranking aguardando avaliações verificadas suficientes.</p>
          </div>
        )}
      </section>

      <section id="agenda">
        <div className="section-title">
          <div>
            <span className="eyebrow">Agenda inteligente</span>
            <h2>Próximos eventos confirmados</h2>
            <p><a href="/fim-de-semana">Ver indicações do fim de semana →</a></p>
            <p><a href="/agenda-semanal">Ver agenda semanal para compartilhar →</a></p>
            <p><a href="/hoje">Ver eventos de hoje →</a></p>
            <p>Apenas eventos verificados e confirmados com fontes oficiais.</p>
          </div>
        </div>
        {confirmedEvents.length > 0 ? (
          <div className="grid">
            {confirmedEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>Nenhum próximo evento confirmado.</h3>
            <p>Os eventos são exibidos apenas quando checados e validados com fontes oficiais.</p>
          </div>
        )}
      </section>

      <section className="two-columns">
        <div className="panel">
          <span className="eyebrow">Guias por região & estilo</span>
          <h2>Explore por região</h2>
          <div className="region-link-grid">
            {regionOptions.map((item) => (
              <a
                className="tag"
                key={item.name}
                href={item.slug === 'sobradinho' ? '/sobradinho' : `/lugares/${item.slug}`}
              >
                {item.name} <strong>{item.count}</strong>
              </a>
            ))}
          </div>
          <h3 style={{ marginTop: 20, fontSize: '1rem' }}>Roteiros e vibes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <a className="tag" href="/bares/aguas-claras">Bares em Águas Claras</a>
            <a className="tag" href="/bares/sobradinho">Bares em Sobradinho</a>
            <a className="tag" href="/pagode/brasilia">Pagode em Brasília</a>
            <a className="tag" href="/sertanejo/brasilia">Sertanejo em Brasília</a>
            <a className="tag" href="/happy-hour/asa-sul">Happy Hour na Asa Sul</a>
            <a className="tag" href="/date/brasilia">Date em Brasília</a>
            <a className="tag" href="/lugares-abertos-agora">Lugares abertos agora</a>
          </div>
        </div>
        <div className="panel">
          <span className="eyebrow">Turismo inteligente</span>
          <h2>Monte seu roteiro</h2>
          <p>Use intenção, região, música, tipo e preço para encontrar lugares que combinam com sua saída.</p>
          <ol>
            <li>Escolha o que você quer fazer hoje.</li>
            <li>Refine por região e estilo.</li>
            <li>Abra a ficha, confira a fonte e trace a rota.</li>
          </ol>
        </div>
      </section>

      <section className="cta">
        <div>
          <span className="eyebrow">Para parceiros</span>
          <h2>Transforme atualizações em clientes</h2>
          <p>Publique agenda, promoções e acompanhe visualizações, rotas, WhatsApp e Instagram.</p>
        </div>
        <a className="button light" href="/planos">Conhecer planos</a>
      </section>

      <footer className="footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <div>Noite DF · descubra lugares e programação com fontes verificáveis.</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <a href="/privacidade" style={{ color: 'var(--muted)', fontSize: 13 }}>Privacidade</a>
            <a href="/termos" style={{ color: 'var(--muted)', fontSize: 13 }}>Termos</a>
            <a href="/planos" style={{ color: 'var(--muted)', fontSize: 13 }}>Planos</a>
            <a href="/parceiro" style={{ color: 'var(--muted)', fontSize: 13 }}>Área do Parceiro</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
