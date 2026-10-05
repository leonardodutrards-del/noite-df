export type RegionScope = 'df' | 'entorno';

export type RegionMeta = {
  slug: string;
  name: string;
  scope: RegionScope;
  aliases?: string[];
};

export const REGION_CATALOG: RegionMeta[] = [
  { slug: 'aguas-claras', name: 'Águas Claras', scope: 'df' },
  { slug: 'asa-norte', name: 'Asa Norte', scope: 'df' },
  { slug: 'asa-sul', name: 'Asa Sul', scope: 'df' },
  { slug: 'ceilandia', name: 'Ceilândia', scope: 'df' },
  { slug: 'gama', name: 'Gama', scope: 'df' },
  { slug: 'granja-do-torto', name: 'Granja do Torto', scope: 'df' },
  { slug: 'guara', name: 'Guará', scope: 'df' },
  { slug: 'lago-sul', name: 'Lago Sul', scope: 'df' },
  { slug: 'park-way', name: 'Park Way', scope: 'df' },
  { slug: 'planaltina', name: 'Planaltina', scope: 'df' },
  { slug: 'saan', name: 'SAAN', scope: 'df' },
  { slug: 'samambaia', name: 'Samambaia', scope: 'df' },
  { slug: 'setor-de-clubes-sul', name: 'Setor de Clubes Sul', scope: 'df' },
  { slug: 'sig', name: 'SIG', scope: 'df' },
  { slug: 'sobradinho', name: 'Sobradinho', scope: 'df' },
  { slug: 'sudoeste', name: 'Sudoeste', scope: 'df' },
  { slug: 'taguatinga', name: 'Taguatinga', scope: 'df' },
  { slug: 'brasilinha', name: 'Brasilinha · Entorno', scope: 'entorno', aliases: ['Brasilinha'] },
  { slug: 'cidade-ocidental', name: 'Cidade Ocidental · Entorno', scope: 'entorno', aliases: ['Cidade Ocidental'] },
  { slug: 'jardim-inga', name: 'Jardim Ingá · Entorno', scope: 'entorno', aliases: ['Jardim Ingá'] },
  { slug: 'valparaiso', name: 'Valparaíso · Entorno', scope: 'entorno', aliases: ['Valparaíso', 'Valparaiso'] },
];

export function normalizeRegionName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getRegionMetaByName(name: string): RegionMeta | undefined {
  const normalized = normalizeRegionName(name);
  return REGION_CATALOG.find((region) => {
    if (normalizeRegionName(region.name) === normalized) return true;
    return region.aliases?.some((alias) => normalizeRegionName(alias) === normalized) ?? false;
  });
}

export function getRegionMetaBySlug(slug: string): RegionMeta | undefined {
  return REGION_CATALOG.find((region) => region.slug === slug);
}

export function getRegionOptionsWithCounts(
  places: Array<{ region: string }>
): Array<RegionMeta & { count: number }> {
  const counts = new Map<string, number>();
  for (const place of places) {
    counts.set(place.region, (counts.get(place.region) ?? 0) + 1);
  }

  return REGION_CATALOG
    .map((region) => ({ ...region, count: counts.get(region.name) ?? 0 }))
    .filter((region) => region.count > 0);
}
