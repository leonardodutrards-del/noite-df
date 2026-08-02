import { EventItem } from '@/data/events';

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="card event">
      <div className="event-date">{event.dateLabel}</div>
      <div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div className="tags">
          <span className="tag">{event.place}</span>
          <span className="tag">{event.region}</span>
          <span className="tag">{event.category}</span>
        </div>
      </div>
    </article>
  );
}
