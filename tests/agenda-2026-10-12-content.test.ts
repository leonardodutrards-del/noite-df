import { describe, expect, it } from 'vitest';
import batch from '@/database/imports/agenda-2026-10-12.json';
import { events } from '@/data/events';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';
import { validateEditorialEvent } from '@/modules/events/editorial';

describe('Programação verificada de 12 a 18/10', () => {
  const now = new Date('2026-10-12T22:00:00Z');
  it('valida os quatro registros para publicação e mantém fontes individuais', () => {
    expect(batch).toHaveLength(4);
    expect(new Set(batch.map(row => row.official_url)).size).toBe(4);
    for (const row of batch) {
      expect(() => validateEditorialEvent({ ...row, sourceConfirmed: true }, now)).not.toThrow();
    }
  });
  it('inclui cada edição uma vez e exclui a fonte remarcada do Surra', () => {
    const weekly = getWeeklyAgenda([...events, ...events], now);
    for (const row of batch) expect(weekly.filter(event => event.id === row.id)).toHaveLength(1);
    expect(weekly.some(event => event.id === 'contexto-surra-modao-2026-10-14')).toBe(false);
    expect(weekly.every(event => Date.parse(event.expiresAt!) > now.getTime())).toBe(true);
  });
});
