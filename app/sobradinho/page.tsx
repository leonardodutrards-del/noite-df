import type { Metadata } from 'next';
import Link from 'next/link';
import { PlaceCard } from '@/components/PlaceCard';
import { EventCard } from '@/components/EventCard';
import { events } from '@/data/events';
import { getTodayEvents } from '@/lib/today-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';
import { establishmentService } from '@/modules/establishments/service';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sobradinho hoje — bares, restaurantes e agenda | Noite DF',
  description: 'Descubra onde sair em Sobradinho: bares, restaurantes, pubs, casas de show e programação confirmada na região.',
  alternates: { canonical: `${appUrl}/sobradinho` },
  openGraph: {
    title: 'Sobradinho no Noite DF',
    description: 'Lugares e programação confirmada para sair em Sobradinho.',
    url: `${appUrl}/sobradinho`,
    type: 'website',
    siteName: 'Noite DF',
  },
};

export default async function SobradinhoHubPage() {
  const now = new Date();
  const allPlaces = await establishmentService.search({});
  const localPlaces = allPlaces
    .filter((place) => place.region === 'Sobradinho' && place.publicationStatus !== 'suspended')
    .sort((left, right) => {
      if (left.ownerManaged !== right.ownerManaged) return left.ownerManaged ? -1 : 1;
      return left.name.localeCompare(right.name, 'pt-BR');
    });

  const todayEvents = getTodayEvents(events, now).filter((event) => event.region === 'Sobradinho');
  const weeklyEvents = getWeeklyAgenda(events, now)
    .filter((event) => event.region === 'Sobradinho')
    .filter((event) => !todayEvents.some((today) => today.id === event.id));

  const featuredPlaces = localPlaces.slice(0, 9);
  const managedCount = localPlaces.filter((place) => place.ownerManaged).length;

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="#hoje">Hoje</Link>
          <Link href="#lugares">Lugares</Link>
          <Link href="/lugares/sobradinho">Ver todos</Link>
          <Link href="/parceiros/sobradinho">Para estabelecimentos</Link>
        </nav>
      </header>

      <section className="hero" style={{ alignItems: 'center', marginTop: 24 }}>
        <div>
          <span className="badge">Sobradinho · guia local</span>
          <h1>O que fazer em Sobradinho hoje?</h1>
          <p style={{ fontSize: 18 }}>
            Bares, restaurantes, pubs e programação confirmada em um só lugar. Abra o perfil,
            confira rota, WhatsApp, Instagram e agenda antes de sair.
          </p>
          <div className="hero-actions">
            <a className="button" href="#lugares">Explorar Sobradinho</a>
            <Link className="button ghost" href="/agenda-semanal">Agenda semanal</Link>
            <Link className="button ghost" href="/fim-de-semana">Fim de semana</Link>
          </div>
        </div>

        <aside className="panel">
          <span className="eyebrow">Sobradinho no Noite DF</span>
          <div className="metrics-grid" style={{ marginTop: 16 }}>
            <article>
              <span>Lugares publicados</span>
              <strong>{localPlaces.length}</strong>
            </article>
            <article>
              <span>Eventos hoje</span>
              <strong>{todayEvents.length}</strong>
            </article>
            <article>
              <span>Agenda da semana</span>
              <strong>{weeklyEvents.length + todayEvents.length}</strong>
            </article>
            <article>
              <span>Gerenciados pelo local</span>
              <strong>{managedCount}</strong>
            </article>
          </div>
        </aside>
      </section>

      <section id="hoje" style={{ marginTop: 40 }}>
        <div className="section-title">
          <div>
            <span className="eyebrow">Agenda local</span>
            <h2>Hoje em Sobradinho</h2>
            <p>Exibimos apenas eventos ainda válidos e com fonte oficial cadastrada.</p>
          </div>
        </div>

        {todayEvents.length ? (
          <div className="grid">
            {todayEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="notice">
            <strong>Nenhum evento confirmado para hoje neste momento.</strong>
            <p style={{ marginBottom: 0 }}>
              A agenda é atualizada conforme as casas divulgam programação verificável. Os lugares da região continuam disponíveis abaixo.
            </p>
          </div>
        )}
      </section>

      {weeklyEvents.length ? (
        <section style={{ marginTop: 36 }}>
          <div className="section-title">
            <div>
              <span className="eyebrow">Próximos dias</span>
              <h2>Agenda confirmada em Sobradinho</h2>
            </div>
          </div>
          <div className="grid">
            {weeklyEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      ) : null}

      <section id="lugares" style={{ marginTop: 40 }}>
        <div className="section-title">
          <div>
            <span className="eyebrow">Guia de Sobradinho</span>
            <h2>Lugares para conhecer</h2>
            <p>{localPlaces.length} estabelecimentos publicados na região.</p>
          </div>
          <Link className="button ghost" href="/lugares/sobradinho">Ver todos os lugares</Link>
        </div>

        {featuredPlaces.length ? (
          <div className="grid">
            {featuredPlaces.map((place) => <PlaceCard key={place.id} place={place} />)}
          </div>
        ) : (
          <div className="empty">
            <h3>Nenhum estabelecimento disponível.</h3>
            <p>A curadoria da região está em atualização.</p>
          </div>
        )}
      </section>

      <section className="two-columns" style={{ marginTop: 40 }}>
        <div className="panel">
          <span className="eyebrow">Escolha pela vibe</span>
          <h2>Atalhos locais</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <Link className="tag" href="/bares/sobradinho">Bares e pubs</Link>
            <Link className="tag" href="/lugares/sobradinho">Todos os lugares</Link>
            <Link className="tag" href="/fim-de-semana">Fim de semana</Link>
            <Link className="tag" href="/agenda-semanal">Agenda semanal</Link>
          </div>
        </div>

        <div className="panel">
          <span className="eyebrow">Você é dono de estabelecimento?</span>
          <h2>Atualize sua própria presença</h2>
          <p>
            Parceiros podem gerenciar agenda, promoções e informações do local e acompanhar visualizações,
            rotas, WhatsApp e Instagram.
          </p>
          <Link className="button" href="/parceiros/sobradinho">Conhecer a proposta para Sobradinho</Link>
        </div>
      </section>

      <footer className="footer">
        <Link href="/">← Voltar ao Noite DF</Link>
      </footer>
    </main>
  );
}
