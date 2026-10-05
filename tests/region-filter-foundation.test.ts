import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import {
  REGION_CATALOG,
  getRegionMetaByName,
  getRegionOptionsWithCounts,
} from '@/lib/regions';
import { intentOptions, matchesNightIntent } from '@/lib/night-intents';
import { REGION_SLUG_MAP } from '@/lib/curated-routes';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hub = readFileSync(resolve(process.cwd(), 'components/ExperienceHub.tsx'), 'utf8');
const css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');

describe('Base de regiões e filtros', () => {
  it('mantém uma fonte canônica para DF e Entorno', () => {
    expect(REGION_CATALOG.length).toBeGreaterThanOrEqual(21);
    expect(REGION_CATALOG.some((region) => region.name === 'Sobradinho' && region.scope === 'df')).toBe(true);
    expect(REGION_CATALOG.some((region) => region.name === 'Valparaíso · Entorno' && region.scope === 'entorno')).toBe(true);
    expect(getRegionMetaByName('Valparaiso')?.name).toBe('Valparaíso · Entorno');
  });

  it('deriva as rotas regionais do mesmo catálogo', () => {
    expect(REGION_SLUG_MAP.sobradinho).toBe('Sobradinho');
    expect(REGION_SLUG_MAP.valparaiso).toBe('Valparaíso · Entorno');
  });

  it('calcula contagem por região usando os dados disponíveis', () => {
    const options = getRegionOptionsWithCounts(places);
    const sobradinho = options.find((region) => region.name === 'Sobradinho');
    expect(sobradinho?.count).toBeGreaterThan(0);
    expect(options.every((region) => region.count > 0)).toBe(true);
  });

  it('filtra intenções usando dados reais do estabelecimento', () => {
    const cheap = places.find((place) => place.price === '$');
    const bar = places.find((place) => place.type === 'Bar');
    const restaurant = places.find((place) => place.type === 'Restaurante');

    expect(cheap && matchesNightIntent(cheap, 'barato')).toBe(true);
    expect(bar && matchesNightIntent(bar, 'beber')).toBe(true);
    expect(restaurant && matchesNightIntent(restaurant, 'comer')).toBe(true);
  });

  it('expõe região, tipo, música, preço e intenção na experiência principal', () => {
    expect(hub).toContain('Distrito Federal');
    expect(hub).toContain('Entorno');
    expect(hub).toContain('Tipo de lugar');
    expect(hub).toContain('Todos os estilos musicais');
    expect(hub).toContain('O que você quer hoje?');
    expect(intentOptions.some((option) => option.label.includes('Evento hoje'))).toBe(true);
    expect(css).toContain('.filter-panel');
    expect(css).toContain('.intent-grid');
  });
});
