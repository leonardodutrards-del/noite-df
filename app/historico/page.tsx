import Link from 'next/link';
import { events } from '@/data/events';
import { getPastOfficialEvents } from '@/lib/event-history';

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const pastEvents = getPastOfficialEvents(events);

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/">Início</Link><Link href="/fim-de-semana">Fim de semana</Link></nav>
      </header>
      <section className="page-heading">
        <span className="eyebrow">Arquivo de programação</span>
        <h1>Histórico de eventos</h1>
        <p>Eventos encerrados com publicação oficial e data verificada. Este arquivo não informa a programação atual.</p>
      </section>
      <section aria-label="Eventos anteriores">
        {pastEvents.length ? (
          <div className="grid">{pastEvents.map(event => (
            <article className="card event" key={event.id}>
              <div className="event-date">{event.dateLabel}</div>
              <h2>{event.title}</h2>
              <p>{event.place} · {event.region}</p>
              <p>{event.description}</p>
              <small>Fonte verificada em {event.source?.verifiedAt}: <a href={event.source?.url} target="_blank" rel="noreferrer">ver publicação original ↗</a></small>
            </article>
          ))}</div>
        ) : (
          <div className="empty"><h2>Nenhum evento encerrado no arquivo</h2><p>Os eventos com fonte oficial aparecerão aqui após o encerramento.</p></div>
        )}
      </section>
      <p style={{ margin: '32px 0' }}><Link href="/#agenda">Ver a agenda atual →</Link></p>
    </main>
  );
}
