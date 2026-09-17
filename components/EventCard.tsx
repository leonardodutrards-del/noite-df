import { EventItem } from '@/data/events';
import { hasRealValue } from '@/lib/data-quality';

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="card event">
      {hasRealValue(event.dateLabel) && <div className="event-date">{event.dateLabel}</div>}
      <div>
        <h3>{event.title}</h3>
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
