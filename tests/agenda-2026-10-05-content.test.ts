import { describe, expect, it } from 'vitest';
import { events } from '@/data/events';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';
import { getMonthlyAgenda } from '@/lib/monthly-agenda';

describe('Agenda 05-11 de outubro de 2026', () => {
  const now = new Date('2026-10-05T12:00:00Z');

  it('inclui a programação verificada da semana', () => {
    const weekly = getWeeklyAgenda(events, now);
    const ids = new Set(weekly.map((event) => event.id));

    expect(ids.has('contexto-forro-varanda-2026-10-06')).toBe(true);
    expect(ids.has('contexto-surra-modao-2026-10-07')).toBe(true);
    expect(ids.has('complexo-hoje-pode-2026-10-08')).toBe(true);
    expect(ids.has('complexo-lrc-love-funk-2026-10-09')).toBe(true);
    expect(ids.has('samambar-surra-modao-2026-10-09')).toBe(true);
    expect(ids.has('birosca-baile-funky-2026-10-09')).toBe(true);
    expect(ids.has('galpao17-oktoberfest-rock-2026-10-09')).toBe(true);
    expect(ids.has('oscarito-luday-wellness-2026-10-10')).toBe(true);
    expect(ids.has('galpao17-oktoberfest-folk-2026-10-10')).toBe(true);
    expect(ids.has('contexto-eskenta-fest-2026-10-10')).toBe(true);
  });

  it('mantém eventos futuros de outubro na agenda mensal mesmo fora desta semana', () => {
    const monthly = getMonthlyAgenda(events, now);
    const ids = new Set(monthly.map((event) => event.id));

    expect(ids.has('contexto-surra-modao-2026-10-14')).toBe(true);
    expect(ids.has('galpao17-hall-of-rock-2026-10-16')).toBe(true);
    expect(ids.has('godofredo-oktoberfest-2026-10-17')).toBe(true);
    expect(ids.has('brutos-volkstreme-2026-10-18')).toBe(true);
    expect(ids.has('galpao17-deu-match-2026-10-23')).toBe(true);
    expect(ids.has('galpao17-halloween-2026-10-30')).toBe(true);
    expect(ids.has('galpao17-dia-los-muertos-2026-10-31')).toBe(true);
  });
});
