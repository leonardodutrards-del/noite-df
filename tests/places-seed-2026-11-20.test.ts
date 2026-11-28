import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { additionalPlacesNovember20 } from '@/data/seeds/places-2026-11-20';

describe('Candidatos de estabelecimentos 28/11/2026', () => {
  it('mantém os dezoito candidatos como rascunho até revisão', () => {
    expect(additionalPlacesNovember20).toHaveLength(18);
    expect(additionalPlacesNovember20.map((place) => place.id)).toEqual([
      'london-music-bar-asa-sul',
      'london-music-bar-aguas-claras',
      'new-mercadito-bar-e-restaurante',
      'minas-brasilia-tenis-clube',
      'cais-do-lago',
      'capsula-bar',
      'a-casa-de-jorge-saan',
      'anexo-bz',
      'club-gastrobar-valparaiso',
      'new-khoder-lounge-bar',
      'abencoado-bar-asa-norte',
      'saguari-gastro-house-samambaia',
      'refugio-cozinha-e-bar-samambaia',
      'externa-club-asa-sul',
      'parada-eixo-cozinha-e-bar',
      'biroska-restaurante-choperia-planaltina-go',
      'bico-de-brasa-planaltina-go',
      'la-casa-pizzaria-planaltina-go',
    ]);
    expect(additionalPlacesNovember20.every((place) => place.publicationStatus === 'draft')).toBe(true);
    expect(places.some((place) => ['london-music-bar-asa-sul', 'london-music-bar-aguas-claras', 'new-mercadito-bar-e-restaurante', 'minas-brasilia-tenis-clube', 'cais-do-lago', 'capsula-bar', 'a-casa-de-jorge-saan', 'anexo-bz', 'club-gastrobar-valparaiso', 'new-khoder-lounge-bar', 'abencoado-bar-asa-norte', 'saguari-gastro-house-samambaia', 'refugio-cozinha-e-bar-samambaia', 'externa-club-asa-sul', 'parada-eixo-cozinha-e-bar', 'biroska-restaurante-choperia-planaltina-go', 'bico-de-brasa-planaltina-go', 'la-casa-pizzaria-planaltina-go'].includes(place.id))).toBe(false);
  });
});
