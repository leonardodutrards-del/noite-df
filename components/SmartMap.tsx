'use client';

import type { Establishment } from '@/modules/establishments/types';

type SmartMapProps = {
  places: Establishment[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
};

export function SmartMap({ places, selectedPlaceId, onSelectPlace }: SmartMapProps) {
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0] ?? null;
  const query = selectedPlace
    ? selectedPlace.mapsQuery || [selectedPlace.name, selectedPlace.address, selectedPlace.region, 'DF'].filter(Boolean).join(' ')
    : 'Brasília Distrito Federal Brasil';
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const directionsUrl = selectedPlace
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
    : 'https://www.google.com/maps/search/?api=1&query=Brasilia+DF';

  return (
    <section id="mapa" className="smart-map-section" aria-labelledby="smart-map-title">
      <div className="section-title">
        <div>
          <span className="eyebrow">Mapa inteligente</span>
          <h2 id="smart-map-title">Encontre seu próximo rolê</h2>
          <p>O mapa acompanha sua busca e os filtros escolhidos. Selecione um local para conferir a região e abrir a rota.</p>
        </div>
        <span className="smart-map-count">{places.length} {places.length === 1 ? 'local' : 'locais'}</span>
      </div>

      <div className="smart-map-layout">
        <div className="smart-map-frame">
          <iframe
            key={selectedPlace?.id ?? 'brasilia'}
            title={selectedPlace ? `Mapa de ${selectedPlace.name}` : 'Mapa de Brasília e Entorno'}
            src={mapUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="smart-map-attribution">Mapa e busca de localização por Google Maps</div>
        </div>

        <aside className="smart-map-results" aria-label="Locais encontrados no mapa">
          {selectedPlace ? (
            <div className="smart-map-selected">
              <span className="eyebrow">Local selecionado</span>
              <strong>{selectedPlace.name}</strong>
              <span>{selectedPlace.address || selectedPlace.region}</span>
              <a className="button" href={directionsUrl} target="_blank" rel="noreferrer">Traçar rota ↗</a>
            </div>
          ) : (
            <div className="smart-map-empty">
              <strong>Nenhum local encontrado</strong>
              <span>Altere a busca ou limpe os filtros para ver opções no mapa.</span>
            </div>
          )}

          <div className="smart-map-place-list">
            <span className="eyebrow">Resultados da sua busca</span>
            {places.slice(0, 8).map((place) => (
              <button
                key={place.id}
                type="button"
                className={place.id === selectedPlace?.id ? 'smart-map-place is-selected' : 'smart-map-place'}
                aria-pressed={place.id === selectedPlace?.id}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className="smart-map-pin" aria-hidden="true">●</span>
                <span><strong>{place.name}</strong><small>{place.region} · {place.type}</small></span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
            {places.length > 8 ? <span className="smart-map-more">Mostrando 8 de {places.length} resultados. Refine os filtros para encontrar outros locais.</span> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
