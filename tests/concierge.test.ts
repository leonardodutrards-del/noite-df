import { describe, expect, it } from 'vitest';
import { recommendEstablishments } from '@/lib/ai/concierge';
import type { Establishment } from '@/modules/establishments/types';

const sample = (overrides: Partial<Establishment>): Establishment => ({
  id: '1', name: 'Bar da Asa Sul', region: 'Asa Sul', type: 'Bar', description: 'Música ao vivo',
  address: 'Brasília', vibe: ['animado'], music: ['sertanejo'], audience: ['adultos'],
  mapsQuery: 'Brasília', verified: true, ownerManaged: false, crowdStatus: 'a confirmar',
  weeklySchedule: [], lastUpdated: '2026-10-21', publicationStatus: 'published', ...overrides,
});

describe('concierge', () => {
  it('recomenda por região e música', () => {
    const found = recommendEstablishments('sertanejo Asa Sul', [sample({})]);
    expect(found).toHaveLength(1);
    expect(found[0].name).toBe('Bar da Asa Sul');
  });
  it('não expõe registros não publicados', () => {
    expect(recommendEstablishments('sertanejo', [sample({ publicationStatus: 'draft' })])).toHaveLength(0);
  });
  it('não inventa correspondências', () => {
    expect(recommendEstablishments('jazz', [sample({})])).toHaveLength(0);
  });
});
