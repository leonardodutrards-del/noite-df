import Link from 'next/link';
import { events } from '@/data/events';
import { places } from '@/data/places';
import { EventCard } from '@/components/EventCard';
import { PlaceCard } from '@/components/PlaceCard';
import { getWeekendEvents, getWeekendWindow } from '@/lib/weekend';
import { getWeekendRecommendations } from '@/lib/weekend-recommendations';

export const dynamic = 'force-dynamic';

export default function WeekendPage() {
  const window = getWeekendWindow();
  const weekendEvents = getWeekendEvents(events);
  const recommendations = getWeekendRecommendations(places, weekendEvents);

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/">Início</Link><Link href="/#radar">Radar</Link><Link href="/#agenda">Agenda completa</Link></nav>
      </header>
      <section className="page-heading">
        <span className="eyebrow">Indicações do fim de semana</span>
        <h1>Seu próximo fim de semana no DF</h1>
        <p>{window.label} · Eventos com data e fonte oficial. Consulte ingressos, horário e condições no canal do organizador.</p>
      </section>
      <section aria-labelledby="weekend-events">
        <div className="section-title"><div><h2 id="weekend-events">Programação confirmada</h2><p>{weekendEvents.length} eventos nesta seleção.</p></div></div>
        {weekendEvents.length ? (
          <div className="grid">{weekendEvents.map(event => <EventCard key={event.id} event={event} />)}</div>
        ) : (
          <div className="empty"><h3>Sem evento confirmado para este fim de semana</h3><p>Novas datas entram após conferência da publicação oficial. Confira também os canais dos locais abaixo.</p></div>
        )}
      </section>
      <section aria-labelledby="weekend-places">
        <div className="section-title"><div><h2 id="weekend-places">Onde ir neste fim de semana</h2><p>Locais com eventos confirmados para estas datas, ordenados pela quantidade de eventos; quando há avaliações numéricas verificadas, elas ajudam a desempatar. Não há indicações pagas nesta seleção. Confira disponibilidade e ingressos com cada casa.</p></div></div>
        {recommendations.length ? (
          <div className="grid">{recommendations.map(place => <PlaceCard key={place.id} place={place} />)}</div>
        ) : (
          <div className="empty"><h3>Aguardando indicações confirmadas</h3><p>Os locais aparecem aqui quando a programação do fim de semana é publicada em fonte oficial.</p></div>
        )}
      </section>
      <p style={{ margin: '32px 0' }}><Link href="/#agenda">Ver agenda completa →</Link></p>
    </main>
  );
}
