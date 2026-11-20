import { describe, expect, it } from 'vitest';
import { additionalPlacesNovember17 } from '@/data/seeds/places-2026-11-17';
import { places } from '@/data/seeds/places';

describe('Candidatos de estabelecimentos — 17/11/2026', () => {
  it('mantém Hop Capital Beer como rascunho documentado e fora do catálogo público', () => {
    const hop = additionalPlacesNovember17.find((place) => place.id === 'hop-capital-beer');

    expect(hop).toBeDefined();
    expect(hop?.name).toBe('Hop Capital Beer');
    expect(hop?.region).toBe('Guará');
    expect(hop?.address).toContain('SIA Trecho 17, Rua 3, Lote 160');
    expect(hop?.source?.kind).toBe('official');
    expect(hop?.source?.url).toBe('https://hopcapital.com.br/brewpub');
    expect(hop?.source?.verifiedAt).toBe('2026-11-17');
    expect(hop?.publicationStatus).toBe('draft');
    expect(hop?.verified).toBe(false);
    expect(hop?.instagram).toBeUndefined();
    expect(places.some((place) => place.id === 'hop-capital-beer')).toBe(false);
  });

  it('mantém Xique Xique Águas Claras pendente por divergência no complemento do endereço', () => {
    const xique = additionalPlacesNovember17.find((place) => place.id === 'xique-xique-aguas-claras');

    expect(xique).toBeDefined();
    expect(xique?.region).toBe('Águas Claras');
    expect(xique?.address).toContain('complemento do lote/loja a confirmar');
    expect(xique?.source?.kind).toBe('official');
    expect(xique?.source?.url).toBe('https://www.restaurantexiquexique.com.br/index.html');
    expect(xique?.publicationStatus).toBe('draft');
    expect(xique?.verified).toBe(false);
    expect(xique?.businessContact).toBeUndefined();
    expect(xique?.instagram).toBeUndefined();
    expect(places.some((place) => place.id === 'xique-xique-aguas-claras')).toBe(false);
  });
});
