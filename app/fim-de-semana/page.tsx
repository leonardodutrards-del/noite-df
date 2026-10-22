import Link from 'next/link';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { places } from '@/data/places';
import { EventCard } from '@/components/EventCard';
import { PlaceCard } from '@/components/PlaceCard';
import { getNextConfirmedWeekend, getWeekendDays } from '@/lib/weekend';
import { getWeekendRecommendations } from '@/lib/weekend-recommendations';

export const dynamic = 'force-dynamic';

export default async function WeekendPage() {
  const events = await getPublicAgenda();
  const selection = getNextConfirmedWeekend(events);
  const weekendEvents = selection.events;
  const recommendations = getWeekendRecommendations(places, weekendEvents);
  const days = getWeekendDays(new Date(), selection.start);
  const nextSelection = getNextConfirmedWeekend(events, new Date(), 6, true);
  const nextDays = getWeekendDays(new Date(), nextSelection.start);

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/">Início</Link><Link href="/#radar">Radar</Link><Link href="/#agenda">Agenda completa</Link></nav>
      </header>
      <section className="page-heading">
        <span className="eyebrow">Indicações do fim de semana</span>
        <h1>Seu próximo fim de semana no DF</h1>
        <p>{selection.label} · Eventos com data e fonte oficial. Consulte ingressos, horário e condições no canal do organizador.</p>
        {selection.shifted ? <p>Como a janela mais próxima está sem programação confirmada, mostramos o próximo fim de semana com evento oficial já validado.</p> : null}
      </section>
      <section aria-labelledby="weekend-events">
        <div className="section-title"><div><h2 id="weekend-events">Programação confirmada</h2><p>{weekendEvents.length} eventos nesta seleção.</p></div></div>
        {weekendEvents.length ? (
          <div style={{ display: 'grid', gap: 36 }}>
            {days.map((day) => {
              const dayEvents = weekendEvents.filter((event) => event.startsAt?.slice(0, 10) === day.key);
              return (
                <section key={day.key} aria-labelledby={`weekend-${day.key}`}>
                  <div className="section-title">
                    <div>
                      <h3 id={`weekend-${day.key}`}>{day.title}</h3>
                      <p>{dayEvents.length} {dayEvents.length === 1 ? 'evento confirmado' : 'eventos confirmados'}.</p>
                    </div>
                  </div>
                  {dayEvents.length ? (
                    <div className="grid">{dayEvents.map(event => <EventCard key={event.id} event={event} />)}</div>
                  ) : (
                    <div className="empty"><p>Aguardando novas confirmações oficiais para este dia.</p></div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="empty"><h3>Sem evento confirmado para este fim de semana</h3><p>Novas datas entram após conferência da publicação oficial. Confira também os canais dos locais abaixo.</p></div>
        )}
      </section>
      {nextSelection.events.length > 0 && nextSelection.start !== selection.start ? (
        <section aria-labelledby="next-confirmed-weekend" style={{ marginTop: 40 }}>
          <div className="section-title">
            <div>
              <h2 id="next-confirmed-weekend">Próximo fim de semana já confirmado</h2>
              <p>{nextSelection.label} · programação oficial já validada.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 36 }}>
            {nextDays.map((day) => {
              const dayEvents = nextSelection.events.filter((event) => event.startsAt?.slice(0, 10) === day.key);
              if (!dayEvents.length) return null;
              return (
                <section key={day.key} aria-labelledby={`next-weekend-${day.key}`}>
                  <div className="section-title">
                    <div>
                      <h3 id={`next-weekend-${day.key}`}>{day.title}</h3>
                      <p>{dayEvents.length} {dayEvents.length === 1 ? 'evento confirmado' : 'eventos confirmados'}.</p>
                    </div>
                  </div>
                  <div className="grid">{dayEvents.map(event => <EventCard key={event.id} event={event} />)}</div>
                </section>
              );
            })}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="weekend-places">
        <div className="section-title"><div><h2 id="weekend-places">Onde ir neste fim de semana</h2><p>Locais com eventos confirmados para estas datas, ordenados pela quantidade de eventos; quando há avaliações numéricas verificadas, elas ajudam a desempatar. Não há indicações pagas nesta seleção. Confira disponibilidade e ingressos com cada casa.</p></div></div>
        {recommendations.length ? (
          <div className="grid">{recommendations.map(place => <PlaceCard key={place.id} place={place} />)}</div>
        ) : (
          <div className="empty"><h3>Aguardando indicações confirmadas</h3><p>Os locais aparecem aqui quando a programação do fim de semana é publicada em fonte oficial.</p></div>
        )}
      </section>
      <p style={{ margin: '32px 0', display: 'flex', gap: '20px', flexWrap: 'wrap' }}><Link href="/#agenda">Ver agenda completa →</Link><Link href="/historico">Consultar histórico de eventos →</Link></p>
    </main>
  );
}
