'use client';

/* Internal hash navigation is intentionally rendered as anchors on this single-page experience. */
/* eslint-disable @next/next/no-html-link-for-pages */

import { useMemo, useState } from 'react';
import { places } from '@/data/places';
import { events } from '@/data/events';
import { PlaceCard } from '@/components/PlaceCard';
import { EventCard } from '@/components/EventCard';
import { recommendPlaces } from '@/lib/recommend';
import { hasConfirmedRating, isConfirmedEvent } from '@/lib/data-quality';
import { track } from '@/lib/analytics';
import { matchesRadar, radarOptions, type RadarFilter } from '@/lib/radar';


export function ExperienceHub() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('todos');
  const [vibe, setVibe] = useState('todas');
  const [budget, setBudget] = useState('Até R$ 120');
  const [duration, setDuration] = useState('1 noite');
  const [radarFilter, setRadarFilter] = useState<RadarFilter | null>(null);

  const regions = useMemo(() => ['todos', ...Array.from(new Set(places.map((place) => place.region))).sort((a, b) => a.localeCompare(b, 'pt-BR'))], []);
  const vibes = useMemo(() => ['todas', ...Array.from(new Set(places.flatMap((place) => place.vibe))).sort((a, b) => a.localeCompare(b, 'pt-BR'))], []);
  const filteredPlaces = useMemo(() => recommendPlaces(query, region, vibe).filter(place => !radarFilter || matchesRadar(place, radarFilter)), [query, region, vibe, radarFilter]);
  const selectedRadar = radarOptions.find(option => option.id === radarFilter);

  // Ranking strictly requires a confirmed numerical rating
  const rankings = useMemo(() => {
    return places
      .filter((place) => hasConfirmedRating(place) && typeof place.rating === 'number' && place.rating > 0)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }, []);

  // Agenda strictly requires confirmed, unexpired events
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
          <a href="/fim-de-semana">Fim de semana</a>
          <a href="/planos">Para estabelecimentos</a>
          <a href="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Área do Parceiro</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span className="badge">Brasília além do roteiro óbvio</span>
          <h1>Onde vale a pena ir hoje no DF?</h1>
          <p>Descubra experiências locais por vibe, região, orçamento e programação confirmada.</p>
          <div className="searchbar">
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
                track('search', { query, region: e.target.value, vibe });
              }}
            >
              {regions.map((i) => <option key={i}>{i}</option>)}
            </select>
            <select
              id="vibe"
              name="vibe"
              aria-label="Vibe"
              value={vibe}
              onChange={(e) => {
                setVibe(e.target.value);
                track('search', { query, region, vibe: e.target.value });
              }}
            >
              {vibes.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="hero-actions">
            <a className="button" href="#lugares">Explorar agora</a>
            <a className="button ghost" href="/fim-de-semana">Indicações do fim de semana</a>
            <a className="button ghost" href="/planos">Cadastrar meu local</a>
          </div>
        </div>
        <aside className="panel decision-card">
          <span className="eyebrow">Seu perfil de hoje</span>
          <h2>Recomendação rápida</h2>
          <label>
            Quanto pretende gastar?
            <select id="orcamento" name="orcamento" value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option>Até R$ 60</option>
              <option>Até R$ 120</option>
              <option>Até R$ 250</option>
              <option>Sem limite definido</option>
            </select>
          </label>
          <label>
            Quanto tempo ficará?
            <select id="duracao" name="duracao" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option>1 noite</option>
              <option>2 dias</option>
              <option>3 dias</option>
              <option>1 semana</option>
            </select>
          </label>
          <p className="recommendation">
            Sugestão: {vibe === 'todas' ? 'comece pelo Radar da Cidade' : `priorize ${vibe}`} em {region === 'todos' ? 'todo o DF' : region}, com orçamento {budget.toLowerCase()} durante {duration}.
          </p>
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
            <p>{filteredPlaces.length} opções encontradas · fonte e última atualização visíveis em cada perfil.</p>
            {selectedRadar && <p className="radar-selection">{selectedRadar.label}: {selectedRadar.description} <button type="button" onClick={() => setRadarFilter(null)}>Limpar filtro</button></p>}
          </div>
        </div>
        {filteredPlaces.length ? (
          <div className="grid">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Nenhum resultado com esses filtros</h3>
            <p>Remova um filtro ou escolha outra região.</p>
            {radarFilter && <button className="button ghost" type="button" onClick={() => setRadarFilter(null)}>Mostrar todos os perfis</button>}
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
            <h2>O que acontece nesta semana</h2>
            <p><a href="/fim-de-semana">Ver indicações do fim de semana →</a></p>
            <p>Apenas eventos verificados e confirmados com fontes oficiais.</p>
          </div>
        </div>
        {confirmedEvents.length > 0 ? (
          <div className="grid">
            {confirmedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Nenhum evento confirmado para hoje.</h3>
            <p>Os eventos são exibidos apenas quando checados e validados com fontes oficiais.</p>
          </div>
        )}
      </section>

      <section className="two-columns">
        <div className="panel">
          <span className="eyebrow">Guias por Região & Estilo</span>
          <h2>Explore por região</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
            <a className="tag" href="/lugares/asa-norte">Asa Norte</a>
            <a className="tag" href="/lugares/asa-sul">Asa Sul</a>
            <a className="tag" href="/lugares/aguas-claras">Águas Claras</a>
            <a className="tag" href="/lugares/sobradinho">Sobradinho</a>
            <a className="tag" href="/lugares/taguatinga">Taguatinga</a>
            <a className="tag" href="/lugares/ceilandia">Ceilândia</a>
            <a className="tag" href="/lugares/gama">Gama</a>
            <a className="tag" href="/lugares/planaltina">Planaltina</a>
            <a className="tag" href="/lugares/guara">Guará</a>
            <a className="tag" href="/lugares/lago-sul">Lago Sul</a>
          </div>
          <h3 style={{ marginTop: '20px', fontSize: '1rem' }}>Roteiros e vibes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
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
          <p>Escolha duração, orçamento e vibe. O sistema organiza uma sequência de lugares e eventos para reduzir tempo de pesquisa.</p>
          <ol>
            <li>Comece com gastronomia local e petiscos.</li>
            <li>Escolha um estabelecimento ou evento compatível com sua vibe.</li>
            <li>Abra a rota no mapa e confirme diretamente com o local.</li>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <div>Noite DF · guia de experiências locais com informação confiável e sem placeholders.</div>
          <div style={{ display: 'flex', gap: '14px' }}>
            <a href="/privacidade" style={{ color: 'var(--muted)', fontSize: '13px' }}>Privacidade</a>
            <a href="/termos" style={{ color: 'var(--muted)', fontSize: '13px' }}>Termos</a>
            <a href="/planos" style={{ color: 'var(--muted)', fontSize: '13px' }}>Planos</a>
            <a href="/parceiro" style={{ color: 'var(--muted)', fontSize: '13px' }}>Área do Parceiro</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
