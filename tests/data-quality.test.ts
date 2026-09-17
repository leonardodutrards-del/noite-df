import { describe, expect, it } from 'vitest';
import { places } from '@/data/places';
import { events } from '@/data/events';
import {
  isPlaceholder,
  hasRealValue,
  getConfirmedCrowdStatus,
  getConfirmedSchedules,
  isConfirmedEvent,
  hasConfirmedRating,
  normalizeString,
} from '@/lib/data-quality';

describe('Data Quality and Truth Filters', () => {
  it('identifica corretamente strings de placeholders e valores ausentes', () => {
    expect(isPlaceholder(null)).toBe(true);
    expect(isPlaceholder(undefined)).toBe(true);
    expect(isPlaceholder('')).toBe(true);
    expect(isPlaceholder('   ')).toBe(true);
    expect(isPlaceholder('A confirmar')).toBe(true);
    expect(isPlaceholder('a CONFIRMAR ')).toBe(true);
    expect(isPlaceholder('⭐ A confirmar')).toBe(true);
    expect(isPlaceholder('Atualização em breve')).toBe(true);
    expect(isPlaceholder('atualizacao em breve.')).toBe(true);
    expect(isPlaceholder('Avaliação pública ainda não localizada')).toBe(true);
    expect(isPlaceholder('Espaço reservado')).toBe(true);
    expect(isPlaceholder('Exemplo de evento local')).toBe(true);
    expect(isPlaceholder('Demonstração do MVP; confirmar programação oficial')).toBe(true);
    expect(isPlaceholder('Monitorar')).toBe(true);
    expect(isPlaceholder('—')).toBe(true);
    expect(isPlaceholder('-')).toBe(true);
  });

  it('reconhece dados reais válidos', () => {
    expect(hasRealValue('Asa Norte')).toBe(true);
    expect(hasRealValue('Bar do Luis')).toBe(true);
    expect(hasRealValue('MPB')).toBe(true);
    expect(hasRealValue('https://www.instagram.com/trendsbar/')).toBe(true);
  });

  it('rejeita lotação não confirmada e preserva apenas status reais', () => {
    expect(getConfirmedCrowdStatus('a confirmar')).toBeUndefined();
    expect(getConfirmedCrowdStatus('A Confirmar')).toBeUndefined();
    expect(getConfirmedCrowdStatus(null)).toBeUndefined();
    expect(getConfirmedCrowdStatus('tranquilo')).toBe('tranquilo');
    expect(getConfirmedCrowdStatus('movimentado')).toBe('movimentado');
    expect(getConfirmedCrowdStatus('lotado')).toBe('lotado');
  });

  it('filtra horários de agenda fictícios ou com placeholders', () => {
    const placeholderSchedule = [
      { day: 'Agenda', title: 'Atualização em breve', time: 'A confirmar', details: 'Informações compartilhadas no perfil oficial.' },
    ];
    expect(getConfirmedSchedules(placeholderSchedule)).toEqual([]);

    const realSchedule = [
      { day: 'Sexta', title: 'Show de Rock', time: '21h', details: 'Entrada franca até 22h' },
    ];
    expect(getConfirmedSchedules(realSchedule)).toHaveLength(1);
    expect(getConfirmedSchedules(realSchedule)[0].title).toBe('Show de Rock');
  });

  it('elimina eventos fictícios, de demonstração ou com fontes placeholder', () => {
    // Both seed events have placeholder descriptions ("Espaço reservado", "Exemplo de evento local")
    for (const event of events.filter(event => ['agenda-granja-torto', 'piseiro-planaltina'].includes(event.id))) {
      expect(isConfirmedEvent(event)).toBe(false);
    }

    const validEvent = {
      id: 'show-confirmado-1',
      title: 'Festival de Jazz de Brasília',
      place: 'Infinu Comunidade Criativa',
      region: 'Asa Sul',
      dateLabel: 'Sábado, 20h',
      category: 'Música ao vivo',
      description: 'Apresentação confirmada com trio instrumental local.',
      sourceStatus: 'manual' as const,
      publicationStatus: 'published' as const,
      source: {
        kind: 'official' as const,
        label: 'Instagram oficial @infinubrasilia',
        verifiedAt: '2026-08-10',
      },
    };
    expect(isConfirmedEvent(validEvent)).toBe(true);
  });

  it('rejeita eventos com data expirada', () => {
    const expiredEvent = {
      id: 'evento-expirado',
      title: 'Show Passado',
      place: 'Galpão 17',
      region: 'Guará',
      dateLabel: '2020-01-01',
      category: 'Rock',
      description: 'Show que já aconteceu.',
      sourceStatus: 'manual' as const,
      publicationStatus: 'published' as const,
      endsAt: '2020-01-02T00:00:00Z',
      source: {
        kind: 'official' as const,
        label: 'Perfil oficial',
        verifiedAt: '2020-01-01',
      },
    };
    expect(isConfirmedEvent(expiredEvent)).toBe(false);
  });

  it('avaliação confirmada exige número positivo e fontes verificadas', () => {
    const unratedPlace = places[0]; // five-sport-bar has rating undefined
    expect(hasConfirmedRating(unratedPlace)).toBe(false);

    const placeWithConfirmedRating = {
      ...unratedPlace,
      rating: 4.6,
      publicRatings: [
        {
          provider: 'google' as const,
          label: 'Google Maps',
          url: 'https://maps.google.com',
          rating: 4.6,
          reviewCount: 50,
          collectedAt: '2026-08-01',
          matchedBy: ['nome'],
          status: 'confirmed' as const,
        },
      ],
    };
    expect(hasConfirmedRating(placeWithConfirmedRating)).toBe(true);
  });

  it('normaliza strings ignorando diacríticos, pontuação e maiúsculas', () => {
    expect(normalizeString('ÁGUAS CLARAS')).toBe('aguas claras');
    expect(normalizeString('  Sertanejo & Piseiro!  ')).toBe('sertanejo & piseiro!');
  });
});
