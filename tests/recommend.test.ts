import { describe, expect, it } from 'vitest';
import { recommendPlaces } from '@/lib/recommend';

describe('recommendPlaces', () => {
  it('filtra por região', () => {
    const result = recommendPlaces('', 'Planaltina', 'todas');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((place) => place.region === 'Planaltina')).toBe(true);
  });

  it('filtra por vibe ignorando acentos e caixa', () => {
    const result = recommendPlaces('', 'todos', 'familia');
    expect(result.some((place) => place.vibe.includes('família'))).toBe(true);
  });

  it('busca em nome, descrição e atributos', () => {
    const result = recommendPlaces('tres tambores', 'todos', 'todas');
    expect(result.some((place) => place.id === 'granja-do-torto-eventos')).toBe(true);
  });
});
