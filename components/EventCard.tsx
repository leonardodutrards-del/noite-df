import { EventItem } from '@/data/events';
import { hasRealValue } from '@/lib/data-quality';
import { EventArtwork } from './EventArtwork';
import { eventDateDisplay } from '@/lib/event-date-display';

export function EventCard({ event }: { event: EventItem }) {
  const dateParts = hasRealValue(event.dateLabel) ? eventDateDisplay(event) : null;

  return (
    <article className="card event">
      {dateParts && (
        <div className="event-date">
          <span className="event-date-day">{dateParts.date}</span>
          {dateParts.time ? <span className="event-date-time">{dateParts.time}</span> : null}
          {dateParts.note ? <small className="event-date-note">{dateParts.note}</small> : null}
        </div>
      )}
      <div>
        <h3>{event.title}</h3>
        {event.artwork && <EventArtwork artwork={event.artwork} />}
        {hasRealValue(event.description) && <p>{event.description}</p>}
        <p className="field-hint">{event.admissionNote ?? 'Entrada e couvert: valores não informados. Confirme com a organização.'}</p>
        <div className="tags">
          {hasRealValue(event.place) && <span className="tag">{event.place}</span>}
          {hasRealValue(event.region) && <span className="tag">{event.region}</span>}
          {hasRealValue(event.category) && <span className="tag">{event.category}</span>}
        </div>
        {(event.source?.label || event.source?.verifiedAt) && (
          <div style={{ marginTop: '8px' }}>
            <small style={{ color: 'var(--muted)', fontSize: '11px' }}>
              {event.source.url ? <a href={event.source.url} target="_blank" rel="noreferrer">Conferir programação na fonte ↗</a> : event.source.label ? `Fonte: ${event.source.label}` : ''}
              {event.source.verifiedAt ? ` · Verificado em ${event.source.verifiedAt}` : ''}
            </small>
          </div>
        )}
      </div>
    </article>
  );
}
