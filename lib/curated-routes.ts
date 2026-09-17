import { places } from '@/data/places';
import type { Establishment } from '@/modules/establishments/types';
import { normalizeString } from '@/lib/data-quality';

export const REGION_SLUG_MAP: Record<string, string> = {
  'setor-de-clubes-sul': 'Setor de Clubes Sul',
  'sig': 'SIG',
  'saan': 'SAAN',
  'asa-norte': 'Asa Norte',
  'asa-sul': 'Asa Sul',
  'aguas-claras': 'Águas Claras',
  'ceilandia': 'Ceilândia',
  'gama': 'Gama',
  'granja-do-torto': 'Granja do Torto',
  'guara': 'Guará',
  'lago-sul': 'Lago Sul',
  'planaltina': 'Planaltina',
  'sobradinho': 'Sobradinho',
  'sudoeste': 'Sudoeste',
  'taguatinga': 'Taguatinga',
  'brasilinha': 'Brasilinha · Entorno',
  'cidade-ocidental': 'Cidade Ocidental · Entorno',
  'jardim-inga': 'Jardim Ingá · Entorno',
  'valparaiso': 'Valparaíso · Entorno',
};

export function slugify(text: string): string {
  return normalizeString(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getRegionFromSlug(slug: string): string | undefined {
  return REGION_SLUG_MAP[slug];
}

export function getPlacesByRegionSlug(slug: string): Establishment[] {
  const regionName = getRegionFromSlug(slug);
  if (!regionName) return [];
  return places.filter((p) => normalizeString(p.region) === normalizeString(regionName));
}

export function getBarsByRegionSlug(slug: string): Establishment[] {
  const regionPlaces = getPlacesByRegionSlug(slug);
  return regionPlaces.filter((p) => {
    const t = p.type;
    return t === 'Bar' || t === 'Gastrobar' || t === 'Pub';
  });
}

export function getPlacesByIntent(intent: 'pagode' | 'sertanejo' | 'happy-hour' | 'date', locationSlug: string): Establishment[] {
  const isAllDF = locationSlug === 'brasilia' || locationSlug === 'df' || locationSlug === 'todos';
  const targetRegion = isAllDF ? null : getRegionFromSlug(locationSlug);

  return places.filter((place) => {
    if (targetRegion && normalizeString(place.region) !== normalizeString(targetRegion)) {
      return false;
    }

    const vibeAndMusic = [
      ...place.vibe.map((v) => normalizeString(v)),
      ...place.music.map((m) => normalizeString(m)),
      normalizeString(place.description),
    ].join(' ');

    switch (intent) {
      case 'pagode':
        return vibeAndMusic.includes('pagode') || vibeAndMusic.includes('samba');
      case 'sertanejo':
        return vibeAndMusic.includes('sertanejo') || vibeAndMusic.includes('piseiro') || vibeAndMusic.includes('agro');
      case 'happy-hour':
        return vibeAndMusic.includes('happy hour') || vibeAndMusic.includes('chope') || vibeAndMusic.includes('chopp') || vibeAndMusic.includes('cerveja');
      case 'date':
        return vibeAndMusic.includes('date') || vibeAndMusic.includes('vinhos') || vibeAndMusic.includes('sofisticado') || vibeAndMusic.includes('casais');
      default:
        return false;
    }
  });
}

export const MIN_CONTENT_COUNT_FOR_SEO = 2;

export function getSitemapCuratedUrls(): string[] {
  const urls: string[] = [];

  // 1. Lugares por região
  for (const slug of Object.keys(REGION_SLUG_MAP)) {
    const count = getPlacesByRegionSlug(slug).length;
    if (count >= MIN_CONTENT_COUNT_FOR_SEO) {
      urls.push(`/lugares/${slug}`);
    }
  }

  // 2. Bares por região
  for (const slug of Object.keys(REGION_SLUG_MAP)) {
    const count = getBarsByRegionSlug(slug).length;
    if (count >= MIN_CONTENT_COUNT_FOR_SEO) {
      urls.push(`/bares/${slug}`);
    }
  }

  // 3. Intenções populares com conteúdo real suficiente
  const intents: Array<{ intent: 'pagode' | 'sertanejo' | 'happy-hour' | 'date'; location: string; path: string }> = [
    { intent: 'pagode', location: 'brasilia', path: '/pagode/brasilia' },
    { intent: 'sertanejo', location: 'brasilia', path: '/sertanejo/brasilia' },
    { intent: 'happy-hour', location: 'asa-sul', path: '/happy-hour/asa-sul' },
    { intent: 'happy-hour', location: 'brasilia', path: '/happy-hour/brasilia' },
    { intent: 'date', location: 'brasilia', path: '/date/brasilia' },
  ];

  for (const item of intents) {
    const count = getPlacesByIntent(item.intent, item.location).length;
    if (count >= MIN_CONTENT_COUNT_FOR_SEO) {
      urls.push(item.path);
    }
  }

  return urls;
}
