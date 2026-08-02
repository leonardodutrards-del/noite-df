import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { buildPublicRatingSummary, getPublicRatingsDisplay, validatePublicRatingSource } from '@/lib/public-ratings';

describe('public ratings', () => {
  it('calcula a média ponderada usando apenas avaliações com quantidade', () => {
    const summary = buildPublicRatingSummary([
      {
        provider: 'google',
        label: 'Google Maps',
        url: 'https://maps.google.com/?q=Noite+DF',
        rating: 4.5,
        reviewCount: 20,
        collectedAt: '2026-08-02',
        matchedBy: ['nome', 'região'],
        status: 'confirmed',
      },
      {
        provider: 'tripadvisor',
        label: 'Tripadvisor',
        url: 'https://www.tripadvisor.com/',
        rating: 5,
        reviewCount: 10,
        collectedAt: '2026-08-02',
        matchedBy: ['nome'],
        status: 'confirmed',
      },
      {
        provider: 'facebook',
        label: 'Facebook',
        url: 'https://www.facebook.com/',
        rating: 4,
        collectedAt: '2026-08-02',
        matchedBy: ['nome'],
        status: 'confirmed',
      },
    ]);

    expect(summary.average).toBeCloseTo(4.6666666667, 10);
    expect(summary.totalReviews).toBe(30);
    expect(summary.sourceCount).toBe(3);
  });

  it('não usa fontes sem quantidade de avaliações na média ponderada', () => {
    const summary = buildPublicRatingSummary([
      {
        provider: 'google',
        label: 'Google Maps',
        url: 'https://maps.google.com/?q=Noite+DF',
        rating: 4.8,
        collectedAt: '2026-08-02',
        matchedBy: ['nome'],
        status: 'confirmed',
      },
    ]);

    expect(summary.average).toBeUndefined();
    expect(summary.totalReviews).toBeUndefined();
  });

  it('mantém o resumo vazio para estabelecimentos sem avaliação pública', () => {
    const summary = buildPublicRatingSummary([]);

    expect(summary.average).toBeUndefined();
    expect(summary.totalReviews).toBeUndefined();
    expect(summary.sourceCount).toBe(0);
  });

  it('marca correspondência pendente sem exibir nota pública', () => {
    const source = {
      provider: 'official' as const,
      label: 'Perfil oficial',
      url: 'https://example.com/estabelecimento',
      collectedAt: '2026-08-02',
      matchedBy: ['nome', 'região'],
      status: 'needs_review' as const,
      observation: 'Correspondência pendente de confirmação manual.',
    };

    expect(validatePublicRatingSource(source)).toEqual([]);
    expect(getPublicRatingsDisplay([source]).headline).toBe('Avaliação pública ainda não localizada');
  });

  it('apresenta as fontes corretamente para o resumo do cartão', () => {
    const display = getPublicRatingsDisplay([
      {
        provider: 'google',
        label: 'Google Maps',
        url: 'https://maps.google.com/?q=Noite+DF',
        rating: 4.3,
        reviewCount: 15,
        collectedAt: '2026-08-02',
        matchedBy: ['nome', 'endereço'],
        status: 'confirmed',
      },
    ]);

    expect(display.headline).toContain('4.3');
    expect(display.sources).toHaveLength(1);
    expect(display.sources[0].label).toBe('Google Maps');
  });

  it('preserva exatamente 51 estabelecimentos e 16 regiões', () => {
    expect(places).toHaveLength(51);
    expect(new Set(places.map((place) => place.region)).size).toBe(16);
  });
});
