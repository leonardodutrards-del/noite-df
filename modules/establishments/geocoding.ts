export type GeocodingPlace = {
  name: string;
  region: string;
  address: string;
};

export type NominatimCandidate = {
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  namedetails?: Record<string, string>;
  address?: Record<string, string>;
};

const STOP_WORDS = new Set([
  'bar', 'restaurante', 'casa', 'show', 'pub', 'gastrobar', 'cozinha',
  'e', 'de', 'do', 'da', 'dos', 'das', 'o', 'a', 'no', 'na', 'em',
  'brasilia', 'df', 'go', 'goias', 'entorno',
]);

export function normalizeGeocodingText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function meaningfulTokens(value: string): string[] {
  return normalizeGeocodingText(value).split(' ').filter((token) =>
    token.length >= 3 && !STOP_WORDS.has(token)
  );
}

const BROAD_PLACE_TYPES = new Set([
  'administrative', 'city', 'county', 'municipality', 'neighbourhood',
  'quarter', 'state', 'suburb', 'town', 'village',
]);

export type GeocodingScore = {
  confidence: number;
  accepted: boolean;
  reason: string;
};

export function scoreNominatimCandidate(
  place: GeocodingPlace,
  candidate: NominatimCandidate
): GeocodingScore {
  const candidateText = normalizeGeocodingText([
    candidate.display_name,
    ...Object.values(candidate.namedetails ?? {}),
    ...Object.values(candidate.address ?? {}),
  ].join(' '));
  const nameTokens = meaningfulTokens(place.name);
  const nameHits = nameTokens.filter((token) => candidateText.includes(token));
  const exactName = candidateText.includes(normalizeGeocodingText(place.name));
  const nameScore = nameTokens.length > 0 ? nameHits.length / nameTokens.length : (exactName ? 1 : 0);

  const addressNumbers = (normalizeGeocodingText(place.address).match(/\b\d+[a-z]?\b/g) ?? []);
  const addressHits = addressNumbers.filter((token) => candidateText.includes(token));
  const addressScore = addressNumbers.length > 0 ? addressHits.length / addressNumbers.length : 0;

  const region = normalizeGeocodingText(place.region).replace(/\bentorno\b/g, '').trim();
  const regionMatch = Boolean(region && candidateText.includes(region));
  const locationContext = ['brasilia', 'luziania', 'valparaiso', 'cidade ocidental', 'planaltina', 'aguas lindas']
    .some((token) => candidateText.includes(token));
  const type = normalizeGeocodingText(candidate.type ?? '');
  const broadPlace = BROAD_PLACE_TYPES.has(type) || (candidate.class === 'place' && !['house', 'building'].includes(type));

  const confidence = Math.min(1, nameScore * 0.72 + addressScore * 0.18 + (regionMatch || locationContext ? 0.1 : 0));
  const hasStrongName = exactName || (nameTokens.length > 0 && nameScore >= 0.8);
  const hasAddressSupport = addressNumbers.length > 0 && addressScore >= 0.5;
  const accepted = Number.isFinite(Number(candidate.lat))
    && Number.isFinite(Number(candidate.lon))
    && !broadPlace
    && (hasStrongName || (nameScore >= 0.65 && hasAddressSupport))
    && (regionMatch || locationContext)
    && confidence >= 0.78;

  return {
    confidence: Number(confidence.toFixed(3)),
    accepted,
    reason: broadPlace
      ? 'Resultado representa uma região, não um estabelecimento.'
      : accepted
        ? 'Nome e contexto geográfico compatíveis.'
        : 'Correspondência insuficiente; exige conferência manual.',
  };
}
