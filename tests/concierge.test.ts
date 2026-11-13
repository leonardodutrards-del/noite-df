import { describe, expect, it } from 'vitest';
import { analyzeConciergeQuery, recommendEstablishments } from '@/lib/ai/concierge';
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
  it('reconhece sinônimos de estilo musical', () => {
    expect(recommendEstablishments('quero ouvir modão', [sample({})])).toHaveLength(1);
  });
  it('prioriza música e região sobre descrições genéricas', () => {
    const places = [sample({ id: '2', name: 'Outro bar', region: 'Taguatinga', music: ['rock'], description: 'sertanejo às vezes' }), sample({ id: '1' })];
    expect(recommendEstablishments('sertanejo Asa Sul', places)[0].id).toBe('1');
  });
  it('identifica pedidos que exigem confirmação externa', () => {
    expect(analyzeConciergeQuery('Hoje quero gastar até R$ 100 com sertanejo')).toMatchObject({ budgetMentioned: true, timeMentioned: true });
  });
});
