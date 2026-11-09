import { describe, expect, it } from 'vitest';
import { getOpeningStatus, isValidOperatingHours, type OperatingHours } from '@/modules/establishments/opening-hours';

const base: OperatingHours = {
  timezone: 'America/Sao_Paulo',
  sourceUrl: 'https://example.com/horarios',
  checkedAt: '2026-11-08',
  schedule: {
    monday: { closed: false, open: '09:00', close: '18:00' },
    tuesday: { closed: true, open: '09:00', close: '18:00' },
    wednesday: { closed: true, open: '09:00', close: '18:00' },
    thursday: { closed: true, open: '09:00', close: '18:00' },
    friday: { closed: true, open: '09:00', close: '18:00' },
    saturday: { closed: true, open: '09:00', close: '18:00' },
    sunday: { closed: true, open: '09:00', close: '18:00' },
  },
};

describe('horários de funcionamento', () => {
  it('identifica estabelecimento aberto no horário local de Brasília', () => {
    const status = getOpeningStatus({ operatingHours: base }, new Date('2026-11-09T14:00:00.000Z'));
    expect(status.state).toBe('open');
    expect(status.label).toBe('Aberto agora');
  });

  it('considera funcionamento que atravessa a meia-noite', () => {
    const overnight: OperatingHours = {
      ...base,
      schedule: { ...base.schedule, monday: { closed: false, open: '18:00', close: '02:00' } },
    };
    const status = getOpeningStatus({ operatingHours: overnight }, new Date('2026-11-10T04:00:00.000Z'));
    expect(status.state).toBe('open');
  });

  it('não declara aberto quando a fonte está ausente ou a conferência venceu', () => {
    expect(getOpeningStatus({ operatingHours: { ...base, sourceUrl: undefined } }, new Date('2026-11-09T14:00:00.000Z')).state).toBe('unknown');
    expect(getOpeningStatus({ operatingHours: { ...base, checkedAt: '2026-06-01' } }, new Date('2026-11-09T14:00:00.000Z')).state).toBe('unknown');
  });

  it('valida formato de horário e exige fonte HTTPS quando informada', () => {
    expect(isValidOperatingHours(base)).toBe(true);
    expect(isValidOperatingHours({ ...base, sourceUrl: 'http://example.com' })).toBe(false);
    expect(isValidOperatingHours({ ...base, schedule: { monday: { closed: false, open: '25:00', close: '18:00' } } })).toBe(false);
  });
});
