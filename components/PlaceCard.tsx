'use client';

import Link from 'next/link';
import { Place } from '@/data/places';
import { RatingBreakdown } from '@/components/RatingBreakdown';
import { PublicRatingsSummary } from '@/components/PublicRatingsSummary';
import { getConfirmedCrowdStatus, getConfirmedSchedules, hasConfirmedRating, hasRealValue } from '@/lib/data-quality';
import { track } from '@/lib/analytics';
import { PlaceContact } from '@/components/PlaceContact';
import { FavoriteButton } from '@/components/FavoriteButton';

export function PlaceCard({ place }: { place: Place }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapsQuery)}`;
  const instagramUrl = place.instagram?.trim();
  const confirmedCrowd = getConfirmedCrowdStatus(place.crowdStatus);
  const confirmedSchedule = getConfirmedSchedules(place.weeklySchedule);
  const isRatingConfirmed = hasConfirmedRating(place);

  const hasValidPromo = place.currentPromotion &&
    hasRealValue(place.currentPromotion.title) &&
    hasRealValue(place.currentPromotion.description);

  return (
    <article className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <h3 style={{ margin: 0 }}>
          <Link
            href={`/lugar/${place.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={() => track('place_view', { placeId: place.id, placeName: place.name })}
          >
            {place.name}
          </Link>
        </h3>
      </div>
      <p style={{ marginTop: '8px' }}>{place.description}</p>
      {hasRealValue(place.address) && <p style={{ marginTop: '6px', color: 'var(--muted)', fontSize: '13px' }}>📍 {place.address}</p>}
      <div className="tags">
        {place.verified && <span className="tag verified">✔ verificado</span>}
        {place.ownerManaged && <span className="tag">gerenciado pelo local</span>}
        {confirmedCrowd && <span className="tag">lotação: {confirmedCrowd}</span>}
        {hasRealValue(place.region) && <span className="tag">{place.region}</span>}
        {hasRealValue(place.type) && <span className="tag">{place.type}</span>}
        {hasRealValue(place.price) && <span className="tag">{place.price}</span>}
        {place.vibe.filter((tag) => hasRealValue(tag)).slice(0, 3).map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </div>
      {hasValidPromo && place.currentPromotion && (
        <div className="promo">
          <strong>{place.currentPromotion.title}</strong>
          <span>{place.currentPromotion.description}</span>
        </div>
      )}
      {place.ratingBreakdown && <RatingBreakdown rating={place.ratingBreakdown} />}
      {place.publicRatings && place.publicRatings.length > 0 && <PublicRatingsSummary sources={place.publicRatings} />}
      {confirmedSchedule.length > 0 && (
        <div className="schedule-mini">
          <strong>Agenda confirmada</strong>
          {confirmedSchedule.slice(0, 2).map((item) => (
            <span key={`${item.day}-${item.title}`}>{item.day}: {item.title} · {item.time}</span>
          ))}
        </div>
      )}
      <PlaceContact place={place} compact />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <FavoriteButton establishmentId={place.id} />
        <Link className="button ghost" href={`/roteiros?place=${encodeURIComponent(place.id)}`}>
          Adicionar a roteiro
        </Link>
      </div>
      <div className="meta">
        {isRatingConfirmed && place.rating !== undefined ? (
          <span>⭐ {place.rating.toFixed(1)}</span>
        ) : (
          <span />
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            href={`/lugar/${place.id}`}
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
            onClick={() => track('place_view', { placeId: place.id, placeName: place.name })}
          >
            Ver detalhes
          </Link>
          {instagramUrl && hasRealValue(instagramUrl) ? (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('instagram_click', { placeId: place.id, placeName: place.name })}
            >
              Instagram ↗
            </a>
          ) : null}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => track('map_click', { placeId: place.id, placeName: place.name })}
          >
            Ver no mapa
          </a>
          <a href={mapsUrl} target="_blank" rel="noreferrer" aria-label={`Buscar avaliações de ${place.name} no Google Maps`}>
            Buscar avaliações no Google ↗
          </a>
        </div>
      </div>
      {(place.source?.label || place.lastUpdated) && (
        <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          <small style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>
            {place.source?.label ? `Fonte: ${place.source.label}` : ''}
            {place.lastUpdated ? ` · Verificado em ${place.lastUpdated}` : ''}
          </small>
        </div>
      )}
    </article>
  );
}
