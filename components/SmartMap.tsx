'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Establishment } from '@/modules/establishments/types';

type SmartMapProps = {
  places: Establishment[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
};
type Coordinate = { latitude: number; longitude: number };
type WorldPoint = { x: number; y: number };
type Tile = { key: string; url: string; left: number; top: number };

const TILE_SIZE = 256;
const DEFAULT_CENTER = { latitude: -15.7939, longitude: -47.8828 };

function project({ latitude, longitude }: Coordinate, zoom: number): WorldPoint {
  const scale = TILE_SIZE * 2 ** zoom;
  const safeLatitude = Math.max(-85.0511, Math.min(85.0511, latitude));
  const sin = Math.sin((safeLatitude * Math.PI) / 180);
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function unproject(point: WorldPoint, zoom: number): Coordinate {
  const scale = TILE_SIZE * 2 ** zoom;
  const longitude = (point.x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * point.y) / scale;
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { latitude, longitude };
}

function fitCoordinates(places: Establishment[]) {
  const points = places.filter(
    (place): place is Establishment & Coordinate =>
      Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
  );
  if (points.length === 0) return { center: DEFAULT_CENTER, zoom: 10 };
  if (points.length === 1) {
    return {
      center: { latitude: points[0].latitude, longitude: points[0].longitude },
      zoom: 14,
    };
  }

  const latitudes = points.map((place) => place.latitude);
  const longitudes = points.map((place) => place.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const span = Math.max(maxLat - minLat, (maxLon - minLon) * Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180));
  const zoom = span < 0.04 ? 13 : span < 0.12 ? 12 : span < 0.3 ? 10 : 9;

  return {
    center: { latitude: (minLat + maxLat) / 2, longitude: (minLon + maxLon) / 2 },
    zoom,
  };
}

export function SmartMap({ places, selectedPlaceId, onSelectPlace }: SmartMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; worldX: number; worldY: number } | null>(null);
  const [viewport, setViewport] = useState({ width: 720, height: 440 });
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(10);

  const mappedPlaces = useMemo(
    () => places.filter(
      (place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
    ),
    [places]
  );
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? places[0] ?? null;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setViewport({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mappedPlaces.length === 0) return;
    const fitted = fitCoordinates(mappedPlaces);
    setCenter(fitted.center);
    setZoom(fitted.zoom);
  }, [mappedPlaces.length]);

  useEffect(() => {
    if (!selectedPlace || !Number.isFinite(selectedPlace.latitude) || !Number.isFinite(selectedPlace.longitude)) return;
    setCenter({ latitude: selectedPlace.latitude!, longitude: selectedPlace.longitude! });
    setZoom((current) => Math.max(current, 13));
  }, [selectedPlace?.id]);

  const centerWorld = project(center, zoom);
  const originX = centerWorld.x - viewport.width / 2;
  const originY = centerWorld.y - viewport.height / 2;
  const tileCount = 2 ** zoom;

  const tiles = useMemo(() => {
    const startX = Math.floor(originX / TILE_SIZE) - 1;
    const endX = Math.floor((originX + viewport.width) / TILE_SIZE) + 1;
    const startY = Math.floor(originY / TILE_SIZE) - 1;
    const endY = Math.floor((originY + viewport.height) / TILE_SIZE) + 1;
    const next: Tile[] = [];

    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= tileCount) continue;
      for (let x = startX; x <= endX; x += 1) {
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        next.push({
          key: zoom + '/' + wrappedX + '/' + y,
          url: 'https://tile.openstreetmap.org/' + zoom + '/' + wrappedX + '/' + y + '.png',
          left: x * TILE_SIZE - originX,
          top: y * TILE_SIZE - originY,
        });
      }
    }
    return next;
  }, [originX, originY, tileCount, viewport.height, viewport.width, zoom]);

  const markers = mappedPlaces.map((place) => {
    const point = project({ latitude: place.latitude!, longitude: place.longitude! }, zoom);
    return { place, left: point.x - originX, top: point.y - originY };
  }).filter((marker) =>
    marker.left >= -24 && marker.left <= viewport.width + 24
    && marker.top >= -36 && marker.top <= viewport.height + 24
  );

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      worldX: centerWorld.x,
      worldY: centerWorld.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    setCenter(unproject({
      x: drag.worldX - (event.clientX - drag.x),
      y: drag.worldY - (event.clientY - drag.y),
    }, zoom));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function changeZoom(delta: number) {
    setZoom((current) => Math.max(7, Math.min(17, current + delta)));
  }

  return (
    <section id="mapa" className="smart-map-section" aria-labelledby="smart-map-title">
      <div className="section-title">
        <div>
          <span className="eyebrow">Mapa inteligente · OpenStreetMap</span>
          <h2 id="smart-map-title">Encontre seu próximo rolê</h2>
          <p>Os pins acompanham os filtros. Arraste o mapa, aproxime e selecione um local para abrir a rota.</p>
        </div>
        <span className="smart-map-count">{mappedPlaces.length} de {places.length} com coordenadas</span>
      </div>

      <div className="smart-map-layout">
        <div
          className="smart-map-frame"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="region"
          aria-label="Mapa interativo dos estabelecimentos"
        >
          <div className="smart-map-canvas" style={{ width: viewport.width, height: viewport.height }}>
            {tiles.map((tile) => (
              <img key={tile.key} className="smart-map-tile" src={tile.url} alt="" draggable={false} style={{ left: tile.left, top: tile.top }} />
            ))}
            {markers.map(({ place, left, top }) => (
              <button
                key={place.id}
                type="button"
                className={place.id === selectedPlace?.id ? 'smart-map-marker is-selected' : 'smart-map-marker'}
                style={{ left, top }}
                title={place.name}
                aria-label={'Selecionar ' + place.name + ' no mapa'}
                aria-pressed={place.id === selectedPlace?.id}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectPlace(place.id);
                }}
              ><span aria-hidden="true" /></button>
            ))}
          </div>

          <div className="smart-map-controls" aria-label="Controles do mapa">
            <button type="button" aria-label="Aproximar mapa" onPointerDown={(event) => event.stopPropagation()} onClick={() => changeZoom(1)}>+</button>
            <button type="button" aria-label="Afastar mapa" onPointerDown={(event) => event.stopPropagation()} onClick={() => changeZoom(-1)}>−</button>
            <button
              type="button"
              aria-label="Enquadrar estabelecimentos"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => {
                const fitted = fitCoordinates(mappedPlaces);
                setCenter(fitted.center);
                setZoom(fitted.zoom);
              }}
            >⌖</button>
          </div>

          {mappedPlaces.length === 0 ? (
            <div className="smart-map-empty-overlay">
              <strong>Coordenadas em preparação</strong>
              <span>Os estabelecimentos continuam na lista. Os pins aparecem assim que a localização for validada.</span>
            </div>
          ) : null}

          <div className="smart-map-attribution">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
          </div>
        </div>

        <aside className="smart-map-results" aria-label="Estabelecimentos encontrados no mapa">
          <div className="smart-map-selected">
            <span className="eyebrow">Local selecionado</span>
            {selectedPlace ? (
              <>
                <strong>{selectedPlace.name}</strong>
                <span>{selectedPlace.address || selectedPlace.region}</span>
                {Number.isFinite(selectedPlace.latitude) && Number.isFinite(selectedPlace.longitude) ? (
                  <a className="button" href={'https://www.google.com/maps/dir/?api=1&destination=' + selectedPlace.latitude + ',' + selectedPlace.longitude} target="_blank" rel="noreferrer">Traçar rota ↗</a>
                ) : (
                  <span className="smart-map-pending">Localização exata pendente de validação</span>
                )}
              </>
            ) : <span>Nenhum local corresponde aos filtros atuais.</span>}
          </div>

          <div className="smart-map-place-list">
            <span className="eyebrow">Resultados da sua busca · {places.length}</span>
            {places.map((place) => (
              <button
                key={place.id}
                type="button"
                className={place.id === selectedPlace?.id ? 'smart-map-place is-selected' : 'smart-map-place'}
                aria-pressed={place.id === selectedPlace?.id}
                onClick={() => onSelectPlace(place.id)}
              >
                <span className={Number.isFinite(place.latitude) && Number.isFinite(place.longitude) ? 'smart-map-pin' : 'smart-map-pin is-pending'} aria-hidden="true">●</span>
                <span><strong>{place.name}</strong><small>{place.region} · {place.type}</small></span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
