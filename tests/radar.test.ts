import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { matchesRadar, radarOptions } from '@/lib/radar';
import { recommendPlaces } from '@/lib/recommend';

describe('Radar da Cidade', () => {
  it('retorna locais reais para todos os botões', () => {
    for (const option of radarOptions) {
      expect(places.filter(place => matchesRadar(place, option.id)).length, option.label).toBeGreaterThan(0);
    }
  });

  it('separa perfis animados e tranquilos sem afirmar lotação atual', () => {
    const boate = places.find(place => place.id === 'club-904')!;
    expect(matchesRadar(boate, 'bombando')).toBe(true);
    expect(matchesRadar(boate, 'tranquilo')).toBe(false);
    expect(radarOptions.find(option => option.id === 'bombando')?.description).toContain('Não indica lotação');
  });

  it('combina a categoria com busca e região', () => {
    const regionResults = recommendPlaces('', 'Sobradinho', 'todas').filter(place => matchesRadar(place, 'pagode'));
    expect(regionResults.length).toBeGreaterThan(0);
    expect(regionResults.every(place => place.region === 'Sobradinho')).toBe(true);
  });
});
