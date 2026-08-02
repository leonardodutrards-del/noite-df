'use client';

/* Internal hash navigation is intentionally rendered as anchors on this single-page experience. */
/* eslint-disable @next/next/no-html-link-for-pages */

import { useMemo, useState } from 'react';
import { places } from '@/data/places';
import { events } from '@/data/events';
import { PlaceCard } from '@/components/PlaceCard';
import { EventCard } from '@/components/EventCard';
import { recommendPlaces } from '@/lib/recommend';

const radar = ['🔥 Bombando', '🟢 Tranquilo', '🎤 Shows', '🤠 Sertanejo', '🥁 Pagode', '🍷 Date', '👨‍👩‍👧 Família', '🍻 Happy hour'];

export function ExperienceHub() {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('todos');
  const [vibe, setVibe] = useState('todas');
  const [budget, setBudget] = useState('Até R$ 120');
  const [duration, setDuration] = useState('1 noite');
  const regions = useMemo(() => ['todos', ...Array.from(new Set(places.map((place) => place.region))).sort((a, b) => a.localeCompare(b, 'pt-BR'))], []);
  const vibes = useMemo(() => ['todas', ...Array.from(new Set(places.flatMap((place) => place.vibe))).sort((a, b) => a.localeCompare(b, 'pt-BR'))], []);
  const filteredPlaces = useMemo(() => recommendPlaces(query, region, vibe), [query, region, vibe]);
  const rankings = useMemo(() => [...places].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)), []);

  return <main className="container">
    <header className="topbar"><a className="brand" href="/">Noite DF</a><nav><a href="#radar">Radar</a><a href="#agenda">Agenda</a><a href="#ranking">Ranking</a><a href="/planos">Para estabelecimentos</a></nav></header>

    <section className="hero">
      <div>
        <span className="badge">Brasília além do roteiro óbvio</span>
        <h1>Onde vale a pena ir hoje no DF?</h1>
        <p>Descubra experiências locais por vibe, região, orçamento e programação confirmada.</p>
        <div className="searchbar">
          <input aria-label="Busca" placeholder="Bar, música, evento ou cidade..." value={query} onChange={e=>setQuery(e.target.value)} />
          <select aria-label="Região" value={region} onChange={e=>setRegion(e.target.value)}>{regions.map(i=><option key={i}>{i}</option>)}</select>
          <select aria-label="Vibe" value={vibe} onChange={e=>setVibe(e.target.value)}>{vibes.map(i=><option key={i}>{i}</option>)}</select>
        </div>
        <div className="hero-actions"><a className="button" href="#lugares">Explorar agora</a><a className="button ghost" href="/planos">Cadastrar meu local</a></div>
      </div>
      <aside className="panel decision-card"><span className="eyebrow">Seu perfil de hoje</span><h2>Recomendação rápida</h2><label>Quanto pretende gastar?<select value={budget} onChange={e=>setBudget(e.target.value)}><option>Até R$ 60</option><option>Até R$ 120</option><option>Até R$ 250</option><option>Sem limite definido</option></select></label><label>Quanto tempo ficará?<select value={duration} onChange={e=>setDuration(e.target.value)}><option>1 noite</option><option>2 dias</option><option>3 dias</option><option>1 semana</option></select></label><p className="recommendation">Sugestão: {vibe === 'todas' ? 'comece pelo Radar da Cidade' : `priorize ${vibe}`} em {region === 'todos' ? 'todo o DF' : region}, com orçamento {budget.toLowerCase()} durante {duration}.</p></aside>
    </section>

    <section id="radar"><div className="section-title"><div><span className="eyebrow">Radar da cidade</span><h2>Escolha a energia da sua noite</h2></div></div><div className="chip-grid">{radar.map((item, index)=><button key={item} onClick={()=>setVibe(index===3?'sertanejo':index===6?'família':'todas')}>{item}</button>)}</div></section>

    <section id="lugares"><div className="section-title"><div><span className="eyebrow">Guia inteligente</span><h2>Lugares para você</h2><p>{filteredPlaces.length} opções encontradas · fonte e última atualização visíveis em cada perfil.</p></div></div>{filteredPlaces.length ? <div className="grid">{filteredPlaces.map(place=><PlaceCard key={place.id} place={place}/>)}</div> : <div className="empty"><h3>Nenhum resultado com esses filtros</h3><p>Remova um filtro ou escolha outra região.</p></div>}</section>

    <section id="ranking" className="soft-section"><div className="section-title"><div><span className="eyebrow">Índice Noite DF</span><h2>Ranking da comunidade</h2><p>Nota combina qualidade da experiência, custo-benefício, ambiente, segurança e intenção de voltar.</p></div></div><div className="ranking-list">{rankings.map((place,index)=><article key={place.id}><strong>#{index+1}</strong><div><h3>{place.name}</h3><p>{place.region} · {place.type}</p></div><span>{place.rating?.toFixed(1) ?? 'A confirmar'} ★</span></article>)}</div></section>

    <section id="agenda"><div className="section-title"><div><span className="eyebrow">Agenda inteligente</span><h2>O que acontece nesta semana</h2><p>Shows, piseiro, promoções e eventos agro organizados por local e região.</p></div></div><div className="grid">{events.map(event=><EventCard key={event.id} event={event}/>)}</div></section>

    <section className="two-columns"><div className="panel"><span className="eyebrow">Timeline local</span><h2>Novidades dos lugares</h2><div className="timeline"><p><b>Rancho do Vaqueiro</b> preparou espaço para divulgar a próxima noite de piseiro.</p><p><b>Granja do Torto</b> está no radar para provas de laço, três tambores e shows.</p><p><b>Pança Cheia</b> pode atualizar promoções e agenda semanal pelo painel parceiro.</p></div></div><div className="panel"><span className="eyebrow">Turismo inteligente</span><h2>Monte seu roteiro</h2><p>Escolha duração, orçamento e vibe. O sistema organiza uma sequência de lugares e eventos para reduzir tempo de pesquisa.</p><ol><li>Comece com gastronomia local.</li><li>Escolha um evento compatível com sua vibe.</li><li>Abra a rota e confirme diretamente com o estabelecimento.</li></ol></div></section>

    <section className="cta"><div><span className="eyebrow">Para parceiros</span><h2>Transforme atualizações em clientes</h2><p>Publique agenda, promoções e acompanhe visualizações, rotas, WhatsApp e Instagram.</p></div><a className="button light" href="/planos">Conhecer planos</a></section>
    <footer className="footer">Noite DF · guia de experiências locais com informação confiável.</footer>
  </main>;
}
