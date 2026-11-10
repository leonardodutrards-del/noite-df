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

  it('não confirma funcionamento quando a grade semanal está incompleta', () => {
    const partial = { ...base, schedule: { monday: base.schedule.monday } };
    expect(getOpeningStatus({ operatingHours: partial }, new Date('2026-11-09T14:00:00.000Z')).state).toBe('unknown');
    expect(isValidOperatingHours(partial)).toBe(false);
  });

  it('valida exceções de datas especiais antes de calcular o status', () => {
    const special = { ...base, exceptions: { '2026-11-09': { closed: false, open: '10:00', close: '16:00' } } };
    expect(isValidOperatingHours(special)).toBe(true);
    expect(isValidOperatingHours({ ...special, exceptions: { '2026-02-30': { closed: true, open: '10:00', close: '16:00' } } })).toBe(false);
    expect(isValidOperatingHours({ ...special, exceptions: { '2026-11-09': { closed: false, open: '27:00', close: '16:00' } } })).toBe(false);
    expect(getOpeningStatus({ operatingHours: { ...special, exceptions: { '2026-11-09': { closed: false, open: '27:00', close: '16:00' } } } }, new Date('2026-11-09T14:00:00.000Z')).state).toBe('unknown');
  });

  it('exige fonte HTTPS válida e data real de conferência', () => {
    expect(isValidOperatingHours(base)).toBe(true);
    expect(isValidOperatingHours({ ...base, sourceUrl: undefined })).toBe(false);
    expect(isValidOperatingHours({ ...base, sourceUrl: 'http://example.com' })).toBe(false);
    expect(isValidOperatingHours({ ...base, sourceUrl: 'https://' })).toBe(false);
    expect(isValidOperatingHours({ ...base, checkedAt: undefined })).toBe(false);
    expect(isValidOperatingHours({ ...base, checkedAt: '2026-02-30' })).toBe(false);
    expect(isValidOperatingHours({ ...base, schedule: { monday: { closed: false, open: '25:00', close: '18:00' } } })).toBe(false);
  });
});
