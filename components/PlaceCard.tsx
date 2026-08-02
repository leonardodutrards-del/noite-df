import { Place } from '@/data/places';
import { RatingBreakdown } from '@/components/RatingBreakdown';

export function PlaceCard({ place }: { place: Place }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapsQuery)}`;
  return (
    <article className="card">
      <h3>{place.name}</h3>
      <p>{place.description}</p>
      <div className="tags">
        {place.verified && <span className="tag verified">✔ verificado</span>}
        {place.ownerManaged && <span className="tag">gerenciado pelo local</span>}
        <span className="tag">lotação: {place.crowdStatus}</span>
        <span className="tag">{place.region}</span>
        <span className="tag">{place.type}</span>
        <span className="tag">{place.price}</span>
        {place.vibe.slice(0, 3).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      {place.currentPromotion && (
        <div className="promo">
          <strong>{place.currentPromotion.title}</strong>
          <span>{place.currentPromotion.description}</span>
        </div>
      )}
      {place.ratingBreakdown && <RatingBreakdown rating={place.ratingBreakdown} />}
      <div className="schedule-mini">
        <strong>Agenda</strong>
        {place.weeklySchedule.slice(0, 2).map((item) => (
          <span key={`${item.day}-${item.title}`}>{item.day}: {item.title} · {item.time}</span>
        ))}
      </div>
      <div className="meta">
        <span>⭐ {place.rating ?? 'A confirmar'}</span>
        <a href={mapsUrl} target="_blank" rel="noreferrer">Ver no mapa</a>
      </div>
    </article>
  );
}
