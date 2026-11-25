import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { additionalPlacesNovember20 } from '@/data/seeds/places-2026-11-20';

describe('Candidatos de estabelecimentos 20/11/2026', () => {
  it('mantém os quinze candidatos como rascunho até revisão', () => {
    expect(additionalPlacesNovember20).toHaveLength(15);
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
    ]);
    expect(additionalPlacesNovember20.every((place) => place.publicationStatus === 'draft')).toBe(true);
    expect(places.some((place) => ['london-music-bar-asa-sul', 'london-music-bar-aguas-claras', 'new-mercadito-bar-e-restaurante', 'minas-brasilia-tenis-clube', 'cais-do-lago', 'capsula-bar', 'a-casa-de-jorge-saan', 'anexo-bz', 'club-gastrobar-valparaiso', 'new-khoder-lounge-bar', 'abencoado-bar-asa-norte', 'saguari-gastro-house-samambaia', 'refugio-cozinha-e-bar-samambaia', 'externa-club-asa-sul', 'parada-eixo-cozinha-e-bar'].includes(place.id))).toBe(false);
  });
});
