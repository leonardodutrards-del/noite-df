import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { additionalPlacesNovember20 } from '@/data/seeds/places-2026-11-20';

describe('Candidatos de estabelecimentos 20/11/2026', () => {
  it('mantém os sete candidatos como rascunho até revisão', () => {
    expect(additionalPlacesNovember20).toHaveLength(7);
    expect(additionalPlacesNovember20.map((place) => place.id)).toEqual([
      'london-music-bar-asa-sul',
      'london-music-bar-aguas-claras',
      'new-mercadito-bar-e-restaurante',
      'minas-brasilia-tenis-clube',
      'cais-do-lago',
      'capsula-bar',
      'a-casa-de-jorge-saan',
    ]);
    expect(additionalPlacesNovember20.every((place) => place.publicationStatus === 'draft')).toBe(true);
    expect(places.some((place) => ['london-music-bar-asa-sul', 'london-music-bar-aguas-claras', 'new-mercadito-bar-e-restaurante', 'minas-brasilia-tenis-clube', 'cais-do-lago', 'a-casa-de-jorge-saan'].includes(place.id))).toBe(false);
  });
});
