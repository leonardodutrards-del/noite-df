import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import sitemap from '@/app/sitemap';
import {
  REGION_SLUG_MAP,
  getPlacesByRegionSlug,
  getBarsByRegionSlug,
  getPlacesByIntent,
  getSitemapCuratedUrls,
  MIN_CONTENT_COUNT_FOR_SEO,
} from '@/lib/curated-routes';

describe('SEO, Slugs and Sitemap consistency', () => {
  it('garante que todos os 56 estabelecimentos possuem IDs únicos e válidos para slugs', () => {
    expect(places).toHaveLength(56);
    const slugs = places.map((p) => p.id);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(places.length);

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9\u00C0-\u017F-]+$/i);
    }

    // Estabelecimento inativo Puxadinho Cozinha e Bar não deve estar presente
    expect(slugs).not.toContain('puxadinho-cozinha-e-bar');
  });

  it('o sitemap gera apenas URLs absolutas, canônicas e com páginas existentes', () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(45);

    const urls = entries.map((e) => e.url);

    // Contém páginas institucionais
    expect(urls.some((u) => u.endsWith('/'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/planos'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/privacidade'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/termos'))).toBe(true);

    // Contém todos os estabelecimentos individuais ativos
    for (const place of places) {
      expect(urls.some((u) => u.endsWith(`/lugar/${place.id}`))).toBe(true);
    }

    // Não deve conter URL do Puxadinho
    expect(urls.some((u) => u.includes('puxadinho'))).toBe(false);
  });

  it('o sitemap exclui rotas vazias ou com menos de 2 estabelecimentos verificados', () => {
    const curatedPaths = getSitemapCuratedUrls();

    for (const path of curatedPaths) {
      if (path.startsWith('/lugares/')) {
        const regionSlug = path.replace('/lugares/', '');
        const count = getPlacesByRegionSlug(regionSlug).length;
        expect(count).toBeGreaterThanOrEqual(MIN_CONTENT_COUNT_FOR_SEO);
      } else if (path.startsWith('/bares/')) {
        const regionSlug = path.replace('/bares/', '');
        const count = getBarsByRegionSlug(regionSlug).length;
        expect(count).toBeGreaterThanOrEqual(MIN_CONTENT_COUNT_FOR_SEO);
      }
    }
  });

  it('filtra estabelecimentos por intenção corretamente', () => {
    const pagodePlaces = getPlacesByIntent('pagode', 'brasilia');
    expect(pagodePlaces.length).toBeGreaterThan(0);

    const sertanejoPlaces = getPlacesByIntent('sertanejo', 'brasilia');
    expect(sertanejoPlaces.length).toBeGreaterThan(0);

    const happyHourAsaSul = getPlacesByIntent('happy-hour', 'asa-sul');
    expect(happyHourAsaSul.length).toBeGreaterThan(0);
  });

  it('mapeamento de regiões cobre todas as regiões dos estabelecimentos cadastrados', () => {
    const mappedRegions = Object.values(REGION_SLUG_MAP);
    for (const place of places) {
      expect(mappedRegions).toContain(place.region);
    }
  });
});
